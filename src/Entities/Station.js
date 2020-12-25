import { circ } from "../lib/render";
import SpaceEntity from "./SpaceEntity";
import colors from "../lib/colors";

class Station extends SpaceEntity {
  constructor(name, x, y, size) {
    super(name, "station", x, y, size);
    this._docks = [];
    this._maxDockableShips = 3; // it's 4 but arrays start at one...
  }

  canShipDock() {
    return this.docks.length < this.maxDockableShips;
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

  showVacancy() {}

  update() {}

  draw() {
    circ(
      this.x,
      this.y,
      this.size,
      this.selected ? colors.Mandarin : colors.GreenWeb
    );
    this.showVacancy();
  }

  get docks() {
    return this._docks;
  }

  set docks(v) {
    this._docks = v;
  }

  get maxDockableShips() {
    return this._maxDockableShips;
  }
}

export default Station;
