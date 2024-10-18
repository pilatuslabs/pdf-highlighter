import styles from "../style/Highlight.module.css";
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
    <div
      className={`Highlight ${styles.highlight} ${
        isScrolledTo ? styles.scrolledTo : ""
      }`}
    >
      <div className={`Highlight__parts ${styles.parts}`}>
        {rects.map((rect, index) => (
          <div
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            onClick={onClick}
            // biome-ignore lint/suspicious/noArrayIndexKey: We can use position hash at some point in future
            key={index}
            style={rect}
            className={`Highlight__part ${styles.part}`}
          />
        ))}
      </div>
    </div>
  );
}
