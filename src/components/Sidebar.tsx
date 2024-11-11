import { ChevronDown } from "@pdf-reader/icons/ChevronDown";
import { ChevronUp } from "@pdf-reader/icons/ChevronUp";
import type { IHighlight } from "@pdf-reader/types";
import { useState } from "react";

interface Props {
  highlights: Array<IHighlight>;
  currentPage: number;
}

export function Sidebar({ highlights, currentPage }: Props) {
  const [expandedHighlights, setExpandedHighlights] = useState<string[]>([]);

  const toggleHighlight = (id: string) => {
    setExpandedHighlights((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const renderHighlight = (highlight: IHighlight) => {
    const isExpanded = expandedHighlights.includes(highlight.id);

    return (
      <div
        key={highlight.id}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <button
          type="button"
          onClick={() => toggleHighlight(highlight.id)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <div className="text-left">
            <div className="text-xs font-medium text-gray-500">
              {highlight?.comment?.text}
            </div>
            {highlight.content.text && (
              <div className="text-sm font-medium text-gray-900">
                {highlight.content.text.slice(0, 20)}...
              </div>
            )}
          </div>
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 text-sm text-gray-600 border-t border-gray-100">
            {highlight.content.text && (
              <p className="mt-2 leading-relaxed">{highlight.content.text}</p>
            )}
            {highlight.content.image && (
              <div className="mt-2 max-w-[300px] border border-dashed">
                <img src={highlight.content.image} alt="Screenshot" />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const filteredHighlights = highlights.filter(
    (highlight) => highlight.position.pageNumber === currentPage,
  );

  return (
    <div className="h-full text-gray-500 w-[25vw] bg-gray-100 ">
      <div className="h-14 border-b border-gray-200 flex items-center px-4 justify-between shadow-sm bg-white">
        <div className="text-sm text-gray-600">Page feedback</div>
      </div>
      <div className="p-4 space-y-3 ">
        {filteredHighlights.length > 0 ? (
          filteredHighlights.map((highlight) => renderHighlight(highlight))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No feedback for this page
          </div>
        )}
      </div>
    </div>
  );
}
