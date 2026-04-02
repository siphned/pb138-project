# WineMarket — Dokument požiadaviek (PRD)

## 1. Základné informácie

| | |
|---|---|
| **Predmet** | PB138 |
| **Tím** | Ján Pullmann, Matěj Šinogl, Adam Mališ, Ondřej Málek |
| **Míľnik 1** | Týždeň 7 — ERD, wireframy, PRD, používateľské role |
| **Míľnik 2** | Týždeň 10 — Jadro implementácie |
| **Míľnik 3** | Týždeň 13 — Finálna revízia, testy, CI/CD |
| **Obhajoba** | Skúškové obdobie |


## 2. Popis produktu

WineMarket je webová platforma určená na prepojenie malých vinárov so zákazníkmi. Vinári (Winemakers) môžu zverejňovať svoje vína s detailnými informáciami a organizovať degustačné eventy. Shopy predávajú vína z katalógu, nastavujú ceny a zásoby, a môžu vytvárať tematické balíčky vín (WineBundles). Zákazníci môžu prehľadávať ponuku vín a vinárov, filtrovať podľa rôznych kritérií, pridávať produkty do košíka a nakupovať s možnosťou osobného odberu alebo doručenia.


## 3. Ciele projektu

- Vytvoriť funkčnú webovú aplikáciu priblížujúcu sa produkčnej kvalite
- Prepojiť malých vinárov priamo so zákazníkmi bez nutnosti medzičlánku
- Ponúknuť transparentné a bohaté informácie o vínach, vinároch, shopoch a eventoch

## 4. Predpoklady

**Technické:**
- Platba je simulovaná — nie je integrovaná reálna platobná brána (napr. Stripe)
- Doručenie nie je logisticky integrované — systém len eviduje typ doručenia a stav objednávky
- Aplikácia beží ako webová stránka — nie je vyvíjaná natívna mobilná aplikácia

**Biznis:**
- Jeden Winemaker môže predávať cez vlastný shop alebo cez partnerské shopy
- Jeden Shop môže ponúkať produkty od viacerých Winemakeroch
- Zákazník môže mať pri nákupe rôzne produkty z viacerých shopov v jednom košíku

## 5. Používateľské role

### 5.1 Neprihlásený používateľ (Guest)
- Prehliadanie katalógu vín, vinárov a shopov
- Filtrovanie podľa regiónu, typu vína, farby, ročníka, cenovej kategórie a otváracích hodín
- Zobrazenie detailu vína — popis, zloženie, chuťový profil, fotky, priemerné hodnotenie, shopy kde sa predáva
- Zobrazenie profilu vinárov s ich portfóliom vín
- Zobrazenie detailu shopu — produkty, otváracie hodiny
- Prezeranie recenzií
- Zobrazenie nadchádzajúcich eventov a ich detailu
- Správa košíka — pridávanie, odoberanie, zmena množstva
- Pre checkout a registráciu na eventy je potrebné prihlásenie

### 5.2 Registrovaný používateľ (Customer)
- Všetky práva neprihláseneho používateľa
- Dokončenie objednávky (checkout) — výber osobného odberu alebo doručenia na adresu
- Správa vlastných objednávok — história a aktuálny stav
- Registrácia na degustačné eventy
- Písanie recenzií produktov a vinárov (1–5 hviezd + text)
- Komentovanie eventov
- Správa vlastného profilu — meno, uložené adresy, heslo
- Podanie žiadosti o rolu Winemaker alebo Shop Owner

### 5.3 Winemaker
- Všetky práva registrovaného používateľa
- Správa profilu vinárstva — bio, región, fotky
- Pridávanie a editácia vín v katalógu (Wine — ročník, odroda, chuťový profil, fotky)
- Vytváranie a správa degustačných eventov (podliehajú schváleniu adminom)
- Dashboard vlastnej aktivity (TBD — rozsah otvorený)

### 5.4 Shop Owner
- Všetky práva registrovaného používateľa
- Správa profilu shopu — názov, adresa, fotky
- Nastavenie otváracích hodín (regular availability) a výnimiek (availability exceptions)
- Pridávanie produktov do shopu — výber vína z katalógu, nastavenie ceny a skladových zásob
- Vytváranie WineBundlov — tematické balíčky vín z katalógu so zvýhodnenou cenou
- Správa a prehľad prichádzajúcich objednávok, zmena stavov objednávok
- Dashboard shopu (TBD — rozsah otvorený)

