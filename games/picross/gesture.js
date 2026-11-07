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
  const begin = (id, cell, x, y) => {
    stroke = { id, tool: getTool(), visited: new Set(), x, y };
    visit(cell);
  };
  const move = (id, x, y) => {
    if (stroke?.id !== id) return;
    const steps = Math.max(1, Math.ceil(Math.hypot(x - stroke.x, y - stroke.y) / 9));
    for (let step = 1; step <= steps; step++) {
      visit(hit(stroke.x + (x - stroke.x) * step / steps, stroke.y + (y - stroke.y) * step / steps));
    }
    stroke.x = x;
    stroke.y = y;
  };
  const end = id => { if (stroke?.id === id) stroke = null; };
  root.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch' || event.button !== 0) return;
    const cell = event.target.closest('.cell');
    if (!cell) return;
    event.preventDefault();
    begin(event.pointerId, cell, event.clientX, event.clientY);
    root.setPointerCapture?.(event.pointerId);
  });
  root.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || stroke?.id !== event.pointerId) return;
    event.preventDefault();
    move(event.pointerId, event.clientX, event.clientY);
  });
  root.addEventListener('touchstart', event => {
    const cell = event.target.closest('.cell');
    if (!cell || stroke || event.touches.length !== 1) return;
    event.preventDefault();
    const touch = event.changedTouches[0];
    begin(touch.identifier, cell, touch.clientX, touch.clientY);
  }, { passive: false });
  root.addEventListener('touchmove', event => {
    if (!stroke || event.touches.length !== 1) return;
    const touch = [...event.changedTouches].find(item => item.identifier === stroke.id);
    if (!touch) return;
    event.preventDefault();
    move(touch.identifier, touch.clientX, touch.clientY);
  }, { passive: false });
  root.addEventListener('touchend', event => {
    for (const touch of event.changedTouches) end(touch.identifier);
  });
  root.addEventListener('touchcancel', event => {
    for (const touch of event.changedTouches) end(touch.identifier);
  });
  root.addEventListener('pointerup', event => end(event.pointerId));
  root.addEventListener('pointercancel', event => end(event.pointerId));
  root.addEventListener('lostpointercapture', event => end(event.pointerId));
  root.addEventListener('click', event => {
    const cell = event.target.closest('.cell');
    if (!cell || event.detail !== 0 && Date.now() - lastPointerPaint < 500) return;
    paint(Number(cell.dataset.row), Number(cell.dataset.column), getTool());
  });
}
