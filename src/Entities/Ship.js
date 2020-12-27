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
    this._docked = false;
    this._drawNav = false;
    this._nav = {
      order: "idle",
      defaultOrder: "idle",
      points: [{ x: x, y: y }]
    };
  }

  // --- Nagigation Commands
  navigate(x, y) {
    if (x && y) {
      this.moving = false;
      this.clearNav();
      this.nav.points = this.getWaypointsTo(x, y);
      this.moving = true;
      this.nav.order = this.nav.defaultOrder;
    }
  }

  moveStepTowardsNav(nav) {
    if (this.moving && this.nav.points.length > 0) {
      if (this.x < nav.x) {
        this.x += this.speed * this.speedMult;
      }
      if (this.x > nav.x) {
        this.x -= this.speed * this.speedMult;
      }
      if (this.y < nav.y) {
        this.y += this.speed * this.speedMult;
      }
      if (this.y > nav.y) {
        this.y -= this.speed * this.speedMult;
      }
    }
  }

  stop() {
    if (this.moving) {
      this.moving = false;
    }
  }

  flyToRandom() {
    this.nav.points = this.getRandomWaypointsTo(this.x, this.y);
  }

  // --- Docklike Commands
  dock(station) {
    if (station.canShipDock()) {
      const designatedSlot = station.getFreeDockslotNav();
      station.dockShip(this);
      this.navigate(designatedSlot.x, designatedSlot.y);
      this.nav.order = "docking";
    } else {
      console.log("Dock permission denied, no free dock");
    }
  }

  mine(asteroid) {
    this.navigate(asteroid.x, asteroid.y);
    this.nav.order = "mine";
  }

  // --- Nav Commands
  clearNav() {
    this.nav.points = [];
  }

  hasArrivedAt(x, y) {
    return (
      isInRange(config.collisionWidth, this.y, y) &&
      isInRange(config.collisionWidth, this.x, x)
    );
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

  // --- Cycle Commands ---
  update() {
    if (config.renderShipOrbit) {
      super.updateOrbit();
    }

    const nextNav = this.nav.points[0];
    this.moveStepTowardsNav(nextNav);

    // on arrival at nav
    if (this.hasArrivedAt(nextNav.x, nextNav.y)) {
      // nav's left?
      if (this.nav.points.length > 1) {
        // remove navPoint from list (and fly to it)
        this.nav.points = this.nav.points.slice(1, this.nav.points.length);
      } else {
        // if not already idle but should after plotted path, set it
        if (this.nav.order === "stop") {
          this.stop();
        } else if (this.nav.order === "docking") {
          this.idle = false;
          this.stop();
        } else if (this.nav.order === "mine") {
          this.idle = false;
          this.stop();
        } else if (this.nav.order === "idle") {
          this.idle = true;
          this.flyToRandom();
        }
      }
    }
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

  get docked() {
    return this._docked;
  }

  set docked(v) {
    this._docked = v;
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
