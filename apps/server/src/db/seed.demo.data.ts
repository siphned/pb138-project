// ─────────────────────────────────────────────────────────────────────────────
// Demo seed data file
// DO NOT put logic here. Keys are symbolic — the seed script resolves them to IDs.
// ─────────────────────────────────────────────────────────────────────────────

export type WineData = {
  name: string;
  color: "red" | "white" | "rosé" | "orange" | "gray" | "tawny" | "yellow";
  type: "still" | "sparkling" | "fortified" | "dessert";
  region: string;
  vintageYear: number;
  alcoholContent: string; // e.g. "13.50"
  volumeMl: 375 | 750 | 1500;
  quantity: number;
  attribution: string;
  composition: string;
  description: string;
  basePrice: number;
  imageUrl?: string;
};

export type EventData = {
  name: string;
  description: string;
  isPast: boolean;
  daysOffset: number;
  durationHours: number;
  capacity: number;
  visibility: "public" | "private";
  imageUrl?: string;
};

export type WinemakerData = {
  key: string;
  ownerKey: "pavlov" | null;
  email: string;
  name: string;
  description: string;
  phone: string;
  websiteUrl: string;
  city: string;
  imageUrl?: string;
  wines: WineData[];
  events: EventData[];
};

export type BundleData = {
  name: string;
  description: string;
  wineNames: string[];
  price: number;
};

export type ShopData = {
  key: string;
  ownerKey: "boutique" | null;
  email: string;
  name: string;
  description: string;
  city: string;
  imageUrl?: string;
  sourceWinemakerKeys: string[];
  bundles: BundleData[];
};

// ── Featured users (5 real Clerk accounts — set IDs in .env.local) ────────────
// Required env vars: DEMO_ADMIN_CLERK_ID, DEMO_WINEMAKER_CLERK_ID,
// DEMO_SHOP_OWNER_CLERK_ID, DEMO_CUSTOMER1_CLERK_ID, DEMO_CUSTOMER2_CLERK_ID
export const FEATURED_USERS = {
  admin: {
    email: "admin@winery.demo",
    fname: "Adam",
    lname: "Správce",
    city: "Praha",
  },
  pavlov: {
    email: "pavlov@winery.demo",
    fname: "Jakub",
    lname: "Vinař",
    city: "Brno",
  },
  boutique: {
    email: "boutique@winery.demo",
    fname: "Pavel",
    lname: "Obchodník",
    city: "Brno",
  },
  jana: {
    email: "jana@winery.demo",
    fname: "Jana",
    lname: "Zákazníková",
    city: "Praha",
  },
  petr: {
    email: "petr@winery.demo",
    fname: "Petr",
    lname: "Procházka",
    city: "Brno",
  },
} as const;

// ── Supporting customers (fake Clerk IDs — provide data volume) ────────────────
export const SUPPORTING_CUSTOMERS: { fname: string; lname: string; email: string; city: string }[] =
  [
    { fname: "Marie", lname: "Nováková", email: "marie.novakova@demo.cz", city: "Praha" },
    { fname: "Tomáš", lname: "Kovář", email: "tomas.kovar@demo.cz", city: "Brno" },
    { fname: "Eva", lname: "Procházková", email: "eva.prochazkova@demo.cz", city: "Ostrava" },
    { fname: "Lukáš", lname: "Novák", email: "lukas.novak@demo.cz", city: "Plzeň" },
    { fname: "Tereza", lname: "Horáková", email: "tereza.horakova@demo.cz", city: "Olomouc" },
    { fname: "Martin", lname: "Dvořák", email: "martin.dvorak@demo.cz", city: "Liberec" },
    { fname: "Kateřina", lname: "Marková", email: "katerina.markova@demo.cz", city: "Praha" },
    { fname: "Ondřej", lname: "Blažek", email: "ondrej.blazek@demo.cz", city: "Brno" },
    {
      fname: "Petra",
      lname: "Součková",
      email: "petra.souckova@demo.cz",
      city: "České Budějovice",
    },
    {
      fname: "Jiří",
      lname: "Kratochvíl",
      email: "jiri.kratochvil@demo.cz",
      city: "Hradec Králové",
    },
    { fname: "Monika", lname: "Veselá", email: "monika.vesela@demo.cz", city: "Olomouc" },
    { fname: "Radek", lname: "Pospíšil", email: "radek.pospisil@demo.cz", city: "Zlín" },
    { fname: "Simona", lname: "Urbanová", email: "simona.urbanova@demo.cz", city: "Praha" },
    { fname: "Michal", lname: "Šimánek", email: "michal.simanek@demo.cz", city: "Brno" },
    { fname: "Lenka", lname: "Kopecká", email: "lenka.kopecka@demo.cz", city: "Ostrava" },
  ];

