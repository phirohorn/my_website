/* ==========================================================================
   UNIFORMHUB — Shared UI: header state, toasts, mobile nav, search
   ========================================================================== */

function toast(message, type) {
  let stack = document.getElementById('toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'toast-stack';
    document.body.appendChild(stack);
  }
  const el = document.createElement('div');
  el.className = 'toast ' + (type || 'info');
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  el.innerHTML = '<span>' + icon + '</span><span>' + message + '</span>';
  stack.appendChild(el);
  setTimeout(() => {
    el.style.transition = '.25s';
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    setTimeout(() => el.remove(), 250);
  }, 2600);
}

function renderHeaderBadges() {
  document.querySelectorAll('.js-cart-count').forEach(b => {
    const c = Cart.count();
    b.textContent = c;
    b.style.display = c > 0 ? 'flex' : 'none';
  });
  document.querySelectorAll('.js-wish-count').forEach(b => {
    const c = Wishlist.count();
    b.textContent = c;
    b.style.display = c > 0 ? 'flex' : 'none';
  });
}

function renderUserMenu() {
  const box = document.getElementById('userMenuBox');
  if (!box) return;
  const user = Auth.currentUser();
  if (!user) {
    box.innerHTML =
      '<a href="login.html"><span>🔑</span> <span lang-en>Login</span><span lang-km>ចូលគណនី</span></a>' +
      '<a href="register.html"><span>📝</span> <span lang-en>Register</span><span lang-km>ចុះឈ្មោះ</span></a>';
  } else {
    box.innerHTML =
      '<div style="padding:8px 12px;"><b style="font-size:14px;">' + user.name + '</b><br><span style="font-size:12px;color:var(--text-mute)">' + user.email + '</span></div><hr>' +
      '<a href="profile.html"><span>👤</span> <span lang-en>My Profile</span><span lang-km>ប្រវត្តិរូប</span></a>' +
      '<a href="orders.html"><span>📦</span> <span lang-en>My Orders</span><span lang-km>ការបញ្ជាទិញ</span></a>' +
      '<a href="wishlist.html"><span>❤️</span> <span lang-en>Wishlist</span><span lang-km>ចង់បាន</span></a>' +
      (user.role === 'admin' ? '<a href="admin.html"><span>🔧</span> <span lang-en>Admin Dashboard</span><span lang-km>ផ្ទាំងគ្រប់គ្រង</span></a>' : '') +
      '<hr><button id="logoutBtn"><span>🚪</span> <span lang-en>Logout</span><span lang-km>ចាកចេញ</span></button>';
    const lo = document.getElementById('logoutBtn');
    if (lo) lo.addEventListener('click', () => {
      Auth.logout();
      toast(t('Logged out successfully.', 'បានចាកចេញដោយជោគជ័យ។'), 'success');
      setTimeout(() => location.href = 'index.html', 500);
    });
  }
}

function wireMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }
  const searchToggle = document.getElementById('searchToggle');
  const search = document.getElementById('headerSearch');
  if (searchToggle && search) {
    searchToggle.addEventListener('click', () => search.classList.toggle('open'));
  }
}

function wireHeaderSearch() {
  const form = document.getElementById('headerSearch');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const q = form.querySelector('input').value.trim();
    location.href = 'products.html' + (q ? '?q=' + encodeURIComponent(q) : '');
  });
}

function highlightActiveNav() {
  const page = document.body.dataset.page;
  if (!page) return;
  document.querySelectorAll('.main-nav a[data-nav]').forEach(a => {
    a.classList.toggle('active', a.dataset.nav === page);
  });
}

function updateSearchPlaceholder() {
  document.querySelectorAll('#headerSearchInput').forEach(i => {
    i.placeholder = t('Search uniforms...', 'ស្វែងរកឯកសណ្ឋាន...');
  });
}

function initHeader() {
  renderHeaderBadges();
  renderUserMenu();
  wireMobileMenu();
  wireHeaderSearch();
  highlightActiveNav();
  updateSearchPlaceholder();
  document.addEventListener('uh:cartchange', renderHeaderBadges);
  document.addEventListener('uh:wishchange', renderHeaderBadges);
  document.addEventListener('uh:langchange', renderUserMenu);
  document.addEventListener('uh:langchange', updateSearchPlaceholder);
}

document.addEventListener('DOMContentLoaded', initHeader);
