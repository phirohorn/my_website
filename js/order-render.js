/* ==========================================================================
   UNIFORMHUB — Shared order rendering (status labels, tracker)
   ========================================================================== */

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_LABELS = {
  pending: ['Pending', 'កំពុងរង់ចាំ'],
  confirmed: ['Confirmed', 'បានបញ្ជាក់'],
  processing: ['Processing', 'កំពុងដំណើរការ'],
  shipped: ['Shipped', 'កំពុងដឹកជញ្ជូន'],
  delivered: ['Delivered', 'បានដឹកជញ្ជូន'],
  cancelled: ['Cancelled', 'បានលុបចោល']
};

function statusLabel(status) {
  const l = STATUS_LABELS[status] || [status, status];
  return t(l[0], l[1]);
}

function statusPillHTML(status) {
  return '<span class="status-pill status-' + status + '">' + statusLabel(status) + '</span>';
}

function buildTracker(order) {
  if (order.status === 'cancelled') {
    return '<div style="background:#fde7e7;color:var(--red-500);padding:12px 16px;border-radius:10px;font-weight:700;font-size:13.5px;">✕ ' +
      t('This order was cancelled.', 'ការបញ្ជាទិញនេះត្រូវបានលុបចោល។') + '</div>';
  }
  const icons = { pending: '⏳', confirmed: '✅', processing: '⚙️', shipped: '🚚', delivered: '📦' };
  const idx = ORDER_STATUSES.indexOf(order.status);
  const fraction = idx <= 0 ? 0 : idx / (ORDER_STATUSES.length - 1);
  const nodes = ORDER_STATUSES.map((s, i) => {
    const cls = i < idx ? 'done' : (i === idx ? 'current' : '');
    return '<div class="track-node ' + cls + '"><div class="dot">' + (i < idx ? '✓' : icons[s]) + '</div><span>' + statusLabel(s) + '</span></div>';
  }).join('');
  return '<div class="track-row"><div class="fill" style="width:calc((100% - 40px) * ' + fraction + ')"></div>' + nodes + '</div>';
}

function orderDate(order) {
  const d = new Date(order.createdAt);
  return d.toLocaleDateString(Store.getLang() === 'km' ? 'km-KH' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
