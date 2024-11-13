import { useSidebar } from "@pdf-reader/hooks/useSidebar";
import type { IHighlight } from "@pdf-reader/types";
import { SideBarContent } from "./sidebar-content";

interface Props {
  highlights: Array<IHighlight>;
  currentPage: number;
  closeSideBar: () => void;
  isOpen: boolean;
}

export function MobileSidebar({
  highlights,
  currentPage,
  closeSideBar,
  isOpen,
}: Props) {
  const { filteredHighlights, expandedHighlights, toggleHighlight } =
    useSidebar(highlights, currentPage);

  return (
    <div
      className={`
      fixed inset-y-0 right-0 
      w-[72vw] 
      bg-gray-100 
      text-gray-500 
      z-50
      transform
      transition-transform
      duration-300
      ease-in-out
      ${isOpen ? "translate-x-0" : "translate-x-full"}
      shadow-lg
    `}
    >
      <SideBarContent
        closeSideBar={closeSideBar}
        toggleHighlight={toggleHighlight}
        filteredHighlights={filteredHighlights}
        expandedHighlights={expandedHighlights}
      />
    </div>
  );
}
