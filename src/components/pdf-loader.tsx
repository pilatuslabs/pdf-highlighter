import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import React, { useState, useEffect, useRef, SVGProps } from "react";
import { OpenIcon } from "@pdf-reader/icons/open-icon";


interface Props {
  workerSrc?: string;
  url: string;
  beforeLoad: JSX.Element;
  errorMessage?: JSX.Element;
  children: (pdfDocument: PDFDocumentProxy) => JSX.Element;
  onError?: (error: Error) => void;
  cMapUrl?: string;
  cMapPacked?: boolean;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isMobileBreakpoint: boolean;
}

export const PdfLoader: React.FC<Props> = ({
  workerSrc = "https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs",
  url,
  beforeLoad,
  errorMessage,
  children,
  onError,
  cMapUrl,
  cMapPacked,
  isSidebarOpen,
  toggleSidebar,
  isMobileBreakpoint,
}) => {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const documentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    load();

    return () => {
      if (pdfDocument) {
        pdfDocument.destroy();
      }
    };
  }, [url, workerSrc]);

  const load = () => {
    const { ownerDocument = document } = documentRef.current || {};
    setPdfDocument(null);
    setError(null);

    if (typeof workerSrc === "string") {
      GlobalWorkerOptions.workerSrc = workerSrc;
    }

    Promise.resolve()
      .then(() => {
        if (pdfDocument) {
          return pdfDocument.destroy();
        }
      })
      .then(() => {
        if (!url) return;

        const loadingTask = getDocument({
          url,
          cMapUrl,
          cMapPacked,
        });

        return loadingTask.promise.then((loadedPdfDocument) => {
          setPdfDocument(loadedPdfDocument);
        });
      })
      .catch((e) => {
        if (onError) onError(e);
        setError(e);
      });
  };

  const renderError = () => {
    if (errorMessage) {
      return React.cloneElement(errorMessage, { error });
    }
    return null;
  };

  return (
    <>
      <span ref={documentRef} />

      {error ? (
        renderError()
      ) : !pdfDocument || !children ? (
        <div className={`w-[${isSidebarOpen ? '75vw' : '100vw'}]`}>{beforeLoad}</div>
      ) : (
        children(pdfDocument)
      )}

      {!isSidebarOpen && !isMobileBreakpoint && (
        <div className="flex flex-col justify-top mx-4 mt-3.5">
          < OpenIcon toggleSideBar={toggleSidebar} />
        </div>
      )}

    </>
  );
};
