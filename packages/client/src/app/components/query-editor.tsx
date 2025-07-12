import { Editor } from "@monaco-editor/react";
import { useRef } from "react";
import type { Monaco } from "@monaco-editor/react";

// NXQL language configuration
const nxqlLanguageConfig = {
  keywords: [
    'SELECT', 'FROM', 'WHERE', 'ORDER', 'BY', 'LIMIT', 'AS', 'AND', 'OR', 'NOT',
    'EXISTS', 'IN', 'UNNEST', 'LET', 'ASC', 'DESC'
  ],
  operators: [
    '=', '!=', '<', '>', '<=', '>=', '+', '-', '*', '/', '%'
  ],
  symbols: /[=><!~?:&|+\-*\/\^%]+/,
  tokenizer: {
    root: [
      // Keywords
      [/[a-zA-Z_$][\w$]*/, {
        cases: {
          '@keywords': 'keyword',
          '@default': 'identifier'
        }
      }],
      
      // Strings
      [/'([^'\\]|\\.)*$/, 'string.invalid'],
      [/'/, 'string', '@string'],
      
      // Numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/\d+/, 'number'],
      
      // Operators
      [/@symbols/, {
        cases: {
          '@operators': 'operator',
          '@default': ''
        }
      }],
      
      // Delimiters
      [/[;,.]/, 'delimiter'],
      [/[{}()\[\]]/, '@brackets'],
      
      // Whitespace
      [/[ \t\r\n]+/, 'white'],
      
      // Comments
      [/--.*$/, 'comment'],
    ],
    
    string: [
      [/[^\\']+/, 'string'],
      [/\\./, 'string.escape.invalid'],
      [/'/, 'string', '@pop']
    ],
  }
};

// Night Owl Dark theme for NXQL
const nxqlNightOwlTheme = {
  base: 'vs-dark' as const,
  inherit: true,
  rules: [
    { token: 'keyword', foreground: 'c792ea', fontStyle: 'bold' },
    { token: 'identifier', foreground: 'd6deeb' },
    { token: 'string', foreground: 'ecc48d' },
    { token: 'number', foreground: 'f78c6c' },
    { token: 'operator', foreground: 'c792ea' },
    { token: 'delimiter', foreground: 'd6deeb' },
    { token: 'comment', foreground: '637777', fontStyle: 'italic' },
  ],
  colors: {
    'editor.background': '#011627',
    'editor.foreground': '#d6deeb',
    'editor.lineHighlightBackground': '#010e17',
    'editor.selectionBackground': '#1d3b53',
    'editorCursor.foreground': '#80a4c2',
    'editorWhitespace.foreground': '#5f7e97',
    'editorLineNumber.foreground': '#4b6479',
    'editorLineNumber.activeForeground': '#c5e4fd',
    'editorIndentGuide.background': '#5e81ce52',
    'editorIndentGuide.activeBackground': '#7e97c652'
  }
};

export function QueryEditor() {
  const monacoRef = useRef<Monaco | null>(null);

  const handleEditorWillMount = (monaco: Monaco) => {
    monacoRef.current = monaco;
    
    // Register the NXQL language
    monaco.languages.register({ id: 'nxql' });
    
    // Set the language configuration
    monaco.languages.setMonarchTokensProvider('nxql', nxqlLanguageConfig);
    
    // Define the Night Owl theme
    monaco.editor.defineTheme('nxql-night-owl', nxqlNightOwlTheme);

  };

  return (
    <div className="flex flex-col items-center justify-center pt-12 h-full bg-night-owl">
      <Editor
        language="nxql"
        theme="nxql-night-owl"
        defaultValue="SELECT * FROM projects WHERE 'lib' IN tags"
        beforeMount={handleEditorWillMount}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 15,
          wordWrap: 'on',
          automaticLayout: true,
          lineNumbers: 'on',
          renderWhitespace: 'selection',
          selectOnLineNumbers: true,
        }}
      />
    </div>
  );
}