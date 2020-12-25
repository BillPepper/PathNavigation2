import * as Game from "../index";
import { isEntityInArea, isVectorInArea } from "./helpers";

const canvas = document.getElementById("canvas");

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  if (e.buttons === 2) {
    Game.handleRightClick(e);
  }
});

canvas.addEventListener("mousedown", (e) => {
  if (e.buttons === 1) {
    // Point a and d of all buttons
    // if click is in area of buttons, Game.handleButtons() or something like this
    const clickVector = { x: e.clientX, y: e.clientY };
    const buttonArea = { a: { x: 5, y: 235 }, d: { x: 5 + 100, y: 235 + 20 } };

    if (isVectorInArea(clickVector, buttonArea)) {
      Game.handleUIClick(e);
    } else {
      Game.handleLeftClick(e);
    }
  }
});

canvas.addEventListener("mouseup", (e) => {
  Game.handleLeftUp(e);
});

canvas.addEventListener("mousemove", (e) => {
  Game.handleMouseMove(e);
});

document.addEventListener("keydown", (e) => {
  Game.handleKey(e);
});