### 5.5 Administrátor (Staff)
- Plný prístup do back-office rozhrania
- Správa používateľov — zobrazenie, deaktivácia účtov
- Schvaľovanie a zamietanie žiadostí o rolu Winemaker / Shop Owner
- Schvaľovanie a zamietanie eventov navrhnutých Winemakermi
- Moderácia recenzií a komentárov
- Správa shopov a produktov naprieč platformou
- Prístup k štatistikám a prehľadom platformy

---

## 6. Funkčné požiadavky

### 6.1 Autentifikácia a autorizácia

| ID | User story |
|---|---|
| AU-1 | Ako Guest chcem sa zaregistrovať emailom a heslom, prípadne cez inú službu (Google, ...), aby som mohol nakupovať a interagovať s platformou |
| AU-2 | Ako Guest chcem dostať potvrdzovací email po registrácii |
| AU-3 | Ako registrovaný používateľ chcem sa prihlásiť a odhlásiť |
| AU-4 | Ako registrovaný používateľ chcem zmeniť heslo |
| AU-5 | Ako Admin chcem mať prístup do back-office, do ktorého bežní používatelia nemajú prístup |
| AU-6 | Ako Customer chcem podať žiadosť o rolu Winemaker vyplnením formulára s detailmi vinárstva |
| AU-7 | Ako Customer chcem podať žiadosť o rolu Shop Owner vyplnením formulára s detailmi shopu |
| AU-8 | Ako Customer chcem byť notifikovaný emailom o schválení alebo zamietnutí mojej žiadosti |

**Systémové požiadavky:**
- Hashované heslá
- Autentifikácia; session uložená v `Sessions` tabuľke
- RBAC — každá rola má presne definované oprávnenia
- Rola Winemaker / Shop Owner sa získava žiadosťou (AU-6/AU-7); aktivuje sa až po schválení adminom
- Jeden používateľ môže mať súčasne rolu Winemaker aj Shop Owner

---

### 6.2 Katalóg a vyhľadávanie

| ID | User story |
|---|---|
| CA-1 | Ako Guest chcem prehľadávať zoznam vín a filtrovať ich podľa: regiónu, typu (červené/biele/ružové/šumivé/...), farby, ročníka a cenovej kategórie |
| CA-2 | Ako Guest chcem zobraziť detail vína s popisom, zložením, chuťovým profilom, fotografiami, priemerným hodnotením a zoznamom shopov, kde sa dané víno predáva |
| CA-3 | Ako Guest chcem prehľadávať winemakeroch a zobraziť profil vinárstva s portfóliom vín |
| CA-4 | Ako Guest chcem prehľadávať shopy a filtrovať ich podľa otváracích hodín |
| CA-5 | Ako Guest chcem zobraziť detail shopu s dostupnými produktmi a otvárateľnými hodinami |
| CA-6 | Ako Winemaker chcem pridať nové víno do katalógu s kompletným popisom a fotografiami |
| CA-7 | Ako Winemaker chcem editovať a mazať vlastné vína |

---

### 6.3 WineBundle

| ID | User story |
|---|---|
| WB-1 | Ako Shop Owner chcem vytvoriť tematický balíček viacerých vín (WineBundle) s vlastnou cenou |
| WB-2 | Ako Shop Owner chcem editovať a mazať vlastné WineBundles |
| WB-3 | Ako Guest chcem zobraziť detail WineBundlu s obsahom a cenou |

**Systémové požiadavky:**
- WineBundle je realizovaný ako produkt (Product) — objednávkový systém s ním pracuje rovnako ako s jednotlivou fľašou
- Väzba medzi produktom a vínami je riešená cez `Product_wines` tabuľku

---

### 6.4 Eventy

| ID | User story |
|---|---|
| EV-1 | Ako Guest chcem vidieť zoznam nadchádzajúcich (schválených) eventov |
| EV-2 | Ako Guest chcem zobraziť detail eventu s miestom, časom, kapacitou a komentármi |
| EV-3 | Ako Customer chcem sa zaregistrovať na event; systém kontroluje kapacitu a zabraňuje duplicitnej registrácii |
| EV-4 | Ako Customer chcem zanechať komentár pod eventom |
| EV-5 | Ako Winemaker chcem navrhnúť event s názvom, popisom, miestom, dátumom a kapacitou |
| EV-6 | Ako Winemaker chcem spravovať vlastné eventy (editácia, zrušenie) |
| EV-7 | Ako Admin chcem schváliť alebo zamietnuť navrhnutý event pred jeho zverejnením |

**Systémové požiadavky:**
- Event sa zobrazuje verejnosti len v stave `approved`
- Po naplnení kapacity nie sú ďalšie registrácie možné
- Každý prihlásený používateľ sa môže registrovať na event maximálne raz (`Event_invites`)

---

### 6.5 Košík a objednávky

