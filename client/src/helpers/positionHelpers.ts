import { PX_MULTIPLIER, CANVAS_HEIGHT_PX } from '../constants/constants';
import { LoonPosition, LoonPositions, TurretPosition } from '../types/types';

const calculateHypotenuse = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const hypotenuse = Math.sqrt(dx ** 2 + dy ** 2);
  return hypotenuse;
};

// Calculate the location of the turret, in the unit that loons
//  records their positions (in our case: pixels).
// The CANVAS_WIDTH is ignored bc the loon positions are exclusively
//  positive values, vs the height which is pos/neg.
export const getTurretPositionInLoonUnits = (
  turretPosition: TurretPosition
): TurretPosition => ({
  left: turretPosition.left / PX_MULTIPLIER,
  top: -(turretPosition.top / PX_MULTIPLIER - CANVAS_HEIGHT_PX / 2)
});

// Treat both the loon and turret positions as coordinates on a plane
//  and calculate the distance between the points.
const getLoonDistanceFromTurret = (
  loonPosition: LoonPosition,
  turretPosition: TurretPosition
) =>
  calculateHypotenuse(
    loonPosition.position_x,
    loonPosition.position_y,
    turretPosition.left,
    turretPosition.top
  );

export const getClosestLoon = (
  loonsPositions: LoonPositions,
  turretPosition: TurretPosition
) => {
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
