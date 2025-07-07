import type { Selection } from "./parser/parser.js";

export function normalizeSelection(selection: Selection): string[] {
  if (selection.type === "All") {
    return ["*"];
  } else if (selection.type === "List") {
    if (!selection.values || selection.values.length === 0) {
      throw new Error("Selection list cannot be empty.");
    }
    return selection.values.map((value) => value.trim());
  }

  throw new Error(`Unsupported selection type: ${selection.type}`);
}