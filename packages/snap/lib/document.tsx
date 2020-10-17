import type {} from 'solid-js';
const { App } = require('./app.tsx');

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
