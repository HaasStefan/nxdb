import type { Selection } from "./parser/parser.js";

export function normalizeSelection(selection: Selection): string[] {
  if (selection.type === "All") {
    return ["*"];
  }

  // TODO: support more selections

  throw new Error(`Unsupported selection type: ${selection.type}`);
}