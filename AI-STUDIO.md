# AI Studio-te Fatiha App Use Korar System

GitHub repo theke code AI Studio-te import kore, okhane edit kore, abar
GitHub-e push korar system. App-er kaj (logic) bodlabe na — sudhu
AI Studio-te kholar + edit korar rasta banano hoyeche.

> ⚠️ **Sotti kotha age:** AI Studio import korar somoy code-ke tar
> nijer runtime-er moto kore sajate pare (React/Node format-e bodle
> dite pare). Tai import-er **prothom prompt-ta** khub dorkari — seta
> na dile app-er logic venge jete pare. Prothom prompt
> `aistudio-first-prompt.txt` file-e ready ache — copy-paste korlei hobe.

## Ki ki lagbe

1. GitHub account — je account-e repo ache (`robelmd2124-afk`)
2. Google account — AI Studio-te login korar jonno
3. Repo: `robelmd2124-afk/fatiha-tyre-battery-stock` (private holeo cholbe,
   jodi AI Studio-ke GitHub access deoa thake; na dekhale niche
   “Private repo dekhacche na” ongsho dekho)

## Step-by-step: Import

1. **AI Studio khulo:** https://aistudio.google.com — Build mode-e jao.
2. Prompt box-er **Add files (+ icon)** menu-te click koro.
3. **Import from GitHub** select koro.
4. GitHub connect korte chaile **Allow / Authorize** koro (nijer account).
5. Repository list theke **`fatiha-tyre-battery-stock`** select koro,
   branch: **`main`**.
6. Import sesh hole **prothom prompt** hisebe `aistudio-first-prompt.txt`
   file-er puro lekha copy kore prompt box-e paste koro, tarpor Run dao.
   - Ei prompt-e bola ache: React-e convert koro na, vanilla
     HTML/CSS/JS-i rakho, kono ID/logic bodlio na, `Code.gs` chhuyo na.
7. Preview-e app khulle **Settings** tab-e giye ager motoi Web App URL
   boshao (je URL Sheet-er Apps Script theke peyecho). URL kokhono
   code-e likho na, commit koro na — eta sudhu browser-e save thake.
8. Ekta test product add kore dekho Sheet-e row jay kina. Thik thakle
   test row-ta delete kore dao.

## AI Studio-te edit korar niom (jate na vange)

- **Ekbar-e ekta choto change** chao. Jemon: “Header-er rong bodlao”,
  “Dashboard-e ekta notun card add koro” — boro change ekbare chaile
  vul howar chance beshi.
- Prottek change-er age bolo: **“Do not convert to React. Keep
  index.html, styles.css, app.js and all element IDs unchanged.”**
- **`Code.gs` kokhono AI Studio-te chalabe na.** `Code.gs` sudhu Google
  Sheet-er Extensions → Apps Script-e cholbe. AI Studio-te keu `Code.gs`
  bodlate chaile “na” bolo — eta Sheet-er backend.
- **Web App URL, Sheet ID ba kono password** prompt-e likho na.
- Change-er por preview-e check koro: Dashboard, Stock, Kroy, Bikroy,
  Settings — sob tab khole kina, Save kaj kore kina.

## GitHub-e ferot pathano (two-way sync)

1. AI Studio-te **Settings → GitHub tab** khulo.
2. Repo-ti link kora thakle **Push** dao — AI Studio nijei commit
   message baniye GitHub-e pathabe.
3. Bahire (Muse ba onno jayga) code bodle thakle **Pull** dao — tahole
   AI Studio-te notun code chole asbe.
4. Dui dike ek-i file bodle gele **Resolve conflicts** dialog asbe —
   prottek file-e AI Studio version na GitHub version rakhbe, dekhe
   select koro. Na bujhle GitHub version rakho — Muse-er code-ta
   kaj-kora (working) version.

## Jodi import-er por app venge jay

1. Ghabrio na — GitHub-er `main` branch-e kaj-kora code ache.
2. AI Studio-ke bolo: “Revert to the imported GitHub version. Do not
   rewrite the logic.”
3. Na hole AI Studio theke **Pull** dao, ba notun kore Import koro.
4. Sobcheye safe backup: repo-r **`fatiha-stock-single-file.html`**
   file-ta — ek file-e puro app (design + logic). Eta khullei app
   cholbe, kono folder lagbe na.
5. Vanga obosthay **Push koro na** — age preview-e thik kore, tarpor push.

## Private repo dekhacche na? (fallback)

- AI Studio-te GitHub connect korar somoy **sob repository-te access**
  diyecho kina check koro. Private repo dekhte hole access lagbei.
- Tobuo na dekhale, repo **Public** korte hobe — eta tomar siddhanto,
  ami bodlai nai. Public korle link diyeo khola jabe.
- Ar ekta rasta: AI Studio-te **Add files → Upload** diye
  `fatiha-stock-single-file.html` upload koro, sathe prothom prompt-ta
  dao. Tokhon GitHub sync thakbe na, kintu app edit kora jabe.

## Mone rakhar kotha

- AI Studio **free quota** sesh hoye gele wait korte hobe ba paid
  lagte pare — eta Google-er limit, code-er dosh na.
- AI Studio theke **deploy (Cloud Run)** korle khoroch hote pare.
  Deploy na kore sudhu edit + GitHub push korlei tomar kaj hobe.
- Kaj-kora (working) app-ta sobsomoy GitHub-er `main`-e thakbe.
  AI Studio holo edit korar ekta rasta, ekmatro rasta na.

## File-gulo

- `index.html` — app-er page (AI Studio-te entry point)
- `styles.css` — design
- `app.js` — app-er logic (Sheet-er sathe fetch, localStorage-e URL)
- `Code.gs` — sudhu Sheet-er Apps Script-e cholbe, AI Studio-te na
- `fatiha-stock-single-file.html` — ek file-e puro app (backup / shohoj kholar jonno)
- `aistudio-first-prompt.txt` — import-er por prothom prompt (copy-paste)
- `metadata.json` — app-er nam (AI Studio metadata)
