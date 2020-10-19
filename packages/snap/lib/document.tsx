import type {} from 'solid-js';
const { App } = require('./app.tsx');
const { ContextProvider } = require('@snap.js/core/router')
export { createComponent, renderToString } from 'solid-js/server';
require("@babel/polyfill");

export const HistoryContextProvider = ContextProvider;

export function Document() {
  return (
    <html>
      <head>{/* TODO: head component */}</head>
      <body>
        <div id="app"><App /></div>

        {/* TODO: add transfer data */}
      </body>
    </html>
  );
}
