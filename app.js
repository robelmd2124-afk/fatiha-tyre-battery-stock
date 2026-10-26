// Fatiha Tyre & Battery — Stock Management (frontend)
// Database: Google Sheet via Apps Script Web App (Code.gs). No key is stored in code;
// the Web App URL lives only in this browser's localStorage (Settings tab).

const $ = id => document.getElementById(id);
const state = { products: [], purchases: [], sales: [], suppliers: [], customers: [] };
const CATEGORIES = ['Tyre', 'Battery', 'IPS', 'Solar Panel', 'Inverter', 'Charger', 'Cable', 'Others'];
const UNITS = ['Pcs', 'Set', 'Meter', 'Kg'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const getUrl = () => (localStorage.getItem('ftb_url') || '').trim();
const getShop = () => localStorage.getItem('ftb_shop') || 'Fatiha Tyre & Battery';
const num = v => { const n = Number(v); return isNaN(n) ? 0 : n; };
const money = v => '৳ ' + num(v).toLocaleString('en-US');
const todayISO = () => new Date().toISOString().slice(0, 10);
function fmtDate(iso) {
  if (!iso) return '';
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(iso);
  return m[3] + '-' + MONTHS[Number(m[2]) - 1] + '-' + m[1];
}
function setStatus(msg, err) {
  const el = $('statusBar');
  el.textContent = msg;
  el.className = 'status' + (err ? ' err' : '');
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---------- API ----------
async function apiGet(params) {
  const url = getUrl();
  if (!url) throw new Error('Settings-এ Web App URL বসান।');
  const res = await fetch(url + '?' + new URLSearchParams(params));
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Server error');
  return data;
}
async function apiPost(body) {
  const url = getUrl();
  if (!url) throw new Error('Settings-এ Web App URL বসান।');
  const res = await fetch(url, { method: 'POST', body: JSON.stringify(body) });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Server error');
  return data;
}

async function loadAll() {
  setStatus('লোড হচ্ছে…');
  const data = await apiGet({ action: 'get' });
  Object.assign(state, data.data);
  renderAll();
  setStatus('সব তথ্য লোড হয়েছে। শেষ আপডেট: ' + new Date().toLocaleTimeString('en-GB'));
}

// ---------- Rendering ----------
function renderAll() {
  $('shopNameTitle').textContent = getShop();
  renderDashboard();
  renderProducts();
  renderPurchases();
  renderSales();
  renderSuppliers();
  renderCustomers();
  renderDues();
}
function renderDashboard() {
  const stockVal = state.products.reduce((s, p) => s + num(p.Stock) * num(p.BuyPrice), 0);
  const today = todayISO();
  const todaySales = state.sales.filter(s => String(s.Date).slice(0, 10) === today)
    .reduce((s, r) => s + num(r.Total), 0);
  const custDue = state.sales.reduce((s, r) => s + num(r.Due), 0);
  const supDue = state.purchases.reduce((s, r) => s + num(r.Due), 0);
  const low = state.products.filter(p => num(p.Stock) <= num(p.MinStock));
  $('dStockValue').textContent = money(stockVal);
  $('dTodaySales').textContent = money(todaySales);
  $('dCustDue').textContent = money(custDue);
  $('dSupDue').textContent = money(supDue);
  $('dLowCount').textContent = low.length;
  $('lowTable').innerHTML = low.map(p =>
    `<tr><td>${esc(p.Name)}</td><td>${esc(p.Category)}</td><td class="${num(p.Stock) < 0 ? 'neg' : ''}">${p.Stock}</td><td>${p.MinStock}</td></tr>`).join('')
    || '<tr><td colspan="4">কোনো লো স্টক নেই।</td></tr>';
  $('recentSales').innerHTML = [...state.sales].slice(-8).reverse().map(s =>
    `<tr><td>${fmtDate(s.Date)}</td><td>${esc(s.ProductName)}</td><td>${esc(s.Customer)}</td><td>${s.Qty}</td><td>${money(s.Total)}</td></tr>`).join('')
    || '<tr><td colspan="5">এখনো বিক্রয় নেই।</td></tr>';
}
function filterRows(rows, q, fields) {
  q = (q || '').trim().toLowerCase();
  if (!q) return rows;
  return rows.filter(r => fields.some(f => String(r[f] || '').toLowerCase().includes(q)));
}
function renderProducts() {
  const rows = filterRows(state.products, $('searchProducts').value, ['Name', 'Category', 'Brand']);
  $('productsTable').innerHTML = rows.map(p =>
    `<tr><td>${p.ID}</td><td>${esc(p.Name)}</td><td>${esc(p.Category)}</td><td>${esc(p.Brand)}</td><td>${esc(p.Unit)}</td><td>${money(p.BuyPrice)}</td><td>${money(p.SellPrice)}</td><td class="${num(p.Stock) < 0 ? 'neg' : ''}">${p.Stock}</td><td>${p.MinStock}</td><td><button class="btn small secondary" onclick="openForm('products',${p.ID})">এডিট</button> <button class="btn small danger" onclick="delRow('products',${p.ID})">ডিলিট</button></td></tr>`).join('')
    || '<tr><td colspan="10">কোনো প্রোডাক্ট নেই।</td></tr>';
}
function renderPurchases() {
  const rows = filterRows(state.purchases, $('searchPurchases').value, ['ProductName', 'Supplier']);
  $('purchasesTable').innerHTML = rows.map(r =>
    `<tr><td>${r.ID}</td><td>${fmtDate(r.Date)}</td><td>${esc(r.ProductName)}</td><td>${esc(r.Supplier)}</td><td>${r.Qty}</td><td>${money(r.BuyPrice)}</td><td>${money(r.Total)}</td><td>${money(r.Paid)}</td><td>${money(r.Due)}</td><td><button class="btn small secondary" onclick="openForm('purchases',${r.ID})">এডিট</button> <button class="btn small danger" onclick="delRow('purchases',${r.ID})">ডিলিট</button></td></tr>`).join('')
    || '<tr><td colspan="10">কোনো ক্রয় নেই।</td></tr>';
}
function renderSales() {
  const rows = filterRows(state.sales, $('searchSales').value, ['ProductName', 'Customer']);
  $('salesTable').innerHTML = rows.map(r =>
    `<tr><td>${r.ID}</td><td>${fmtDate(r.Date)}</td><td>${esc(r.ProductName)}</td><td>${esc(r.Customer)}</td><td>${r.Qty}</td><td>${money(r.SellPrice)}</td><td>${money(r.Total)}</td><td>${money(r.Paid)}</td><td>${money(r.Due)}</td><td><button class="btn small" onclick="printReceipt(${r.ID})">রসিদ</button> <button class="btn small secondary" onclick="openForm('sales',${r.ID})">এডিট</button> <button class="btn small danger" onclick="delRow('sales',${r.ID})">ডিলিট</button></td></tr>`).join('')
    || '<tr><td colspan="10">কোনো বিক্রয় নেই।</td></tr>';
}
function dueMap(rows, keyField) {
  const m = {};
  rows.forEach(r => {
    const k = (r[keyField] || '').trim();
    if (!k) return;
    m[k] = (m[k] || 0) + num(r.Due);
  });
  return m;
}
function renderSuppliers() {
  const due = dueMap(state.purchases, 'Supplier');
  const rows = filterRows(state.suppliers, $('searchSuppliers').value, ['Name', 'Phone']);
  $('suppliersTable').innerHTML = rows.map(s =>
    `<tr><td>${s.ID}</td><td>${esc(s.Name)}</td><td>${esc(s.Phone)}</td><td>${esc(s.Address)}</td><td>${money(due[s.Name] || 0)}</td><td><button class="btn small secondary" onclick="openForm('suppliers',${s.ID})">এডিট</button> <button class="btn small danger" onclick="delRow('suppliers',${s.ID})">ডিলিট</button></td></tr>`).join('')
    || '<tr><td colspan="6">কোনো সাপ্লায়ার নেই।</td></tr>';
}
function renderCustomers() {
  const due = dueMap(state.sales, 'Customer');
  const rows = filterRows(state.customers, $('searchCustomers').value, ['Name', 'Phone']);
  $('customersTable').innerHTML = rows.map(c =>
    `<tr><td>${c.ID}</td><td>${esc(c.Name)}</td><td>${esc(c.Phone)}</td><td>${esc(c.Address)}</td><td>${money(due[c.Name] || 0)}</td><td><button class="btn small secondary" onclick="openForm('customers',${c.ID})">এডিট</button> <button class="btn small danger" onclick="delRow('customers',${c.ID})">ডিলিট</button></td></tr>`).join('')
    || '<tr><td colspan="6">কোনো কাস্টমার নেই।</td></tr>';
}
function renderDues() {
  const cd = dueMap(state.sales, 'Customer');
  const sd = dueMap(state.purchases, 'Supplier');
  $('custDueTable').innerHTML = Object.entries(cd).filter(([, v]) => v !== 0).map(([k, v]) =>
    `<tr><td>${esc(k)}</td><td>${money(v)}</td></tr>`).join('') || '<tr><td colspan="2">কোনো বাকি নেই।</td></tr>';
  $('supDueTable').innerHTML = Object.entries(sd).filter(([, v]) => v !== 0).map(([k, v]) =>
    `<tr><td>${esc(k)}</td><td>${money(v)}</td></tr>`).join('') || '<tr><td colspan="2">কোনো বাকি নেই।</td></tr>';
}

// ---------- Forms ----------
let currentForm = null;
const FORMS = {
  products: [
    { k: 'Name', l: 'প্রোডাক্টের নাম', req: true },
    { k: 'Category', l: 'ক্যাটাগরি', type: 'select', opts: CATEGORIES },
    { k: 'Brand', l: 'ব্র্যান্ড' },
    { k: 'Unit', l: 'একক', type: 'select', opts: UNITS },
    { k: 'BuyPrice', l: 'ক্রয় দর (৳)', type: 'number', req: true },
    { k: 'SellPrice', l: 'বিক্রয় দর (৳)', type: 'number', req: true },
    { k: 'Stock', l: 'বর্তমান স্টক', type: 'number' },
    { k: 'MinStock', l: 'মিনিমাম স্টক (এই নিচে গেলে অ্যালার্ট)', type: 'number' },
  ],
  purchases: [
    { k: 'Date', l: 'তারিখ', type: 'date', req: true },
    { k: 'ProductID', l: 'প্রোডাক্ট', type: 'product' },
    { k: 'Supplier', l: 'সাপ্লায়ার', list: 'suppliers' },
    { k: 'Qty', l: 'পরিমাণ', type: 'number', req: true },
    { k: 'BuyPrice', l: 'ক্রয় দর (৳)', type: 'number', req: true },
    { k: 'Paid', l: 'জমা (৳)', type: 'number' },
    { k: 'Note', l: 'নোট' },
  ],
  sales: [
    { k: 'Date', l: 'তারিখ', type: 'date', req: true },
    { k: 'ProductID', l: 'প্রোডাক্ট', type: 'product' },
    { k: 'Customer', l: 'কাস্টমার', list: 'customers' },
    { k: 'Qty', l: 'পরিমাণ', type: 'number', req: true },
    { k: 'SellPrice', l: 'বিক্রয় দর (৳)', type: 'number', req: true },
    { k: 'Paid', l: 'জমা (৳)', type: 'number' },
    { k: 'Note', l: 'নোট' },
  ],
  suppliers: [
    { k: 'Name', l: 'নাম', req: true },
    { k: 'Phone', l: 'ফোন' },
    { k: 'Address', l: 'ঠিকানা' },
    { k: 'Note', l: 'নোট' },
  ],
  customers: [
    { k: 'Name', l: 'নাম', req: true },
    { k: 'Phone', l: 'ফোন' },
    { k: 'Address', l: 'ঠিকানা' },
    { k: 'Note', l: 'নোট' },
  ],
};
function fieldHtml(f, val) {
  const v = esc(val == null ? '' : val);
  if (f.type === 'select') return `<label>${f.l}</label><select id="f_${f.k}">${f.opts.map(o => `<option ${o === val ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
  if (f.type === 'product') return `<label>${f.l}</label><select id="f_${f.k}">${state.products.map(p => `<option value="${p.ID}" ${String(p.ID) === String(val) ? 'selected' : ''}>${esc(p.Name)} (${esc(p.Brand || '')}) — স্টক: ${p.Stock}</option>`).join('')}</select>`;
  if (f.type === 'date') return `<label>${f.l}</label><input id="f_${f.k}" type="date" value="${v || todayISO()}">`;
  if (f.type === 'number') return `<label>${f.l}</label><input id="f_${f.k}" type="number" step="any" value="${v}">`;
  const listAttr = f.list ? ` list="dl_${f.list}"` : '';
  const dl = f.list ? `<datalist id="dl_${f.list}">${(f.list === 'suppliers' ? state.suppliers : state.customers).map(x => `<option value="${esc(x.Name)}">`).join('')}</datalist>` : '';
  return `<label>${f.l}</label><input id="f_${f.k}" value="${v}"${listAttr}>${dl}`;
}
function openForm(kind, id) {
  const titles = { products: 'প্রোডাক্ট', purchases: 'ক্রয়', sales: 'বিক্রয়', suppliers: 'সাপ্লায়ার', customers: 'কাস্টমার' };
  const list = state[kind];
  const row = id ? list.find(r => String(r.ID) === String(id)) : null;
  if (kind === 'purchases' || kind === 'sales') {
    if (!state.products.length) { alert('আগে একটি প্রোডাক্ট যোগ করুন।'); return; }
  }
  currentForm = { kind, id: row ? row.ID : null };
  $('modalTitle').textContent = (row ? 'এডিট: ' : 'নতুন ') + titles[kind];
  $('modalFields').innerHTML = FORMS[kind].map(f => fieldHtml(f, row ? row[f.k] : '')).join('');
  $('modalMsg').textContent = '';
  $('modal').classList.remove('hidden');
  // Autofill price when product changes
  const ps = $('f_ProductID');
  if (ps) ps.addEventListener('change', () => {
    const p = state.products.find(x => String(x.ID) === ps.value);
    if (!p) return;
    if (kind === 'purchases' && $('f_BuyPrice')) $('f_BuyPrice').value = p.BuyPrice;
    if (kind === 'sales' && $('f_SellPrice')) $('f_SellPrice').value = p.SellPrice;
  });
}
async function saveForm() {
  const { kind, id } = currentForm;
  const row = {};
  for (const f of FORMS[kind]) {
    const el = $('f_' + f.k);
    row[f.k] = f.type === 'number' ? num(el.value) : el.value.trim();
  }
  try {
    if (kind === 'purchases' || kind === 'sales') {
      const p = state.products.find(x => String(x.ID) === String(row.ProductID));
      if (!p) throw new Error('প্রোডাক্ট বাছুন।');
      const price = kind === 'purchases' ? num(row.BuyPrice) : num(row.SellPrice);
      if (!row.Qty || row.Qty <= 0) throw new Error('পরিমাণ ০-এর বেশি হতে হবে।');
      row.ProductName = p.Name;
      row.Total = row.Qty * price;
      row.Due = row.Total - num(row.Paid);
      if (kind === 'sales' && !id && row.Qty > num(p.Stock)) {
        if (!confirm(`স্টকে আছে ${p.Stock}, বিক্রি করতে চাচ্ছেন ${row.Qty}। তবুও বিক্রয় করবেন? (স্টক নেগেটিভ দেখাবে)`)) return;
      }
      row.ProductID = p.ID;
    }
    $('modalMsg').textContent = 'সেভ হচ্ছে…';
    if (id) await apiPost({ action: 'update', sheet: kind, id, row });
    else await apiPost({ action: 'add', sheet: kind, row });
    $('modal').classList.add('hidden');
    await loadAll();
  } catch (e) { $('modalMsg').textContent = 'ভুল: ' + e.message; }
}
async function delRow(kind, id) {
  if (!confirm('এই রেকর্ড ডিলিট করবেন? স্টকও সেই অনুযায়ী ঠিক হয়ে যাবে।')) return;
  try { await apiPost({ action: 'delete', sheet: kind, id }); await loadAll(); }
  catch (e) { alert('ভুল: ' + e.message); }
}

// ---------- Receipt ----------
function printReceipt(id) {
  const s = state.sales.find(r => String(r.ID) === String(id));
  if (!s) return;
  const w = window.open('', '_blank');
  w.document.write(`<html><head><title>রসিদ #${s.ID}</title><style>
    body{font-family:system-ui,sans-serif;max-width:420px;margin:30px auto;padding:0 16px}
    h2{text-align:center;margin-bottom:2px} p.c{text-align:center;color:#555;margin-top:0}
    table{width:100%;border-collapse:collapse;margin-top:16px} td{padding:7px 0;border-bottom:1px solid #ddd}
    td:last-child{text-align:right} .t{font-weight:700;font-size:17px}
  </style></head><body>
  <h2>${esc(getShop())}</h2><p class="c">বিক্রয় রসিদ #${s.ID} — ${fmtDate(s.Date)}</p>
  <table>
  <tr><td>প্রোডাক্ট</td><td>${esc(s.ProductName)}</td></tr>
  <tr><td>কাস্টমার</td><td>${esc(s.Customer)}</td></tr>
  <tr><td>পরিমাণ</td><td>${s.Qty}</td></tr>
  <tr><td>দর</td><td>${money(s.SellPrice)}</td></tr>
  <tr><td class="t">মোট</td><td class="t">${money(s.Total)}</td></tr>
  <tr><td>জমা</td><td>${money(s.Paid)}</td></tr>
  <tr><td>বাকি</td><td>${money(s.Due)}</td></tr>
  </table><p class="c">ধন্যবাদ!</p>
  <script>window.print();<\/script></body></html>`);
  w.document.close();
}

// ---------- Tabs & wiring ----------
function switchTab(name) {
  document.querySelectorAll('#mainTabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tabpage').forEach(s => s.classList.toggle('active', s.id === 'tab-' + name));
}
document.querySelectorAll('#mainTabs button').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
$('refreshBtn').addEventListener('click', () => loadAll().catch(e => setStatus('ভুল: ' + e.message, true)));
$('modalClose').addEventListener('click', () => $('modal').classList.add('hidden'));
$('modalSave').addEventListener('click', saveForm);
['Products', 'Purchases', 'Sales', 'Suppliers', 'Customers'].forEach(k => {
  $('search' + k).addEventListener('input', () => {
    ({ Products: renderProducts, Purchases: renderPurchases, Sales: renderSales, Suppliers: renderSuppliers, Customers: renderCustomers })[k]();
  });
});
$('saveCfgBtn').addEventListener('click', () => {
  localStorage.setItem('ftb_url', $('cfgUrl').value.trim());
  localStorage.setItem('ftb_shop', $('cfgShop').value.trim() || 'Fatiha Tyre & Battery');
  $('cfgMsg').textContent = 'সেভ হয়েছে। এখন রিফ্রেশ দিয়ে ডেটা লোড করুন।';
  $('shopNameTitle').textContent = getShop();
});
$('setupSheetBtn').addEventListener('click', async () => {
  try {
    $('cfgMsg').textContent = 'শিটে ট্যাব বানানো হচ্ছে…';
    await apiPost({ action: 'setup' });
    $('cfgMsg').textContent = 'ট্যাব তৈরি হয়েছে। এখন রিফ্রেশ দিন।';
  } catch (e) { $('cfgMsg').textContent = 'ভুল: ' + e.message; }
});

// ---------- Init ----------
$('cfgUrl').value = getUrl();
$('cfgShop').value = getShop();
if (!getUrl()) {
  setStatus('প্রথমবার: Settings ট্যাবে Web App URL বসান, তারপর রিফ্রেশ দিন।', true);
  switchTab('settings');
} else {
  loadAll().catch(e => setStatus('ভুল: ' + e.message + ' — URL ঠিক আছে কিনা Settings-এ দেখুন।', true));
}
