import { HighlightLayer } from "@pdf-reader/components/highlight-layer";
import { MouseSelection } from "@pdf-reader/components/mouse-selection";
import { TipContainer } from "@pdf-reader/components/tip-container";
import { useMobileBreakpoint } from "@pdf-reader/hooks/useMobileBreakpoint";
import { ZoomIn } from "@pdf-reader/icons/zoom-in";
import { ZoomOut } from "@pdf-reader/icons/zoom-out";
import {
  scaledToViewport,
  viewportToScaled,
} from "@pdf-reader/lib/coordinates";
import { getAreaAsPNG } from "@pdf-reader/lib/get-area-as-png";
import { getBoundingRect } from "@pdf-reader/lib/get-bounding-rect";
import { getClientRects } from "@pdf-reader/lib/get-client-rects";
import {
  findOrCreateContainerLayer,
  getPageFromElement,
  getPagesFromRange,
  getWindow,
  isHTMLElement,
} from "@pdf-reader/lib/pdfjs-dom";
import type {
  IHighlight,
  LTWH,
  LTWHP,
  Position,
  Scaled,
  ScaledPosition,
} from "@pdf-reader/types";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { EventBus, PDFViewer } from "pdfjs-dist/legacy/web/pdf_viewer.mjs";
import type { PDFViewerOptions } from "pdfjs-dist/types/web/pdf_viewer";
import {
  type PointerEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type Root, createRoot } from "react-dom/client";
import { debounce } from "ts-debounce";

export type T_ViewportHighlight<T_HT> = { position: Position } & T_HT;

export interface IHighlightTransformParams<T_HT> {
  highlight: T_ViewportHighlight<T_HT>;
  index: number;
  setTip: (
    highlight: T_ViewportHighlight<T_HT>,
    callback: (highlight: T_ViewportHighlight<T_HT>) => JSX.Element,
  ) => void;
  hideTip: () => void;
  viewportToScaled: (rect: LTWHP) => Scaled;
  screenshot: (position: LTWH) => string;
  isScrolledTo: boolean;
}

interface Props<T_HT> {
  highlightTransform: (
    params: IHighlightTransformParams<T_HT>,
  ) => JSX.Element | null;
  highlights: Array<T_HT>;
  onScrollChange: () => void;
  scrollRef: (scrollTo: (highlight: T_HT) => void) => void;
  pdfDocument: PDFDocumentProxy;
  pdfScaleValue?: string;
  onSelectionFinished: (
    position: ScaledPosition,
    content: { text?: string; image?: string },
    hideTipAndSelection: () => void,
    transformSelection: () => void,
  ) => JSX.Element | null;
  enableAreaSelection: (event: MouseEvent) => boolean;
  pdfViewerOptions?: PDFViewerOptions;
  currentPage: number;
  updateCurrentPage: (updatedPage: number) => void;
  openDrawer: (isDrawerOpen: boolean) => void;
}

const EMPTY_ID = "empty-id";

