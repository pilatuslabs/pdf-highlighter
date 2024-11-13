import { useSidebar } from "@pdf-reader/hooks/useSidebar";
import type { IHighlight } from "@pdf-reader/types";
import { SideBarContent } from "./sidebar-content";

interface Props {
  highlights: Array<IHighlight>;
  currentPage: number;
}

export function DesktopSidebar({ highlights, currentPage }: Props) {
  const { filteredHighlights, expandedHighlights, toggleHighlight } =
    useSidebar(highlights, currentPage);

  return (
    <div className="h-full text-gray-500 w-[25vw] bg-gray-100 z-50">
      <SideBarContent
        toggleHighlight={toggleHighlight}
        filteredHighlights={filteredHighlights}
        expandedHighlights={expandedHighlights}
      />
    </div>
  );
}
