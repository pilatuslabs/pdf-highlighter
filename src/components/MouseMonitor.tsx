import React, { useRef, useEffect } from "react";

interface Props {
  onMoveAway: () => void;
  paddingX: number;
  paddingY: number;
  children: JSX.Element;
}

export const MouseMonitor: React.FC<Props> = ({
  onMoveAway,
  paddingX,
  paddingY,
  children,
  ...restProps
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const { left, top, width, height } = container.getBoundingClientRect();

      const inBoundsX =
        clientX > left - paddingX && clientX < left + width + paddingX;
      const inBoundsY =
        clientY > top - paddingY && clientY < top + height + paddingY;

      if (!(inBoundsX && inBoundsY)) {
        onMoveAway();
      }
    };

    const doc = container.ownerDocument;
    doc.addEventListener("mousemove", onMouseMove);
    return () => doc.removeEventListener("mousemove", onMouseMove);
  }, [onMoveAway, paddingX, paddingY]);

  return (
    <div ref={containerRef}>{React.cloneElement(children, restProps)}</div>
  );
};
