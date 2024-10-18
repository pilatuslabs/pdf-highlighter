import styles from "../style/AreaHighlight.module.css";
import type { ViewportHighlight } from "../types";

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
      className={`${styles.areaHighlight} ${styles.part} ${
        isScrolledTo ? styles.scrolledTo : ""
      }`}
      style={{
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`,
        position: "absolute", // Ensure the highlight is positioned correctly
      }}
      onClick={(event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        event.preventDefault();
      }}
      {...otherProps}
    />
  );
}
