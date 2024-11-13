import { createRoot } from "react-dom/client";
import { PdfReader } from "@pdf-reader/pdf-reader";

import { testHighlights as _testHighlights } from "@pdf-reader/data/test-feedback";
import type { IPdfAndHighlights } from "./types";
const data: IPdfAndHighlights = _testHighlights;

// biome-ignore lint/style/noNonNullAssertion: Root element must be there
const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(<PdfReader data={data} />);
