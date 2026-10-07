# Psaní všemi deseti

Moderní výukový program pro Windows, který tě naučí psát všemi deseti na **české klávesnici** – inspirovaný starým programem *Psaní všemi deseti 1.5*, ale s více lekcemi a novým vzhledem.

## Co umí

- **61 lekcí** krok za krokem: základní řada → horní řada → dolní řada → velká písmena (Shift) → háčky a čárky → mrtvé klávesy (ó, ď, ť, ň, velká Č, Ř, Ů…) → čísla → interpunkce a znaky → slova, přísloví, jazykolamy a souvislé texty → závěrečný test.
- Text cvičení se **generuje pokaždé nový**, vždy jen z písmen, která už znáš (se skutečnými českými slovy).
- **Klávesnice na obrazovce** s barvami prstů, zvýrazněnou další klávesou (včetně správného Shiftu) a **obrázek rukou**, který ukazuje, kterým prstem psát.
- Měření **úhozů za minutu** (Shift a mrtvá klávesa se počítají jako úhoz navíc), **chybovosti** a času; hodnocení 1–3 hvězdami.
- **Slabá místa** – program si pamatuje, kde chybuješ, ukáže teplotní mapu klávesnice a sestaví cvičení na míru.
- **Vlastní text** – vlož libovolný text a procvič si ho.
- **Statistiky** s grafem vývoje rychlosti a historií cvičení.
- Česká klávesnice **QWERTZ i QWERTY**; **emulace české klávesnice** pro počítače, kde je ve Windows nastavená jen anglická.
- Více **uživatelů** (třeba pro celou rodinu), záloha a obnova postupu, světlý/tmavý motiv.
- Funguje úplně **offline**, nic se nikam neodesílá.

## Stažení pro Windows

Hotové `.exe` sestavuje GitHub Actions (záložka **Actions** → poslední běh „Sestavení pro Windows“ → *Artifacts*):

- `PsaniVsemiDeseti-Setup-2.0.0.exe` – instalátor (zástupce na ploše a v nabídce Start),
- `PsaniVsemiDeseti-Portable-2.0.0.exe` – přenosná verze bez instalace.

Po vytvoření tagu `v*` (např. `v2.0.0`) se soubory přidají i do sekce **Releases**.

## Vyzkoušení bez instalace

Stačí otevřít soubor `app/index.html` v prohlížeči (Chrome, Edge, Firefox).

## Vývoj

```bash
npm install
npm start        # spustí aplikaci v Electronu
npm run dist     # sestaví .exe (na Windows)
```

Struktura:

- `app/js/layout.js` – rozložení české klávesnice, prsty, mrtvé klávesy
- `app/js/lessons.js` – osnova kurzu a generátor cvičení
- `app/js/data.js` – slova, věty, přísloví a texty
- `app/js/app.js` – uživatelské rozhraní, měření, ukládání postupu
- `main.js` – okno aplikace (Electron)
