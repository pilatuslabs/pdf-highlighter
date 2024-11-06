import { useCallback, useEffect, useRef, useState } from "react";

import {
  AreaHighlight,
  Highlight,
  PdfHighlighter,
  PdfLoader,
  Popup,
  Sidebar,
  Spinner,
  Tip,
} from "./index";
import type { IHighlight, IPdfAndHighlights, NewHighlight } from "./index";

import { testHighlights as _testHighlights } from "../example/src/data/test-feedback";

import "./style/App.css";
import "../dist/style.css";
import type { PDFDocumentProxy } from "pdfjs-dist";

const testHighlights: IPdfAndHighlights = _testHighlights;

const getNextId = () => String(Math.random()).slice(2);

const parseIdFromHash = () =>
  document.location.hash.slice("#highlight-".length);

const resetHash = () => {
  document.location.hash = "";
};

export function App() {
  const [url] = useState(testHighlights.url);
  const [highlights, setHighlights] = useState<Array<IHighlight>>(
    testHighlights.highlights ? [...testHighlights.highlights] : [],
  );
  const [currentPage, setCurrentPage] = useState<number>(1);

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
        false,
      );
    };
  }, [scrollToHighlightFromHash]);

  const getHighlightById = (id: string) => {
    return highlights.find((highlight) => highlight.id === id);
  };

  const addHighlight = (highlight: NewHighlight) => {
    console.log("Saving highlight", highlight);
    setHighlights((prevHighlights) => [
      { ...highlight, id: getNextId(), isPageFeedback: true }, // TODO : We're assuming page feedback , remove this assumption later.
      ...prevHighlights,
    ]);
  };

  const renderPage = (pdfDocument: PDFDocumentProxy) => {
    return (
      <PdfHighlighter
        pdfDocument={pdfDocument}
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
          transformSelection,
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
      />
    );
  };

  return (
    <div className="flex h-screen">
      <PdfLoader url={url} beforeLoad={<Spinner />}>
        {(pdfDocument) => renderPage(pdfDocument)}
      </PdfLoader>
      <Sidebar highlights={highlights} currentPage={currentPage} />
    </div>
  );
}