// ── Winemakers ────────────────────────────────────────────────────────────────
export const WINEMAKERS: WinemakerData[] = [
  {
    key: "lavicka",
    ownerKey: null,
    email: "info@chateau-lavicka.cz",
    name: "Château de la Lavička",
    description:
      "Nachází se strategicky mezi třetím nástupištěm a zastávkou nočních rozjezdů. Toto urbanistické vinařství se zaměřuje na absolutní cenovou dostupnost. Naše ročníky přirozeně fermentují pod moravským sluncem v autentických recyklovaných PET lahvích. Cílíme výhradně na studenty přesně tři dny před výplatou a na otrlé veterány ulice.",
    phone: "+420 777 528 425",
    websiteUrl: "https://chateau-lavicka.cz",
    city: "Brno - Hlavní nádraží",
    imageUrl: "/uploads/winemaker/la_lavicka.webp",
    wines: [
      {
        name: "Modrý Blesk 2024",
        color: "white",
        type: "still",
        region: "Brněnská Nádražní Oblast",
        vintageYear: 2024,
        alcoholContent: "11.50",
        volumeMl: 1500,
        quantity: 850,
        attribution: "Street Estate",
        composition: "100% Mystery Grape",
        description:
          "Zářivě neonově modrý ročník, který silně voní po umělém borůvkovém aroma a čistém přežití. Závěrečná agresivní kyselinka vyčistí nejen patro, ale i drobné skvrny od rzi. Nejlépe chutná přímo z plastové lahve při nočním sprintu na tramvaj číslo 1.",
        basePrice: 9,
        imageUrl: "/uploads/wine/modry_blesk.webp",
      },
      {
        name: "Hradní Svíce Black Label",
        color: "red",
        type: "still",
        region: "Brněnská Nádražní Oblast",
        vintageYear: 2023,
        alcoholContent: "9.50",
        volumeMl: 1500,
        quantity: 650,
        attribution: "Street Reserve",
        composition: "100% Unknown",
        description:
          "Naše prémiová nabídka s revoluční technologií plastového šroubovacího uzávěru, která vám ušetří peníze za vývrtku. Očekávejte těžké třísloviny, které připomínají žvýkání asfaltu na D1, s překvapivě sirupovým závěrem. Skvěle se páruje se suchým rohlíkem.",
        basePrice: 12,
        imageUrl: "/uploads/wine/hradni_svice.webp",
      },
      {
        name: "Brněnský Drak (Falešný Krokodýl)",
        color: "orange",
        type: "still",
        region: "Brněnská Nádražní Oblast",
        vintageYear: 2023,
        alcoholContent: "13.00",
        volumeMl: 1500,
        quantity: 420,
        attribution: "Urban Legend",
        composition: "100% Urban Legend",
        description:
          "Místní legenda praví, že tohle víno dokáže uspat i bájného krokodýla visícího na Staré radnici. Chutná neidentifikovatelně, ale spolehlivě a silně hřeje v žaludku. K dostání exkluzivně zpod pultu.",
        basePrice: 14,
        imageUrl: "/uploads/wine/drak.webp",
      },
    ],
    events: [
      {
        name: "Půlnoční degustace pod Orlojem",
        description:
          "Vysoce neformální, neautorizované setkání přímo u nechvalně známých černých hodin na Náměstí Svobody. Očekávejte syrovou, autentickou pouliční atmosféru, kde budeme ochutnávat ty nejlepší PET lahvové ročníky přímo od zdroje. Přineste si vlastní plastové kelímky a teplou bundu.",
        isPast: false,
        daysOffset: 21,
        durationHours: 3,
        capacity: 35,
        visibility: "public",
        imageUrl: "/uploads/event/event_placeholder.webp",
      },
    ],
  },
  {
    key: "ego",
    ownerKey: null,
    email: "prestige@maisondego.cz",
    name: "Maison de l'Ego",
    description:
      "Maison de l'Ego bylo založeno výhradně proto, aby si technologičtí miliardáři a startupisté měli co odepsat z daní. Neprodáváme víno, prodáváme nalahvovanou nadřazenost a tekutou aroganci. Pokud se musíte dívat na cenovku, je vám právně zakázáno s našimi produkty jakkoliv interagovat.",
    phone: "+420 900 346 000",
    websiteUrl: "https://maisondego.cz",
    city: "Brno - Titanium Nové Sady",
    imageUrl: "/uploads/winemaker/maison_de.webp",
    wines: [
      {
        name: "Liquid Arrogance",
        color: "red",
        type: "still",
        region: "Tax Haven",
        vintageYear: 2024,
        alcoholContent: "15.00",
        volumeMl: 750,
        quantity: 12,
        attribution: "Grand Cru de l'Ego",
        composition: "100% Ego",
        description:
          "Víno tak exkluzivní, že vás reálně soudí, když ho naléváte do sklenice. Ve vůni dominují bílé lanýže, kaviár a zřetelný náznak offshorových účtů. Vypití této lahve okamžitě zvyšuje váš kreditní skóre a prohlubuje vaše pohrdání pracující třídou.",
        basePrice: 45000,
        imageUrl: "/uploads/wine/arrogance.webp",
      },
      {
        name: "Tears of the Peasant 1984",
        color: "white",
        type: "still",
        region: "Tax Haven",
        vintageYear: 1984,
        alcoholContent: "13.50",
        volumeMl: 750,
        quantity: 6,
        attribution: "Grand Cru de l'Ego",
        composition: "100% Exploitation",
        description:
          "Sklizeno během historické stávky dělníků na vinici. Toto víno zachycuje přesný okamžik, kdy byly jejich požadavky zamítnuty. Je perfektně vyvážené, řízné a zcela zbavené jakékoliv empatie. Výjimečně dobře se páruje s nepřátelským převzetím konkurence.",
        basePrice: 125000,
        imageUrl: "/uploads/wine/tears_of_peasant.webp",
      },
      {
        name: "10x Developer Cuvée",
        color: "red",
        type: "still",
        region: "Tax Haven",
        vintageYear: 2024,
        alcoholContent: "14.50",
        volumeMl: 750,
        quantity: 20,
        attribution: "Single Vineyard",
        composition: "100% Arrogance",
        description:
          "Navrženo pro lidi, kteří píší kód rovnou do produkce a nikdy nepoužívají komentáře. Má tak silné tělo, že k sobě nepotřebuje zbytek týmu. V dochuti jasně ucítíte nefalšované pohrdání juniorními programátory.",
        basePrice: 8500,
        imageUrl: "/uploads/wine/10xdeveloper.webp",
      },
    ],
    events: [],
  },
  {
    key: "vinarska",
    ownerKey: "pavlov",
    email: "info@kolejni-vino.cz",
    name: "Koleje Vinařská Cellars",
    description:
      "Zrozeno z čirého zoufalství během zkouškového období. Naše sudy jsou ukryté pod palandami a pečlivě zrají vedle ústředního topení pro dosažení toho správného kolejního tepelného profilu. Je to jediné víno, které vám zaručeně pomůže zapomenout na to, že jste právě nevyletěli z algoritmů, ale úplně ze školy.",
    phone: "+420 603 565 353",
    websiteUrl: "https://kolejni-vino.cz",
    city: "Brno - Pisárky",
    imageUrl: "/uploads/winemaker/winery_placeholder.webp",
    wines: [
      {
        name: "Radiator Reserve 2023",
        color: "white",
        type: "still",
        region: "Pisárecká Kolejní Oblast",
        vintageYear: 2023,
        alcoholContent: "15.00",
        volumeMl: 750,
        quantity: 280,
        attribution: "Radiator Selection",
        composition: "100% Dormitory Grapes",
        description:
          "Zrálo přesně tři týdny za vařícím radiátorem na sdíleném pokoji na Vinařské. Tento urychlený termální proces stárnutí dodává vínu unikátní, lehce připálený chuťový profil. Důrazně doporučujeme nechat víno prodýchat, aby mohly uniknout výpary z rozpouštědel.",
        basePrice: 22,
        imageUrl: "/uploads/wine/ranni_rozjezd.webp",
      },
      {
        name: "Slzy Zkouškového Cuvée",
        color: "white",
        type: "still",
        region: "Pisárecká Kolejní Oblast",
        vintageYear: 2024,
        alcoholContent: "10.00",
        volumeMl: 1500,
        quantity: 320,
        attribution: "Corridor Reserve",
        composition: "Hope + Despair",
        description:
          "Vytvořeno specificky pro studenty čelící blížícím se deadlinům. Vůně je komplexní směsí starého kafe, studeného potu a instantních nudlí. Poskytuje okamžitý pocit apatie, čímž skvěle doplňuje blížící se akademickou zkázu.",
        basePrice: 18,
        imageUrl: "/uploads/wine/skuskove.webp",
      },
      {
        name: "Sdílená Koupelna Rosé",
        color: "rosé",
        type: "still",
        region: "Pisárecká Kolejní Oblast",
        vintageYear: 2024,
        alcoholContent: "11.00",
        volumeMl: 1500,
        quantity: 210,
        attribution: "Bathroom Blend",
        composition: "Dormitory Blend",
        description:
          "Svou barvu získalo náhodným kontaktem s odloženým sprchovým gelem. Je překvapivě osvěžující, ale zanechává silný pocit, že byste si měli okamžitě umýt ruce. Klasika pátečních večerů na áčkách.",
        basePrice: 15,
        imageUrl: "/uploads/wine/wine_placeholder.webp",
      },
    ],
    events: [
      {
        name: "Kolaudačka na Vinařské 2025",
        description:
          "Extrémně chaotická degustace konaná ve sdílené kuchyňce na kolejích Vinařská. Atmosféra byla hustá vlhkostí z vařených těstovin a unikátním aroma vín zrajících na radiátoru. Účastníci úspěšně zkonzumovali veškeré zásoby ještě předtím, než to přišel správce kolejí rozpustit.",
        isPast: true,
        daysOffset: -45,
        durationHours: 3,
        capacity: 40,
        visibility: "public",
        imageUrl: "/uploads/event/event_placeholder.webp",
      },
    ],
  },
  {
    key: "cayman",
    ownerKey: null,
    email: "dao@kryptonvineyards.io",
    name: "Krypton & Cayman Vineyards",
    description:
      "Původně spuštěno jako blockchainový smart kontrakt. Produkce fyzického vína byla jen nehoda, kterou jsme se rozhodli agresivně monetizovat. Každá láhev vyžaduje k otevření sken sítnice a slouží jako proof of stake v naší DAO. Chuť je druhořadá, hlavní je investiční hodnota a exkluzivní přístup na náš firemní Discord.",
    phone: "+420 900 278 966",
    websiteUrl: "https://kryptonvineyards.dao",
    city: "Brno - CEITEC Bohunice",
    imageUrl: "/uploads/winemaker/winery_placeholder.webp",
    wines: [
      {
        name: "Parseq Bull Run 2025",
        color: "red",
        type: "still",
        region: "Blockchain Offshore Estate",
        vintageYear: 2025,
        alcoholContent: "14.50",
        volumeMl: 750,
        quantity: 77,
        attribution: "Blockchain Certified",
        composition: "100% Liquidated Assets",
        description:
          "Vydáno speciálně k oslavě raketového růstu platformy pro analýzu akcií. Chutná jako evropské akciové trhy v zelených číslech a neomezený budget. Původně oceněno na dva bitcoiny, jeho cena divoce kolísá podle algoritmů na sociálních sítích.",
        basePrice: 2800,
        imageUrl: "/uploads/wine/bull_run.webp",
      },
      {
        name: "The 28th Regime Reserve",
        color: "red",
        type: "still",
        region: "Blockchain Offshore Estate",
        vintageYear: 2024,
        alcoholContent: "13.00",
        volumeMl: 750,
        quantity: 50,
        attribution: "Compliance Certified",
        composition: "100% Bureaucracy",
        description:
          "Pečlivě inženýrsky navrženo tak, aby obešlo veškeré byrokratické překážky 28. evropského režimu a zůstalo legálně klasifikováno jako luxusní komodita. Je extrémně suché, vysoce komplexní a k jeho plnému pochopení potřebujete daňového poradce.",
        basePrice: 950,
        imageUrl: "/uploads/wine/regime.webp",
      },
      {
        name: "Semiconductor Blanc",
        color: "white",
        type: "still",
        region: "Blockchain Offshore Estate",
        vintageYear: 2024,
        alcoholContent: "13.50",
        volumeMl: 750,
        quantity: 33,
        attribution: "Single Vineyard",
        composition: "100% Silicon",
        description:
          "Víno reagující na globální nedostatek čipů. Extrémně vysoká přidaná hodnota, produkce limitována výhradně kapacitou litografických strojů. Vůně čistého křemíku, monopolního postavení a zelených čísel na burze.",
        basePrice: 1500,
        imageUrl: "/uploads/wine/semiconductor.webp",
      },
    ],
    events: [
      {
        name: "Spielberk Tower Crypto-Gala",
        description:
          "Koná se v nejvyšším patře kancelářského centra Spielberk s panoramatickým výhledem na město, které technicky vzato vlastníte. Tento networkingový event se zaměřuje na Web3 investice a nalévají se vína, která stojí více než byt 2+kk v Králově Poli. Smart casual a hardwarová krypto peněženka jsou povinné.",
        isPast: false,
        daysOffset: 56,
        durationHours: 4,
        capacity: 60,
        visibility: "private",
        imageUrl: "/uploads/event/event_placeholder.webp",
      },
    ],
  },
  {
    key: "fimuni",
    ownerKey: null,
    email: "root@fimuni.winery",
    name: "FI MUNI Basement Brewery",
    description:
      "Udržováno skupinou vývojářů, kteří neviděli denní světlo od roku 2024. Proces fermentace je plně automatizován pomocí zrezivělého Raspberry Pi a mizerně napsaného Python skriptu. Výsledný produkt má vysoký obsah kofeinu a zřetelné podtóny teplovodivé pasty.",
    phone: "+420 549 494 212",
    websiteUrl: "https://fimuni.winery",
    city: "Brno - Botanická",
    imageUrl: "/uploads/winemaker/fi_muni_basement.webp",
    wines: [
      {
        name: "Postgres Rollback 2024",
        color: "red",
        type: "still",
        region: "Botanická Serverová Oblast",
        vintageYear: 2024,
        alcoholContent: "14.00",
        volumeMl: 750,
        quantity: 190,
        attribution: "Debug Release",
        composition: "100% Panic",
        description:
          "Těžké červené víno, které vzniklo chybou v Docker kontejneru během nasazování do produkce. Uzavřeno speciální zátkou z 3D tiskárny, která možná pouští trochu toxických látek, ale skvěle těsní. Chutná po probdělé noci a padajících databázích.",
        basePrice: 35,
        imageUrl: "/uploads/wine/postgress.webp",
      },
      {
        name: "Git Push --Force 2026",
        color: "red",
        type: "still",
        region: "Botanická Serverová Oblast",
        vintageYear: 2026,
        alcoholContent: "16.00",
        volumeMl: 750,
        quantity: 42,
        attribution: "Production Hotfix",
        composition: "100% Conflict",
        description:
          "Extrémně těžké a agresivní víno. Vzniklo, když dva vývojáři omylem přepsali produkční databázi a museli pít, aby zapomněli. Chutná po zmaru a spálené kávě. Konzumujte pouze na vlastní nebezpečí, neexistuje žádný návrat zpět.",
        basePrice: 55,
        imageUrl: "/uploads/wine/git_push.webp",
      },
      {
        name: "Resin Vat Reserve",
        color: "orange",
        type: "still",
        region: "Botanická Serverová Oblast",
        vintageYear: 2024,
        alcoholContent: "12.00",
        volumeMl: 375,
        quantity: 88,
        attribution: "Experimental Build",
        composition: "3D Printer Runoff",
        description:
          "Experimentální ročník zrající ve vyřazených vaničkách z SLA tiskáren. Obsahuje stopové prvky fotocitlivé pryskyřice, díky kterým na slunci jemně tuhne na patře. Ideální pro makers a DIY inženýry, kteří ocení technickou pachuť.",
        basePrice: 28,
        imageUrl: "/uploads/wine/resin.webp",
      },
    ],
    events: [
      {
        name: "FI MUNI Debug & Drink",
        description:
          "Pořádáno v suterénních labech na Botanické během vrcholu zkouškového období. Vystresovaní studenti informatiky párovali naše vysokokofeinová Server Room vína se studenou pizzou, zatímco se snažili opravit rozbité backend integrace. Noc čisté, nefalšované akademické paniky.",
        isPast: true,
        daysOffset: -60,
        durationHours: 4,
        capacity: 50,
        visibility: "public",
        imageUrl: "/uploads/event/event_placeholder.webp",
      },
    ],
  },
  {
    key: "oligarch",
    ownerKey: null,
    email: "butler@baronvon.estate",
    name: "Baron von Oligarch Estates",
    description:
      "Postaveno na staletích generačního bohatství a vysoce pochybných tržních monopolech. Naše réva je zalévána výhradně vodou z tajících ledovců a slzami našich zlikvidovaných konkurentů. Pití tohoto vína statisticky zvyšuje šanci, že si koupíte jachtu a spácháte sofistikovanou hospodářskou kriminalitu.",
    phone: "+420 900 000 000",
    websiteUrl: "https://baronvon.oligarch.estate",
    city: "Brno - Spielberk Tower",
    imageUrl: "/uploads/winemaker/winery_placeholder.webp",
    wines: [
      {
        name: "Diamond Infusion Cuvée",
        color: "white",
        type: "sparkling",
        region: "Exclusive Monopoly",
        vintageYear: 2024,
        alcoholContent: "12.50",
        volumeMl: 750,
        quantity: 8,
        attribution: "Ultra Premium",
        composition: "100% Wealth",
        description:
          "Fermentováno s reálným, nekonfliktním diamantovým prachem, aby každý doušek jemně provedl peeling vašeho trávicího traktu. Bublá s lehkostí čerstvě vytištěných peněz. Toto víno nepolykáte, vy do něj interně investujete.",
        basePrice: 75000,
        imageUrl: "/uploads/wine/diamond.webp",
      },
      {
        name: "Hostile Takeover 2026",
        color: "red",
        type: "still",
        region: "Exclusive Monopoly",
        vintageYear: 2026,
        alcoholContent: "15.50",
        volumeMl: 750,
        quantity: 15,
        attribution: "Ultra Premium",
        composition: "100% Majority Stake",
        description:
          "Temné a brutální víno, které nejprve pohltí všechny chutě ve vašich ústech a následně zlikviduje váš bankovní účet. Pije se výhradně ve chvíli, kdy v rámci optimalizace kupujete firmu svého nejlepšího kamaráda.",
        basePrice: 38000,
        imageUrl: "/uploads/wine/wine_placeholder.webp",
      },
    ],
    events: [
      {
        name: "Villa Tugendhat Elite Auction 2026",
        description:
          "Striktně VIP událost pouze pro zvané, kde se funkcionalistická architektura setkává s neregulovaným kapitalismem. Účastníci budou usrkávat diamantové cuvée během diskuzí o agresivních firemních převzetích a daňových kličkách. Ochranka bude u vstupu vymáhat přísný dress code a minimální čisté jmění.",
        isPast: false,
        daysOffset: 35,
        durationHours: 3,
        capacity: 30,
        visibility: "private",
        imageUrl: "/uploads/event/event_placeholder.webp",
      },
    ],
  },
];

