import type { IHighlight } from "../types";

import styles from "../style/Sidebar.module.css";

interface Props {
  highlights: Array<IHighlight>;
}

const updateHash = (highlight: IHighlight) => {
  document.location.hash = `highlight-${highlight.id}`;
};

export function Sidebar({ highlights }: Props) {
  const renderHighlight = (highlight: IHighlight, index: number) => {
    return (
      <li
        key={index}
        className={styles.sidebar__highlight}
        onClick={() => {
          updateHash(highlight);
        }}
        style={{
          top: `${
            highlight.position.boundingRect.y1 +
            (highlight.position.pageNumber - 1) *
              highlight.position.boundingRect.height
          }px`,
        }}
      >
        <div>
          <strong>{highlight.comment.text}</strong>
          {highlight.content.text ? (
            <blockquote style={{ marginTop: "0.5rem" }}>
              {`${highlight.content.text.slice(0, 90).trim()}…`}
            </blockquote>
          ) : null}
          {highlight.content.image ? (
            <div
              className={styles.highlight__image}
              style={{ marginTop: "0.5rem" }}
            >
              <img src={highlight.content.image} alt={"Screenshot"} />
            </div>
          ) : null}
        </div>
        <div className={styles.highlight__location}>
          Page {highlight.position.pageNumber}
        </div>
      </li>
    );
  };
  return (
    <div className={styles.sidebar} style={{ width: "25vw" }}>
      <ul className={styles.sidebar__highlights}>
        {highlights.map((highlight, index) =>
          renderHighlight(highlight, index),
        )}
      </ul>
    </div>
  );
}
