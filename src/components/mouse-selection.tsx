import { isHTMLElement } from "@pdf-reader/lib/pdfjs-dom";
import type { LTWH } from "@pdf-reader/types";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

interface Coords {
  x: number;
  y: number;
}

interface Props {
  onSelection: (
    startTarget: HTMLElement,
    boundingRect: LTWH,
    resetSelection: () => void,
  ) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  shouldStart: (event: MouseEvent) => boolean;
  onChange: (isVisible: boolean) => void;
}

const getBoundingRect = (start: Coords, end: Coords): LTWH => ({
  left: Math.min(end.x, start.x),
  top: Math.min(end.y, start.y),
  width: Math.abs(end.x - start.x),
  height: Math.abs(end.y - start.y),
});

const shouldRender = (boundingRect: LTWH) =>
  boundingRect.width >= 1 && boundingRect.height >= 1;

export function MouseSelection({
  onSelection,
  onDragStart,
  onDragEnd,
  shouldStart,
  onChange,
}: Props) {
  const [locked, setLocked] = useState(false);
  const [start, setStart] = useState<Coords | null>(null);
  const [end, setEnd] = useState<Coords | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const startRef = useRef(start);
  const lockedRef = useRef(locked);

  useEffect(() => {
    startRef.current = start;
  }, [start]);

  useEffect(() => {
    lockedRef.current = locked;
  }, [locked]);

  const reset = useCallback(() => {
    onDragEnd();
    setStart(null);
    setEnd(null);
    setLocked(false);
  }, [onDragEnd]);

  // Use ref to track previous visibility state
  const prevVisibleRef = useRef(false);

  // Use layoutEffect instead of effect to handle visibility changes
  useLayoutEffect(() => {
    const isVisible = Boolean(start && end);
    if (prevVisibleRef.current !== isVisible) {
      prevVisibleRef.current = isVisible;
      onChange(isVisible);
    }
  }, [start, end, onChange]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    const container = root.parentElement;
    if (!container || !isHTMLElement(container)) {
      return;
    }

    const containerCoords = (pageX: number, pageY: number) => {
      const containerBoundingRect = container.getBoundingClientRect();
      return {
        x: pageX - containerBoundingRect.left + container.scrollLeft,
        y:
          pageY -
          containerBoundingRect.top +
          container.scrollTop -
          window.scrollY,
      };
    };

    const mouseMoveHandler = (event: MouseEvent) => {
      if (!startRef.current || lockedRef.current) {
        return;
      }
      setEnd(containerCoords(event.pageX, event.pageY));
    };

    const mouseDownHandler = (event: MouseEvent) => {
      if (!shouldStart(event)) {
        reset();
        return;
      }

      const startTarget = event.target as HTMLElement;
      if (!(startTarget instanceof Element) || !isHTMLElement(startTarget)) {
        return;
      }

      onDragStart();
      setStart(containerCoords(event.pageX, event.pageY));
      setEnd(null);
      setLocked(false);

      const mouseUpHandler = (event: Event) => {
        event.currentTarget?.removeEventListener("mouseup", mouseUpHandler);
        const currentStart = startRef.current;
        if (!currentStart) {
          return;
        }
        if (!(event instanceof MouseEvent)) {
          return;
        }

        const endCoords = containerCoords(event.pageX, event.pageY);
        const boundingRect = getBoundingRect(currentStart, endCoords);

        if (
          !(event.target instanceof Element) ||
          !isHTMLElement(event.target) ||
          !container.contains(event.target) ||
          !shouldRender(boundingRect)
        ) {
          reset();
          return;
        }

        setEnd(endCoords);
        setLocked(true);

        onSelection(startTarget, boundingRect, reset);
        onDragEnd();
      };

      const doc = container.ownerDocument;
      if (doc?.body) {
        doc.body.addEventListener("mouseup", mouseUpHandler);
      }
    };

    container.addEventListener("mousemove", mouseMoveHandler);
    container.addEventListener("mousedown", mouseDownHandler);

    return () => {
      container.removeEventListener("mousemove", mouseMoveHandler);
      container.removeEventListener("mousedown", mouseDownHandler);
    };
  }, [shouldStart, onDragStart, onDragEnd, onSelection, reset]);

  return (
    <div ref={rootRef}>
      {start && end && (
        <div
          className="absolute border border-dashed border-gray-800 bg-yellow-300 mix-blend-multiply"
          style={getBoundingRect(start, end)}
        />
      )}
    </div>
  );
}
