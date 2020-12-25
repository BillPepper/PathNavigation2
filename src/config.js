export default {
  // Render Settings
  resolution: { width: 16 * 60, height: 9 * 60 },
  defaultStroke: "#999",
  defualtFill: "#999",
  defualtText: "#999",

  // Game Settings
  shipsEnabled: true,
  asteroidsEnabled: true,
  stationsEnabled: true,
  collisionWidth: 2,
  orbitResolution: 2,
  selectionRange: 1,
  renderShipNames: false,
  renderShipOrbit: false,

  // Debug Settings
  debugEnabled: true,
  debugRenderLineDesc: false,
  debugRenderTriLines: true,
  debugRenderOrbit: false,

  // Map Settings
  map: { width: 1000, height: 1000 },
  mapPadding: 5,
  mapSize: 10,
  mapDotMultiplier: 2, // times
  // Camera Settings
  cameraScrollSpeed: 20
};