| ID | User story |
|---|---|
| OR-1 | Ako Guest chcem pridať produkt do košíka bez nutnosti prihlásenia |
| OR-2 | Ako Guest chcem zmeniť množstvo alebo odobrať produkt z košíka |
| OR-3 | Ako Guest/Customer chcem vidieť aktuálnu cenu košíka v reálnom čase |
| OR-4 | Ako Customer chcem dokončiť objednávku (checkout) s výberom: osobný odber alebo doručenie na adresu |
| OR-5 | Ako Customer chcem zvoliť adresu doručenia (nová alebo uložená z profilu) |
| OR-6 | Ako Customer chcem dostať emailové potvrdenie po vytvorení objednávky |
| OR-7 | Ako Customer chcem sledovať stav svojich objednávok |
| OR-8 | Ako Shop Owner chcem prezerať a spravovať prichádzajúce objednávky a meniť ich stav |

**Stavy objednávky:**
```
pending → confirmed → ready_for_pickup → completed
```

**Systémové požiadavky:**
- Jeden košík môže obsahovať produkty z viacerých shopov
- Pri checkoutovi sa cena produktov zmrazí (`price_at_purchase` na `Order_items`)
- Adresa objednávky sa zmrazí vytvorením novej kópie záznamu v `Addresses`
- Platba je simulovaná — po potvrdení prechádza objednávka do stavu `confirmed` bez reálnej transakcie
- Každý `Order_item` eviduje referenčný `shop_id` pre logiku osobného odberu

---

### 6.6 Recenzie a hodnotenia

| ID | User story |
|---|---|
| RE-1 | Ako Customer chcem ohodnotiť produkt (1–5 hviezd) s textovým komentárom |
| RE-2 | Ako Customer chcem ohodnotiť winemakers (1–5 hviezd) s textovým komentárom |
| RE-3 | Ako Guest chcem vidieť priemerné hodnotenie a recenzie na stránke produktu a winemakers |
| RE-4 | Ako Admin chcem skryť alebo odstrániť nevhodné recenzie a komentáre |

**Systémové požiadavky:**
- Každý používateľ môže napísať jednu recenziu na daný produkt a jednu na daného winemakers
- Priemerné hodnotenie sa vypočítava zo všetkých aktívnych recenzií

---

### 6.7 Back-office (Admin)

| ID | User story |
|---|---|
| BO-1 | Ako Admin chcem zobraziť zoznam všetkých používateľov a vedieť deaktivovať účet |
| BO-2 | Ako Admin chcem schvaľovať alebo zamietnuť eventy |
| BO-3 | Ako Admin chcem moderovať recenzie a komentáre (skryť/odstrániť) |
| BO-4 | Ako Admin chcem spravovať shopy a produkty naprieč platformou |
| BO-5 | Ako Admin chcem mať prístup k základným štatistikám (počet používateľov, objednávok, eventov) |
| BO-6 | Ako Admin chcem zobraziť zoznam čakajúcich žiadostí o rolu a schváliť alebo zamietnuť každú z nich |

---

## 7. Nefunkčné požiadavky

| Požiadavka | Popis |
|---|---|
| **Témy** | Aplikácia podporuje svetlý a tmavý motív naprieč celým UI |
| **Responzivita** | Mobile-first prístup — všetky stránky sú plne použiteľné na mobilných zariadeniach |
| **Testovanie** | E2E testy (Playwright) a unit testy pre kritickú logiku |
| **Bezpečnosť** | Hashované heslá; API chránené autorizáciou; vstupy validované na FE aj BE |
| **Komponentová knižnica** | UI postavené na ShadCN/UI/... s konzistentným dizajn systémom |
| **CI/CD** | GitLab pipeline spúšťa ESLint, Prettier a testy pri každom Merge Requeste |
| **API dokumentácia** | OpenAPI špecifikácia generovaná z Elysia, zobrazená cez Scalar |

---

## 8. Použité technológie

| Technológia | Oblasť |
|---|---|
| React 19 + TypeScript | Frontend |
| Tailwind CSS + ShadCN/UI | UI / dizajn systém |
| TanStack Router | Frontend routing |
| TanStack Query | Server state management |
| Zod | Validácia schém (FE + BE) |
| Kubb | Generovanie API klienta z OpenAPI špecifikácie |
| Vite | Build tool |
| Elysia | Backend framework (Bun runtime) |
| Bun | JavaScript runtime |
| PostgreSQL | Relačná databáza |
| Drizzle ORM | ORM |
| OpenAPI / Scalar | API dokumentácia |
| Jira | Manažment projektu |
| GitLab CI | CI/CD pipeline |



