import type { IHighlight } from "@pdf-reader/types";
import { useState } from "react";

interface UseSidebarReturn {
  filteredHighlights: IHighlight[];
  expandedHighlights: string[];
  toggleHighlight: (higlighId: string) => void;
}

export const useSidebar = (
  highlights: IHighlight[],
  currentPage: number,
): UseSidebarReturn => {
  const [expandedHighlights, setExpandedHighlights] = useState<string[]>([]);

  const toggleHighlight = (id: string) => {
    setExpandedHighlights((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const filteredHighlights = highlights.filter(
    (highlight) => highlight.position.pageNumber === currentPage,
  );
  return {
    filteredHighlights,
    expandedHighlights,
    toggleHighlight,
  };
};
