import config from "./config";
import colors from "./lib/colors";
import "./lib/input";

// Helpers
import { moveCamera, rect, rectStroke, text } from "./lib/render";
import { getMaxScrolls, getRectVertecies, isInRange } from "./lib/helpers";

// Entities
import Asteroid from "./Entities/Asteroid";
import Ship from "./Entities/Ship";
import Station from "./Entities/Station";

// UI
import { renderMap } from "./ui/map";

// Styling
import "./styles.css";

// State contains temporary settings
const state = {
  paused: false,
  selectedEntity: undefined,
  selectBoxEnabled: false,
  startClick: { x: 0, y: 0 },
  endClick: { x: 0, y: 0 },
  orbitTest: [],
  camera: { x: 0, y: 0 },
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
  // Select with click
  const entity = getEntityAt(e.clientX, e.clientY);

  // Select with rectangle
  state.startClick = { x: e.clientX, y: e.clientY };
  state.endClick = { x: e.clientX, y: e.clientY };

  if (entity.length > 0) {
    entity[0].selected = true;
    state.selectedEntity = entity[0];
  } else {
    resetSelection();
  }

  // Path plotting
  if (e.ctrlKey) {
    // try to get ref of ship here
    debugger;

    state.nav.points.push({ x: e.clientX, y: e.clientY });
  }
};

export const handleLeftUp = (e) => {
  state.endClick = {
    x: e.clientX,
    y: e.clientY
  };
  state.selectBoxEnabled = false;
  selectEntities();
};

export const handleRightClick = (e) => {
  const rightClickItems = getEntityAt(e.clientX, e.clientY);

  if (rightClickItems.length > 0) {
    const rightClickItem = rightClickItems[0];
    const selectedItem = state.selectedEntity;

    if (rightClickItem && selectedItem) {
      // Dock one ship
      if (rightClickItem.type === "asteroid") {
        selectedItem.mine(rightClickItem);
        console.log("mine");
      } else {
        selectedItem.dock(rightClickItem);
        console.log("dock");
      }
    } else {
      // Dock multiple ships
      SpaceEntities.ships.forEach((ship) => {
        if (ship.selected) {
          ship.dock(rightClickItem);
        }
      });
    }
  } else {
    // Fly to nav point
    SpaceEntities.ships.forEach((ship) => {
      if (ship.selected) {
        ship.navigate(e.clientX, e.clientY);
      }
    });
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
      if (state.cameraOffset.vertical >= 1) {
        state.cameraOffset.vertical--;
        moveCamera(0, config.cameraScrollSpeed);
      }
      break;
    case "ArrowDown":
      const maxScrollsY = getMaxScrolls().y;
      if (state.cameraOffset.vertical < maxScrollsY) {
        state.cameraOffset.vertical++;
        moveCamera(0, config.cameraScrollSpeed * -1);
      }

      break;
    case "ArrowLeft":
      if (state.cameraOffset.horizontal >= 1) {
        state.cameraOffset.horizontal--;
        moveCamera(config.cameraScrollSpeed, 0);
      }
      break;
    case "ArrowRight":
      const maxScrollsX = getMaxScrolls().x;
      if (state.cameraOffset.horizontal < maxScrollsX) {
        state.cameraOffset.horizontal++;
        moveCamera(config.cameraScrollSpeed * -1, 0);
      }
      break;
    case "Escape":
      state.paused = !state.paused;
      break;
    default:
      console.log("key not assigned", e.key);
      break;
  }
};

// --- Selection ---
const getEntityAt = (clickX, clickY) => {
  const entities = mergeEntities();

  let clickedEntities = [];
  for (let i = 0; i < entities.length; i++) {
    if (
      isInRange(entities[i].size, clickX, entities[i].x) &&
      isInRange(entities[i].size, clickY, entities[i].y)
    ) {
      clickedEntities.push(entities[i]);
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
    if (
      entities[i].x > verticies.a.x + 20 * state.cameraOffset.horizontal &&
      entities[i].x < verticies.d.x + 20 * state.cameraOffset.horizontal &&
      entities[i].y > verticies.a.y + 20 * state.cameraOffset.vertical &&
      entities[i].y < verticies.d.y + 20 * state.cameraOffset.vertical
    ) {
      entities[i].selected = true;
    }
  }
};

const resetSelection = () => {
  const entities = mergeEntities();
  state.selectedEntity = undefined;
  for (let i = 0; i < entities.length; i++) {
    entities[i].selected = false;
  }
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
    createShip("EZ-100", 500, 300, 2);
    createShip("AK-886", 100, 10, 0.8);
    createShip("HG-239", 400, 200, 0.3);
    createShip("SK-945", 100, 400, 1);
    createShip("TT-934", 100, 600, 0.8);
    createShip("UT-223", 600, 600, 0.3);
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
    colors.SpaceCadet
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

  drawShiplist(5, 120);

  // Button
  renderButton(5, 235, 33.3, 20, "Patrol");
  renderButton(33.3 + 5, 235, 33.3, 20, "Idle");
  renderButton(66.6 + 5, 235, 33.3, 20, "Stop");

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

const drawShiplist = (x, y) => {
  const tx = 100;
  const ty = 100;
  const lineHeight = 12;
  const paddingTop = 12;
  const paddingLeft = 2;

  // Render container
  rect(x, y, tx, ty, colors.transparentGray);

  SpaceEntities.ships.slice(0, 6).forEach((ship, i) => {
    const shipDesc = `${ship.name} - ${ship.nav.postArrival}`;
    text(
      x + paddingLeft,
      paddingTop + y + lineHeight * i,
      shipDesc,
      false,
      10,
      ship.selected ? colors.Mandarin : undefined
    );
  });
};

init();
const mainInterval = setInterval(() => {
  update();
}, 20);
