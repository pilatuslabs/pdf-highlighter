import type {
  IHighlightTransformParams,
  T_ViewportHighlight,
} from "@pdf-reader/components/pdf-highlighter";
import { viewportToScaled } from "@pdf-reader/lib/coordinates";
import type {
  IHighlight,
  LTWH,
  Position,
  ScaledPosition,
} from "@pdf-reader/types";
import type { PDFViewer } from "pdfjs-dist/web/pdf_viewer.mjs";

interface HighlightLayerProps<T_HT> {
  highlightsByPage: { [pageNumber: string]: Array<T_HT> };
  pageNumber: string;
  scrolledToHighlightId: string;
  highlightTransform: (
    params: IHighlightTransformParams<T_HT>,
  ) => JSX.Element | null;
  tip: {
    highlight: T_ViewportHighlight<T_HT>;
    callback: (highlight: T_ViewportHighlight<T_HT>) => JSX.Element;
  } | null;
  scaledPositionToViewport: (scaledPosition: ScaledPosition) => Position;
  hideTipAndSelection: () => void;
  viewer: PDFViewer;
  screenshot: (position: LTWH, pageNumber: number) => string;
  showTip: (highlight: T_ViewportHighlight<T_HT>, content: JSX.Element) => void;
  setTip: (state: {
    highlight: T_ViewportHighlight<T_HT>;
    callback: (highlight: T_ViewportHighlight<T_HT>) => JSX.Element;
  }) => void;
}

export function HighlightLayer<T_HT extends IHighlight>({
  highlightsByPage,
  scaledPositionToViewport,
  pageNumber,
  scrolledToHighlightId,
  highlightTransform,
  tip,
  hideTipAndSelection,
  viewer,
  screenshot,
  showTip,
  setTip,
}: HighlightLayerProps<T_HT>) {
  const currentHighlights = highlightsByPage[String(pageNumber)] || [];
  return (
    <div>
      {currentHighlights.map((highlight, index) => {
        const viewportHighlight: T_ViewportHighlight<T_HT> = {
          ...highlight,
          position: scaledPositionToViewport(highlight.position),
        };

        if (tip && tip.highlight.id === String(highlight.id)) {
          showTip(tip.highlight, tip.callback(viewportHighlight));
        }

        const isScrolledTo = Boolean(scrolledToHighlightId === highlight.id);

        return highlightTransform({
          highlight: viewportHighlight,
          index,
          setTip: (highlight, callback) => {
            setTip({ highlight, callback });
            showTip(highlight, callback(highlight));
          },
          hideTip: hideTipAndSelection,
          viewportToScaled: (rect) => {
            const viewport = viewer.getPageView(
              (rect.pageNumber || Number.parseInt(pageNumber)) - 1,
            ).viewport;

            return viewportToScaled(rect, viewport);
          },
          screenshot: (boundingRect) =>
            screenshot(boundingRect, Number.parseInt(pageNumber)),
          isScrolledTo,
        });
      })}
    </div>
  );
}
