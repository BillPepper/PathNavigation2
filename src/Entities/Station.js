import { circ, text } from "../lib/render";
import SpaceEntity from "./SpaceEntity";
import colors from "../lib/colors";
import { generateOrbitNavs } from "../lib/helpers";
import config from "../config";

class Station extends SpaceEntity {
  constructor(name, x, y, size) {
    super(name, "station", x, y, size);
    this._dockLocations = generateOrbitNavs(this.x, this.y, this.size + 0.5, 4);
    this._dockedShips = [];
    this._maxDockableShips = 3; // it's 4 but arrays start at one...
  }

  canShipDock() {
    return this._dockedShips.length < this.maxDockableShips;
  }

  getFreeDockslotNav() {
    return this._dockLocations[this._dockedShips.length];
  }

  dockShip(ship) {
    // this ints the dock stuff, add ship ref
    // and pobably some trading stuff
    if (ship) {
      console.log(`${this.name} acknowledged dock of ${ship.name}`);
    } else {
      console.log(`Docking failed at ${this.name}`);
    }
  }

  drawDockSlots() {
    this._dockLocations.forEach((dock) => {
      circ(dock.x, dock.y, 2);
    });
  }

  drawStationName() {
    // could be in SpaceEntity
    if (config.renderStationNames || this.selected) {
      const offset = -26; //px
      text(this.x, this.y + offset, this.name, true, 10);
    }
  }

  update() {}

  draw() {
    this.drawDockSlots();
    this.drawStationName();
    circ(
      this.x,
      this.y,
      this.size,
      this.selected ? colors.Mandarin : colors.GreenWeb
    );
  }

  get maxDockableShips() {
    return this._maxDockableShips;
  }
}

export default Station;
