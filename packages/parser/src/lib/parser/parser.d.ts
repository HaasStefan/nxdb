declare module '@parser' {
  /**
   * The result type of the parser.
   * Replace `any` with a proper AST type if known.
   */
  export function parse(input: string): any;
}