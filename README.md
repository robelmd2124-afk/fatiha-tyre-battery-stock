# Fatiha Tyre & Battery — Stock Management Software

IPS / Solar Battery dokan-er jonno stock management app. Database: Google Sheet
(prottek menu-r jonno alada tab). Code: ei repo.

## Menu (Sheet tab)

| Menu | Tab | Kaaj |
|---|---|---|
| ড্যাশবোর্ড | — (hisab kore dekhay) | Stock mullo, ajker bikroy, baki, low-stock |
| স্টক | Products | Product, category, brand, kroy/bikroy dor, stock, minimum |
| ক্রয় | Purchases | Kroy entry — dilei stock bare |
| বিক্রয় | Sales | Bikroy entry — dilei stock kome, rosid print kora jay |
| সাপ্লায়ার | Suppliers | Supplier list + tader mot baki |
| কাস্টমার | Customers | Customer list + tader mot baki |
| বাকি | — (hisab kore dekhay) | Ke koto baki — customer + supplier |
| সেটিংস | — | Web App URL + dokan-er nam |

## Setup (ekbar-i korte hobe)

1. **Google Sheet khulun** — notun blank spreadsheet banan (nam: Fatiha Stock).
2. **Apps Script boshan** — Sheet-e giye Extensions → Apps Script → `Code.gs` file-er
   puro code paste korun → Save.
3. **Deploy korun** — Deploy → New deployment → gear icon → Web app →
   - Execute as: **Me**
   - Who has access: **Anyone**
   → Deploy → je URL dibe, seta copy korun.
4. **App khulun** — `index.html` khulun (GitHub Pages ba jekono static host-e
   `index.html`, `styles.css`, `app.js` upload korlei cholbe) → Settings tab-e
   Web App URL + dokan-er nam boshan → Save → **“শিটে ট্যাব বানান”** চাপুন।
5. **Done** — ekhon theke sob entry Sheet-e save hobe, menu-wise tab-e।

> ⚠️ Web App URL kauke diben na — ei URL diyei apnar Sheet-e lekha jay।

## Bebohar

- **Notun entry:** prottek menu-te “+ নতুন” button → form puron → Save।
- **Kroy** dile stock **bare**, **Bikroy** dile stock **kome** — nije hisab korte hoy na।
- **Stock-er cheye beshi bikroy** korte gele app sotorko korbe (chaile tobuo kora jabe,
  stock negative dekhabe)।
- **Edit/Delete:** prottek row-te button ache; delete korle stock-o ager moto fire jabe।
- **Baki:** Sales-er Due = customer baki, Purchases-er Due = supplier baki — Dues
  menu-te mot hisab dekhay।
- **Rosid:** Sales row-te “রসিদ” চাপলে print korar moto rosid khulbe।

## AI Studio-te use (GitHub theke import)

1. AI Studio → Build mode → prompt box-er **+ (Add files)** → **Import from GitHub** → repo `fatiha-tyre-battery-stock` (branch `main`) select koro.
2. Import-er por `aistudio-first-prompt.txt` file-er puro lekha prompt-e paste koro — eta React-e convert kora, ID/logic bodlano ar `Code.gs` chhoa bondho kore.
3. Puro step, edit-er niom, GitHub-e push/pull ar venge gele ki korbe — sob `AI-STUDIO.md`-e ache.
4. Mone rakho: `Code.gs` sudhu Sheet-er Apps Script-e cholbe, AI Studio-te na. Web App URL kokhono code-e likho na.

## File

- `index.html` — app-er page
- `styles.css` — design
- `app.js` — app-er logic
- `Code.gs` — Google Sheet-er sathe jogajog (Apps Script backend)
- `fatiha-stock-single-file.html` — ek file-e puro app (AI Studio backup / shohoj khola)
- `AI-STUDIO.md` — AI Studio import + use korar guide
- `aistudio-first-prompt.txt` — AI Studio-te prothom prompt (copy-paste)
- `metadata.json` — app-er nam (AI Studio metadata)
