import colors from "../lib/colors";

import SpaceEntity from "./SpaceEntity";
import { circ } from "../lib/render";

export default class Asteroid extends SpaceEntity {
  constructor(x, y, size) {
    super("asteroid", "asteroid", x, y, size);
  }

  update() {}

  draw() {
    circ(this.x, this.y, this.size, colors.DirtBrown);
  }
}
