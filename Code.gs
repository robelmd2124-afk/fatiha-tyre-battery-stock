// Fatiha Tyre & Battery — Google Sheet backend (Apps Script)
// Setup: notun Google Sheet khulun > Extensions > Apps Script > ei file-er code paste
// korun > Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone
// > Deploy. Je URL paben, seta app-er Settings tab-e boshan. URL kauke diben na.

const TABS = {
  products:   ['ID', 'Name', 'Category', 'Brand', 'Unit', 'BuyPrice', 'SellPrice', 'Stock', 'MinStock'],
  purchases:  ['ID', 'Date', 'ProductID', 'ProductName', 'Supplier', 'Qty', 'BuyPrice', 'Total', 'Paid', 'Due', 'Note'],
  sales:      ['ID', 'Date', 'ProductID', 'ProductName', 'Customer', 'Qty', 'SellPrice', 'Total', 'Paid', 'Due', 'Note'],
  suppliers:  ['ID', 'Name', 'Phone', 'Address', 'Note'],
  customers:  ['ID', 'Name', 'Phone', 'Address', 'Note'],
};

function ss() { return SpreadsheetApp.getActiveSpreadsheet(); }

function ensureSheet(name) {
  let sh = ss().getSheetByName(name);
  if (!sh) sh = ss().insertSheet(name);
  if (sh.getLastRow() === 0) sh.appendRow(TABS[name]);
  return sh;
}
function ensureSetup() {
  Object.keys(TABS).forEach(ensureSheet);
  // Prothom tab-ti (Products) khola rakhun
  ss().setActiveSheet(ss().getSheetByName('products'));
}
function rowsOf(name) {
  const sh = ensureSheet(name);
  const vals = sh.getDataRange().getValues();
  const headers = vals[0];
  const out = [];
  for (let i = 1; i < vals.length; i++) {
    if (vals[i].every(c => c === '' || c === null)) continue;
    const o = {};
    headers.forEach((h, j) => { o[h] = vals[i][j]; });
    out.push(o);
  }
  return out;
}
function findRow(name, id) {
  const sh = ensureSheet(name);
  const vals = sh.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (String(vals[i][0]) === String(id)) return { sheet: sh, rowIdx: i + 1, values: vals[i], headers: vals[0] };
  }
  return null;
}
function nextId(name) {
  const rows = rowsOf(name);
  let m = 0;
  rows.forEach(r => { const n = Number(r.ID); if (!isNaN(n) && n > m) m = n; });
  return m + 1;
}
function objToRow(name, obj) {
  return TABS[name].map(h => (obj[h] === undefined || obj[h] === null) ? '' : obj[h]);
}
function adjustStock(productId, delta) {
  if (!productId || !delta) return;
  const f = findRow('products', productId);
  if (!f) return;
  const stockIdx = TABS.products.indexOf('Stock');
  const cur = Number(f.values[stockIdx]) || 0;
  f.sheet.getRange(f.rowIdx, stockIdx + 1).setValue(cur + delta);
}
function stockDelta(sheet, oldRow, newRow) {
  // Returns list of [productId, delta] to apply
  if (sheet === 'purchases') {
    if (oldRow && newRow) {
      if (String(oldRow.ProductID) === String(newRow.ProductID))
        return [[newRow.ProductID, Number(newRow.Qty) - Number(oldRow.Qty)]];
      return [[oldRow.ProductID, -Number(oldRow.Qty)], [newRow.ProductID, Number(newRow.Qty)]];
    }
    if (newRow) return [[newRow.ProductID, Number(newRow.Qty)]];
    if (oldRow) return [[oldRow.ProductID, -Number(oldRow.Qty)]];
  }
  if (sheet === 'sales') {
    if (oldRow && newRow) {
      if (String(oldRow.ProductID) === String(newRow.ProductID))
        return [[newRow.ProductID, -(Number(newRow.Qty) - Number(oldRow.Qty))]];
      return [[oldRow.ProductID, Number(oldRow.Qty)], [newRow.ProductID, -Number(newRow.Qty)]];
    }
    if (newRow) return [[newRow.ProductID, -Number(newRow.Qty)]];
    if (oldRow) return [[oldRow.ProductID, Number(oldRow.Qty)]];
  }
  return [];
}
function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'get';
    if (action === 'setup') { ensureSetup(); return jsonOut({ ok: true }); }
    ensureSetup();
    const data = {};
    Object.keys(TABS).forEach(k => { data[k] = rowsOf(k); });
    return jsonOut({ ok: true, data: data });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  const lock = LockService.getDocumentLock();
  try {
    lock.waitLock(15000);
    const body = JSON.parse(e.postData.contents);
    if (body.action === 'setup') { ensureSetup(); return jsonOut({ ok: true }); }
    const sheet = body.sheet;
    if (!TABS[sheet]) throw new Error('Unknown sheet: ' + sheet);

    if (body.action === 'add') {
      const row = body.row || {};
      row.ID = nextId(sheet);
      ensureSheet(sheet).appendRow(objToRow(sheet, row));
      stockDelta(sheet, null, row).forEach(d => adjustStock(d[0], d[1]));
      return jsonOut({ ok: true, id: row.ID });
    }
    if (body.action === 'update') {
      const f = findRow(sheet, body.id);
      if (!f) throw new Error('Row not found: ' + body.id);
      const oldObj = {};
      f.headers.forEach((h, j) => { oldObj[h] = f.values[j]; });
      const merged = Object.assign({}, oldObj, body.row || {});
      merged.ID = oldObj.ID;
      f.sheet.getRange(f.rowIdx, 1, 1, TABS[sheet].length).setValues([objToRow(sheet, merged)]);
      stockDelta(sheet, oldObj, merged).forEach(d => adjustStock(d[0], d[1]));
      return jsonOut({ ok: true });
    }
    if (body.action === 'delete') {
      const f = findRow(sheet, body.id);
      if (!f) throw new Error('Row not found: ' + body.id);
      const oldObj = {};
      f.headers.forEach((h, j) => { oldObj[h] = f.values[j]; });
      f.sheet.deleteRow(f.rowIdx);
      stockDelta(sheet, oldObj, null).forEach(d => adjustStock(d[0], d[1]));
      return jsonOut({ ok: true });
    }
    throw new Error('Unknown action: ' + body.action);
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