export function PdfHighlighter<T_HT extends IHighlight>({
  highlightTransform,
  highlights,
  onScrollChange,
  scrollRef,
  pdfScaleValue = "auto",
  pdfDocument,
  onSelectionFinished,
  enableAreaSelection,
  pdfViewerOptions,
  currentPage,
  updateCurrentPage,
  openDrawer,
}: Props<T_HT>) {
  const [state, setState] = useState<{
    ghostHighlight: {
      position: ScaledPosition;
      content?: { text?: string; image?: string };
    } | null;
    isCollapsed: boolean;
    range: Range | null;
    tip: {
      highlight: T_ViewportHighlight<T_HT>;
      callback: (highlight: T_ViewportHighlight<T_HT>) => JSX.Element;
    } | null;
    tipPosition: Position | null;
    tipChildren: JSX.Element | null;
    isAreaSelectionInProgress: boolean;
    scrolledToHighlightId: string;
    scalePercentage: number;
    currentScale: number;
  }>({
    ghostHighlight: null,
    isCollapsed: true,
    range: null,
    scrolledToHighlightId: EMPTY_ID,
    isAreaSelectionInProgress: false,
    tip: null,
    tipPosition: null,
    tipChildren: null,
    scalePercentage: 100,
    currentScale: 100,
  });

  const isMobileBreakpoint = useMobileBreakpoint();

  const viewerRef = useRef<PDFViewer>();
  const containerNodeRef = useRef<HTMLDivElement>(null);
  const highlightRootsRef = useRef<{
    [page: number]: { reactRoot: Root; container: Element };
  }>({});

  const handleScaleValue = useCallback(() => {
    if (viewerRef.current) {
      viewerRef.current.currentScaleValue = pdfScaleValue;
    }
  }, [pdfScaleValue]);

  const debouncedScaleValue: () => void = debounce(handleScaleValue, 500);

  const resizeObserverRef = useRef<ResizeObserver | null>(
    typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(debouncedScaleValue)
      : null,
  );

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (highlights) {
      renderHighlightLayers();
    }
  }, [highlights]);

  const handleZoomIn = () => {
    if (viewerRef.current) {
      viewerRef.current.increaseScale({ steps: 0.2 });
      setState({
        ...state,
        currentScale: Math.min(viewerRef.current.currentScale * 100),
      });
    }
  };

  const handleZoomOut = () => {
    if (viewerRef.current) {
      viewerRef.current.decreaseScale({ steps: 0.2 });
      setState({
        ...state,
        currentScale: Math.round(viewerRef.current.currentScale * 100),
      });
    }
  };

  const onMouseDown: PointerEventHandler<HTMLDivElement> = (event) => {
    if (!(event.target instanceof Element) || !isHTMLElement(event.target)) {
      return;
    }

    if (event.target.closest("#PdfHighlighter__tip-container")) {
      return;
    }

    hideTipAndSelection();
  };

  const toggleTextSelection = (flag: boolean) => {
    if (!viewerRef.current?.viewer) {
      return;
    }
    viewerRef.current.viewer.classList.toggle("select-none", flag);
    viewerRef.current.viewer.classList.toggle("pointer-events-none", flag);
  };

  useEffect(() => {
    if (
      (state.ghostHighlight === null && state.tip === null) ||
      (state.ghostHighlight?.position &&
        !state.ghostHighlight.content?.image) ||
      state.scrolledToHighlightId.length > 0
    ) {
      renderHighlightLayers();
    } else if (
      state.ghostHighlight?.position &&
      state.ghostHighlight?.content?.image
    ) {
      renderHighlightLayers();
    }
  }, [state.ghostHighlight, state.tip, state.scrolledToHighlightId]);

  const onDocumentReady = useCallback(() => {
    debouncedScaleValue();

    scrollRef(scrollTo);
  }, [debouncedScaleValue, scrollRef]);

  const afterSelection = useCallback(
    (range: Range, isCollapsed: boolean) => {
      if (!range || isCollapsed) {
        return;
      }

      const pages = getPagesFromRange(range);

      if (!pages || pages.length === 0) {
        return;
      }

      const rects = getClientRects(range, pages);

      if (rects.length === 0) {
        return;
      }

      const boundingRect = getBoundingRect(rects);

      const viewportPosition: Position = {
        boundingRect,
        rects,
        pageNumber: pages[0].number,
      };

      const content = {
        text: range.toString(),
      };
      const scaledPosition = viewportPositionToScaled(viewportPosition);

      setTip(
        viewportPosition,
        onSelectionFinished(
          scaledPosition,
          content,
          () => hideTipAndSelection(),
          () => {
            setState((prevState) => ({
              ...prevState,
              ghostHighlight: { position: scaledPosition },
            }));
            renderHighlightLayers();
          },
        ),
      );
    },
    [onSelectionFinished],
  );

  const debouncedAfterSelection = useMemo(
    () =>
      debounce(
        (range: Range, isCollapsed: boolean) =>
          afterSelection(range, isCollapsed),
        500,
      ),
    [afterSelection],
  );

  useEffect(() => {
    const { range, isCollapsed } = state;
    if (range && !isCollapsed) {
      debouncedAfterSelection(range, isCollapsed);
    }
  }, [state, state.range, state.isCollapsed, debouncedAfterSelection]);

  const onSelectionChange = useCallback(() => {
    const container = containerNodeRef.current;
    if (!container) {
      return;
    }

    const selection = getWindow(container).getSelection();
    if (!selection) {
      return;
    }
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    if (selection.isCollapsed) {
      setState((prevState) => ({ ...prevState, isCollapsed: true }));
      return;
    }

    if (
      !range ||
      !container ||
      !container.contains(range.commonAncestorContainer)
    ) {
      return;
    }
    setState((prevState) => ({
      ...prevState,
      isCollapsed: false,
      range,
    }));

    debouncedAfterSelection(range, selection.isCollapsed);
  }, [debouncedAfterSelection]);

  const onPageChange = useCallback(
    (e: { pageNumber: number }) => {
      const newCurrentPage = e.pageNumber;
      const previousPageNumber = currentPage;
      console.log("page", newCurrentPage, previousPageNumber);
      if (
        newCurrentPage !== previousPageNumber ||
        (newCurrentPage === 1 && previousPageNumber === 1)
      ) {
        updateCurrentPage(newCurrentPage);
      }
    },
    [currentPage, updateCurrentPage],
  );

  useEffect(() => {
    if (state.scrolledToHighlightId === EMPTY_ID) {
      renderHighlightLayers();
    }
  }, [state.scrolledToHighlightId]);

  const onScroll = () => {
    onScrollChange();

    setState((prevState) => ({
      ...prevState,
      scrolledToHighlightId: EMPTY_ID,
    }));

    viewerRef.current?.container.removeEventListener("scroll", onScroll);
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.code === "Escape") {
      hideTipAndSelection();
    }
  }, []);

  const onTextLayerRendered = useCallback(() => {
    renderHighlightLayers();
  }, []);

  let unsubscribe = () => {};

  const attachRef = (eventBus: EventBus) => {
    const containerNode = containerNodeRef.current;
    unsubscribe();

    if (containerNode) {
      const { ownerDocument: doc } = containerNode;
      eventBus.on("textlayerrendered", onTextLayerRendered);
      eventBus.on("pagesinit", onDocumentReady);
      eventBus.on("pagechanging", onPageChange);
      doc.addEventListener("selectionchange", onSelectionChange);
      doc.addEventListener("keydown", handleKeyDown);
      doc.defaultView?.addEventListener("resize", debouncedScaleValue);
      if (resizeObserverRef.current)
        resizeObserverRef.current.observe(containerNode);

      unsubscribe = () => {
        eventBus.off("pagesinit", onDocumentReady);
        eventBus.off("textlayerrendered", onTextLayerRendered);
        eventBus.off("pagechanging", onPageChange);
        doc.removeEventListener("selectionchange", onSelectionChange);
        doc.removeEventListener("keydown", handleKeyDown);
        doc.defaultView?.removeEventListener("resize", debouncedScaleValue);
        if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
      };
    }
  };

  const scrollTo = (highlight: T_HT) => {
    const { pageNumber, boundingRect, usePdfCoordinates } = highlight.position;

    viewerRef.current?.container.removeEventListener("scroll", onScroll);

    const pageViewport = viewerRef.current?.getPageView(
      pageNumber - 1,
    ).viewport;

    const scrollMargin = 10;

    viewerRef.current?.scrollPageIntoView({
      pageNumber,
      destArray: [
        null,
        { name: "XYZ" },
        ...pageViewport.convertToPdfPoint(
          0,
          scaledToViewport(boundingRect, pageViewport, usePdfCoordinates).top -
            scrollMargin,
        ),
        0,
      ],
    });

    setState((prevState) => ({
      ...prevState,
      scrolledToHighlightId: highlight.id,
    }));

    // wait for scrolling to finish
    setTimeout(() => {
      viewerRef.current?.container.addEventListener("scroll", onScroll);
    }, 100);
  };

  const init = async () => {
    const pdfjs = await import("pdfjs-dist/web/pdf_viewer.mjs");
    const eventBus = new pdfjs.EventBus();
    const linkService = new pdfjs.PDFLinkService({
      eventBus,
      externalLinkTarget: 2,
    });

    if (!containerNodeRef.current) {
      throw new Error("!");
    }
    viewerRef.current =
      viewerRef.current ||
      new pdfjs.PDFViewer({
        container: containerNodeRef.current,
        eventBus: eventBus,
        // enhanceTextSelection: true, // deprecated. https://github.com/mozilla/pdf.js/issues/9943#issuecomment-409369485
        textLayerMode: 2,
        removePageBorders: true,
        linkService: linkService,
        ...pdfViewerOptions,
      });

    viewerRef.current.currentScaleValue = "auto";

    linkService.setDocument(pdfDocument);
    linkService.setViewer(viewerRef.current);
    viewerRef.current.setDocument(pdfDocument);
    attachRef(eventBus);
  };

  const hideTipAndSelection = () => {
    setState((prevState) => ({
      ...prevState,
      tipPosition: null,
      tipChildren: null,
    }));

    setState((prevState) => ({
      ...prevState,
      ghostHighlight: null,
      tip: null,
    }));
  };

  const viewportPositionToScaled = ({
    pageNumber,
    boundingRect,
    rects,
  }: Position): ScaledPosition => {
    const viewport = viewerRef.current?.getPageView(pageNumber - 1).viewport;

    return {
      boundingRect: viewportToScaled(boundingRect, viewport),
      rects: (rects || []).map((rect) => viewportToScaled(rect, viewport)),
      pageNumber,
    };
  };

  const screenshot = (position: LTWH, pageNumber: number) => {
    const canvas = viewerRef.current?.getPageView(pageNumber - 1).canvas;

    return getAreaAsPNG(canvas, position);
  };

  const setTip = (position: Position, inner: JSX.Element | null) => {
    setState((prevState) => ({
      ...prevState,
      tipPosition: position,
      tipChildren: inner,
    }));
  };

  const renderTip = () => {
    const { tipPosition, tipChildren } = state;
    if (!tipPosition) return null;

    const { boundingRect, pageNumber } = tipPosition;
    const page = {
      node: viewerRef.current?.getPageView(
        (boundingRect.pageNumber || pageNumber) - 1,
      ).div,
      pageNumber: boundingRect.pageNumber || pageNumber,
    };

    const pageBoundingClientRect = page.node.getBoundingClientRect();

    const pageBoundingRect = {
      bottom: pageBoundingClientRect.bottom,
      height: pageBoundingClientRect.height,
      left: pageBoundingClientRect.left,
      right: pageBoundingClientRect.right,
      top: pageBoundingClientRect.top,
      width: pageBoundingClientRect.width,
      x: pageBoundingClientRect.x,
      y: pageBoundingClientRect.y,
      pageNumber: page.pageNumber,
    };
    if (!viewerRef.current) return;
    return (
      <TipContainer
        scrollTop={viewerRef.current.container.scrollTop}
        pageBoundingRect={pageBoundingRect}
        style={{
          left:
            page.node.offsetLeft + boundingRect.left + boundingRect.width / 2,
          top: boundingRect.top + page.node.offsetTop,
          bottom: boundingRect.top + page.node.offsetTop + boundingRect.height,
        }}
      >
        {tipChildren}
      </TipContainer>
    );
  };

  const showTip = (
    highlight: T_ViewportHighlight<T_HT>,
    content: JSX.Element,
  ) => {
    const { isCollapsed, ghostHighlight, isAreaSelectionInProgress } = state;

    const highlightInProgress = !isCollapsed || ghostHighlight;

    if (highlightInProgress || isAreaSelectionInProgress) {
      return;
    }

    setTip(highlight.position, content);
  };

  const scaledPositionToViewport = ({
    pageNumber,
    boundingRect,
    rects,
    usePdfCoordinates,
  }: ScaledPosition): Position => {
    const viewport = viewerRef.current?.getPageView(pageNumber - 1).viewport;

    return {
      boundingRect: scaledToViewport(boundingRect, viewport, usePdfCoordinates),
      rects: (rects || []).map((rect) =>
        scaledToViewport(rect, viewport, usePdfCoordinates),
      ),
      pageNumber,
    };
  };

  const groupHighlightsByPage = (
    highlights: Array<T_HT>,
  ): {
    [pageNumber: string]: Array<T_HT>;
  } => {
    const { ghostHighlight } = state;

    const allHighlights = [...highlights, ghostHighlight].filter(
      Boolean,
    ) as T_HT[];

    const pageNumbers = new Set<number>();
    for (const highlight of allHighlights) {
      pageNumbers.add(highlight.position.pageNumber);
      for (const rect of highlight.position.rects) {
        if (rect.pageNumber) {
          pageNumbers.add(rect.pageNumber);
        }
      }
    }

    const groupedHighlights: Record<number, T_HT[]> = {};

    for (const pageNumber of pageNumbers) {
      groupedHighlights[pageNumber] = groupedHighlights[pageNumber] || [];
      for (const highlight of allHighlights) {
        const pageSpecificHighlight = {
          ...highlight,
          position: {
            pageNumber,
            boundingRect: highlight.position.boundingRect,
            rects: [],
            usePdfCoordinates: highlight.position.usePdfCoordinates,
          } as ScaledPosition,
        };
        let anyRectsOnPage = false;
        for (const rect of highlight.position.rects) {
          if (
            pageNumber === (rect.pageNumber || highlight.position.pageNumber)
          ) {
            pageSpecificHighlight.position.rects.push(rect);
            anyRectsOnPage = true;
          }
        }
        if (anyRectsOnPage || pageNumber === highlight.position.pageNumber) {
          groupedHighlights[pageNumber].push(pageSpecificHighlight);
        }
      }
    }

    return groupedHighlights;
  };

  const findOrCreateHighlightLayer = (page: number) => {
    const { textLayer } = viewerRef.current?.getPageView(page - 1) || {};

    if (!textLayer) {
      return null;
    }

    return findOrCreateContainerLayer(
      textLayer.div,
      "PdfHighlighter__highlight-layer absolute z-3 left-0",
      ".PdfHighlighter__highlight-layer",
    );
  };

  const renderHighlightLayers = () => {
    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
      const highlightRoot = highlightRootsRef.current[pageNumber];
      /** Need to check if container is still attached to the DOM as PDF.js can unload pages. */
      if (highlightRoot?.container.isConnected) {
        renderHighlightLayer(highlightRoot.reactRoot, pageNumber);
      } else {
        const highlightLayer = findOrCreateHighlightLayer(pageNumber);
        if (highlightLayer) {
          // Check if we already have a root for this page
          if (!highlightRootsRef.current[pageNumber]) {
            const reactRoot = createRoot(highlightLayer);
            highlightRootsRef.current[pageNumber] = {
              reactRoot,
              container: highlightLayer,
            };
            renderHighlightLayer(reactRoot, pageNumber);
          } else {
            // If we already have a root, just render using that
            renderHighlightLayer(
              highlightRootsRef.current[pageNumber].reactRoot,
              pageNumber,
            );
          }
        }
      }
    }
  };
  const renderHighlightLayer = (root: Root, pageNumber: number) => {
    const { tip, scrolledToHighlightId } = state;
    viewerRef.current &&
      root.render(
        <HighlightLayer
          highlightsByPage={groupHighlightsByPage(highlights)}
          pageNumber={pageNumber.toString()}
          scrolledToHighlightId={scrolledToHighlightId}
          highlightTransform={highlightTransform}
          tip={tip}
          scaledPositionToViewport={scaledPositionToViewport}
          hideTipAndSelection={hideTipAndSelection}
          viewer={viewerRef.current}
          screenshot={screenshot}
          showTip={showTip}
          setTip={(tip) => {
            setState((prevState) => ({ ...prevState, tip }));
          }}
        />,
      );
  };

  return (
    <div className="flex-1 flex flex-col h-full relative">
      <div className="h-14 border-b border-gray-200 flex items-center px-4 justify-between shadow-sm ">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ZoomOut className="w-8 h-8 text-gray-600" />
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ZoomIn className="w-8 h-8 text-gray-600" />
          </button>
          <span className="text-sm text-gray-600">
            {`${state.currentScale}%`}
          </span>
        </div>
        {isMobileBreakpoint && (
          <button
            className="bg-blue-700 text-white px-4 py-2 rounded-md"
            type="submit"
            onClick={() => openDrawer(true)}
          >
            Open AI notes
          </button>
        )}
        <div className="text-sm text-gray-600">Page {currentPage}</div>
      </div>
      <div className="flex-1 relative h-full">
        <div
          className="absolute overflow-auto h-full inset-x-0 bg-gray-100"
          onPointerDown={onMouseDown}
          style={{ display: "flex" }}
          ref={containerNodeRef}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="pdfViewer" />

          {renderTip()}
          {typeof enableAreaSelection === "function" ? (
            <MouseSelection
              onDragStart={() => toggleTextSelection(true)}
              onDragEnd={() => toggleTextSelection(false)}
              onChange={(isVisible) =>
                setState((prev) => ({
                  ...prev,
                  isAreaSelectionInProgress: isVisible,
                }))
              }
              shouldStart={(event) =>
                enableAreaSelection(event) &&
                event.target instanceof Element &&
                isHTMLElement(event.target) &&
                Boolean(event.target.closest(".page"))
              }
              onSelection={(startTarget, boundingRect, resetSelection) => {
                const page = getPageFromElement(startTarget);

                if (!page) {
                  return;
                }

                const pageBoundingRect = {
                  ...boundingRect,
                  top: boundingRect.top - page.node.offsetTop,
                  left: boundingRect.left - page.node.offsetLeft,
                  pageNumber: page.number,
                };

                const viewportPosition = {
                  boundingRect: pageBoundingRect,
                  rects: [],
                  pageNumber: page.number,
                };

                const scaledPosition =
                  viewportPositionToScaled(viewportPosition);

                const image = screenshot(
                  pageBoundingRect,
                  pageBoundingRect.pageNumber,
                );

                setTip(
                  viewportPosition,
                  onSelectionFinished(
                    scaledPosition,
                    { image },
                    () => hideTipAndSelection(),
                    () => {
                      console.log("setting ghost highlight", scaledPosition);
                      setState((prev) => ({
                        ...prev,
                        ghostHighlight: {
                          position: scaledPosition,
                          content: { image },
                        },
                      }));
                      renderHighlightLayers();
                      resetSelection();
                    },
                  ),
                );
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
