// Keep the arcade viewport stable on touch devices while preserving page scrolling.
// Safari exposes pinch gestures through these non-standard events.
for (const type of ['gesturestart', 'gesturechange', 'gestureend']) {
  document.addEventListener(type, event => event.preventDefault(), { passive: false });
}
