/* ==========================================================================
   UNIFORMHUB — Product Detail page
   ========================================================================== */

(function () {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const product = Store.getProduct(id);
  const root = document.getElementById('pdRoot');

  if (!product) {
    root.innerHTML = '<div class="empty-state"><div class="ic">😕</div><h3 lang-en>Product not found</h3><h3 lang-km>រកមិនឃើញផលិតផល</h3><a href="products.html" class="btn btn-primary" style="margin-top:14px;"><span lang-en>Back to Shop</span><span lang-km>ត្រឡប់ទៅទំនិញ</span></a></div>';
    return;
  }

  const state = {
    img: 0,
    size: product.sizes[0],
    color: (product.colors[0] || {}).n || '',
    qty: 1
  };

  function stockInfo() {
    if (product.stock <= 0) return { cls: 'out', text: t('Out of Stock', 'អស់ស្តុក') };
    if (product.stock <= 6) return { cls: 'low', text: t('Only ' + product.stock + ' left', 'នៅសល់ ' + product.stock + ' ប៉ុណ្ណោះ') };
    return { cls: 'in', text: t('In Stock', 'មានស្តុក') };
  }

  function render() {
    const name = t(product.name_en, product.name_km);
    const desc = t(product.desc_en, product.desc_km);
    const material = t(product.material_en, product.material_km);
    const cat = Store.getCategories().find(c => c.id === product.category);
    const catName = cat ? t(cat.name_en, cat.name_km) : product.category;
    const stock = stockInfo();
    const wished = Wishlist.has(product.id);
    document.title = name + ' — UniformHub';
    document.getElementById('crumbName').textContent = name;

    root.innerHTML =
      '<div class="pd-layout">' +
        '<div>' +
          '<div class="pd-gallery-main"><img id="pdMainImg" src="' + product.images[state.img] + '" alt="' + name + '"></div>' +
          '<div class="pd-thumbs">' +
            product.images.map((src, i) => '<img src="' + src + '" data-i="' + i + '" class="' + (i === state.img ? 'active' : '') + '">').join('') +
          '</div>' +
        '</div>' +
        '<div class="pd-info">' +
          '<span class="product-cat">' + catName + '</span>' +
          '<h1>' + name + '</h1>' +
          '<div class="pd-meta">' +
            '<span class="rating">' + '★'.repeat(Math.round(product.rating || 0)) + '☆'.repeat(5 - Math.round(product.rating || 0)) + ' (' + (product.reviews || 0) + ' ' + t('reviews', 'ការវាយតម្លៃ') + ')</span>' +
            '<span>' + t('SKU', 'លេខកូដ') + ': ' + product.id.toUpperCase() + '</span>' +
          '</div>' +
          '<div class="pd-price-row">' +
            '<span class="pd-price">' + fmtPrice(product.price) + '</span>' +
            (product.oldPrice ? '<span class="price-old" style="font-size:16px;">' + fmtPrice(product.oldPrice) + '</span>' : '') +
            '<span class="pd-stock ' + stock.cls + '">' + stock.text + '</span>' +
          '</div>' +
          '<p>' + desc + '</p>' +
          '<div class="opt-block">' +
            '<label class="title">' + t('Size', 'ទំហំ') + ': <span>' + state.size + '</span></label>' +
            '<div class="size-grid" id="pdSizes">' + product.sizes.map(s => '<button type="button" class="size-chip ' + (s === state.size ? 'active' : '') + '" data-size="' + s + '">' + s + '</button>').join('') + '</div>' +
          '</div>' +
          '<div class="opt-block">' +
            '<label class="title">' + t('Color', 'ពណ៌') + ': <span>' + state.color + '</span></label>' +
            '<div class="color-row" id="pdColors">' + product.colors.map(c => '<button type="button" class="color-dot ' + (c.n === state.color ? 'active' : '') + '" data-color="' + c.n + '" style="background:' + c.hex + '" title="' + c.n + '"></button>').join('') + '</div>' +
          '</div>' +
          '<div class="opt-block">' +
            '<label class="title">' + t('Quantity', 'ចំនួន') + '</label>' +
            '<div class="qty-stepper">' +
              '<button type="button" id="qtyMinus">−</button>' +
              '<input type="text" id="qtyInput" value="' + state.qty + '" readonly>' +
              '<button type="button" id="qtyPlus">+</button>' +
            '</div>' +
          '</div>' +
          '<div class="pd-actions">' +
            '<button type="button" class="btn btn-primary" id="addToCartBtn" ' + (product.stock <= 0 ? 'disabled' : '') + '>🛒 <span lang-en>Add to Cart</span><span lang-km>បន្ថែមទៅរទេះទំនិញ</span></button>' +
            '<button type="button" class="btn btn-icon" id="wishBtn" style="width:50px;height:50px;font-size:20px;" title="' + t('Wishlist', 'ចង់បាន') + '">' + (wished ? '❤️' : '🤍') + '</button>' +
          '</div>' +
          '<div class="pd-features">' +
            '<div class="pd-feature"><div class="ic">🚚</div><span lang-en>Free delivery over $50</span><span lang-km>ដឹកជញ្ជូនឥតគិតថ្លៃលើស $50</span></div>' +
            '<div class="pd-feature"><div class="ic">🧵</div><span lang-en>Custom logo available</span><span lang-km>អាចដាក់ស្លាកតាមបំណង</span></div>' +
            '<div class="pd-feature"><div class="ic">↩️</div><span lang-en>7-day size exchange</span><span lang-km>ប្តូរទំហំក្នុង ៧ថ្ងៃ</span></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="tabs">' +
        '<button type="button" class="tab-btn active" data-tab="desc"><span lang-en>Description</span><span lang-km>ការពិពណ៌នា</span></button>' +
        '<button type="button" class="tab-btn" data-tab="spec"><span lang-en>Specification</span><span lang-km>លក្ខណៈបច្ចេកទេស</span></button>' +
        '<button type="button" class="tab-btn" data-tab="ship"><span lang-en>Shipping &amp; Returns</span><span lang-km>ការដឹកជញ្ជូន និងការប្តូរ</span></button>' +
      '</div>' +
      '<div class="tab-panel active" id="tab-desc"><p>' + desc + '</p></div>' +
      '<div class="tab-panel" id="tab-spec"><table class="spec-table">' +
        '<tr><td>' + t('Category', 'ប្រភេទ') + '</td><td>' + catName + '</td></tr>' +
        '<tr><td>' + t('Material', 'សម្ភារៈ') + '</td><td>' + material + '</td></tr>' +
        '<tr><td>' + t('Available Sizes', 'ទំហំដែលមាន') + '</td><td>' + product.sizes.join(', ') + '</td></tr>' +
        '<tr><td>' + t('Available Colors', 'ពណ៌ដែលមាន') + '</td><td>' + product.colors.map(c => c.n).join(', ') + '</td></tr>' +
        '<tr><td>' + t('Stock', 'ស្តុក') + '</td><td>' + product.stock + ' ' + t('units', 'ឯកតា') + '</td></tr>' +
      '</table></div>' +
      '<div class="tab-panel" id="tab-ship">' +
        '<p lang-en>Standard delivery takes 2–5 business days within Phnom Penh and 3–7 days for provinces. Free delivery on orders over $50.</p>' +
        '<p lang-km>ការដឹកជញ្ជូនស្តង់ដារចំណាយពេល ២–៥ថ្ងៃធ្វើការនៅភ្នំពេញ និង ៣–៧ថ្ងៃសម្រាប់ខេត្ត។ ដឹកជញ្ជូនឥតគិតថ្លៃលើការបញ្ជាទិញលើស $50។</p>' +
        '<p lang-en>Size exchanges accepted within 7 days of delivery, provided items are unworn and in original packaging.</p>' +
        '<p lang-km>អាចប្តូរទំហំបានក្នុងរយៈពេល ៧ថ្ងៃបន្ទាប់ពីទទួលទំនិញ លុះត្រាតែទំនិញនៅសភាពដើម មិនទាន់ប្រើប្រាស់។</p>' +
      '</div>';

    wireEvents();
  }

  function wireEvents() {
    document.querySelectorAll('.pd-thumbs img').forEach(img => {
      img.addEventListener('click', () => { state.img = Number(img.dataset.i); render(); });
    });
    document.querySelectorAll('#pdSizes .size-chip').forEach(btn => {
      btn.addEventListener('click', () => { state.size = btn.dataset.size; render(); });
    });
    document.querySelectorAll('#pdColors .color-dot').forEach(btn => {
      btn.addEventListener('click', () => { state.color = btn.dataset.color; render(); });
    });
    document.getElementById('qtyMinus').addEventListener('click', () => { if (state.qty > 1) { state.qty--; document.getElementById('qtyInput').value = state.qty; } });
    document.getElementById('qtyPlus').addEventListener('click', () => { if (state.qty < product.stock) { state.qty++; document.getElementById('qtyInput').value = state.qty; } else { toast(t('Reached available stock.', 'ដល់កម្រិតស្តុកអតិបរមាហើយ។'), 'error'); } });

    const addBtn = document.getElementById('addToCartBtn');
    addBtn.addEventListener('click', () => {
      if (product.stock <= 0) return;
      Cart.add(product.id, state.qty, state.size, state.color);
      toast(t('Added to cart!', 'បានបន្ថែមទៅរទេះទំនិញ!'), 'success');
    });

    document.getElementById('wishBtn').addEventListener('click', () => {
      const added = Wishlist.toggle(product.id);
      document.getElementById('wishBtn').textContent = added ? '❤️' : '🤍';
      toast(added ? t('Added to wishlist.', 'បានបន្ថែមទៅចង់បាន។') : t('Removed from wishlist.', 'បានដកចេញពីចង់បាន។'), 'success');
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
      });
    });
  }

  function renderRelated() {
    const related = Store.getProducts().filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
    renderProductGrid(document.getElementById('relatedGrid'), related);
    document.getElementById('relatedSection').style.display = related.length ? 'block' : 'none';
  }

  document.addEventListener('DOMContentLoaded', () => { render(); renderRelated(); });
  document.addEventListener('uh:langchange', () => { render(); renderRelated(); });
  document.addEventListener('uh:currencychange', () => { render(); renderRelated(); });
  document.addEventListener('uh:wishchange', renderRelated);
})();
