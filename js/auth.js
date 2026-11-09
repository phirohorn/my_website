/* ==========================================================================
   UNIFORMHUB — Authentication (localStorage-backed)
   ========================================================================== */

const Auth = {
  currentUser() {
    const sess = Store.getSession();
    if (!sess) return null;
    return Store.getUsers().find(u => u.id === sess.userId) || null;
  },

  isLoggedIn() { return !!this.currentUser(); },
  isAdmin() { const u = this.currentUser(); return !!u && u.role === 'admin'; },

  register({ name, email, password, phone }) {
    const users = Store.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: t('An account with this email already exists.', 'គណនីជាមួយអ៊ីមែលនេះមានរួចហើយ។') };
    }
    const user = { id: genId('u'), name, email, password, phone: phone || '', address: '', role: 'customer' };
    users.push(user);
    Store.saveUsers(users);
    Store.setSession({ userId: user.id });
    return { ok: true, user };
  },

  login(email, password) {
    const users = Store.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) return { ok: false, error: t('Invalid email or password.', 'អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ។') };
    Store.setSession({ userId: user.id });
    return { ok: true, user };
  },

  logout() {
    Store.clearSession();
  },

  updateProfile(userId, patch) {
    const users = Store.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return false;
    users[idx] = { ...users[idx], ...patch };
    Store.saveUsers(users);
    return true;
  },

  requireLogin(redirectTo) {
    if (!this.isLoggedIn()) {
      const back = encodeURIComponent(location.pathname.split('/').pop() + location.search);
      location.href = (redirectTo || 'login.html') + '?next=' + back;
      return false;
    }
    return true;
  },

  requireAdmin() {
    if (!this.isLoggedIn() || !this.isAdmin()) {
      location.href = 'login.html?next=admin.html';
      return false;
    }
    return true;
  }
};
