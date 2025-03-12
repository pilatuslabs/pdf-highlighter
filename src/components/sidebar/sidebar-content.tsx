import { Feedback } from "@pdf-reader/components/feedback";
import { CloseIcon } from "@pdf-reader/icons/close-icon";
import type { IHighlight } from "@pdf-reader/types";

interface Props {
  filteredHighlights: IHighlight[];
  expandedHighlights: string[];
  toggleHighlight: (highlightId: string) => void;
  toggleSideBar?: () => void;
  isOpen: boolean;
}

export function SideBarContent({
  filteredHighlights,
  expandedHighlights,
  toggleHighlight,
  toggleSideBar,
  isOpen,
}: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="z-50 h-14 border-b border-gray-200 flex items-center px-4 justify-between shadow-sm bg-white flex-shrink-0">
        <div className="text-sm text-gray-600">Page feedback</div>
        <div onClick={toggleSideBar}>
          <CloseIcon isOpen={isOpen} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
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
      </div>
    </div>
  );
}
