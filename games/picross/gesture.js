/** One continuous stroke paints each crossed cell once on touch, pen or mouse. */
export function attachBoardGesture(root, getTool, paint) {
  let stroke = null;
  let suppressClickUntil = 0;
  const cellAt = (x, y) => {
    const cell = document.elementFromPoint(x, y)?.closest('.cell');
    return cell && root.contains(cell) ? cell : null;
  };
  const visit = cell => {
    if (!stroke || !cell || stroke.visited.has(cell)) return;
    stroke.visited.add(cell);
    paint(Number(cell.dataset.row), Number(cell.dataset.column), stroke.tool);
  };
  const begin = (id, x, y, cell) => {
    stroke = { id, x, y, tool: getTool(), visited: new Set() };
    suppressClickUntil = Date.now() + 700;
    visit(cell);
  };
  const move = (id, x, y) => {
    if (stroke?.id !== id) return;
    const { x: oldX, y: oldY } = stroke;
    const steps = Math.max(1, Math.ceil(Math.hypot(x - oldX, y - oldY) / 6));
    for (let i = 1; i <= steps; i++) visit(cellAt(oldX + (x - oldX) * i / steps, oldY + (y - oldY) * i / steps));
    stroke.x = x; stroke.y = y;
  };
  const end = id => { if (stroke?.id === id) stroke = null; };

  if (window.PointerEvent) {
    root.addEventListener('pointerdown', event => {
      const cell = event.target.closest('.cell');
      if (!cell || stroke || event.button !== 0 || !event.isPrimary) return;
      event.preventDefault();
      begin(event.pointerId, event.clientX, event.clientY, cell);
      try { root.setPointerCapture(event.pointerId); } catch { /* Touch keeps implicit capture on the cell. */ }
    });
    root.addEventListener('pointermove', event => {
      if (stroke?.id !== event.pointerId) return;
      event.preventDefault();
      move(event.pointerId, event.clientX, event.clientY);
    });
    root.addEventListener('pointerup', event => end(event.pointerId));
    root.addEventListener('pointercancel', event => end(event.pointerId));
    root.addEventListener('lostpointercapture', event => end(event.pointerId));
  } else {
    root.addEventListener('touchstart', event => {
      const cell = event.target.closest('.cell');
      if (!cell || stroke || event.touches.length !== 1) return;
      event.preventDefault();
      const touch = event.changedTouches[0];
      begin(touch.identifier, touch.clientX, touch.clientY, cell);
    }, { passive: false });
    root.addEventListener('touchmove', event => {
      if (!stroke) return;
      const touch = Array.from(event.changedTouches).find(item => item.identifier === stroke.id);
      if (!touch) return;
      event.preventDefault();
      move(touch.identifier, touch.clientX, touch.clientY);
    }, { passive: false });
    for (const name of ['touchend', 'touchcancel']) root.addEventListener(name, event => {
      for (const touch of event.changedTouches) end(touch.identifier);
    });
  }
  root.addEventListener('click', event => {
    const cell = event.target.closest('.cell');
    if (!cell || (event.detail !== 0 && Date.now() < suppressClickUntil)) return;
    paint(Number(cell.dataset.row), Number(cell.dataset.column), getTool());
  });
}
