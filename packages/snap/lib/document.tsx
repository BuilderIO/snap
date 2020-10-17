import type {} from 'solid-js';

export function Document(props: { children: any }) {
  return (
    <html>
      <head>{/* TODO: head component */}</head>
      <body>
        <div id="app">{props.children}</div>

        {/* TODO: add transfer data */}
      </body>
    </html>
  );
}
