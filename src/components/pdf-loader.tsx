import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import React, { useState, useEffect, useRef, SVGProps } from "react";


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
  openSidebar: (isOpen: boolean) => void;
  svgProps?: SVGProps<SVGSVGElement>;
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
  openSidebar,
  svgProps = {},
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

      {!isSidebarOpen && (
        <div onClick={() => openSidebar(true)} className="flex flex-col justify-top mx-4 mt-3.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.7rem"
            height="1.7rem"
            viewBox="0 0 128 128"
            fill="none"
            className="cursor-pointer"
            {...svgProps}
          >
            <rect width="97" height="97" x="15" y="16" stroke="#000" strokeWidth="7" rx="27" />
            <path stroke="#000" strokeLinecap="round" strokeWidth="7" d="M46 17L46 112" />
            <path
              stroke="#000"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="7"
              d="M85 79L83.0973 77.6569C78.7198 74.5669 74.7866 70.8912 71.4077 66.7326V66.7326C70.5875 65.7231 70.5875 64.2769 71.4077 63.2674V63.2674C74.7866 59.1088 78.7198 55.4331 83.0973 52.3431L85 51"
            />
          </svg>
        </div>
      )}
    </>
  );
};