// ── Shops ─────────────────────────────────────────────────────────────────────
export const SHOPS: ShopData[] = [
  {
    key: "vecerka_jost",
    ownerKey: "boutique",
    email: "info@vecerkajost.cz",
    name: "Večerka u Jošta",
    description:
      "Strategicky umístěná přímo v srdci Brna pod vysokýma nohama. Tato prodejna je majákem naděje o třetí ráno. Drží skladem celou naši streetovou kolekci hned vedle energeťáků a oschlého pečiva. Je to premiérová destinace pro panické nákupy před odjezdem na noční kolejní afterparty.",
    city: "Brno - Centrum",
    imageUrl: "/uploads/shop/vecerka_u_joska.webp",
    sourceWinemakerKeys: ["lavicka", "vinarska"],
    bundles: [
      {
        name: "Noční Záchranná Sada",
        description: "Kompletní výbava pro přežití brněnské noci. Tři PET lahve, žádné otázky.",
        wineNames: [
          "Modrý Blesk 2024",
          "Hradní Svíce Black Label",
          "Brněnský Drak (Falešný Krokodýl)",
        ],
        price: 29,
      },
      {
        name: "Kolejní Survival Kit",
        description: "Dvě lahve na přežití zkouškového. Doporučeno akademickým senátem.",
        wineNames: ["Radiator Reserve 2023", "Slzy Zkouškového Cuvée"],
        price: 38,
      },
    ],
  },
  {
    key: "titanium_lounge",
    ownerKey: null,
    email: "executive@titaniumlounge.biz",
    name: "Titanium Executive Lounge",
    description:
      "Ukryto za mléčným sklem v jedné z nejdražších brněnských kancelářských budov. Sem nemůžete jen tak vejít; potřebujete platinovou firemní kartu a sjednanou schůzku. Naskladňují výhradně vína investičního stupně, která se pravděpodobně nikdy neotevřou.",
    city: "Brno - Nové Sady",
    imageUrl: "/uploads/shop/shop_placeholder.webp",
    sourceWinemakerKeys: ["ego", "oligarch"],
    bundles: [
      {
        name: "Corporate Write-Off Collection",
        description: "Tři lahve pro daňové odpisy a boardroom dominanci.",
        wineNames: ["Liquid Arrogance", "10x Developer Cuvée", "Diamond Infusion Cuvée"],
        price: 128500,
      },
    ],
  },
  {
    key: "brnenska_nadrazka",
    ownerKey: null,
    email: "hospoda@brnenska-nadrazka.cz",
    name: "Brněnská Nádražka",
    description:
      "Tento podnik nabízí nepřekonatelnou, drsnou atmosféru, která perfektně doplňuje naše PET lahvové ročníky. Podlaha je permanentně lepkavá a klientela sahá od ztracených turistů až po tvrdé lokální štamgasty. Skutečná kulturní památka jihomoravské metropole.",
    city: "Brno - Hlavní nádraží",
    imageUrl: "/uploads/shop/shop_placeholder.webp",
    sourceWinemakerKeys: ["lavicka", "fimuni"],
    bundles: [
      {
        name: "Developer & Degen Bundle",
        description: "Pro ty, kteří zároveň pushuji na produkci i pijí z PET lahve.",
        wineNames: ["Modrý Blesk 2024", "Postgres Rollback 2024"],
        price: 42,
      },
    ],
  },
  {
    key: "ceitec_nano",
    ownerKey: null,
    email: "nanocellar@ceitec.biz",
    name: "CEITEC Nano-Cellar",
    description:
      "Nachází se v kampusu v Bohunicích. Tento obchod zachází s vínem jako s vysoce těkavou chemickou sloučeninou. Nákupy se řeší výhradně přes blockchain a láhve jsou uloženy v tlakových vitrínách plněných argonem. Je to maloobchod s vínem zcela zbavený radosti a lidského tepla.",
    city: "Brno - Bohunice",
    imageUrl: "/uploads/shop/shop_placeholder.webp",
    sourceWinemakerKeys: ["cayman", "oligarch"],
    bundles: [],
  },
  {
    key: "fimuni_bufet",
    ownerKey: null,
    email: "bufet@fimuni.cz",
    name: "FI MUNI Suterénní Bufet",
    description:
      "Zářivkami osvětlená oáza přežití v suterénu fakulty informatiky. Voní slabě po starém kafi a tiskařském toneru. Nabízí ta nejlepší nízkonákladová vína s vysokým obsahem kofeinu, která vám pomohou pushnout ten poslední commit před ranním deadlinem.",
    city: "Brno - Botanická",
    imageUrl: "/uploads/shop/shop_placeholder.webp",
    sourceWinemakerKeys: ["fimuni", "vinarska"],
    bundles: [
      {
        name: "Zkouškový Emergency Pack",
        description: "Kombinace kolejního a serverového. Slouží jako náhrada za spánek.",
        wineNames: ["Slzy Zkouškového Cuvée", "Git Push --Force 2026"],
        price: 68,
      },
    ],
  },
];

