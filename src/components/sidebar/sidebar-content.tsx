import { Feedback } from "@pdf-reader/components/feedback";
import { CloseIcon } from "@pdf-reader/icons/closeIcon";
import type { IHighlight } from "@pdf-reader/types";

interface Props {
  filteredHighlights: IHighlight[];
  expandedHighlights: string[];
  toggleHighlight: (highlightId: string) => void;
  closeSideBar?: (() => void) | null;
}

export function SideBarContent({
  filteredHighlights,
  expandedHighlights,
  toggleHighlight,
  closeSideBar = null,
}: Props) {
  return (
    <>
      <div className="z-50 h-14  border-b border-gray-200 flex items-center px-4 justify-between shadow-sm bg-white">
        <div className="text-sm text-gray-600">Page feedback</div>
        {closeSideBar !== null && (
          <div onClick={closeSideBar}>
            <CloseIcon />
          </div>
        )}
      </div>
      <div className="p-4 space-y-3 ">
        {filteredHighlights.length > 0 ? (
          filteredHighlights.map((highlight) => (
            <Feedback
              key={highlight.id}
              highlight={highlight}
              expandedHighlights={expandedHighlights}
              toggleHighlight={() => toggleHighlight(highlight.id)}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No feedback for this page
          </div>
        )}
      </div>
    </>
  );
}
