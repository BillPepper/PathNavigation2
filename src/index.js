import config from "./config";
import colors from "./lib/colors";
import "./lib/input";

// Helpers
import { moveCamera, rect, rectStroke, text } from "./lib/render";
import {
  getMaxScrolls,
  getRectVertecies,
  isEntityInArea,
  isInRange
} from "./lib/helpers";

// Entities
import Asteroid from "./Entities/Asteroid";
import Ship from "./Entities/Ship";
import Station from "./Entities/Station";

// UI
import { renderMap } from "./ui/Map";

// Styling
import "./styles.css";
import drawShiplist from "./ui/Shiplist";
import Ships from "./data/Ships";

// State contains temporary settings
const state = {
  paused: false,
  selectBoxEnabled: false,
  startClick: { x: undefined, y: undefined },
  endClick: { x: undefined, y: undefined },
  orbitTest: [],
  cameraOffset: { vertical: 0, horizontal: 0 }
};

// SpaceEntities contains all entities extended
// from SpaceEntity
const SpaceEntities = {
  ships: [],
  asteroids: [],
  stations: []
};

// --- INPUT ---
export const handleLeftClick = (e) => {
  resetSelection();

  // Select with rectangle
  state.startClick = { x: e.clientX, y: e.clientY };
  state.endClick = { x: e.clientX, y: e.clientY };

  const entity = getEntityAt(e.clientX, e.clientY);

  if (entity.length > 0) {
    entity[0].selected = true;
  } else {
    resetSelection();
  }

  // Path plotting
  if (e.ctrlKey) {
    // try to get ref of ship here
    state.nav.points.push({ x: e.clientX, y: e.clientY });
  }
};

export const handleLeftUp = (e) => {
  state.endClick = {
    x: e.clientX,
    y: e.clientY
  };
  state.selectBoxEnabled = false;

  // prevent failure from undefined rect select
  if (state.startClick.x && state.startClick.y) {
    if (state.endClick.x && state.endClick.y) {
      selectEntities();
    }
  }
};

export const handleRightClick = (e) => {
  const rightClickEntity = getEntityAt(e.clientX, e.clientY)[0];
  const selectedShips = getSelectedShips();

  if (rightClickEntity) {
    console.log("mine/dock");
    dockSelectedShipsAt(rightClickEntity);
  } else {
    flySelectedShipsTo(e.clientX, e.clientY);
  }
};

export const handleMouseMove = (e) => {
  state.endClick = {
    x: e.clientX - state.startClick.x,
    y: e.clientY - state.startClick.y
  };
  // only if primary mouse button clicked and mouse moved
  if (e.buttons === 1) {
    state.selectBoxEnabled = true;
  }
};

export const handleKey = (e) => {
  switch (e.key) {
    case "ArrowUp":
      movCamUp();
      break;
    case "ArrowDown":
      movCamDown();

      break;
    case "ArrowLeft":
      movCamLeft();
      break;
    case "ArrowRight":
      movCamRight();
      break;
    case "Escape":
      togglePause();
      break;
    default:
      console.log("key not assigned", e.key);
      break;
  }
};

export const handleUIClick = (e) => {
  // this definitin is reduntand with input.js one
  const buttonArea = { a: { x: 5, y: 235 }, d: { x: 5 + 100, y: 235 + 20 } };
  console.log(buttonArea);
};

// --- Entity Commands ---
const dockShipAt = (ship, entity) => {
  if (entity.type === "asteroid") {
    ship.mine(entity);
  } else {
    ship.dock(entity);
  }
};

const dockSelectedShipsAt = (entity) => {
  SpaceEntities.ships.forEach((ship) => {
    if (ship.selected) {
      if (entity.type === "asteroid") {
        ship.mine(entity);
      } else {
        ship.dock(entity);
      }
    }
  });
};

const dockSelectedShipAt = (entity) => {
  if (entity.type === "asteroid") {
    entity.mine(entity);
  } else {
    entity.dock(entity);
  }
};

const flySelectedShipsTo = (x, y) => {
  SpaceEntities.ships.forEach((ship) => {
    if (ship.selected) {
      ship.navigate(x, y);
    }
  });
};

const getEntityAt = (x, y) => {
  const entities = mergeEntities();

  let clickedEntities = [];
  for (let i = 0; i < entities.length; i++) {
    if (
      isInRange(entities[i].size, x, entities[i].x) &&
      isInRange(entities[i].size, y, entities[i].y)
    ) {
      clickedEntities.push(entities[i]);
    }
  }

  return clickedEntities;
};

// --- Game State ---
const togglePause = () => {
  state.paused = !state.paused;
};

// --- Camera ---
const movCamUp = () => {
  if (state.cameraOffset.vertical >= 1) {
    state.cameraOffset.vertical--;
    moveCamera(0, config.cameraScrollSpeed);
  }
};

const movCamDown = () => {
  const maxScrollsY = getMaxScrolls().y;
  if (state.cameraOffset.vertical < maxScrollsY) {
    state.cameraOffset.vertical++;
    moveCamera(0, config.cameraScrollSpeed * -1);
  }
};

const movCamLeft = () => {
  if (state.cameraOffset.horizontal >= 1) {
    state.cameraOffset.horizontal--;
    moveCamera(config.cameraScrollSpeed, 0);
  }
};

const movCamRight = () => {
  const maxScrollsX = getMaxScrolls().x;
  if (state.cameraOffset.horizontal < maxScrollsX) {
    state.cameraOffset.horizontal++;
    moveCamera(config.cameraScrollSpeed * -1, 0);
  }
};

