/* ==========================================================================
   UNIFORMHUB — Cart page
   ========================================================================== */

(function () {
  const SHIPPING_FLAT = 3.5;
  const FREE_SHIPPING_THRESHOLD = 50;
  const VALID_PROMO = 'WELCOME10';
  let promoApplied = false;

  function render() {
    const lines = Cart.detailedLines();
    const empty = document.getElementById('cartEmpty');
    const content = document.getElementById('cartContent');

    if (lines.length === 0) {
      empty.style.display = 'block';
      content.style.display = 'none';
      return;
    }
    empty.style.display = 'none';
    content.style.display = 'grid';

    document.getElementById('cartItems').innerHTML = lines.map(l => {
      const name = t(l.product.name_en, l.product.name_km);
      return '<div class="cart-item" data-line="' + l.lineId + '">' +
        '<img src="' + l.product.images[0] + '" alt="' + name + '">' +
        '<div>' +
          '<div class="cart-item-name"><a href="product-detail.html?id=' + l.product.id + '">' + name + '</a></div>' +
          '<div class="cart-item-meta">' + t('Size', 'ទំហំ') + ': ' + l.size + ' · ' + t('Color', 'ពណ៌') + ': ' + l.color + '</div>' +
          '<div class="cart-item-actions">' +
            '<div class="qty-stepper">' +
              '<button type="button" class="cart-dec" data-line="' + l.lineId + '">−</button>' +
              '<input type="text" readonly value="' + l.qty + '">' +
              '<button type="button" class="cart-inc" data-line="' + l.lineId + '" data-stock="' + l.product.stock + '">+</button>' +
            '</div>' +
            '<button type="button" class="remove-link" data-line="' + l.lineId + '">🗑 ' + t('Remove', 'លុប') + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="cart-item-right">' +
          '<span class="price">' + fmtPrice(l.product.price * l.qty) + '</span>' +
          '<span style="font-size:12px;color:var(--text-mute)">' + fmtPrice(l.product.price) + ' ' + t('each', 'មួយឯកតា') + '</span>' +
        '</div>' +
      '</div>';
    }).join('');

    document.querySelectorAll('.cart-inc').forEach(btn => {
      btn.addEventListener('click', () => {
        const line = Cart.lines().find(x => x.lineId === btn.dataset.line);
        const stock = Number(btn.dataset.stock);
        if (line && line.qty < stock) { Cart.updateQty(btn.dataset.line, line.qty + 1); render(); }
        else toast(t('Reached available stock.', 'ដល់កម្រិតស្តុកអតិបរមាហើយ។'), 'error');
      });
    });
    document.querySelectorAll('.cart-dec').forEach(btn => {
      btn.addEventListener('click', () => {
        const line = Cart.lines().find(x => x.lineId === btn.dataset.line);
        if (line) { Cart.updateQty(btn.dataset.line, line.qty - 1); render(); }
      });
    });
    document.querySelectorAll('.remove-link').forEach(btn => {
      btn.addEventListener('click', () => {
        Cart.remove(btn.dataset.line);
        toast(t('Item removed.', 'បានលុបទំនិញ។'), 'info');
        render();
      });
    });

    renderSummary();
  }

  function renderSummary() {
    const subtotal = Cart.subtotal();
    const discount = promoApplied ? subtotal * 0.1 : 0;
    const shipping = (subtotal - discount) >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FLAT;
    const total = subtotal - discount + shipping;

    document.getElementById('sumSubtotal').textContent = fmtPrice(subtotal);
    document.getElementById('sumDiscountRow').style.display = promoApplied ? 'flex' : 'none';
    document.getElementById('sumDiscount').textContent = '−' + fmtPrice(discount);
    document.getElementById('sumShipping').textContent = shipping === 0 ? t('Free', 'ឥតគិតថ្លៃ') : fmtPrice(shipping);
    document.getElementById('sumTotal').textContent = fmtPrice(total);
  }

  document.getElementById('applyPromoBtn').addEventListener('click', () => {
    const code = document.getElementById('promoInput').value.trim().toUpperCase();
    if (code === VALID_PROMO) {
      promoApplied = true;
      toast(t('Promo code applied! 10% off.', 'បានអនុវត្តកូដបញ្ចុះតម្លៃ! បញ្ចុះ ១០%។'), 'success');
    } else {
      promoApplied = false;
      toast(t('Invalid promo code.', 'កូដមិនត្រឹមត្រូវ។'), 'error');
    }
    renderSummary();
  });

  document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (Cart.lines().length === 0) return;
    if (!Auth.requireLogin('login.html')) return;
    sessionStorage.setItem('uh_checkout_promo', promoApplied ? '1' : '0');
    location.href = 'checkout.html';
  });

  document.addEventListener('DOMContentLoaded', render);
  document.addEventListener('uh:langchange', render);
  document.addEventListener('uh:currencychange', render);
})();
