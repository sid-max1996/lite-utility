export function catchFatalBrowserErrors(handler: (text: string) => void) {
  window.addEventListener('error', (event) => {
    const text =
      `FATAL ERROR: ${event.type}: ${event.message}\n` + `${event.filename}:${event.lineno}:${event.colno}\n`;
    handler(text);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const text = `FATAL ERROR: ${event.type}: ${event.reason} ${event.reason?.stack}\n`;
    handler(text);
  });
}
