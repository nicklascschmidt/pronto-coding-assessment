import {
  useEffect,
  useCallback,
  FC,
  RefObject,
  SetStateAction,
  Dispatch
} from 'react';
import TurretIcon from './TurretIcon';
import styled from 'styled-components';
import {
  getClosestLoon,
  getTurretPositionInLoonUnits
} from '../helpers/positionHelpers';
import useInterval from '../hooks/useInterval';
import {
  GameStatus,
  LoonPositions,
  TurretPosition,
  TurretState
} from '../types/types.js';
import { SendJsonMessage } from 'react-use-websocket/dist/lib/types.js';
import { LOON_CANVAS_CLASS_NAME } from '../constants/constants';
import useDragAndDrop from '../hooks/useDragAndDrop';

const TURRET_SIZE_PX = 32;

const DragContainer = styled.div<{
  $position: TurretPosition;
  $isDragging: boolean;
  $isLocked: boolean;
}>`
  position: absolute;
  left: ${({ $position }) =>
    typeof $position.left === 'number' ? `${$position.left}px` : ''};
  top: ${({ $position }) =>
    typeof $position.top === 'number' ? `${$position.top}px` : ''};
  // Can't put cursor=not-allowed with pointer-events=none
  cursor: ${({ $isDragging }) => ($isDragging ? 'grabbing' : 'grab')};
  pointer-events: ${({ $isLocked }) => ($isLocked ? 'none' : '')};

  // this makes the center of the container the click target
  transform: translate(-50%, -50%);
  display: flex; // this shrinks height to SVG
`;

type TurretProps = {
  turret: TurretState;
  containerRef: RefObject<HTMLDivElement>;
  gameStatus: GameStatus;
  loonsPositions: LoonPositions;
  sendJsonMessage: SendJsonMessage;
  setSelectedTurret: Dispatch<SetStateAction<TurretState | undefined>>;
  isSelected: boolean;
};

const Turret: FC<TurretProps> = ({
  turret,
  containerRef,
  gameStatus,
  loonsPositions,
  sendJsonMessage,
  setSelectedTurret,
  isSelected
}) => {
  const iconColor = isSelected ? 'blue' : 'black';
  const { handleMouseDown, isDragging, position, dragRef } = useDragAndDrop({
    containerRef,
    elementSizePx: TURRET_SIZE_PX
  });

  // Calculate the turret position, then find the closest loon to that position,
  //  then send the pop_loon command with that loonId.
  const handlePopLoon = useCallback(() => {
    if (loonsPositions.length) {
      const turretPosition = getTurretPositionInLoonUnits(position);
      const closestLoonId = getClosestLoon(loonsPositions, turretPosition);
      if (closestLoonId) {
        sendJsonMessage({ type: 'pop_loon', data: closestLoonId });
      }
    }
  }, [position, loonsPositions, sendJsonMessage]);

  useInterval(() => {
    if (gameStatus === 'IN_PROGRESS') {
      handlePopLoon();
    }
  }, 1000);

  // If user selects a turret, add a click listener to monitor
  //  if a user clicks off the turret (on the canvas).
  // If user clicks off the turret, deselect the turret.
  useEffect(() => {
    const handleDeselectTurret = (e: MouseEvent) => {
      e.preventDefault();
      const targetEl = e.target as HTMLElement;
      if (
        targetEl &&
        !targetEl.classList.contains(`turret-${turret.id}`) &&
        targetEl.classList.contains(LOON_CANVAS_CLASS_NAME)
      ) {
        setSelectedTurret(undefined);
      }
    };

    if (isSelected) {
      document.addEventListener('click', handleDeselectTurret);
    } else {
      document.removeEventListener('click', handleDeselectTurret);
    }
    return () => {
      document.removeEventListener('click', handleDeselectTurret);
    };
  }, [isSelected, setSelectedTurret, turret]);

  return (
    <DragContainer
      ref={dragRef}
      className={`turret-${turret.id}`}
      onClick={() => setSelectedTurret(turret)}
      onMouseDown={handleMouseDown}
      $isDragging={isDragging}
      $position={position}
      $isLocked={gameStatus === 'IN_PROGRESS'}
    >
      <TurretIcon
        size={TURRET_SIZE_PX}
        color={iconColor}
        // This ensures the deselect click event will
        //  trigger on the container element, which we
        //  can reliably check the class of.
        customStyle={{ pointerEvents: 'none' }}
      />
    </DragContainer>
  );
};

export default Turret;
