import {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
  FC,
  RefObject,
  MouseEventHandler,
  SetStateAction,
  Dispatch
} from 'react';
import TurretIcon from './TurretIcon';
import styled from 'styled-components';
import {
  getClosestLoon,
  getTurretPositionInLoonUnits
} from '../helpers/helpers.js';
import useInterval from '../hooks/useInterval.js';
import { GameStatus, LoonPosition, TurretState } from '../types/types.js';
import { SendJsonMessage } from 'react-use-websocket/dist/lib/types.js';
import { LOON_CANVAS_CLASS_NAME } from '../constants/constants';

const TURRET_SIZE_PX = 32;

type TurretPosition = {
  top: number;
  left: number;
};

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
  // Can't put cursor=not-allowed with pointer-events=none (deprioritize)
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
  loonsPositions: [string, LoonPosition][];
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
  const dragRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({
    left: TURRET_SIZE_PX / 2,
    top: TURRET_SIZE_PX / 2
  });
  const iconColor = isSelected ? 'blue' : 'black';

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        setPosition({
          left: offsetX,
          top: offsetY
        });
      }
    },
    [containerRef]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(true);

      if (dragRef.current) {
        const rect = dragRef.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        setPosition({
          left: position.left + offsetX - TURRET_SIZE_PX / 2,
          top: position.top + offsetY - TURRET_SIZE_PX / 2
        });
      }
    },
    [handleMouseMove, handleMouseUp, position]
  );

  // When the position changes, ensure the turret stays within the canvas.
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const turretOffset = TURRET_SIZE_PX / 2;
      if (position && container) {
        if (position.left - turretOffset < 0) {
          setPosition({ ...position, left: turretOffset });
        } else if (position.left + turretOffset > container.width) {
          setPosition({
            ...position,
            left: container.width - turretOffset
          });
        } else if (position.top - turretOffset < 0) {
          setPosition({ ...position, top: turretOffset });
        } else if (position.top + turretOffset > container.height) {
          setPosition({
            ...position,
            top: container.height - turretOffset
          });
        }
      }
    }
  }, [position, containerRef]);

  const handlePopLoon = useCallback(() => {
    const turretPosition = getTurretPositionInLoonUnits(position);
    const closestLoonId = getClosestLoon(loonsPositions, turretPosition);
    if (closestLoonId) {
      sendJsonMessage({ type: 'pop_loon', data: closestLoonId });
    } else {
      console.log('no loons to pop?', closestLoonId, loonsPositions);
    }
  }, [position, loonsPositions, sendJsonMessage]);

  useInterval(() => {
    if (gameStatus === 'IN_PROGRESS') {
      handlePopLoon();
    }
  }, 1000);

  useEffect(() => {
    console.log('new gameStatus', gameStatus);
  }, [gameStatus]);

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
