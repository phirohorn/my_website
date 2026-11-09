/* ==========================================================================
   UNIFORMHUB — Custom Uniform request page
   ========================================================================== */

(function () {
  let designDataUrl = '';

  document.addEventListener('DOMContentLoaded', () => {
    const user = Auth.currentUser();
    if (user) {
      document.getElementById('contactName').value = user.name || '';
      document.getElementById('contactEmail').value = user.email || '';
      document.getElementById('contactPhone').value = user.phone || '';
    }

    document.getElementById('designFile').addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        designDataUrl = ev.target.result;
        const img = document.getElementById('designPreview');
        img.src = designDataUrl;
        img.style.display = 'block';
        document.getElementById('fileDropText').style.display = 'none';
      };
      reader.readAsDataURL(file);
    });

    function updateTotal() {
      let total = 0;
      document.querySelectorAll('.size-qty').forEach(inp => total += Number(inp.value || 0));
      document.getElementById('totalQtyLabel').textContent = total;
    }
    document.querySelectorAll('.size-qty').forEach(inp => inp.addEventListener('input', updateTotal));

    document.getElementById('customForm').addEventListener('submit', e => {
      e.preventDefault();
      const sizeBreakdown = {};
      let totalQty = 0;
      document.querySelectorAll('.size-qty').forEach(inp => {
        const v = Number(inp.value || 0);
        if (v > 0) sizeBreakdown[inp.dataset.size] = v;
        totalQty += v;
      });
      if (totalQty <= 0) {
        toast(t('Please enter quantity for at least one size.', 'សូមបញ្ចូលចំនួនសម្រាប់ទំហំយ៉ាងហោចណាស់មួយ។'), 'error');
        return;
      }

      const order = {
        id: genId('CU').toUpperCase(),
        userId: user ? user.id : null,
        orgName: document.getElementById('orgName').value.trim(),
        category: document.getElementById('customCategory').value,
        garmentDesc: document.getElementById('garmentDesc').value.trim(),
        sizeBreakdown, totalQty,
        colors: document.getElementById('prefColors').value.trim(),
        designImage: designDataUrl,
        notes: document.getElementById('customNotes').value.trim(),
        contact: {
          name: document.getElementById('contactName').value.trim(),
          phone: document.getElementById('contactPhone').value.trim(),
          email: document.getElementById('contactEmail').value.trim()
        },
        status: 'pending',
        quotedPrice: null,
        createdAt: Date.now()
      };

      const orders = Store.getCustomOrders();
      orders.push(order);
      Store.saveCustomOrders(orders);

      document.getElementById('customForm').style.display = 'none';
      const successBox = document.getElementById('customSuccess');
      successBox.style.display = 'block';
      document.getElementById('successRefId').textContent = '#' + order.id;
      document.getElementById('successRefIdKm').textContent = '#' + order.id;
      toast(t('Custom uniform request submitted!', 'បានដាក់ស្នើសំណើឯកសណ្ឋានតាមបំណង!'), 'success');
      successBox.scrollIntoView({ behavior: 'smooth' });
    });
  });
})();
