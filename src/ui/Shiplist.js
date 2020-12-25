import { rect, text } from "../lib/render";
import colors from "../lib/colors";

const drawShiplist = (x, y, shipList) => {
  const tx = 100;
  const ty = 100;
  const lineHeight = 12;
  const paddingTop = 12;
  const paddingLeft = 2;

  // Render container
  rect(x, y, tx, ty, colors.transparentGray);

  shipList.slice(0, 6).forEach((ship, i) => {
    const shipDesc = `${ship.name} - ${ship.nav.order}`;
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

export default drawShiplist;
