import { Editor } from '@monaco-editor/react';
import { useRef } from 'react';
import type { Monaco } from '@monaco-editor/react';

// NXQL language configuration
const nxqlLanguageConfig = {
  keywords: [
    'SELECT',
    'FROM',
    'WHERE',
    'ORDER',
    'BY',
    'LIMIT',
    'AS',
    'AND',
    'OR',
    'NOT',
    'EXISTS',
    'IN',
    'UNNEST',
    'LET',
    'ASC',
    'DESC',
  ],
  operators: ['=', '!=', '<', '>', '<=', '>=', '+', '-', '*', '/', '%'],
  symbols: /[=><!~?:&|+\-*\/\^%]+/,
  tokenizer: {
    root: [
      // Keywords
      [
        /[a-zA-Z_$][\w$]*/,
        {
          cases: {
            '@keywords': 'keyword',
            '@default': 'identifier',
          },
        },
      ],

      // Strings
      [/'([^'\\]|\\.)*$/, 'string.invalid'],
      [/'/, 'string', '@string'],

      // Numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/\d+/, 'number'],

      // Operators
      [
        /@symbols/,
        {
          cases: {
            '@operators': 'operator',
            '@default': '',
          },
        },
      ],

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
      [/'/, 'string', '@pop'],
    ],
  },
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
    'editorIndentGuide.activeBackground': '#7e97c652',
  },
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

  const handleRunQuery = () => {
    // TODO: Implement query execution logic
    console.log('Running query...');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-night-owl">
      <div className='mb-8 w-full flex justify-end px-4 pt-8 pb-4 border-b-2 border-b-slate-600 bg-black bg-opacity-20'>
        <button
          onClick={handleRunQuery}
          className="inline-flex items-center gap-2 px-4 py-2 border border-night-owl-green text-night-owl-green bg-transparent rounded-lg hover:bg-night-owl-green hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-night-owl"
        >
          <PlayIcon className="w-4 h-4" />
          Run Query
        </button>
      </div>
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

// Play icon component
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
        clipRule="evenodd"
      />
    </svg>
  );
}
