import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import React, { useState, useEffect, useRef } from "react";

interface Props {
  workerSrc: string;
  url: string;
  beforeLoad: JSX.Element;
  errorMessage?: JSX.Element;
  children: (pdfDocument: PDFDocumentProxy) => JSX.Element;
  onError?: (error: Error) => void;
  cMapUrl?: string;
  cMapPacked?: boolean;
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
}) => {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const documentRef = useRef<HTMLElement>(null);

  // biome-ignore lint: cant put pdfDocument as a dependency
  useEffect(() => {
    load();

    return () => {
      pdfDocument?.destroy();
    };
  }, [url]);

  const load = () => {
    const { ownerDocument = document } = documentRef.current || {};
    setPdfDocument(null);
    setError(null);

    if (typeof workerSrc === "string") {
      GlobalWorkerOptions.workerSrc = workerSrc;
    }

    Promise.resolve()
      .then(() => pdfDocument?.destroy())
      .then(() => {
        if (!url) return;

        const document = {
          ownerDocument,
          url,
          cMapUrl,
          cMapPacked,
        };

        return getDocument(document).promise.then((loadedPdfDocument) => {
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
        <div className="w-[75vw]">{beforeLoad}</div>
      ) : (
        children(pdfDocument)
      )}
    </>
  );
};
