import { ChevronDown } from "@pdf-reader/icons/ChevronDown";
import { ChevronUp } from "@pdf-reader/icons/ChevronUp";
import type { IHighlight } from "@pdf-reader/types";

interface Props {
  highlight: IHighlight;
  expandedHighlights: string[];
  toggleHighlight: (highlightId: string) => void;
}

export function Feedback({
  highlight,
  expandedHighlights,
  toggleHighlight,
}: Props) {
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
}
