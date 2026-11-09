/* ==========================================================================
   UNIFORMHUB — Order tracking & order history page
   ========================================================================== */

(function () {
  const params = new URLSearchParams(location.search);
  const highlightId = params.get('new');

  function orderCardHTML(order, opts) {
    opts = opts || {};
    const itemsThumbs = order.items.slice(0, 5).map(it =>
      '<img src="' + it.image + '" title="' + t(it.name_en, it.name_km) + '">'
    ).join('');
    const canCancel = opts.allowCancel && (order.status === 'pending' || order.status === 'confirmed');
    return '<div class="order-card" id="order-' + order.id + '" style="' + (order.id === highlightId ? 'border-color:var(--blue-500);box-shadow:0 0 0 3px rgba(47,95,216,.15);' : '') + '">' +
      '<div class="order-card-head">' +
        '<span class="order-id">#' + order.id + '</span>' +
        statusPillHTML(order.status) +
      '</div>' +
      '<div style="font-size:12.5px;color:var(--text-mute);">' +
        t('Placed on', 'បញ្ជាទិញនៅ') + ' ' + orderDate(order) + ' · ' + order.items.length + ' ' + t('item(s)', 'ទំនិញ') + ' · ' +
        '<b style="color:var(--text);">' + fmtPrice(order.total) + '</b>' +
      '</div>' +
      '<div class="order-items-mini">' + itemsThumbs + '</div>' +
      buildTracker(order) +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;flex-wrap:wrap;gap:8px;">' +
        '<div style="font-size:12.5px;color:var(--text-mute);">' + t('Deliver to', 'ដឹកជញ្ជូនទៅ') + ': ' + (order.customer ? order.customer.address + ', ' + order.customer.city : '—') + '</div>' +
        (canCancel ? '<button type="button" class="btn btn-outline btn-sm js-cancel-order" data-id="' + order.id + '">✕ ' + t('Cancel Order', 'លុបចោលការបញ្ជាទិញ') + '</button>' : '') +
      '</div>' +
    '</div>';
  }

  function renderMyOrders() {
    const listBox = document.getElementById('ordersList');
    const empty = document.getElementById('ordersEmpty');
    const loginPrompt = document.getElementById('loginPrompt');

    if (!Auth.isLoggedIn()) {
      loginPrompt.style.display = 'block';
      empty.style.display = 'none';
      listBox.innerHTML = '';
      return;
    }
    loginPrompt.style.display = 'none';

    const user = Auth.currentUser();
    const orders = Store.getOrders().filter(o => o.userId === user.id).sort((a, b) => b.createdAt - a.createdAt);

    if (orders.length === 0) {
      empty.style.display = 'block';
      listBox.innerHTML = '';
      return;
    }
    empty.style.display = 'none';
    listBox.innerHTML = orders.map(o => orderCardHTML(o, { allowCancel: true })).join('');

    listBox.querySelectorAll('.js-cancel-order').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm(t('Cancel this order? This cannot be undone.', 'លុបចោលការបញ្ជាទិញនេះ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។'))) return;
        const orders = Store.getOrders();
        const order = orders.find(o => o.id === btn.dataset.id);
        if (!order) return;
        order.status = 'cancelled';
        order.statusHistory.push({ status: 'cancelled', at: Date.now() });
        const products = Store.getProducts();
        order.items.forEach(it => {
          const p = products.find(x => x.id === it.productId);
          if (p) p.stock += it.qty;
        });
        Store.saveProducts(products);
        Store.saveOrders(orders);
        toast(t('Order cancelled.', 'ការបញ្ជាទិញត្រូវបានលុបចោល។'), 'info');
        renderMyOrders();
      });
    });

    if (highlightId) {
      const el = document.getElementById('order-' + highlightId);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
    }
  }

  function trackOrder() {
    const val = document.getElementById('trackInput').value.trim().toUpperCase();
    const box = document.getElementById('trackResult');
    if (!val) { box.innerHTML = ''; return; }
    const order = Store.getOrders().find(o => o.id.toUpperCase() === val);
    if (!order) {
      box.innerHTML = '<div style="background:var(--surface-2);padding:14px 16px;border-radius:10px;font-size:13.5px;color:var(--text-soft);">' +
        t('No order found with that ID. Please check and try again.', 'រកមិនឃើញការបញ្ជាទិញជាមួយលេខកូដនោះទេ។ សូមពិនិត្យ និងព្យាយាមម្តងទៀត។') + '</div>';
      return;
    }
    box.innerHTML = orderCardHTML(order, { allowCancel: false });
  }

  document.getElementById('trackBtn').addEventListener('click', trackOrder);
  document.getElementById('trackInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); trackOrder(); } });

  document.addEventListener('DOMContentLoaded', () => {
    renderMyOrders();
    if (highlightId) {
      document.getElementById('trackInput').value = highlightId;
    }
  });
  document.addEventListener('uh:langchange', renderMyOrders);
  document.addEventListener('uh:currencychange', renderMyOrders);
})();
