import config from "../config";
import { circ } from "./render";

const debugElement = document.getElementById("debug");

export const setDebugText = (text) => {
  debugElement.innerHTML = text;
};

export const calcWaypoints = (vertices) => {
  var waypoints = [];
  for (var i = 1; i < vertices.length; i++) {
    var pt0 = vertices[i - 1];
    var pt1 = vertices[i];
    var dx = pt1.x - pt0.x;
    var dy = pt1.y - pt0.y;
    for (var j = 0; j < 100; j++) {
      var x = pt0.x + (dx * j) / 100;
      var y = pt0.y + (dy * j) / 100;
      waypoints.push({
        x: x,
        y: y
      });
    }
  }
  return waypoints;
};

export const getRandom = (min, max) =>
  Math.floor(Math.random() * (max - min) + min);

export const isInRange = (range, value, comparison) => {
  // plus minus x
  return Math.abs(value - comparison) <= range;
};

export const generateOrbitNavs = (x, y, radius, amount) => {
  const r = radius;
  const degree = 360 / amount;
  const theta = (degree * Math.PI) / 180;

  const vertices = [];
  for (let i = 0; i < amount; i++) {
    const tx = r * Math.cos(theta * i);
    const ty = r * Math.sin(theta * i);
    vertices.push({ x: tx + x, y: ty + y });
    circ(tx + x, ty + y, 1);
  }
  return vertices;
};

export const generateOrbitDot = (x, y, radius, d) => {
  const r = radius;
  const degree = 360 / 1;
  const theta = (degree * Math.PI) / 180;

  const tx = r * Math.cos(degree * theta);
  const ty = r * Math.sin(degree * theta);

  return { x: tx, y: ty };
};

export const arrMin = (arr) => {
  return Math.min(...arr);
};

export const arrMax = (arr) => {
  return Math.max(...arr);
};

export const getRectVertecies = (startVector, endVector) => {
  const xs = [startVector.x, endVector.x];
  const ys = [startVector.y, endVector.y];

  const minX = arrMin(xs);
  const maxX = arrMax(xs);
  const minY = arrMin(ys);
  const maxY = arrMax(ys);

  return {
    a: { x: minX, y: minY },
    b: { x: minX, y: maxY },
    c: { x: maxX, y: minY },
    d: { x: maxX, y: maxY }
  };
};

export const getMaxScrolls = () => {
  const maxX =
    (config.map.width - config.resolution.width) / config.cameraScrollSpeed;
  const maxY =
    (config.map.height - config.resolution.height) / config.cameraScrollSpeed;
  return { x: maxX, y: maxY };
};

export const isEntityInArea = (entity, areaVectors, camOffset) => {
  // append " + 20 * camOffset.horizontal && " for cam offset
  const vector = { x: entity.x, y: entity.y };
  const area = {
    a: { x: areaVectors.a.x, y: areaVectors.a.y },
    d: { x: areaVectors.d.x, y: areaVectors.d.y }
  };

  return isVectorInArea(vector, area);
};

export const isVectorInArea = (vector, area) => {
  return (
    vector.x > area.a.x &&
    vector.x < area.d.x &&
    vector.y > area.a.y &&
    vector.y < area.d.y
  );
};