// --- Selection ---
const selectEntityAt = (x, y) => {
  const entities = mergeEntities();

  let clickedEntities = [];
  for (let i = 0; i < entities.length; i++) {
    if (
      isInRange(entities[i].size, x, entities[i].x) &&
      isInRange(entities[i].size, y, entities[i].y)
    ) {
      entities[i].selected = true;
    }
  }

  return clickedEntities;
};

const selectEntities = () => {
  const entities = mergeEntities();

  for (let i = 0; i < entities.length; i++) {
    // Reconstruct a rectangle of selection
    const verticies = getRectVertecies(state.startClick, state.endClick);

    // if entity[i] location is inside the vertecies
    if (isEntityInArea(entities[i], verticies, state.cameraOffset)) {
      entities[i].selected = true;
    }
  }
};

const resetSelection = () => {
  const entities = mergeEntities();
  state.selectedEntities = [];
  for (let i = 0; i < entities.length; i++) {
    entities[i].selected = false;
  }
};

const getSelectedShips = () => {
  const ships = [];
  SpaceEntities.ships.forEach((ship) => {
    if (ship.selected) {
      ships.push(ship);
    }
  });
  return ships;
};

// --- Entity Creation ---
const createShip = (name, x, y, speed) => {
  SpaceEntities.ships.push(new Ship(name, x, y, speed));
};

const createAsteroid = (x, y, size) => {
  SpaceEntities.asteroids.push(new Asteroid(x, y, size));
};

const createStation = (name, x, y, size) => {
  SpaceEntities.stations.push(new Station(name, x, y, size));
};

const mergeEntities = () => {
  return [
    ...SpaceEntities.ships,
    ...SpaceEntities.asteroids,
    ...SpaceEntities.stations
  ];
};

// --- Cycle Functions ---
const init = () => {
  // init ships
  if (config.shipsEnabled) {
    console.log("Creating ships");
    Ships.forEach((ship) => {
      createShip(ship.name, ship.x, ship.y, ship.speed);
    });
  }

  // Debugging stuff
  const ez = SpaceEntities.ships[0];
  // ez.nav.postArrival = "stop";

  if (config.asteroidsEnabled) {
    console.log("Creating asteroids");
    createAsteroid(505, 115);
    createAsteroid(515, 125);
    createAsteroid(525, 110);
  }

  if (config.stationsEnabled) {
    console.log("Creating stations");
    createStation("Carbon-12b", 550, 300, 15);
  }
};

const update = () => {
  if (!state.paused) {
    try {
      SpaceEntities.ships.forEach((ship) => {
        if (ship.enabled) {
          ship.update();
        }
      });
      SpaceEntities.asteroids.forEach((asteroid) => {
        if (asteroid.enabled) {
          asteroid.update();
        }
      });
      SpaceEntities.stations.forEach((station) => {
        if (station.enabled) {
          station.update();
        }
      });
      draw();
    } catch (e) {
      console.log(e);
      clearInterval(mainInterval);
    }
  } else {
    drawPause();
  }
};

const draw = () => {
  const camOffset = state.cameraOffset;
  const camSpeed = config.cameraScrollSpeed;
  const res = config.resolution;
  // Clear canvas
  rect(
    0 + camOffset.horizontal * camSpeed,
    0 + camOffset.vertical * camSpeed,
    config.resolution.width + camSpeed * camOffset.vertical,
    res.height,
    colors.spaceBlack
  );

  // Map border
  // rectStroke(1, 1, config.map.width - 1, config.map.height - 1, "#ff00ff");

  // render ships
  SpaceEntities.ships.forEach((ship) => {
    if (ship.enabled) {
      ship.draw();
    }
  });

  // render asteroids
  SpaceEntities.asteroids.forEach((asteroid) => {
    if (asteroid.enabled) {
      asteroid.draw();
    }
  });

  // render stations
  SpaceEntities.stations.forEach((station) => {
    if (station.enabled) {
      station.draw();
    }
  });

  // render Select box if active
  if (state.selectBoxEnabled) {
    rectStroke(
      20 * camOffset.horizontal + state.startClick.x,
      20 * camOffset.vertical + state.startClick.y,
      state.endClick.x,
      state.endClick.y,
      "#444"
    );
  }

  renderMap(
    // state.cameraOffset to move it along with camera
    5 + camOffset.horizontal * 20,
    5 + camOffset.vertical * 20,
    state,
    SpaceEntities
  );

  drawShiplist(5, 120, SpaceEntities.ships);

  // Button
  renderButton(5, 235, 33.3, 20, "Patrol");
  renderButton(33.3 + 5, 235, 33.3, 20, "Idle");
  renderButton(66.6 + 5, 235, 33.3, 20, "Stop");
  rectStroke(5, 235, 100, 20, "#ff00ff");

  // const test = { x: 300, y: 300 };
  // circ(test.x, test.y, 3, "#ff00ff");
  // const bla = generateOrbitDot(test.x, test.y, 100, 90);
  // // console.log(bla);
  // line(test.x, test.y, bla.x, bla.y, "#ff00ff");
};

const renderButton = (x, y, w, h, value, func) => {
  const topPadding = 4;
  rect(x, y, w, h, colors.transparentGray);
  rectStroke(x, y, w, h);
  text(x + w / 2, y + h / 2 + topPadding, value, true, 10);
};

const drawPause = () => {
  if (state.paused) {
    text(
      config.resolution.width / 2,
      config.resolution.height / 2,
      "Paused",
      true,
      50
    );
  }
};

init();
const mainInterval = setInterval(() => {
  update();
}, 20);
