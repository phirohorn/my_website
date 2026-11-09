/* ==========================================================================
   UNIFORMHUB — Admin Dashboard controller
   ========================================================================== */

(function () {
  if (!Auth.isLoggedIn() || !Auth.isAdmin()) {
    document.getElementById('adminGuard').style.display = 'block';
    document.getElementById('adminShell').style.display = 'none';
    return;
  }
  document.getElementById('adminGuard').style.display = 'none';
  document.getElementById('adminShell').style.display = 'grid';

  /* ---------------- Modal helpers ---------------- */
  function openModal(html) {
    document.getElementById('modalBox').innerHTML = html;
    document.getElementById('modalOverlay').classList.add('open');
  }
  function closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
    document.getElementById('modalBox').innerHTML = '';
  }
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target.id === 'modalOverlay') closeModal();
  });

  /* ---------------- Navigation ---------------- */
  const sectionRenderers = {
    dashboard: renderDashboard,
    products: () => renderProductsTable(document.getElementById('prodSearch').value),
    categories: renderCategoriesTable,
    stock: renderStockTable,
    orders: () => renderOrdersTable(document.getElementById('orderStatusFilter').value),
    custom: renderCustomTable,
    customers: renderCustomersTable
  };

  document.querySelectorAll('.admin-nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const sec = link.dataset.section;
      document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
      document.getElementById('sec-' + sec).classList.add('active');
      sectionRenderers[sec]();
    });
  });

  /* ---------------- Dashboard ---------------- */
  function renderDashboard() {
    const orders = Store.getOrders();
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    const revenue = validOrders.reduce((s, o) => s + o.total, 0);
    document.getElementById('dashRevenue').textContent = fmtPrice(revenue);
    document.getElementById('dashOrders').textContent = orders.length;
    document.getElementById('dashProducts').textContent = Store.getProducts().length;
    document.getElementById('dashCustomers').textContent = Store.getUsers().filter(u => u.role === 'customer').length;

    const recent = [...orders].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);
    document.getElementById('dashRecentOrders').innerHTML = recent.length ? recent.map(o =>
      '<tr><td><b>#' + o.id + '</b></td><td>' + (o.customer ? o.customer.name : '—') + '</td><td>' + orderDate(o) + '</td><td>' + fmtPrice(o.total) + '</td><td>' + statusPillHTML(o.status) + '</td></tr>'
    ).join('') : '<tr><td colspan="5" style="text-align:center;color:var(--text-mute);">No orders yet.</td></tr>';

    const products = Store.getProducts();
    const low = products.filter(p => p.stock <= 6).sort((a, b) => a.stock - b.stock);
    document.getElementById('dashLowStock').innerHTML = low.length ? low.map(p => {
      const cat = Store.getCategories().find(c => c.id === p.category);
      return '<tr><td>' + t(p.name_en, p.name_km) + '</td><td>' + (cat ? t(cat.name_en, cat.name_km) : p.category) + '</td>' +
        '<td>' + (p.stock <= 0 ? '<span class="tag tag-out">' + t('Out of Stock', 'អស់ស្តុក') + '</span>' : '<span class="tag tag-low">' + p.stock + ' ' + t('left', 'នៅសល់') + '</span>') + '</td>' +
        '<td><button type="button" class="btn btn-ghost btn-sm js-goto-stock">' + t('Manage', 'គ្រប់គ្រង') + '</button></td></tr>';
    }).join('') : '<tr><td colspan="4" style="text-align:center;color:var(--text-mute);">All products well stocked.</td></tr>';

    document.querySelectorAll('.js-goto-stock').forEach(btn => {
      btn.addEventListener('click', () => document.querySelector('.admin-nav-link[data-section="stock"]').click());
    });
  }

  /* ---------------- Products ---------------- */
  function renderProductsTable(search) {
    search = (search || '').toLowerCase();
    const products = Store.getProducts().filter(p =>
      !search || p.name_en.toLowerCase().includes(search) || p.name_km.includes(search) || p.category.includes(search)
    );
    const cats = Store.getCategories();
    document.getElementById('productsTableBody').innerHTML = products.map(p => {
      const cat = cats.find(c => c.id === p.category);
      const statusBadge = p.stock <= 0
        ? '<span class="tag tag-out">' + t('Out of Stock', 'អស់ស្តុក') + '</span>'
        : p.stock <= 6 ? '<span class="tag tag-low">' + t('Low Stock', 'ស្តុកតិច') + '</span>'
        : '<span class="badge-soft" style="color:var(--green-600);">' + t('Active', 'សកម្ម') + '</span>';
      return '<tr>' +
        '<td><img class="thumb" src="' + p.images[0] + '"></td>' +
        '<td><b>' + p.name_en + '</b><br><span style="color:var(--text-mute);font-size:12px;">' + p.name_km + '</span></td>' +
        '<td>' + (cat ? cat.name_en : p.category) + '</td>' +
        '<td>' + fmtPrice(p.price) + '</td>' +
        '<td>' + p.stock + '</td>' +
        '<td>' + statusBadge + '</td>' +
        '<td><div class="row-actions">' +
          '<button type="button" class="js-edit-product" data-id="' + p.id + '" title="Edit">✏️</button>' +
          '<button type="button" class="js-delete-product" data-id="' + p.id + '" title="Delete">🗑</button>' +
        '</div></td>' +
      '</tr>';
    }).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--text-mute);">No products found.</td></tr>';

    document.querySelectorAll('.js-edit-product').forEach(btn => btn.addEventListener('click', () => openProductModal(Store.getProduct(btn.dataset.id))));
    document.querySelectorAll('.js-delete-product').forEach(btn => btn.addEventListener('click', () => {
      if (!confirm('Delete this product? This cannot be undone.')) return;
      Store.saveProducts(Store.getProducts().filter(p => p.id !== btn.dataset.id));
      toast('Product deleted.', 'info');
      renderProductsTable(document.getElementById('prodSearch').value);
    }));
  }

  function openProductModal(product) {
    const isNew = !product;
    const p = product || { id: '', name_en: '', name_km: '', category: Store.getCategories()[0].id, price: '', oldPrice: '', stock: 0, material_en: '', material_km: '', sizes: [], colors: [], images: [], desc_en: '', desc_km: '', gender: 'Unisex', isNew: false, isFeatured: false, rating: 4.5, reviews: 0 };
    const cats = Store.getCategories();

    openModal(
      '<div class="modal-head"><h3>' + (isNew ? 'Add Product' : 'Edit Product') + '</h3><button type="button" id="modalCloseBtn">✕</button></div>' +
      '<form id="productForm">' +
        '<div class="form-row"><div class="form-group"><label>Name (English)</label><input type="text" id="f_name_en" value="' + p.name_en + '" required></div>' +
        '<div class="form-group"><label>Name (Khmer)</label><input type="text" id="f_name_km" value="' + p.name_km + '"></div></div>' +
        '<div class="form-row"><div class="form-group"><label>Category</label><select id="f_category">' +
          cats.map(c => '<option value="' + c.id + '" ' + (c.id === p.category ? 'selected' : '') + '>' + c.name_en + '</option>').join('') +
        '</select></div>' +
        '<div class="form-group"><label>Gender</label><select id="f_gender">' +
          ['Unisex', 'Men', 'Women', 'Boys', 'Girls'].map(g => '<option ' + (g === p.gender ? 'selected' : '') + '>' + g + '</option>').join('') +
        '</select></div></div>' +
        '<div class="form-row"><div class="form-group"><label>Price (USD)</label><input type="number" step="0.01" min="0" id="f_price" value="' + p.price + '" required></div>' +
        '<div class="form-group"><label>Old Price (optional)</label><input type="number" step="0.01" min="0" id="f_oldprice" value="' + (p.oldPrice || '') + '"></div></div>' +
        '<div class="form-row"><div class="form-group"><label>Stock</label><input type="number" min="0" id="f_stock" value="' + p.stock + '" required></div>' +
        '<div class="form-group"><label>Rating (0-5)</label><input type="number" min="0" max="5" step="0.1" id="f_rating" value="' + p.rating + '"></div></div>' +
        '<div class="form-row"><div class="form-group"><label>Material (English)</label><input type="text" id="f_material_en" value="' + p.material_en + '"></div>' +
        '<div class="form-group"><label>Material (Khmer)</label><input type="text" id="f_material_km" value="' + p.material_km + '"></div></div>' +
        '<div class="form-group"><label>Sizes (comma-separated)</label><input type="text" id="f_sizes" value="' + p.sizes.join(', ') + '" placeholder="S, M, L, XL" required></div>' +
        '<div class="form-group"><label>Colors — format Name:#hex, Name:#hex</label><input type="text" id="f_colors" value="' + p.colors.map(c => c.n + ':' + c.hex).join(', ') + '" placeholder="Navy:#1e3057, White:#ffffff" required></div>' +
        '<div class="form-group"><label>Image paths (comma-separated)</label><input type="text" id="f_images" value="' + p.images.join(', ') + '" placeholder="images/uniformgirl/1.jpg, images/uniofrmboy/1.jpg" required>' +
        '<small>Use paths from your /images folder.</small></div>' +
        '<div class="form-group"><label>Description (English)</label><textarea id="f_desc_en" rows="2">' + p.desc_en + '</textarea></div>' +
        '<div class="form-group"><label>Description (Khmer)</label><textarea id="f_desc_km" rows="2">' + p.desc_km + '</textarea></div>' +
        '<div class="form-row">' +
        '<label class="filter-opt"><input type="checkbox" id="f_isnew" ' + (p.isNew ? 'checked' : '') + '> Mark as New Arrival</label>' +
        '<label class="filter-opt"><input type="checkbox" id="f_isfeatured" ' + (p.isFeatured ? 'checked' : '') + '> Mark as Featured</label>' +
        '</div>' +
        '<div style="display:flex;gap:10px;margin-top:10px;"><button type="submit" class="btn btn-primary btn-block">' + (isNew ? 'Add Product' : 'Save Changes') + '</button></div>' +
      '</form>'
    );

    document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
    document.getElementById('productForm').addEventListener('submit', e => {
      e.preventDefault();
      const sizes = document.getElementById('f_sizes').value.split(',').map(s => s.trim()).filter(Boolean);
      const colors = document.getElementById('f_colors').value.split(',').map(pair => {
        const [n, hex] = pair.split(':');
        return n && hex ? { n: n.trim(), hex: hex.trim() } : null;
      }).filter(Boolean);
      const images = document.getElementById('f_images').value.split(',').map(s => s.trim()).filter(Boolean);

      if (!sizes.length || !colors.length || !images.length) {
        toast('Please provide at least one size, color, and image.', 'error');
        return;
      }

      const updated = {
        id: isNew ? genId('p') : p.id,
        category: document.getElementById('f_category').value,
        gender: document.getElementById('f_gender').value,
        name_en: document.getElementById('f_name_en').value.trim(),
        name_km: document.getElementById('f_name_km').value.trim() || document.getElementById('f_name_en').value.trim(),
        price: Number(document.getElementById('f_price').value),
        oldPrice: document.getElementById('f_oldprice').value ? Number(document.getElementById('f_oldprice').value) : undefined,
        stock: Number(document.getElementById('f_stock').value),
        rating: Number(document.getElementById('f_rating').value) || 0,
        reviews: p.reviews || 0,
        material_en: document.getElementById('f_material_en').value.trim(),
        material_km: document.getElementById('f_material_km').value.trim(),
        sizes, colors, images,
        desc_en: document.getElementById('f_desc_en').value.trim(),
        desc_km: document.getElementById('f_desc_km').value.trim(),
        isNew: document.getElementById('f_isnew').checked,
        isFeatured: document.getElementById('f_isfeatured').checked
      };

      const list = Store.getProducts();
      if (isNew) {
        list.push(updated);
      } else {
        const idx = list.findIndex(x => x.id === p.id);
        list[idx] = updated;
      }
      Store.saveProducts(list);
      closeModal();
      toast(isNew ? 'Product added.' : 'Product updated.', 'success');
      renderProductsTable(document.getElementById('prodSearch').value);
    });
  }

  document.getElementById('addProductBtn').addEventListener('click', () => openProductModal(null));
  document.getElementById('prodSearch').addEventListener('input', e => renderProductsTable(e.target.value));

  /* ---------------- Categories ---------------- */
  function renderCategoriesTable() {
    const cats = Store.getCategories();
    const products = Store.getProducts();
    document.getElementById('categoriesTableBody').innerHTML = cats.map(c =>
      '<tr><td style="font-size:20px;">' + c.icon + '</td><td>' + c.name_en + '</td><td>' + c.name_km + '</td>' +
      '<td>' + products.filter(p => p.category === c.id).length + '</td>' +
      '<td><div class="row-actions"><button type="button" class="js-edit-cat" data-id="' + c.id + '">✏️</button><button type="button" class="js-delete-cat" data-id="' + c.id + '">🗑</button></div></td></tr>'
    ).join('');

    document.querySelectorAll('.js-edit-cat').forEach(btn => btn.addEventListener('click', () => openCategoryModal(cats.find(c => c.id === btn.dataset.id))));
    document.querySelectorAll('.js-delete-cat').forEach(btn => btn.addEventListener('click', () => {
      const inUse = products.some(p => p.category === btn.dataset.id);
      if (inUse) { toast('Cannot delete — products are still assigned to this category.', 'error'); return; }
      if (!confirm('Delete this category?')) return;
      Store.saveCategories(Store.getCategories().filter(c => c.id !== btn.dataset.id));
      toast('Category deleted.', 'info');
      renderCategoriesTable();
    }));
  }

  function openCategoryModal(category) {
    const isNew = !category;
    const c = category || { id: '', name_en: '', name_km: '', icon: '🗂' };
    openModal(
      '<div class="modal-head"><h3>' + (isNew ? 'Add Category' : 'Edit Category') + '</h3><button type="button" id="modalCloseBtn">✕</button></div>' +
      '<form id="categoryForm">' +
        '<div class="form-group"><label>Category ID (slug, lowercase, no spaces)</label><input type="text" id="f_cat_id" value="' + c.id + '" ' + (isNew ? '' : 'disabled') + ' required></div>' +
        '<div class="form-group"><label>Icon (emoji)</label><input type="text" id="f_cat_icon" value="' + c.icon + '" maxlength="4"></div>' +
        '<div class="form-group"><label>Name (English)</label><input type="text" id="f_cat_en" value="' + c.name_en + '" required></div>' +
        '<div class="form-group"><label>Name (Khmer)</label><input type="text" id="f_cat_km" value="' + c.name_km + '"></div>' +
        '<button type="submit" class="btn btn-primary btn-block">' + (isNew ? 'Add Category' : 'Save Changes') + '</button>' +
      '</form>'
    );
    document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
    document.getElementById('categoryForm').addEventListener('submit', e => {
      e.preventDefault();
      const id = document.getElementById('f_cat_id').value.trim().toLowerCase().replace(/\s+/g, '-');
      const list = Store.getCategories();
      if (isNew && list.some(x => x.id === id)) { toast('Category ID already exists.', 'error'); return; }
      const updated = { id, icon: document.getElementById('f_cat_icon').value.trim() || '🗂', name_en: document.getElementById('f_cat_en').value.trim(), name_km: document.getElementById('f_cat_km').value.trim() };
      if (isNew) list.push(updated);
      else { const idx = list.findIndex(x => x.id === c.id); list[idx] = updated; }
      Store.saveCategories(list);
      closeModal();
      toast(isNew ? 'Category added.' : 'Category updated.', 'success');
      renderCategoriesTable();
    });
  }
  document.getElementById('addCategoryBtn').addEventListener('click', () => openCategoryModal(null));

  /* ---------------- Stock ---------------- */
  function renderStockTable() {
    const products = Store.getProducts();
    const cats = Store.getCategories();
    document.getElementById('stockTableBody').innerHTML = products.map(p => {
      const cat = cats.find(c => c.id === p.category);
      const stockColor = p.stock <= 0 ? 'var(--red-500)' : p.stock <= 6 ? 'var(--amber-500)' : 'var(--green-600)';
      return '<tr><td><img class="thumb" src="' + p.images[0] + '"></td><td>' + p.name_en + '</td><td>' + (cat ? cat.name_en : p.category) + '</td>' +
        '<td><b style="color:' + stockColor + '">' + p.stock + '</b></td>' +
        '<td><div style="display:flex;gap:8px;"><input type="number" min="0" value="' + p.stock + '" class="js-stock-input" data-id="' + p.id + '" style="width:90px;padding:8px;border-radius:8px;border:1.5px solid var(--border);"><button type="button" class="btn btn-ghost btn-sm js-stock-save" data-id="' + p.id + '">Update</button></div></td></tr>';
    }).join('');

    document.querySelectorAll('.js-stock-save').forEach(btn => btn.addEventListener('click', () => {
      const input = document.querySelector('.js-stock-input[data-id="' + btn.dataset.id + '"]');
      const list = Store.getProducts();
      const prod = list.find(p => p.id === btn.dataset.id);
      prod.stock = Math.max(0, Number(input.value) || 0);
      Store.saveProducts(list);
      toast('Stock updated for ' + prod.name_en + '.', 'success');
      renderStockTable();
    }));
  }

  /* ---------------- Orders ---------------- */
  function renderOrdersTable(filterStatus) {
    let orders = Store.getOrders();
    if (filterStatus && filterStatus !== 'all') orders = orders.filter(o => o.status === filterStatus);
    orders = [...orders].sort((a, b) => b.createdAt - a.createdAt);

    document.getElementById('ordersTableBody').innerHTML = orders.map(o =>
      '<tr><td><b>#' + o.id + '</b></td><td>' + (o.customer ? o.customer.name + '<br><span style="color:var(--text-mute);font-size:12px;">' + o.customer.phone + '</span>' : '—') + '</td>' +
      '<td>' + orderDate(o) + '</td><td>' + o.items.length + '</td><td>' + fmtPrice(o.total) + '</td>' +
      '<td><select class="select-status js-order-status" data-id="' + o.id + '">' +
        [...ORDER_STATUSES, 'cancelled'].map(s => '<option value="' + s + '" ' + (s === o.status ? 'selected' : '') + '>' + s.charAt(0).toUpperCase() + s.slice(1) + '</option>').join('') +
      '</select></td>' +
      '<td><button type="button" class="btn btn-ghost btn-sm js-view-order" data-id="' + o.id + '">View</button></td></tr>'
    ).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--text-mute);">No orders found.</td></tr>';

    document.querySelectorAll('.js-order-status').forEach(sel => sel.addEventListener('change', () => {
      const orders = Store.getOrders();
      const order = orders.find(o => o.id === sel.dataset.id);
      order.status = sel.value;
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({ status: sel.value, at: Date.now() });
      Store.saveOrders(orders);
      toast('Order #' + order.id + ' status updated to ' + sel.value + '.', 'success');
    }));
    document.querySelectorAll('.js-view-order').forEach(btn => btn.addEventListener('click', () => openOrderModal(btn.dataset.id)));
  }

  function openOrderModal(orderId) {
    const order = Store.getOrders().find(o => o.id === orderId);
    if (!order) return;
    const itemsHtml = order.items.map(it =>
      '<div style="display:flex;gap:10px;align-items:center;margin-bottom:10px;"><img src="' + it.image + '" style="width:46px;height:46px;border-radius:8px;object-fit:cover;">' +
      '<div style="flex:1;"><b style="font-size:13.5px;">' + it.name_en + '</b><br><span style="font-size:12px;color:var(--text-mute);">' + it.size + ' / ' + it.color + ' × ' + it.qty + '</span></div>' +
      '<b>' + fmtPrice(it.price * it.qty) + '</b></div>'
    ).join('');
    openModal(
      '<div class="modal-head"><h3>Order #' + order.id + '</h3><button type="button" id="modalCloseBtn">✕</button></div>' +
      buildTracker(order) +
      '<div class="divider"></div>' +
      '<h4 style="font-size:13px;text-transform:uppercase;color:var(--text-mute);">Items</h4>' + itemsHtml +
      '<div class="divider"></div>' +
      '<h4 style="font-size:13px;text-transform:uppercase;color:var(--text-mute);">Customer</h4>' +
      '<p style="margin:0;font-size:14px;">' + order.customer.name + ' · ' + order.customer.phone + ' · ' + order.customer.email + '<br>' + order.customer.address + ', ' + order.customer.city + '<br>Payment: ' + order.paymentMethod.toUpperCase() + '</p>' +
      (order.customer.notes ? '<p style="font-size:13px;color:var(--text-mute);">Note: ' + order.customer.notes + '</p>' : '') +
      '<div class="divider"></div>' +
      '<div class="summary-row"><span>Subtotal</span><span>' + fmtPrice(order.subtotal) + '</span></div>' +
      (order.discount ? '<div class="summary-row"><span>Discount</span><span>−' + fmtPrice(order.discount) + '</span></div>' : '') +
      '<div class="summary-row"><span>Shipping</span><span>' + (order.shipping === 0 ? 'Free' : fmtPrice(order.shipping)) + '</span></div>' +
      '<div class="summary-row total"><span>Total</span><span>' + fmtPrice(order.total) + '</span></div>'
    );
    document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
  }

  document.getElementById('orderStatusFilter').addEventListener('change', e => renderOrdersTable(e.target.value));

  /* ---------------- Custom Orders ---------------- */
  function renderCustomTable() {
    const orders = [...Store.getCustomOrders()].sort((a, b) => b.createdAt - a.createdAt);
    document.getElementById('customTableBody').innerHTML = orders.map(o =>
      '<tr><td><b>#' + o.id + '</b></td><td>' + o.orgName + '</td><td>' + o.category + '</td><td>' + o.totalQty + '</td>' +
      '<td>' + o.contact.name + '<br><span style="color:var(--text-mute);font-size:12px;">' + o.contact.phone + '</span></td>' +
      '<td><span class="status-pill status-' + (o.status === 'completed' ? 'delivered' : o.status === 'rejected' ? 'cancelled' : 'pending') + '">' + o.status + '</span></td>' +
      '<td><button type="button" class="btn btn-ghost btn-sm js-view-custom" data-id="' + o.id + '">View</button></td></tr>'
    ).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--text-mute);">No custom requests yet.</td></tr>';

    document.querySelectorAll('.js-view-custom').forEach(btn => btn.addEventListener('click', () => openCustomModal(btn.dataset.id)));
  }

  function openCustomModal(id) {
    const orders = Store.getCustomOrders();
    const o = orders.find(x => x.id === id);
    if (!o) return;
    const sizeRows = Object.entries(o.sizeBreakdown).map(([sz, qty]) => sz + ': ' + qty).join(' · ');
    const statuses = ['pending', 'reviewing', 'quoted', 'in_production', 'completed', 'rejected'];
    openModal(
      '<div class="modal-head"><h3>Custom Request #' + o.id + '</h3><button type="button" id="modalCloseBtn">✕</button></div>' +
      (o.designImage ? '<img src="' + o.designImage + '" style="max-height:200px;border-radius:10px;margin-bottom:14px;border:1px solid var(--border);">' : '') +
      '<table class="spec-table">' +
        '<tr><td>Organization</td><td>' + o.orgName + '</td></tr>' +
        '<tr><td>Category</td><td>' + o.category + '</td></tr>' +
        '<tr><td>Garment</td><td>' + o.garmentDesc + '</td></tr>' +
        '<tr><td>Sizes</td><td>' + sizeRows + '</td></tr>' +
        '<tr><td>Total Qty</td><td>' + o.totalQty + '</td></tr>' +
        '<tr><td>Colors</td><td>' + (o.colors || '—') + '</td></tr>' +
        '<tr><td>Contact</td><td>' + o.contact.name + ' · ' + o.contact.phone + ' · ' + o.contact.email + '</td></tr>' +
        (o.notes ? '<tr><td>Notes</td><td>' + o.notes + '</td></tr>' : '') +
      '</table>' +
      '<div class="divider"></div>' +
      '<form id="customStatusForm">' +
        '<div class="form-row"><div class="form-group"><label>Status</label><select id="f_custom_status">' +
          statuses.map(s => '<option value="' + s + '" ' + (s === o.status ? 'selected' : '') + '>' + s.replace('_', ' ') + '</option>').join('') +
        '</select></div>' +
        '<div class="form-group"><label>Quoted Price (USD)</label><input type="number" step="0.01" min="0" id="f_custom_price" value="' + (o.quotedPrice || '') + '"></div></div>' +
        '<button type="submit" class="btn btn-primary btn-block">Save</button>' +
      '</form>'
    );
    document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
    document.getElementById('customStatusForm').addEventListener('submit', e => {
      e.preventDefault();
      o.status = document.getElementById('f_custom_status').value;
      o.quotedPrice = document.getElementById('f_custom_price').value ? Number(document.getElementById('f_custom_price').value) : null;
      Store.saveCustomOrders(orders);
      closeModal();
      toast('Custom request updated.', 'success');
      renderCustomTable();
    });
  }

  /* ---------------- Customers ---------------- */
  function renderCustomersTable() {
    const customers = Store.getUsers().filter(u => u.role === 'customer');
    const orders = Store.getOrders();
    document.getElementById('customersTableBody').innerHTML = customers.map(u => {
      const myOrders = orders.filter(o => o.userId === u.id);
      const spent = myOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
      return '<tr><td><b>' + u.name + '</b></td><td>' + u.email + '</td><td>' + (u.phone || '—') + '</td><td>' + myOrders.length + '</td><td>' + fmtPrice(spent) + '</td>' +
        '<td><button type="button" class="btn btn-ghost btn-sm js-delete-customer" data-id="' + u.id + '">🗑 Delete</button></td></tr>';
    }).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--text-mute);">No customers yet.</td></tr>';

    document.querySelectorAll('.js-delete-customer').forEach(btn => btn.addEventListener('click', () => {
      if (!confirm('Delete this customer account?')) return;
      Store.saveUsers(Store.getUsers().filter(u => u.id !== btn.dataset.id));
      toast('Customer deleted.', 'info');
      renderCustomersTable();
    }));
  }

  /* ---------------- Init ---------------- */
  renderDashboard();
  document.addEventListener('uh:langchange', () => {
    const active = document.querySelector('.admin-nav-link.active');
    if (active) sectionRenderers[active.dataset.section]();
  });
})();
