import {
  MouseEventHandler,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import { TurretPosition } from '../types/types';

type UseDragAndDropProps = {
  containerRef: RefObject<HTMLDivElement>;
  elementSizePx: number;
};

type UseDragAndDropReturnValues = {
  handleMouseDown: MouseEventHandler<HTMLDivElement>;
  isDragging: boolean;
  position: TurretPosition;
  dragRef: RefObject<HTMLDivElement>;
};

const useDragAndDrop = ({
  containerRef,
  elementSizePx
}: UseDragAndDropProps): UseDragAndDropReturnValues => {
  const dragRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<TurretPosition>({
    left: elementSizePx / 2,
    top: elementSizePx / 2
  });

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
          left: position.left + offsetX - elementSizePx / 2,
          top: position.top + offsetY - elementSizePx / 2
        });
      }
    },
    [elementSizePx, handleMouseMove, handleMouseUp, position.left, position.top]
  );

  // When the position changes, ensure the turret stays within the canvas.
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const elSizeOffset = elementSizePx / 2;
      if (position && container) {
        if (position.left - elSizeOffset < 0) {
          setPosition({ ...position, left: elSizeOffset });
        } else if (position.left + elSizeOffset > container.width) {
          setPosition({
            ...position,
            left: container.width - elSizeOffset
          });
        } else if (position.top - elSizeOffset < 0) {
          setPosition({ ...position, top: elSizeOffset });
        } else if (position.top + elSizeOffset > container.height) {
          setPosition({
            ...position,
            top: container.height - elSizeOffset
          });
        }
      }
    }
  }, [position, containerRef, elementSizePx]);

  return { handleMouseDown, isDragging, position, dragRef };
};

export default useDragAndDrop;
