import config from "../config";
import colors from "../lib/colors";
import { rect, rectStroke } from "../lib/render";

export const renderMap = (x, y, state, entities) => {
  const res = config.resolution;
  const mapSize = config.mapSize;
  const mapPadding = config.mapPadding;
  const map = config.map;
  const camOffset = state.cameraOffset;
  const camSpeed = config.cameraScrollSpeed;

  // Shadow
  // rect(
  //   x + 1,
  //   y + 1,
  //   map.width / mapSize,
  //   map.height / mapSize,
  //   colors.ShadowGray
  // );

  // Map
  rect(x, y, map.width / mapSize, map.height / mapSize, colors.transparentGray);

  // Screen
  rectStroke(
    x + camOffset.horizontal * (camSpeed / mapSize),
    y + camOffset.vertical * (camSpeed / mapSize),
    res.width / mapSize,
    res.height / mapSize,
    colors.Mandarin
  );

  // Ship dots
  entities.ships.forEach((ship) => {
    rect(
      mapPadding + ship.x / mapSize + camSpeed * camOffset.horizontal,
      mapPadding + ship.y / mapSize + camSpeed * camOffset.vertical,
      (ship.size / 10) * config.mapDotMultiplier,
      (ship.size / 10) * config.mapDotMultiplier,
      ship.selected ? colors.Mandarin : "white"
    );
  });
  entities.stations.forEach((station) => {
    rect(
      mapPadding + station.x / mapSize + camSpeed * camOffset.horizontal,
      mapPadding + station.y / mapSize + camSpeed * camOffset.vertical,
      (station.size / 10) * config.mapDotMultiplier,
      (station.size / 10) * config.mapDotMultiplier,
      (station.size / 10) * config.mapDotMultiplier,
      station.selected ? colors.Mandarin : colors.GreenWeb
    );
  });
};
