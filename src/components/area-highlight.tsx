import type { ViewportHighlight } from "@pdf-reader/types";

interface Props {
  highlight: ViewportHighlight;
  isScrolledTo: boolean;
}

export function AreaHighlight({
  highlight,
  isScrolledTo,
  ...otherProps
}: Props) {
  const { top, left, width, height } = highlight.position.boundingRect;

  return (
    <div
      className={`absolute border border-gray-800 ${
        isScrolledTo ? "bg-red-500" : "bg-yellow-300"
      } transition-colors mix-blend-multiply`}
      style={{
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      onClick={(event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        event.preventDefault();
      }}
      {...otherProps}
    />
  );
}
