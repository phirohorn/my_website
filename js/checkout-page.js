/* ==========================================================================
   UNIFORMHUB — Checkout page
   ========================================================================== */

(function () {
  if (!Auth.requireLogin('login.html')) return;

  const SHIPPING_FLAT = 3.5;
  const FREE_SHIPPING_THRESHOLD = 50;
  const promoApplied = sessionStorage.getItem('uh_checkout_promo') === '1';

  function totals() {
    const subtotal = Cart.subtotal();
    const discount = promoApplied ? subtotal * 0.1 : 0;
    const shipping = (subtotal - discount) >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
    const total = subtotal - discount + shipping;
    return { subtotal, discount, shipping, total };
  }

  function renderItems() {
    const lines = Cart.detailedLines();
    document.getElementById('checkoutItems').innerHTML = lines.map(l => {
      const name = t(l.product.name_en, l.product.name_km);
      return '<div style="display:flex;gap:10px;align-items:center;margin-bottom:12px;">' +
        '<img src="' + l.product.images[0] + '" style="width:50px;height:50px;border-radius:8px;object-fit:cover;">' +
        '<div style="flex:1;">' +
          '<div style="font-size:13.5px;font-weight:600;">' + name + '</div>' +
          '<div style="font-size:12px;color:var(--text-mute);">' + l.size + ' / ' + l.color + ' × ' + l.qty + '</div>' +
        '</div>' +
        '<div style="font-weight:700;font-size:13.5px;">' + fmtPrice(l.product.price * l.qty) + '</div>' +
      '</div>';
    }).join('');
  }

  function renderSummary() {
    const { subtotal, discount, shipping, total } = totals();
    document.getElementById('coSubtotal').textContent = fmtPrice(subtotal);
    document.getElementById('coDiscountRow').style.display = promoApplied ? 'flex' : 'none';
    document.getElementById('coDiscount').textContent = '−' + fmtPrice(discount);
    document.getElementById('coShipping').textContent = shipping === 0 ? t('Free', 'ឥតគិតថ្លៃ') : fmtPrice(shipping);
    document.getElementById('coTotal').textContent = fmtPrice(total);
  }

  function prefill() {
    const user = Auth.currentUser();
    if (!user) return;
    document.getElementById('custName').value = user.name || '';
    document.getElementById('custEmail').value = user.email || '';
    document.getElementById('custPhone').value = user.phone || '';
    document.getElementById('custAddress').value = user.address || '';
  }

  function wireRadioCards() {
    document.querySelectorAll('.radio-card input[name=payment]').forEach(radio => {
      radio.addEventListener('change', () => {
        document.querySelectorAll('.radio-card').forEach(c => c.classList.remove('selected'));
        radio.closest('.radio-card').classList.add('selected');
      });
    });
  }

  function placeOrder(e) {
    e.preventDefault();
    const lines = Cart.detailedLines();
    if (lines.length === 0) return;

    const { subtotal, discount, shipping, total } = totals();
    const user = Auth.currentUser();
    const order = {
      id: genId('ORD').toUpperCase(),
      userId: user.id,
      items: lines.map(l => ({
        productId: l.product.id, name_en: l.product.name_en, name_km: l.product.name_km,
        image: l.product.images[0], size: l.size, color: l.color, qty: l.qty, price: l.product.price
      })),
      subtotal, discount, shipping, total,
      customer: {
        name: document.getElementById('custName').value.trim(),
        email: document.getElementById('custEmail').value.trim(),
        phone: document.getElementById('custPhone').value.trim(),
        address: document.getElementById('custAddress').value.trim(),
        city: document.getElementById('custCity').value.trim(),
        zip: document.getElementById('custZip').value.trim(),
        notes: document.getElementById('custNotes').value.trim()
      },
      paymentMethod: document.querySelector('input[name=payment]:checked').value,
      status: 'pending',
      statusHistory: [{ status: 'pending', at: Date.now() }],
      createdAt: Date.now()
    };

    const orders = Store.getOrders();
    orders.push(order);
    Store.saveOrders(orders);

    const products = Store.getProducts();
    lines.forEach(l => {
      const p = products.find(x => x.id === l.product.id);
      if (p) p.stock = Math.max(0, p.stock - l.qty);
    });
    Store.saveProducts(products);

    Auth.updateProfile(user.id, {
      phone: order.customer.phone || user.phone,
      address: order.customer.address || user.address
    });

    Cart.clear();
    sessionStorage.removeItem('uh_checkout_promo');
    toast(t('Order placed successfully!', 'បានដាក់ការបញ្ជាទិញដោយជោគជ័យ!'), 'success');
    setTimeout(() => { location.href = 'orders.html?new=' + order.id; }, 900);
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (Cart.lines().length === 0) {
      document.getElementById('checkoutEmpty').style.display = 'block';
      document.getElementById('checkoutForm').style.display = 'none';
      return;
    }
    document.getElementById('checkoutForm').style.display = 'grid';
    prefill();
    renderItems();
    renderSummary();
    wireRadioCards();
    document.getElementById('checkoutForm').addEventListener('submit', placeOrder);
  });

  document.addEventListener('uh:langchange', () => { renderItems(); renderSummary(); });
  document.addEventListener('uh:currencychange', () => { renderItems(); renderSummary(); });
})();
