/* ==========================================================================
   UNIFORMHUB — Products listing: search, filter, sort
   ========================================================================== */

(function () {
  const params = new URLSearchParams(location.search);
  const allProducts = Store.getProducts();
  const maxCatalogPrice = Math.max(...allProducts.map(p => p.price), 10);
  const priceCeil = Math.ceil(maxCatalogPrice / 5) * 5;

  const filters = {
    cats: new Set(params.get('cat') ? [params.get('cat')] : []),
    sizes: new Set(),
    colors: new Set(),
    maxPrice: priceCeil,
    query: params.get('q') || ''
  };
  let sort = 'featured';

  function uniqueSizes() {
    const s = new Set();
    allProducts.forEach(p => p.sizes.forEach(sz => s.add(sz)));
    return Array.from(s);
  }
  function uniqueColors() {
    const map = new Map();
    allProducts.forEach(p => p.colors.forEach(c => map.set(c.n, c.hex)));
    return Array.from(map.entries()).map(([n, hex]) => ({ n, hex }));
  }

  function renderFilterLists() {
    const catBox = document.getElementById('catFilterList');
    catBox.innerHTML = Store.getCategories().map(c => {
      const count = allProducts.filter(p => p.category === c.id).length;
      const checked = filters.cats.has(c.id) ? 'checked' : '';
      return '<label class="filter-opt"><input type="checkbox" data-cat="' + c.id + '" ' + checked + '>' +
        c.icon + ' ' + t(c.name_en, c.name_km) + '<span class="cnt">' + count + '</span></label>';
    }).join('');
    catBox.querySelectorAll('input[type=checkbox]').forEach(cb => {
      cb.addEventListener('change', () => {
        cb.checked ? filters.cats.add(cb.dataset.cat) : filters.cats.delete(cb.dataset.cat);
        renderAll();
      });
    });

    const sizeBox = document.getElementById('sizeFilterList');
    sizeBox.innerHTML = uniqueSizes().map(sz =>
      '<button type="button" class="size-chip ' + (filters.sizes.has(sz) ? 'active' : '') + '" data-size="' + sz + '">' + sz + '</button>'
    ).join('');
    sizeBox.querySelectorAll('.size-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const sz = btn.dataset.size;
        filters.sizes.has(sz) ? filters.sizes.delete(sz) : filters.sizes.add(sz);
        renderAll();
      });
    });

    const colorBox = document.getElementById('colorFilterList');
    colorBox.innerHTML = uniqueColors().map(c =>
      '<button type="button" class="color-dot ' + (filters.colors.has(c.n) ? 'active' : '') + '" data-color="' + c.n + '" style="background:' + c.hex + '" title="' + c.n + '"></button>'
    ).join('');
    colorBox.querySelectorAll('.color-dot').forEach(btn => {
      btn.addEventListener('click', () => {
        const cn = btn.dataset.color;
        filters.colors.has(cn) ? filters.colors.delete(cn) : filters.colors.add(cn);
        renderAll();
      });
    });

    const range = document.getElementById('priceRange');
    range.max = priceCeil;
    range.value = filters.maxPrice;
    document.getElementById('priceValueLabel').textContent =
      t('Up to ', 'រហូតដល់ ') + fmtPrice(filters.maxPrice);
  }

  function renderChips() {
    const chips = [];
    filters.cats.forEach(id => {
      const c = Store.getCategories().find(x => x.id === id);
      chips.push({ label: (c ? t(c.name_en, c.name_km) : id), onRemove: () => filters.cats.delete(id) });
    });
    filters.sizes.forEach(sz => chips.push({ label: t('Size ', 'ទំហំ ') + sz, onRemove: () => filters.sizes.delete(sz) }));
    filters.colors.forEach(cn => chips.push({ label: cn, onRemove: () => filters.colors.delete(cn) }));
    if (filters.maxPrice < priceCeil) chips.push({ label: '≤ ' + fmtPrice(filters.maxPrice), onRemove: () => { filters.maxPrice = priceCeil; } });
    if (filters.query) chips.push({ label: '"' + filters.query + '"', onRemove: () => { filters.query = ''; document.getElementById('sidebarSearch').value = ''; } });

    const box = document.getElementById('activeChips');
    if (!chips.length) { box.innerHTML = ''; return; }
    box.innerHTML = chips.map((c, i) => '<span class="active-chip">' + c.label + ' <button type="button" data-i="' + i + '">✕</button></span>').join('');
    box.querySelectorAll('button').forEach((btn, i) => {
      btn.addEventListener('click', () => { chips[i].onRemove(); renderAll(); });
    });
  }

  function matchesQuery(p, q) {
    if (!q) return true;
    const hay = (p.name_en + ' ' + p.name_km + ' ' + p.desc_en + ' ' + p.desc_km + ' ' + p.category).toLowerCase();
    return hay.includes(q.toLowerCase());
  }

  function filteredSorted() {
    let list = allProducts.filter(p =>
      (filters.cats.size === 0 || filters.cats.has(p.category)) &&
      (filters.sizes.size === 0 || p.sizes.some(s => filters.sizes.has(s))) &&
      (filters.colors.size === 0 || p.colors.some(c => filters.colors.has(c.n))) &&
      p.price <= filters.maxPrice &&
      matchesQuery(p, filters.query)
    );
    switch (sort) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'newest': list.sort((a, b) => (b.isNew === true) - (a.isNew === true)); break;
      case 'rating': list.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      default: list.sort((a, b) => (b.isFeatured === true) - (a.isFeatured === true));
    }
    return list;
  }

  function renderAll() {
    renderFilterLists();
    renderChips();
    const list = filteredSorted();
    const grid = document.getElementById('productsGrid');
    const empty = document.getElementById('emptyState');
    if (list.length === 0) {
      grid.innerHTML = '';
      empty.style.display = 'block';
    } else {
      empty.style.display = 'none';
      renderProductGrid(grid, list);
    }
    document.getElementById('resultCount').textContent =
      list.length + ' ' + t('products found', 'ទំនិញត្រូវបានរកឃើញ');
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sidebarSearch').value = filters.query;
    document.getElementById('sidebarSearch').addEventListener('input', e => {
      filters.query = e.target.value;
      renderAll();
    });
    document.getElementById('priceRange').addEventListener('input', e => {
      filters.maxPrice = Number(e.target.value);
      document.getElementById('priceValueLabel').textContent = t('Up to ', 'រហូតដល់ ') + fmtPrice(filters.maxPrice);
    });
    document.getElementById('priceRange').addEventListener('change', renderAll);
    document.getElementById('sortSelect').addEventListener('change', e => { sort = e.target.value; renderAll(); });
    document.getElementById('clearFilters').addEventListener('click', () => {
      filters.cats.clear(); filters.sizes.clear(); filters.colors.clear();
      filters.maxPrice = priceCeil; filters.query = '';
      document.getElementById('sidebarSearch').value = '';
      renderAll();
    });
    renderAll();
  });

  document.addEventListener('uh:langchange', renderAll);
  document.addEventListener('uh:currencychange', renderAll);
  document.addEventListener('uh:wishchange', renderAll);
})();
