import type { IHighlight } from "../types";

interface Props {
  highlights: Array<IHighlight>;
  currentPage: number;
}

const updateHash = (highlight: IHighlight) => {
  document.location.hash = `highlight-${highlight.id}`;
};

export function Sidebar({ highlights, currentPage }: Props) {
  const renderHighlight = (highlight: IHighlight) => {
    return (
      <li
        className="flex justify-between cursor-pointer transition-background duration-140 border-b border-gray-500 sticky top-0 p-2.5 pb-4 hover:bg-[rgba(58,56,52,0.08)] "
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
              className=" max-w-[300px] border border-dashed"
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

  const filteredHighlights = highlights.filter(
    (highlight) => highlight.position.pageNumber === currentPage,
  );
  return (
    <div className="h-full  text-gray-500 w-[25vw] ">
      <div className="h-14 border-b border-gray-200 flex items-center px-4 justify-between shadow-sm ">
        <div className="text-sm text-gray-600 ">Page feedback</div>
      </div>
      <ul className="list-none p-0 bg-white ">
        {filteredHighlights.map((highlight) => (
          <div key={highlight.id}>{renderHighlight(highlight)}</div>
        ))}
      </ul>
    </div>
  );
}