// ── Curated story interactions ────────────────────────────────────────────────
export const STORY = {
  // Jana: Praha customer, buys from Večerka u Jošta, active reviewer
  jana: {
    orders: [
      {
        shopKey: "vecerka_jost",
        status: "delivered" as const,
        items: [
          { wineName: "Modrý Blesk 2024", winemakerId: "lavicka", quantity: 3 },
          { wineName: "Hradní Svíce Black Label", winemakerId: "lavicka", quantity: 1 },
        ],
      },
      {
        shopKey: "vecerka_jost",
        status: "confirmed" as const,
        items: [{ wineName: "Slzy Zkouškového Cuvée", winemakerId: "vinarska", quantity: 2 }],
      },
    ],
    productReviews: [
      {
        wineName: "Modrý Blesk 2024",
        winemakerId: "lavicka",
        shopKey: "vecerka_jost",
        rating: 5,
        body: "Přišla jsem sem úplně náhodou při nočním útěku z fitka a byl to osud. Ten neonový vzhled mě zaujal, ta chuť mě naprosto zničila v tom nejlepším slova smyslu. Vypila jsem celou dvoulitrovou lahev za pochodu k tramvaji a nikdy jsem se necítila tak svobodně. Absolutní klasika, kupuji pravidelně každý čtvrtek.",
      },
      {
        wineName: "Hradní Svíce Black Label",
        winemakerId: "lavicka",
        shopKey: "vecerka_jost",
        rating: 5,
        body: "Koupila jsem to jako žert pro kamarádku k narozeninám, ale nakonec jsme ho celý vypily samy a byl to nejlepší večer roku. Ano, chuť je trochu jako žvýkat asfalt na D1, ale to dává charakter! Etiketa je navíc naprosto geniální. Pro autentický brněnský zážitek není nad toto.",
      },
      {
        wineName: "Slzy Zkouškového Cuvée",
        winemakerId: "vinarska",
        shopKey: "vecerka_jost",
        rating: 4,
        body: "Pomohlo mi přežít moje bakalářky, i když za cenu lehké amnézie na celý víkend. Pít bych to normálně nedoporučovala, ale v době krize je to prostě zázrak. Kdyby nebylo té mírné pachuti po instantních nudlích, dala bych plných pět hvězd.",
      },
    ],
    winemakerReviews: [
      {
        winemakerId: "lavicka",
        rating: 5,
        body: "Château de la Lavička je zjevení. Konečně vinařství pro nás normální lidi, kteří si nemohou dovolit utrácet tři stovky za jednu lahev. Pán za třetím nástupištěm je skutečný vizionář a ten neonový Modrý Blesk je jeho mistrovské dílo. Brno potřebuje více takových průkopníků.",
      },
    ],
    eventRegistrations: ["vinarska-0", "lavicka-0"],
  },

  // Petr: Brno customer, one order, measured developer tone
  petr: {
    orders: [
      {
        shopKey: "brnenska_nadrazka",
        status: "delivered" as const,
        items: [
          { wineName: "Postgres Rollback 2024", winemakerId: "fimuni", quantity: 2 },
          { wineName: "Modrý Blesk 2024", winemakerId: "lavicka", quantity: 2 },
        ],
      },
    ],
    productReviews: [
      {
        wineName: "Postgres Rollback 2024",
        winemakerId: "fimuni",
        shopKey: "brnenska_nadrazka",
        rating: 4,
        body: "Jako backend developer to musím ocenit na metaúrovni. Ten název, ta chuť databázové paniky, ten resin uzávěr, který mírně pouští toxické látky. Čtyři hvězdy, protože pátá patří řešení, které tento produkt nevyžaduje. Zkonzumoval jsem dvě lahve během posledního deploye na produkci.",
      },
    ],
    winemakerReviews: [
      {
        winemakerId: "fimuni",
        rating: 4,
        body: "Odvážný projekt, špatně zdokumentovaný, nefungující testy, ale výsledek překvapivě použitelný. Typická FI MUNI metodologie. Oceňuji automatizaci fermentace přes Raspberry Pi, i když ten Python skript je opravdu mizerně napsaný. Čtyři hvězdy s tím, že doufám v refaktoring v další verzi.",
      },
    ],
    eventRegistrations: ["fimuni-0", "cayman-0"],
  },
};

