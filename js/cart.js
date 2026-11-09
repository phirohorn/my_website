/* ==========================================================================
   UNIFORMHUB — Cart
   Cart line: { lineId, productId, qty, size, color }
   ========================================================================== */

const Cart = {
  lines() { return Store.getCart(); },

  count() { return this.lines().reduce((s, l) => s + l.qty, 0); },

  add(productId, qty, size, color) {
    const lines = this.lines();
    const existing = lines.find(l => l.productId === productId && l.size === size && l.color === color);
    if (existing) {
      existing.qty += qty;
    } else {
      lines.push({ lineId: genId('cl'), productId, qty, size, color });
    }
    Store.saveCart(lines);
    document.dispatchEvent(new CustomEvent('uh:cartchange'));
  },

  updateQty(lineId, qty) {
    let lines = this.lines();
    if (qty <= 0) {
      lines = lines.filter(l => l.lineId !== lineId);
    } else {
      const l = lines.find(x => x.lineId === lineId);
      if (l) l.qty = qty;
    }
    Store.saveCart(lines);
    document.dispatchEvent(new CustomEvent('uh:cartchange'));
  },

  remove(lineId) {
    const lines = this.lines().filter(l => l.lineId !== lineId);
    Store.saveCart(lines);
    document.dispatchEvent(new CustomEvent('uh:cartchange'));
  },

  clear() {
    Store.saveCart([]);
    document.dispatchEvent(new CustomEvent('uh:cartchange'));
  },

  detailedLines() {
    const products = Store.getProducts();
    return this.lines().map(l => {
      const p = products.find(x => x.id === l.productId);
      return p ? { ...l, product: p } : null;
    }).filter(Boolean);
  },

  subtotal() {
    return this.detailedLines().reduce((sum, l) => sum + l.product.price * l.qty, 0);
  }
};
