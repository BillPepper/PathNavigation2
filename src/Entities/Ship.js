import config from "../config";
import colors from "../lib/colors";

import SpaceEntity from "./SpaceEntity";
import { line, circ, text } from "../lib/render";
import { isInRange, getRandom, calcWaypoints } from "../lib/helpers";

export default class Ship extends SpaceEntity {
  constructor(name, x, y, speed) {
    super(name, "ship", x, y);
    this._speed = speed;
    this._speedMult = 0.25;
    this._moving = true;
    this._idle = false;
    this._drawNav = false;
    this._nav = {
      postArrival: "idle",
      defaultPostArrival: "idle",
      points: [{ x: x, y: y }]
    };
  }

  navigate(x, y) {
    if (x && y) {
      this.moving = false;
      this.drawNav = false;
      this.clearNav();
      this.nav.points = this.getWaypointsTo(x, y);
      this.moving = true;
      this.drawNav = true;
      this.nav.postArrival = this.nav.defaultPostArrival;
    }
  }

  dock(station) {
    this.navigate(station.x, station.y);
    this.nav.postArrival = "dock";
  }

  mine(asteroid) {
    this.navigate(asteroid.x, asteroid.y);
    this.nav.postArrival = "mine";
  }

  stop() {
    if (this.moving) {
      this.moving = false;
    }
  }

  flyToRandom() {
    this.nav.points = this.getRandomWaypointsTo(this.x, this.y);
  }

  clearNav() {
    this.nav.points = [];
  }

  hasArrivedAt(x, y) {
    return (
      isInRange(config.collisionWidth, this.y, y) &&
      isInRange(config.collisionWidth, this.x, x)
    );
  }

  update() {
    super.updateOrbit();

    const nextNav = this.nav.points[0];
    // Move ship towards next nav
    if (this.moving && this.nav.points.length > 0) {
      if (this.x < nextNav.x) {
        this.x += this.speed * this.speedMult;
      }
      if (this.x > nextNav.x) {
        this.x -= this.speed * this.speedMult;
      }
      if (this.y < nextNav.y) {
        this.y += this.speed * this.speedMult;
      }
      if (this.y > nextNav.y) {
        this.y -= this.speed * this.speedMult;
      }
    }
    // on arrival at nav
    if (this.hasArrivedAt(nextNav.x, nextNav.y)) {
      // nav's left?
      if (this.nav.points.length > 1) {
        // remove navPoint from list (and fly to it)
        this.nav.points = this.nav.points.slice(1, this.nav.points.length);
      } else {
        // if not already idle but should after plotted path, set it

        if (this.nav.postArrival === "stop") {
          this.stop();
        } else if (this.nav.postArrival === "dock") {
          this.idle = false;
          this.stop();
        } else if (this.nav.postArrival === "mine") {
          this.idle = false;
          this.stop();
        } else if (this.nav.postArrival === "idle") {
          this.idle = true;
          this.flyToRandom();
        }
      }
    }
  }

  // move this to helpers
  getRandomWaypointsTo(x, y) {
    return calcWaypoints([
      { x: this.x, y: this.y },
      {
        x: getRandom(20, config.map.width - 20),
        y: getRandom(20, config.map.height - 20)
      }
    ]);
  }

  // move this to helpers
  getWaypointsTo(x, y) {
    return calcWaypoints([
      { x: this.x, y: this.y },
      {
        x: x,
        y: y
      }
    ]);
  }

  draw() {
    super.drawOrbit();
    this.drawPath();
    this.drawPerception();
    const color = this.selected ? colors.Mandarin : colors.Independence;
    circ(this.x, this.y, this.size, color);
    this.drawName();
  }

  drawPath() {
    if (this.drawNav || this.selected) {
      let lastNav = this.nav.points[this.nav.points.length - 1];

      this.nav.points.forEach((navPoint, i) => {
        // When path is plottet, the active route is rendered differently
        const color = i === 0 ? colors.Mandarin : colors.Silver;
        if (lastNav) {
          // line(lastNav.x, lastNav.y, navPoint.x, navPoint.y, color);
          line(lastNav.x, lastNav.y, navPoint.x, navPoint.y, color);
        } else {
          // Calculate a rectangle
          const kathete1 = navPoint.x - this.x;
          const kathete2 = navPoint.y - this.y;
          const hyphotenuse = Math.sqrt(
            kathete1 * kathete1 + kathete2 * kathete2
          );

          // Render direct line to target
          const hypoDesc = hyphotenuse > 0 && Math.round(hyphotenuse);
          line(this.x, this.y, navPoint.x, navPoint.y, color, hypoDesc);

          // Render helplines of triangle and debug stuff
          if (
            this.selected &&
            config.debugEnabled &&
            config.debugRenderTriLines
          ) {
            const kath1Desc =
              kathete2 !== kathete1 && kathete1 !== 0 && `x: ${kathete1}`;
            const kath2Desc =
              kathete1 !== kathete2 && kathete2 !== 0 && `y: ${kathete2}`;
            line(
              this.x,
              navPoint.y,
              navPoint.x,
              navPoint.y,
              undefined,
              kath1Desc
            );

            line(this.x, this.y, this.x, navPoint.y, "#ff00ff", kath2Desc);
            // render nav dots
            circ(navPoint.x, navPoint.y, 1);
          }
        }

        lastNav = navPoint;
      });
    }
  }

  // move to space entity
  drawName() {
    // Disable text when docked. Should be it's own property
    // triggered by docking command
    if (this.moving) {
      if (config.renderShipNames || this.selected) {
        const offset = 16; //px
        text(this.x, this.y + offset, this.name, true, 10);
      }
    }
  }

  drawPerception() {}

  // Getters & Setters
  get speed() {
    return this._speed;
  }

  get speedMult() {
    return this._speedMult;
  }

  get moving() {
    return this._moving;
  }

  set moving(v) {
    this._moving = v;
  }

  get idle() {
    return this._idle;
  }

  set idle(v) {
    this._idle = v;
  }

  get drawNav() {
    return this._drawNav;
  }

  set drawNav(v) {
    this._drawNav = v;
  }

  get nav() {
    return this._nav;
  }

  set nav(v) {
    this._nav = v;
  }
}
