import config from "../config";

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

canvas.width = config.resolution.width;
canvas.height = config.resolution.height;

export const text = (x, y, str, center, fontSize, color) => {
  context.font = `${fontSize || 12}px Rubik`;
  context.fillStyle = color || config.defualtText;
  context.textAlign = center ? "center" : "left";
  context.fillText(str, x, y);
  context.fillStyle = config.defualtText;
};

export const circ = (x, y, r, col) => {
  context.beginPath();
  context.arc(x, y, r, 0, 2 * Math.PI);
  context.fillStyle = col || config.defualtFill;
  context.fill();
  context.fillStyle = config.defualtFill;
};

export const line = (x, y, tx, ty, col, displayText, renderCenter) => {
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(tx, ty);
  context.strokeStyle = col || config.defaultStroke;
  context.stroke();
  context.strokeStyle = config.defaultStroke;
  renderCenter && circ((x + tx) / 2, (y + ty) / 2, 2);
  displayText &&
    config.debugEnabled &&
    config.debugRenderLineDesc &&
    text((x + tx) / 2, (y + ty) / 2, displayText);
};

export const rect = (sx, sy, tx, ty, col) => {
  context.beginPath();
  context.rect(sx, sy, tx, ty);
  context.fillStyle = col || "#555";
  context.fill();
  context.fillStyle = config.defualtFill;
};

export const rectStroke = (sx, sy, tx, ty, col) => {
  context.beginPath();
  context.rect(sx, sy, tx, ty);
  context.strokeStyle = col || "#555";
  context.stroke();
  context.strokeStyle = config.defualtFill;
};

export const square = (x, y, s, col) => {
  context.beginPath();
  context.rect(x, y, s, s);
  context.fillStyle = col || "#555";
  context.fill();
  context.fillStyle = config.defualtFill;
};

export const moveCamera = (x, y) => {
  context.translate(x, y);
};
