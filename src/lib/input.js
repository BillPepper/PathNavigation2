import * as Game from "../index";

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
    // const buttonArea = { a: { x: 0, y: 0 }, d: { x: 0, y: 0 } };
    // if click is in area of buttons, Game.handleButtons() or something like this

    Game.handleLeftClick(e);
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
