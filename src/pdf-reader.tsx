import {
  AreaHighlight,
  DesktopSidebar,
  Highlight,
  PdfHighlighter,
  PdfLoader,
  Popup,
  Spinner,
  Tip,
  MobileSidebar,
} from "@pdf-reader/index";
import { useCallback, useEffect, useRef, useState } from "react";

import type {
  IHighlight,
  IPdfAndHighlights,
  NewHighlight,
} from "@pdf-reader/types";

import type { PDFDocumentProxy } from "pdfjs-dist";
import { useMobileBreakpoint } from "./hooks/useMobileBreakpoint";

const getNextId = () => String(Math.random()).slice(2);

const parseIdFromHash = () =>
  document.location.hash.slice("#highlight-".length);

const resetHash = () => {
  document.location.hash = "";
};

interface Props {
  data: IPdfAndHighlights;
}

export function PdfReader({ data }: Props) {
  const [url] = useState(data.url);
  const [highlights, setHighlights] = useState<Array<IHighlight>>(
    data.highlights ? [...data.highlights] : []
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const isMobileBreakpoint = useMobileBreakpoint();
  const [pdfScaleValue, setPdfScaleValue] = useState(() =>
    isMobileBreakpoint ? "page-width" : "auto"
  );

  useEffect(() => {
    isMobileBreakpoint
      ? setPdfScaleValue("page-width")
      : setPdfScaleValue("auto");
  }, [isMobileBreakpoint]);

  const scrollViewerTo = useRef((highlight: IHighlight) => {
    // Implement scrolling logic here
  });

  const scrollToHighlightFromHash = useCallback(() => {
    const highlight = getHighlightById(parseIdFromHash());
    if (highlight) {
      scrollViewerTo.current(highlight);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("hashchange", scrollToHighlightFromHash, false);
    return () => {
      window.removeEventListener(
        "hashchange",
        scrollToHighlightFromHash,
        false
      );
    };
  }, [scrollToHighlightFromHash]);

  const getHighlightById = (id: string) => {
    return highlights.find((highlight) => highlight.id === id);
  };

  const addHighlight = (highlight: NewHighlight) => {
    console.log("Saving highlight", highlight);
    setHighlights((prevHighlights) => [
      { ...highlight, id: getNextId(), isPageFeedback: false },
      ...prevHighlights,
    ]);
  };

  const renderPage = (pdfDocument: PDFDocumentProxy) => {
    return (
      <PdfHighlighter
        pdfDocument={pdfDocument}
        pdfScaleValue={pdfScaleValue}
        enableAreaSelection={(event) => event.altKey}
        onScrollChange={resetHash}
        scrollRef={(scrollTo) => {
          scrollViewerTo.current = scrollTo;
          scrollToHighlightFromHash();
        }}
        onSelectionFinished={(
          position,
          content,
          hideTipAndSelection,
          transformSelection
        ) => (
          <Tip
            onOpen={transformSelection}
            onConfirm={(comment) => {
              addHighlight({ content, position, comment });
              hideTipAndSelection();
            }}
          />
        )}
        highlightTransform={({
          highlight,
          index,
          setTip,
          hideTip,
          isScrolledTo,
        }) => {
          const isPageFeedback = highlight.isPageFeedback;
          if (isPageFeedback) {
            return null;
          }
          const isTextHighlight = !highlight.content?.image;

          const component = isTextHighlight ? (
            <Highlight
              isScrolledTo={isScrolledTo}
              position={highlight.position}
            />
          ) : (
            <AreaHighlight isScrolledTo={isScrolledTo} highlight={highlight} />
          );
          return (
            <Popup
              popupContent={<div>popup remove it later</div>}
              onMouseOver={(popupContent) =>
                setTip(highlight, () => popupContent)
              }
              onMouseOut={hideTip}
              key={index}
            >
              {component}
            </Popup>
          );
        }}
        highlights={highlights}
        currentPage={currentPage}
        updateCurrentPage={(updatedPage) => setCurrentPage(updatedPage)}
        openDrawer={openDrawer}
      />
    );
  };

  const openDrawer = () => {
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex h-screen">
      <PdfLoader url={url} beforeLoad={<Spinner />}>
        {(pdfDocument) => renderPage(pdfDocument)}
      </PdfLoader>

      {isMobileBreakpoint && (
        <>
          <div
            className={`
        absolute top-0 bottom-0 right-0 left-0
        bg-black/40
        bg-blend-color
        z-20
        transition-opacity
        duration-300
        ease-in-out
        ${isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
            onClick={() => setIsDrawerOpen(false)}
          />
          <MobileSidebar
            highlights={highlights}
            currentPage={currentPage}
            closeSideBar={() => setIsDrawerOpen(false)}
            isOpen={isDrawerOpen}
          />
        </>
      )}
      {/* )} */}
      {!isMobileBreakpoint && (
        <DesktopSidebar highlights={highlights} currentPage={currentPage} />
      )}
    </div>
  );
}
