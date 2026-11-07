/** Apply one tool once per cell during a pointer stroke, including touch drags. */
export function attachBoardGesture(root, getTool, paint) {
  let stroke = null;
  let lastPointerPaint = 0;
  const hit = (x, y) => {
    const cell = document.elementFromPoint(x, y)?.closest('.cell');
    return cell && root.contains(cell) ? cell : null;
  };
  const visit = cell => {
    if (!cell || !stroke || stroke.visited.has(cell)) return;
    stroke.visited.add(cell);
    lastPointerPaint = Date.now();
    paint(Number(cell.dataset.row), Number(cell.dataset.column), stroke.tool);
  };
  root.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.target.closest('.cell')) return;
    event.preventDefault();
    stroke = { id: event.pointerId, tool: getTool(), visited: new Set(), x: event.clientX, y: event.clientY };
    root.setPointerCapture(event.pointerId);
    visit(event.target.closest('.cell'));
  });
  root.addEventListener('pointermove', event => {
    if (stroke?.id !== event.pointerId) return;
    event.preventDefault();
    const steps = Math.max(1, Math.ceil(Math.hypot(event.clientX - stroke.x, event.clientY - stroke.y) / 9));
    for (let step = 1; step <= steps; step++) {
      visit(hit(stroke.x + (event.clientX - stroke.x) * step / steps, stroke.y + (event.clientY - stroke.y) * step / steps));
    }
    stroke.x = event.clientX;
    stroke.y = event.clientY;
  });
  const end = event => { if (stroke?.id === event.pointerId) stroke = null; };
  root.addEventListener('pointerup', end);
  root.addEventListener('pointercancel', end);
  root.addEventListener('lostpointercapture', end);
  root.addEventListener('click', event => {
    const cell = event.target.closest('.cell');
    if (!cell || event.detail !== 0 && Date.now() - lastPointerPaint < 500) return;
    paint(Number(cell.dataset.row), Number(cell.dataset.column), getTool());
  });
}
