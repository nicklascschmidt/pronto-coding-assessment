import { PX_MULTIPLIER, CANVAS_HEIGHT_PX } from '../constants/constants';

const calculateHypotenuse = (x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const hypotenuse = Math.sqrt(dx ** 2 + dy ** 2);
  return hypotenuse;
};

// Calculate the location of the turret, in the unit that loons
//  records their positions (in our case: pixels).
// The CANVAS_WIDTH is ignored bc the loon positions are exclusively
//  positive values, vs the height which is pos/neg.
export const getTurretPositionInLoonUnits = (turretPosition) => ({
  position_x: turretPosition.left / PX_MULTIPLIER,
  position_y: -(turretPosition.top / PX_MULTIPLIER - CANVAS_HEIGHT_PX / 2)
});

// Treat both the loon and turret positions as coordinates on a plane
//  and calculate the distance between the points.
const getLoonDistanceFromTurret = (loonPosition, turretPosition) =>
  calculateHypotenuse(
    loonPosition.position_x,
    loonPosition.position_y,
    turretPosition.position_x,
    turretPosition.position_y
  );

export const getClosestLoon = (loonsPositions, turretPosition) => {
  let closestLoonId = '';
  loonsPositions.reduce((acc, [loonId, loonPosition]) => {
    const distanceFromTurret = getLoonDistanceFromTurret(
      loonPosition,
      turretPosition
    );
    if (distanceFromTurret < acc) {
      closestLoonId = loonId;
      acc = distanceFromTurret;
    }
    return acc;
  }, Infinity);
  return closestLoonId;
};
