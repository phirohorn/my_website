/* ==========================================================================
   UNIFORMHUB — Wishlist (array of product IDs)
   ========================================================================== */

const Wishlist = {
  ids() { return Store.getWishlist(); },
  count() { return this.ids().length; },
  has(productId) { return this.ids().includes(productId); },

  toggle(productId) {
    let ids = this.ids();
    let added;
    if (ids.includes(productId)) {
      ids = ids.filter(id => id !== productId);
      added = false;
    } else {
      ids.push(productId);
      added = true;
    }
    Store.saveWishlist(ids);
    document.dispatchEvent(new CustomEvent('uh:wishchange'));
    return added;
  },

  remove(productId) {
    Store.saveWishlist(this.ids().filter(id => id !== productId));
    document.dispatchEvent(new CustomEvent('uh:wishchange'));
  },

  products() {
    const products = Store.getProducts();
    return this.ids().map(id => products.find(p => p.id === id)).filter(Boolean);
  }
};