// ── Review content for supporting customers ────────────────────────────────────
export const REVIEW_BODIES = {
  positive: [
    "Absolutní mistrovské dílo moderních daňových úniků. Chuťový profil je komplexní, ale ta pravá radost přichází až s kapitálovými výnosy.",
    "Za 35 korun jsem nečekal zázraky, ale tohle mi spolehlivě vymazalo paměť na celý víkend. Neskutečný poměr cena/výkon.",
    "Perfektní balanc, elegantní závěr a lahev vypadá fantasticky na mém Instagram story. Všichni v našem co-workingovém spaceu závidí.",
    "Ta plastová flaška byla trochu zdeformovaná, asi od tepla z radiátoru, ale obsah byl vysoce efektivní.",
    "Překvapivě pitelné! Skvěle to doplnilo studený kebab ve 4 ráno na České.",
    "Oceňuji tu čistou drzost účtovat si tolik peněz za zkvašený hroznový džus. Odvážný byznysový tah.",
    "Upřímně, to nejlepší co potkalo Brno od dob nových linek rozjezdů. Nemůžu to přestat pít.",
    "Ten plastový uzávěr se okamžitě strhl, ale šroubovák to spravil. Solidní, robustní volba na páteční večery.",
  ],
  neutral: [
    "Je to ok. Chutná to přesně jako můj nenaplněný potenciál a blížící se krize středního věku.",
    "Vypil jsem to. Neoslepl jsem. Považuji to za úspěšný nákup.",
    "Předražené, přehypované a upřímně trochu nuda. Ale opil jsem se, takže tři hvězdy.",
    "Popis sliboval tóny pouličního přežití, ale mně to chutnalo prostě jen jako špinavé drobné.",
  ],
  critical: [
    "Přinesl jsem to na luxusní večeři a všichni se mnou přestali mluvit.",
    "Absolutně odporné. Vylil jsem to do dřezu a ten dřez mě poprosil o sklenici vody.",
  ],
};

export const EVENT_COMMENT_BODIES = [
  "Nemůžu se dočkat! Nevíte někdo, jestli tam bude veganská varianta pro ty okoralé okraje od pizzy?",
  "Je poblíž místa konání hlídané parkoviště pro Maybach, nebo mám říct řidiči, ať prostě krouží kolem bloku?",
  "@Kamil vole musíme jít, slyšel jsem, že o půlnoci narážejí čerstvý plastový sud.",
  "Bude se během degustace probírat i ten nový evropský 28. režim, nebo je to čistě networkingová akce?",
  "Když jsem se toho účastnil minule, vzbudil jsem se v jiném časovém pásmu. Jdu do toho znova!",
  "Rychlý dotaz na organizátory: je dress code striktně oblek a kravata, nebo projde i nechutně drahý rolák?",
  "Jdu na streetovou degustaci poprvé! Je zvykem si přinést vlastní skládací židličku, nebo se prostě sedí na obrubníku?",
  "Opravdu hrůzný zážitek. Miloval jsem každou vteřinu. Vidíme se příští měsíc.",
];
