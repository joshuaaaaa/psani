# Psaní všemi deseti

Moderní výukový program pro Windows, který tě naučí psát všemi deseti na **české klávesnici** – inspirovaný starým programem *Psaní všemi deseti 1.5*, ale s více lekcemi a novým vzhledem.

## Co umí

- **88 lekcí** krok za krokem: základní řada → horní řada → dolní řada → velká písmena (Shift), jména a města → háčky a čárky → mrtvé klávesy (ó, ď, ť, ň, velká Č, Ř, Ů…) → čísla, datum a čas → interpunkce a znaky → speciální znaky přes AltGr (@ # & € [ ] { } …) → slova, slabiky, přísloví, jazykolamy a 23 souvislých textů → závěrečný test.
- Lekce **naslepo** se skrytou klávesnicí (nápověda se ukáže až po dvou chybách).
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

Nejnovější verze je vždy v sekci **[Releases](https://github.com/joshuaaaaa/psani/releases/latest)**:

- `PsaniVsemiDeseti-Setup-X.Y.Z.exe` – instalátor (zástupce na ploše a v nabídce Start), **aktualizuje se sám**,
- `PsaniVsemiDeseti-Portable-X.Y.Z.exe` – přenosná verze bez instalace; o nové verzi jen dá vědět.

## Aktualizace

- Nainstalovaný program při každém spuštění zkontroluje Releases. Novou verzi stáhne na pozadí a nainstaluje ji při zavření programu (nebo hned tlačítkem *Restartovat a aktualizovat*).
- Ručně: *Nastavení → O programu → Zkontrolovat aktualizace*, nebo stačí stáhnout nový instalátor a spustit ho přes starou verzi.
- **Postup a statistiky se při aktualizaci ani přeinstalaci neztratí** – jsou uložené zvlášť v `%APPDATA%\Psaní všemi deseti`. Pro jistotu je jde zálohovat v *Nastavení → Uložit zálohu*.
- Automatické aktualizace vyžadují, aby byl repozitář veřejný (soukromé Releases program bez přihlášení nestáhne).

### Jak vydat novou verzi

1. Zvyš `version` v `package.json` (např. `2.2.0`).
2. Commitni a pushni, pak vytvoř a pushni tag se stejným číslem:
   ```bash
   git tag v2.2.0
   git push origin v2.2.0
   ```
3. GitHub Actions sestaví `.exe` a zveřejní je jako Release – nainstalované programy si je pak samy stáhnou.

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
- `main.js`, `preload.js` – okno aplikace a aktualizace (Electron)
