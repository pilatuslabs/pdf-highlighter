import type { IHighlight } from "../types";

interface Props {
  highlights: Array<IHighlight>;
}

const updateHash = (highlight: IHighlight) => {
  document.location.hash = `highlight-${highlight.id}`;
};

export function Sidebar({ highlights }: Props) {
  const renderHighlight = (highlight: IHighlight) => {
    return (
      <li
        className="flex justify-between cursor-pointer transition-background duration-140 border-b border-gray-500 sticky top-0 p-2.5 pb-4 hover:bg-[rgba(58,56,52,0.08)]"
        onClick={() => {
          updateHash(highlight);
        }}
      >
        <div>
          {highlight.content.text ? (
            <p style={{ marginTop: "0.5rem" }}>{highlight.content.text}</p>
          ) : null}
          {highlight.content.image ? (
            <div
              className="overflow-auto max-w-[300px] border border-dashed"
              style={{ marginTop: "0.5rem" }}
            >
              <img src={highlight.content.image} alt={"Screenshot"} />
            </div>
          ) : null}
        </div>
        <div className="mt-2 text-right text-xs self-end">
          Page {highlight.position.pageNumber}
        </div>
      </li>
    );
  };
  return (
    <div className="text-gray-500 w-[25vw]" style={{ width: "25vw" }}>
      <ul className="list-none p-0">
        {highlights.map((highlight) => (
          <div
            key={highlight.id}
            style={{
              height: `${highlight.position.boundingRect.height}px`,
              position: "absolute",
              top: `${
                (highlight.position.pageNumber - 1) *
                highlight.position.boundingRect.height
              }px`,
            }}
          >
            {renderHighlight(highlight)}
          </div>
        ))}
      </ul>
    </div>
  );
}
