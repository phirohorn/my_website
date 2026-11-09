/* ==========================================================================
   UNIFORMHUB — Shared product card rendering
   ========================================================================== */

function stockTag(p) {
  if (p.stock <= 0) return '<span class="tag tag-out">' + t('Out of Stock', 'អស់ស្តុក') + '</span>';
  if (p.stock <= 6) return '<span class="tag tag-low">' + t('Low Stock', 'ស្តុកតិច') + '</span>';
  return '';
}

function productCardHTML(p) {
  const name = t(p.name_en, p.name_km);
  const cat = Store.getCategories().find(c => c.id === p.category);
  const catName = cat ? t(cat.name_en, cat.name_km) : p.category;
  const wished = Wishlist.has(p.id);
  const swatches = (p.colors || []).slice(0, 4).map(c => '<span class="swatch" style="background:' + c.hex + '" title="' + c.n + '"></span>').join('');
  const stars = '★'.repeat(Math.round(p.rating || 0)) + '☆'.repeat(5 - Math.round(p.rating || 0));
  return (
    '<div class="product-card" data-id="' + p.id + '">' +
      '<div class="product-thumb">' +
        '<a href="product-detail.html?id=' + p.id + '">' +
          '<img src="' + p.images[0] + '" alt="' + name + '" loading="lazy">' +
        '</a>' +
        '<div class="product-tags">' +
          (p.isNew ? '<span class="tag tag-new">' + t('New', 'ថ្មី') + '</span>' : '') +
          (p.oldPrice ? '<span class="tag tag-sale">' + t('Sale', 'បញ្ចុះតម្លៃ') + '</span>' : '') +
          stockTag(p) +
        '</div>' +
        '<button type="button" class="wish-fab js-wish-btn ' + (wished ? 'active' : '') + '" data-id="' + p.id + '" title="' + t('Add to wishlist', 'បន្ថែមទៅចង់បាន') + '">' + (wished ? '❤️' : '🤍') + '</button>' +
        '<div class="quick-add">' +
          '<button type="button" class="btn btn-primary btn-block btn-sm js-quick-add" data-id="' + p.id + '" ' + (p.stock <= 0 ? 'disabled' : '') + '>' +
            (p.stock <= 0 ? t('Unavailable', 'អស់ស្តុក') : '🛒 ' + t('Quick Add', 'បន្ថែមរហ័ស')) +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="product-body">' +
        '<span class="product-cat">' + catName + '</span>' +
        '<h3 class="product-name"><a href="product-detail.html?id=' + p.id + '">' + name + '</a></h3>' +
        '<div class="swatches">' + swatches + '</div>' +
        '<span class="rating">' + stars + ' <span style="color:var(--text-mute);font-weight:500;">(' + (p.reviews || 0) + ')</span></span>' +
        '<div class="product-price-row">' +
          '<span class="price">' + fmtPrice(p.price) + '</span>' +
          (p.oldPrice ? '<span class="price-old">' + fmtPrice(p.oldPrice) + '</span>' : '') +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

function attachProductCardEvents(container) {
  container.querySelectorAll('.js-wish-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const id = btn.dataset.id;
      const added = Wishlist.toggle(id);
      btn.classList.toggle('active', added);
      btn.textContent = added ? '❤️' : '🤍';
      toast(added ? t('Added to wishlist.', 'បានបន្ថែមទៅចង់បាន។') : t('Removed from wishlist.', 'បានដកចេញពីចង់បាន។'), 'success');
    });
  });
  container.querySelectorAll('.js-quick-add').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const id = btn.dataset.id;
      const p = Store.getProduct(id);
      if (!p || p.stock <= 0) return;
      Cart.add(id, 1, p.sizes[0], (p.colors[0] || {}).n || '');
      toast(t('Added to cart.', 'បានបន្ថែមទៅរទេះទំនិញ។'), 'success');
    });
  });
}

function renderProductGrid(container, products) {
  container.innerHTML = products.map(productCardHTML).join('');
  attachProductCardEvents(container);
}
