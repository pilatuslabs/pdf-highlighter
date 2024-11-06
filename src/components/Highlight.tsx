import type { LTWHP } from "../types.js";

interface Props {
  position: {
    boundingRect: LTWHP;
    rects: Array<LTWHP>;
  };
  onClick?: () => void;
  onMouseOver?: () => void;
  onMouseOut?: () => void;
  isScrolledTo: boolean;
}

export function Highlight({
  position,
  onClick,
  onMouseOver,
  onMouseOut,
  isScrolledTo,
}: Props) {
  const { rects } = position;

  return (
    <div className="absolute">
      <div className="opacity-100">
        {rects.map((rect) => (
          <div
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            onClick={onClick}
            key={
              rect.left +
              rect.top +
              (rect.pageNumber || 0) +
              rect.height +
              rect.width
            }
            style={{
              top: `${rect.top}px`,
              left: `${rect.left}px`,
              width: `${rect.width}px`,
              height: `${rect.height}px`,
            }}
            className={`absolute ${
              isScrolledTo ? "bg-red-500" : "bg-yellow-300"
            } transition-colors`}
          />
        ))}
      </div>
    </div>
  );
}
