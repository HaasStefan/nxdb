const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        'night-owl': {
          // Background colors
          'bg-primary': '#011627',
          'bg-secondary': '#010e17',
          'bg-tertiary': '#1d3b53',
          'bg-accent': '#5e81ce52',

          // Text colors
          'text-primary': '#d6deeb',
          'text-secondary': '#c5e4fd',
          'text-muted': '#4b6479',
          'text-comment': '#637777',

          // Syntax highlighting colors
          keyword: '#c792ea',
          string: '#ecc48d',
          number: '#f78c6c',
          operator: '#c792ea',
          cursor: '#80a4c2',
          whitespace: '#5f7e97',
        },
      },
      backgroundColor: {
        'night-owl': '#011627',
        'night-owl-secondary': '#010e17',
        'night-owl-selection': '#1d3b53',
        'night-owl-accent': '#5e81ce52',
      },
      textColor: {
        'night-owl': '#d6deeb',
        'night-owl-muted': '#4b6479',
        'night-owl-accent': '#c5e4fd',
        'night-owl-comment': '#637777',
      },
    },
  },
  plugins: [],
};
