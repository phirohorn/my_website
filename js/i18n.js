/* ==========================================================================
   UNIFORMHUB — Language & Currency
   Static bilingual markup uses [lang-en]/[lang-km] attributes (see style.css).
   Dynamic (JS-rendered) strings use t(en, km).
   ========================================================================== */

function t(en, km) {
  return Store.getLang() === 'km' ? km : en;
}

function applyLangCurrency() {
  const lang = Store.getLang();
  const cur = Store.getCurrency();
  document.documentElement.setAttribute('data-lang', lang);
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  document.querySelectorAll('.cur-btn').forEach(b => b.classList.toggle('active', b.dataset.cur === cur));
}

function setLang(lang) {
  Store.setLang(lang);
  applyLangCurrency();
  document.dispatchEvent(new CustomEvent('uh:langchange'));
}

function setCurrency(cur) {
  Store.setCurrency(cur);
  applyLangCurrency();
  document.dispatchEvent(new CustomEvent('uh:currencychange'));
}

function wireLangCurrencySwitchers() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
  document.querySelectorAll('.cur-btn').forEach(btn => {
    btn.addEventListener('click', () => setCurrency(btn.dataset.cur));
  });
  applyLangCurrency();
}

document.addEventListener('DOMContentLoaded', wireLangCurrencySwitchers);