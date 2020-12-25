import config from "../config";
import { generateOrbitNavs } from "../lib/helpers";
import { circ } from "../lib/render";

export default class SpaceEntity {
  constructor(name, type, x, y, size) {
    this._x = x;
    this._y = y;
    this._name = name;
    this._type = type;
    this._enabled = true;
    this._selected = false;
    this._size = size || 5;
    this._orbitNavs = [];
  }

  updateOrbit() {
    this.orbitNavs = generateOrbitNavs(
      this.x,
      this.y,
      this.size + this.size * 2,
      config.orbitResolution * this.size
    );
  }

  drawOrbit() {
    if (config.debugEnabled && config.renderShipOrbit && this.selected) {
      this.orbitNavs.forEach((nav) => circ(nav.x, nav.y, 1, "white"));
    }
  }

  get orbitNavs() {
    return this._orbitNavs;
  }

  set orbitNavs(v) {
    this._orbitNavs = v;
  }

  get type() {
    return this._type;
  }

  set type(v) {
    this._type = v;
  }

  get name() {
    return this._name;
  }

  set name(v) {
    this._name = v;
  }

  get x() {
    return this._x;
  }

  set x(v) {
    this._x = v;
  }

  get y() {
    return this._y;
  }

  set y(v) {
    this._y = v;
  }

  get enabled() {
    return this._enabled;
  }

  set enabled(v) {
    this._enabled = v;
  }

  get selected() {
    return this._selected;
  }

  set selected(v) {
    this._selected = v;
  }

  get size() {
    return this._size;
  }

  set size(v) {
    this._size = v;
  }
}
