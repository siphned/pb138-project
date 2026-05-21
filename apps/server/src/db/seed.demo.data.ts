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
    city: "Praha",
    email: "admin@winery.demo",
    fname: "Adam",
    lname: "Správce",
  },
  boutique: {
    city: "Brno",
    email: "boutique@winery.demo",
    fname: "Pavel",
    lname: "Obchodník",
  },
  jana: {
    city: "Praha",
    email: "jana@winery.demo",
    fname: "Jana",
    lname: "Zákazníková",
  },
  pavlov: {
    city: "Brno",
    email: "pavlov@winery.demo",
    fname: "Jakub",
    lname: "Vinař",
  },
  petr: {
    city: "Brno",
    email: "petr@winery.demo",
    fname: "Petr",
    lname: "Procházka",
  },
} as const;

// ── Supporting customers (fake Clerk IDs — provide data volume) ────────────────
export const SUPPORTING_CUSTOMERS: { fname: string; lname: string; email: string; city: string }[] =
  [
    { city: "Praha", email: "marie.novakova@demo.cz", fname: "Marie", lname: "Nováková" },
    { city: "Brno", email: "tomas.kovar@demo.cz", fname: "Tomáš", lname: "Kovář" },
    { city: "Ostrava", email: "eva.prochazkova@demo.cz", fname: "Eva", lname: "Procházková" },
    { city: "Plzeň", email: "lukas.novak@demo.cz", fname: "Lukáš", lname: "Novák" },
    { city: "Olomouc", email: "tereza.horakova@demo.cz", fname: "Tereza", lname: "Horáková" },
    { city: "Liberec", email: "martin.dvorak@demo.cz", fname: "Martin", lname: "Dvořák" },
    { city: "Praha", email: "katerina.markova@demo.cz", fname: "Kateřina", lname: "Marková" },
    { city: "Brno", email: "ondrej.blazek@demo.cz", fname: "Ondřej", lname: "Blažek" },
    {
      city: "České Budějovice",
      email: "petra.souckova@demo.cz",
      fname: "Petra",
      lname: "Součková",
    },
    {
      city: "Hradec Králové",
      email: "jiri.kratochvil@demo.cz",
      fname: "Jiří",
      lname: "Kratochvíl",
    },
    { city: "Olomouc", email: "monika.vesela@demo.cz", fname: "Monika", lname: "Veselá" },
    { city: "Zlín", email: "radek.pospisil@demo.cz", fname: "Radek", lname: "Pospíšil" },
    { city: "Praha", email: "simona.urbanova@demo.cz", fname: "Simona", lname: "Urbanová" },
    { city: "Brno", email: "michal.simanek@demo.cz", fname: "Michal", lname: "Šimánek" },
    { city: "Ostrava", email: "lenka.kopecka@demo.cz", fname: "Lenka", lname: "Kopecká" },
  ];

// ── Winemakers ────────────────────────────────────────────────────────────────
export const WINEMAKERS: WinemakerData[] = [
  {
    city: "Brno - Hlavní nádraží",
    description:
      "Nachází se strategicky mezi třetím nástupištěm a zastávkou nočních rozjezdů. Toto urbanistické vinařství se zaměřuje na absolutní cenovou dostupnost. Naše ročníky přirozeně fermentují pod moravským sluncem v autentických recyklovaných PET lahvích. Cílíme výhradně na studenty přesně tři dny před výplatou a na otrlé veterány ulice.",
    email: "info@chateau-lavicka.cz",
    events: [
      {
        capacity: 35,
        daysOffset: 21,
        description:
          "Vysoce neformální, neautorizované setkání přímo u nechvalně známých černých hodin na Náměstí Svobody. Očekávejte syrovou, autentickou pouliční atmosféru, kde budeme ochutnávat ty nejlepší PET lahvové ročníky přímo od zdroje. Přineste si vlastní plastové kelímky a teplou bundu.",
        durationHours: 3,
        imageUrl: "/uploads/event/event_placeholder.webp",
        isPast: false,
        name: "Půlnoční degustace pod Orlojem",
        visibility: "public",
      },
    ],
    imageUrl: "/uploads/winemaker/la_lavicka.webp",
    key: "lavicka",
    name: "Château de la Lavička",
    ownerKey: null,
    phone: "+420 777 528 425",
    websiteUrl: "https://chateau-lavicka.cz",
    wines: [
      {
        alcoholContent: "11.50",
        attribution: "Street Estate",
        basePrice: 9,
        color: "white",
        composition: "100% Mystery Grape",
        description:
          "Zářivě neonově modrý ročník, který silně voní po umělém borůvkovém aroma a čistém přežití. Závěrečná agresivní kyselinka vyčistí nejen patro, ale i drobné skvrny od rzi. Nejlépe chutná přímo z plastové lahve při nočním sprintu na tramvaj číslo 1.",
        imageUrl: "/uploads/wine/modry_blesk.webp",
        name: "Modrý Blesk 2024",
        quantity: 850,
        region: "Brněnská Nádražní Oblast",
        type: "still",
        vintageYear: 2024,
        volumeMl: 1500,
      },
      {
        alcoholContent: "9.50",
        attribution: "Street Reserve",
        basePrice: 12,
        color: "red",
        composition: "100% Unknown",
        description:
          "Naše prémiová nabídka s revoluční technologií plastového šroubovacího uzávěru, která vám ušetří peníze za vývrtku. Očekávejte těžké třísloviny, které připomínají žvýkání asfaltu na D1, s překvapivě sirupovým závěrem. Skvěle se páruje se suchým rohlíkem.",
        imageUrl: "/uploads/wine/hradni_svice.webp",
        name: "Hradní Svíce Black Label",
        quantity: 650,
        region: "Brněnská Nádražní Oblast",
        type: "still",
        vintageYear: 2023,
        volumeMl: 1500,
      },
      {
        alcoholContent: "13.00",
        attribution: "Urban Legend",
        basePrice: 14,
        color: "orange",
        composition: "100% Urban Legend",
        description:
          "Místní legenda praví, že tohle víno dokáže uspat i bájného krokodýla visícího na Staré radnici. Chutná neidentifikovatelně, ale spolehlivě a silně hřeje v žaludku. K dostání exkluzivně zpod pultu.",
        imageUrl: "/uploads/wine/drak.webp",
        name: "Brněnský Drak (Falešný Krokodýl)",
        quantity: 420,
        region: "Brněnská Nádražní Oblast",
        type: "still",
        vintageYear: 2023,
        volumeMl: 1500,
      },
    ],
  },
  {
    city: "Brno - Titanium Nové Sady",
    description:
      "Maison de l'Ego bylo založeno výhradně proto, aby si technologičtí miliardáři a startupisté měli co odepsat z daní. Neprodáváme víno, prodáváme nalahvovanou nadřazenost a tekutou aroganci. Pokud se musíte dívat na cenovku, je vám právně zakázáno s našimi produkty jakkoliv interagovat.",
    email: "prestige@maisondego.cz",
    events: [],
    imageUrl: "/uploads/winemaker/maison_de.webp",
    key: "ego",
    name: "Maison de l'Ego",
    ownerKey: null,
    phone: "+420 900 346 000",
    websiteUrl: "https://maisondego.cz",
    wines: [
      {
        alcoholContent: "15.00",
        attribution: "Grand Cru de l'Ego",
        basePrice: 45000,
        color: "red",
        composition: "100% Ego",
        description:
          "Víno tak exkluzivní, že vás reálně soudí, když ho naléváte do sklenice. Ve vůni dominují bílé lanýže, kaviár a zřetelný náznak offshorových účtů. Vypití této lahve okamžitě zvyšuje váš kreditní skóre a prohlubuje vaše pohrdání pracující třídou.",
        imageUrl: "/uploads/wine/arrogance.webp",
        name: "Liquid Arrogance",
        quantity: 12,
        region: "Tax Haven",
        type: "still",
        vintageYear: 2024,
        volumeMl: 750,
      },
      {
        alcoholContent: "13.50",
        attribution: "Grand Cru de l'Ego",
        basePrice: 125000,
        color: "white",
        composition: "100% Exploitation",
        description:
          "Sklizeno během historické stávky dělníků na vinici. Toto víno zachycuje přesný okamžik, kdy byly jejich požadavky zamítnuty. Je perfektně vyvážené, řízné a zcela zbavené jakékoliv empatie. Výjimečně dobře se páruje s nepřátelským převzetím konkurence.",
        imageUrl: "/uploads/wine/tears_of_peasant.webp",
        name: "Tears of the Peasant 1984",
        quantity: 6,
        region: "Tax Haven",
        type: "still",
        vintageYear: 1984,
        volumeMl: 750,
      },
      {
        alcoholContent: "14.50",
        attribution: "Single Vineyard",
        basePrice: 8500,
        color: "red",
        composition: "100% Arrogance",
        description:
          "Navrženo pro lidi, kteří píší kód rovnou do produkce a nikdy nepoužívají komentáře. Má tak silné tělo, že k sobě nepotřebuje zbytek týmu. V dochuti jasně ucítíte nefalšované pohrdání juniorními programátory.",
        imageUrl: "/uploads/wine/10xdeveloper.webp",
        name: "10x Developer Cuvée",
        quantity: 20,
        region: "Tax Haven",
        type: "still",
        vintageYear: 2024,
        volumeMl: 750,
      },
    ],
  },
  {
    city: "Brno - Pisárky",
    description:
      "Zrozeno z čirého zoufalství během zkouškového období. Naše sudy jsou ukryté pod palandami a pečlivě zrají vedle ústředního topení pro dosažení toho správného kolejního tepelného profilu. Je to jediné víno, které vám zaručeně pomůže zapomenout na to, že jste právě nevyletěli z algoritmů, ale úplně ze školy.",
    email: "info@kolejni-vino.cz",
    events: [
      {
        capacity: 40,
        daysOffset: -45,
        description:
          "Extrémně chaotická degustace konaná ve sdílené kuchyňce na kolejích Vinařská. Atmosféra byla hustá vlhkostí z vařených těstovin a unikátním aroma vín zrajících na radiátoru. Účastníci úspěšně zkonzumovali veškeré zásoby ještě předtím, než to přišel správce kolejí rozpustit.",
        durationHours: 3,
        imageUrl: "/uploads/event/event_placeholder.webp",
        isPast: true,
        name: "Kolaudačka na Vinařské 2025",
        visibility: "public",
      },
    ],
    imageUrl: "/uploads/winemaker/winery_placeholder.webp",
    key: "vinarska",
    name: "Koleje Vinařská Cellars",
    ownerKey: "pavlov",
    phone: "+420 603 565 353",
    websiteUrl: "https://kolejni-vino.cz",
    wines: [
      {
        alcoholContent: "15.00",
        attribution: "Radiator Selection",
        basePrice: 22,
        color: "white",
        composition: "100% Dormitory Grapes",
        description:
          "Zrálo přesně tři týdny za vařícím radiátorem na sdíleném pokoji na Vinařské. Tento urychlený termální proces stárnutí dodává vínu unikátní, lehce připálený chuťový profil. Důrazně doporučujeme nechat víno prodýchat, aby mohly uniknout výpary z rozpouštědel.",
        imageUrl: "/uploads/wine/ranni_rozjezd.webp",
        name: "Radiator Reserve 2023",
        quantity: 280,
        region: "Pisárecká Kolejní Oblast",
        type: "still",
        vintageYear: 2023,
        volumeMl: 750,
      },
      {
        alcoholContent: "10.00",
        attribution: "Corridor Reserve",
        basePrice: 18,
        color: "white",
        composition: "Hope + Despair",
        description:
          "Vytvořeno specificky pro studenty čelící blížícím se deadlinům. Vůně je komplexní směsí starého kafe, studeného potu a instantních nudlí. Poskytuje okamžitý pocit apatie, čímž skvěle doplňuje blížící se akademickou zkázu.",
        imageUrl: "/uploads/wine/skuskove.webp",
        name: "Slzy Zkouškového Cuvée",
        quantity: 320,
        region: "Pisárecká Kolejní Oblast",
        type: "still",
        vintageYear: 2024,
        volumeMl: 1500,
      },
      {
        alcoholContent: "11.00",
        attribution: "Bathroom Blend",
        basePrice: 15,
        color: "rosé",
        composition: "Dormitory Blend",
        description:
          "Svou barvu získalo náhodným kontaktem s odloženým sprchovým gelem. Je překvapivě osvěžující, ale zanechává silný pocit, že byste si měli okamžitě umýt ruce. Klasika pátečních večerů na áčkách.",
        imageUrl: "/uploads/wine/wine_placeholder.webp",
        name: "Sdílená Koupelna Rosé",
        quantity: 210,
        region: "Pisárecká Kolejní Oblast",
        type: "still",
        vintageYear: 2024,
        volumeMl: 1500,
      },
    ],
  },
  {
    city: "Brno - CEITEC Bohunice",
    description:
      "Původně spuštěno jako blockchainový smart kontrakt. Produkce fyzického vína byla jen nehoda, kterou jsme se rozhodli agresivně monetizovat. Každá láhev vyžaduje k otevření sken sítnice a slouží jako proof of stake v naší DAO. Chuť je druhořadá, hlavní je investiční hodnota a exkluzivní přístup na náš firemní Discord.",
    email: "dao@kryptonvineyards.io",
    events: [
      {
        capacity: 60,
        daysOffset: 56,
        description:
          "Koná se v nejvyšším patře kancelářského centra Spielberk s panoramatickým výhledem na město, které technicky vzato vlastníte. Tento networkingový event se zaměřuje na Web3 investice a nalévají se vína, která stojí více než byt 2+kk v Králově Poli. Smart casual a hardwarová krypto peněženka jsou povinné.",
        durationHours: 4,
        imageUrl: "/uploads/event/event_placeholder.webp",
        isPast: false,
        name: "Spielberk Tower Crypto-Gala",
        visibility: "private",
      },
    ],
    imageUrl: "/uploads/winemaker/winery_placeholder.webp",
    key: "cayman",
    name: "Krypton & Cayman Vineyards",
    ownerKey: null,
    phone: "+420 900 278 966",
    websiteUrl: "https://kryptonvineyards.dao",
    wines: [
      {
        alcoholContent: "14.50",
        attribution: "Blockchain Certified",
        basePrice: 2800,
        color: "red",
        composition: "100% Liquidated Assets",
        description:
          "Vydáno speciálně k oslavě raketového růstu platformy pro analýzu akcií. Chutná jako evropské akciové trhy v zelených číslech a neomezený budget. Původně oceněno na dva bitcoiny, jeho cena divoce kolísá podle algoritmů na sociálních sítích.",
        imageUrl: "/uploads/wine/bull_run.webp",
        name: "Parseq Bull Run 2025",
        quantity: 77,
        region: "Blockchain Offshore Estate",
        type: "still",
        vintageYear: 2025,
        volumeMl: 750,
      },
      {
        alcoholContent: "13.00",
        attribution: "Compliance Certified",
        basePrice: 950,
        color: "red",
        composition: "100% Bureaucracy",
        description:
          "Pečlivě inženýrsky navrženo tak, aby obešlo veškeré byrokratické překážky 28. evropského režimu a zůstalo legálně klasifikováno jako luxusní komodita. Je extrémně suché, vysoce komplexní a k jeho plnému pochopení potřebujete daňového poradce.",
        imageUrl: "/uploads/wine/regime.webp",
        name: "The 28th Regime Reserve",
        quantity: 50,
        region: "Blockchain Offshore Estate",
        type: "still",
        vintageYear: 2024,
        volumeMl: 750,
      },
      {
        alcoholContent: "13.50",
        attribution: "Single Vineyard",
        basePrice: 1500,
        color: "white",
        composition: "100% Silicon",
        description:
          "Víno reagující na globální nedostatek čipů. Extrémně vysoká přidaná hodnota, produkce limitována výhradně kapacitou litografických strojů. Vůně čistého křemíku, monopolního postavení a zelených čísel na burze.",
        imageUrl: "/uploads/wine/semiconductor.webp",
        name: "Semiconductor Blanc",
        quantity: 33,
        region: "Blockchain Offshore Estate",
        type: "still",
        vintageYear: 2024,
        volumeMl: 750,
      },
    ],
  },
  {
    city: "Brno - Botanická",
    description:
      "Udržováno skupinou vývojářů, kteří neviděli denní světlo od roku 2024. Proces fermentace je plně automatizován pomocí zrezivělého Raspberry Pi a mizerně napsaného Python skriptu. Výsledný produkt má vysoký obsah kofeinu a zřetelné podtóny teplovodivé pasty.",
    email: "root@fimuni.winery",
    events: [
      {
        capacity: 50,
        daysOffset: -60,
        description:
          "Pořádáno v suterénních labech na Botanické během vrcholu zkouškového období. Vystresovaní studenti informatiky párovali naše vysokokofeinová Server Room vína se studenou pizzou, zatímco se snažili opravit rozbité backend integrace. Noc čisté, nefalšované akademické paniky.",
        durationHours: 4,
        imageUrl: "/uploads/event/event_placeholder.webp",
        isPast: true,
        name: "FI MUNI Debug & Drink",
        visibility: "public",
      },
    ],
    imageUrl: "/uploads/winemaker/fi_muni_basement.webp",
    key: "fimuni",
    name: "FI MUNI Basement Brewery",
    ownerKey: null,
    phone: "+420 549 494 212",
    websiteUrl: "https://fimuni.winery",
    wines: [
      {
        alcoholContent: "14.00",
        attribution: "Debug Release",
        basePrice: 35,
        color: "red",
        composition: "100% Panic",
        description:
          "Těžké červené víno, které vzniklo chybou v Docker kontejneru během nasazování do produkce. Uzavřeno speciální zátkou z 3D tiskárny, která možná pouští trochu toxických látek, ale skvěle těsní. Chutná po probdělé noci a padajících databázích.",
        imageUrl: "/uploads/wine/postgress.webp",
        name: "Postgres Rollback 2024",
        quantity: 190,
        region: "Botanická Serverová Oblast",
        type: "still",
        vintageYear: 2024,
        volumeMl: 750,
      },
      {
        alcoholContent: "16.00",
        attribution: "Production Hotfix",
        basePrice: 55,
        color: "red",
        composition: "100% Conflict",
        description:
          "Extrémně těžké a agresivní víno. Vzniklo, když dva vývojáři omylem přepsali produkční databázi a museli pít, aby zapomněli. Chutná po zmaru a spálené kávě. Konzumujte pouze na vlastní nebezpečí, neexistuje žádný návrat zpět.",
        imageUrl: "/uploads/wine/git_push.webp",
        name: "Git Push --Force 2026",
        quantity: 42,
        region: "Botanická Serverová Oblast",
        type: "still",
        vintageYear: 2026,
        volumeMl: 750,
      },
      {
        alcoholContent: "12.00",
        attribution: "Experimental Build",
        basePrice: 28,
        color: "orange",
        composition: "3D Printer Runoff",
        description:
          "Experimentální ročník zrající ve vyřazených vaničkách z SLA tiskáren. Obsahuje stopové prvky fotocitlivé pryskyřice, díky kterým na slunci jemně tuhne na patře. Ideální pro makers a DIY inženýry, kteří ocení technickou pachuť.",
        imageUrl: "/uploads/wine/resin.webp",
        name: "Resin Vat Reserve",
        quantity: 88,
        region: "Botanická Serverová Oblast",
        type: "still",
        vintageYear: 2024,
        volumeMl: 375,
      },
    ],
  },
  {
    city: "Brno - Spielberk Tower",
    description:
      "Postaveno na staletích generačního bohatství a vysoce pochybných tržních monopolech. Naše réva je zalévána výhradně vodou z tajících ledovců a slzami našich zlikvidovaných konkurentů. Pití tohoto vína statisticky zvyšuje šanci, že si koupíte jachtu a spácháte sofistikovanou hospodářskou kriminalitu.",
    email: "butler@baronvon.estate",
    events: [
      {
        capacity: 30,
        daysOffset: 35,
        description:
          "Striktně VIP událost pouze pro zvané, kde se funkcionalistická architektura setkává s neregulovaným kapitalismem. Účastníci budou usrkávat diamantové cuvée během diskuzí o agresivních firemních převzetích a daňových kličkách. Ochranka bude u vstupu vymáhat přísný dress code a minimální čisté jmění.",
        durationHours: 3,
        imageUrl: "/uploads/event/event_placeholder.webp",
        isPast: false,
        name: "Villa Tugendhat Elite Auction 2026",
        visibility: "private",
      },
    ],
    imageUrl: "/uploads/winemaker/winery_placeholder.webp",
    key: "oligarch",
    name: "Baron von Oligarch Estates",
    ownerKey: null,
    phone: "+420 900 000 000",
    websiteUrl: "https://baronvon.oligarch.estate",
    wines: [
      {
        alcoholContent: "12.50",
        attribution: "Ultra Premium",
        basePrice: 75000,
        color: "white",
        composition: "100% Wealth",
        description:
          "Fermentováno s reálným, nekonfliktním diamantovým prachem, aby každý doušek jemně provedl peeling vašeho trávicího traktu. Bublá s lehkostí čerstvě vytištěných peněz. Toto víno nepolykáte, vy do něj interně investujete.",
        imageUrl: "/uploads/wine/diamond.webp",
        name: "Diamond Infusion Cuvée",
        quantity: 8,
        region: "Exclusive Monopoly",
        type: "sparkling",
        vintageYear: 2024,
        volumeMl: 750,
      },
      {
        alcoholContent: "15.50",
        attribution: "Ultra Premium",
        basePrice: 38000,
        color: "red",
        composition: "100% Majority Stake",
        description:
          "Temné a brutální víno, které nejprve pohltí všechny chutě ve vašich ústech a následně zlikviduje váš bankovní účet. Pije se výhradně ve chvíli, kdy v rámci optimalizace kupujete firmu svého nejlepšího kamaráda.",
        imageUrl: "/uploads/wine/wine_placeholder.webp",
        name: "Hostile Takeover 2026",
        quantity: 15,
        region: "Exclusive Monopoly",
        type: "still",
        vintageYear: 2026,
        volumeMl: 750,
      },
    ],
  },
];

// ── Shops ─────────────────────────────────────────────────────────────────────
export const SHOPS: ShopData[] = [
  {
    bundles: [
      {
        description: "Kompletní výbava pro přežití brněnské noci. Tři PET lahve, žádné otázky.",
        name: "Noční Záchranná Sada",
        price: 29,
        wineNames: [
          "Modrý Blesk 2024",
          "Hradní Svíce Black Label",
          "Brněnský Drak (Falešný Krokodýl)",
        ],
      },
      {
        description: "Dvě lahve na přežití zkouškového. Doporučeno akademickým senátem.",
        name: "Kolejní Survival Kit",
        price: 38,
        wineNames: ["Radiator Reserve 2023", "Slzy Zkouškového Cuvée"],
      },
    ],
    city: "Brno - Centrum",
    description:
      "Strategicky umístěná přímo v srdci Brna pod vysokýma nohama. Tato prodejna je majákem naděje o třetí ráno. Drží skladem celou naši streetovou kolekci hned vedle energeťáků a oschlého pečiva. Je to premiérová destinace pro panické nákupy před odjezdem na noční kolejní afterparty.",
    email: "info@vecerkajost.cz",
    imageUrl: "/uploads/shop/vecerka_u_joska.webp",
    key: "vecerka_jost",
    name: "Večerka u Jošta",
    ownerKey: "boutique",
    sourceWinemakerKeys: ["lavicka", "vinarska"],
  },
  {
    bundles: [
      {
        description: "Tři lahve pro daňové odpisy a boardroom dominanci.",
        name: "Corporate Write-Off Collection",
        price: 128500,
        wineNames: ["Liquid Arrogance", "10x Developer Cuvée", "Diamond Infusion Cuvée"],
      },
    ],
    city: "Brno - Nové Sady",
    description:
      "Ukryto za mléčným sklem v jedné z nejdražších brněnských kancelářských budov. Sem nemůžete jen tak vejít; potřebujete platinovou firemní kartu a sjednanou schůzku. Naskladňují výhradně vína investičního stupně, která se pravděpodobně nikdy neotevřou.",
    email: "executive@titaniumlounge.biz",
    imageUrl: "/uploads/shop/shop_placeholder.webp",
    key: "titanium_lounge",
    name: "Titanium Executive Lounge",
    ownerKey: null,
    sourceWinemakerKeys: ["ego", "oligarch"],
  },
  {
    bundles: [
      {
        description: "Pro ty, kteří zároveň pushuji na produkci i pijí z PET lahve.",
        name: "Developer & Degen Bundle",
        price: 42,
        wineNames: ["Modrý Blesk 2024", "Postgres Rollback 2024"],
      },
    ],
    city: "Brno - Hlavní nádraží",
    description:
      "Tento podnik nabízí nepřekonatelnou, drsnou atmosféru, která perfektně doplňuje naše PET lahvové ročníky. Podlaha je permanentně lepkavá a klientela sahá od ztracených turistů až po tvrdé lokální štamgasty. Skutečná kulturní památka jihomoravské metropole.",
    email: "hospoda@brnenska-nadrazka.cz",
    imageUrl: "/uploads/shop/shop_placeholder.webp",
    key: "brnenska_nadrazka",
    name: "Brněnská Nádražka",
    ownerKey: null,
    sourceWinemakerKeys: ["lavicka", "fimuni"],
  },
  {
    bundles: [],
    city: "Brno - Bohunice",
    description:
      "Nachází se v kampusu v Bohunicích. Tento obchod zachází s vínem jako s vysoce těkavou chemickou sloučeninou. Nákupy se řeší výhradně přes blockchain a láhve jsou uloženy v tlakových vitrínách plněných argonem. Je to maloobchod s vínem zcela zbavený radosti a lidského tepla.",
    email: "nanocellar@ceitec.biz",
    imageUrl: "/uploads/shop/shop_placeholder.webp",
    key: "ceitec_nano",
    name: "CEITEC Nano-Cellar",
    ownerKey: null,
    sourceWinemakerKeys: ["cayman", "oligarch"],
  },
  {
    bundles: [
      {
        description: "Kombinace kolejního a serverového. Slouží jako náhrada za spánek.",
        name: "Zkouškový Emergency Pack",
        price: 68,
        wineNames: ["Slzy Zkouškového Cuvée", "Git Push --Force 2026"],
      },
    ],
    city: "Brno - Botanická",
    description:
      "Zářivkami osvětlená oáza přežití v suterénu fakulty informatiky. Voní slabě po starém kafi a tiskařském toneru. Nabízí ta nejlepší nízkonákladová vína s vysokým obsahem kofeinu, která vám pomohou pushnout ten poslední commit před ranním deadlinem.",
    email: "bufet@fimuni.cz",
    imageUrl: "/uploads/shop/shop_placeholder.webp",
    key: "fimuni_bufet",
    name: "FI MUNI Suterénní Bufet",
    ownerKey: null,
    sourceWinemakerKeys: ["fimuni", "vinarska"],
  },
];

// ── Curated story interactions ────────────────────────────────────────────────
export const STORY = {
  // Jana: Praha customer, buys from Večerka u Jošta, active reviewer
  jana: {
    eventRegistrations: ["vinarska-0", "lavicka-0"],
    orders: [
      {
        items: [
          { quantity: 3, winemakerId: "lavicka", wineName: "Modrý Blesk 2024" },
          { quantity: 1, winemakerId: "lavicka", wineName: "Hradní Svíce Black Label" },
        ],
        shopKey: "vecerka_jost",
        status: "delivered" as const,
      },
      {
        items: [{ quantity: 2, winemakerId: "vinarska", wineName: "Slzy Zkouškového Cuvée" }],
        shopKey: "vecerka_jost",
        status: "confirmed" as const,
      },
    ],
    productReviews: [
      {
        body: "Přišla jsem sem úplně náhodou při nočním útěku z fitka a byl to osud. Ten neonový vzhled mě zaujal, ta chuť mě naprosto zničila v tom nejlepším slova smyslu. Vypila jsem celou dvoulitrovou lahev za pochodu k tramvaji a nikdy jsem se necítila tak svobodně. Absolutní klasika, kupuji pravidelně každý čtvrtek.",
        rating: 5,
        shopKey: "vecerka_jost",
        winemakerId: "lavicka",
        wineName: "Modrý Blesk 2024",
      },
      {
        body: "Koupila jsem to jako žert pro kamarádku k narozeninám, ale nakonec jsme ho celý vypily samy a byl to nejlepší večer roku. Ano, chuť je trochu jako žvýkat asfalt na D1, ale to dává charakter! Etiketa je navíc naprosto geniální. Pro autentický brněnský zážitek není nad toto.",
        rating: 5,
        shopKey: "vecerka_jost",
        winemakerId: "lavicka",
        wineName: "Hradní Svíce Black Label",
      },
      {
        body: "Pomohlo mi přežít moje bakalářky, i když za cenu lehké amnézie na celý víkend. Pít bych to normálně nedoporučovala, ale v době krize je to prostě zázrak. Kdyby nebylo té mírné pachuti po instantních nudlích, dala bych plných pět hvězd.",
        rating: 4,
        shopKey: "vecerka_jost",
        winemakerId: "vinarska",
        wineName: "Slzy Zkouškového Cuvée",
      },
    ],
    winemakerReviews: [
      {
        body: "Château de la Lavička je zjevení. Konečně vinařství pro nás normální lidi, kteří si nemohou dovolit utrácet tři stovky za jednu lahev. Pán za třetím nástupištěm je skutečný vizionář a ten neonový Modrý Blesk je jeho mistrovské dílo. Brno potřebuje více takových průkopníků.",
        rating: 5,
        winemakerId: "lavicka",
      },
    ],
  },

  // Petr: Brno customer, one order, measured developer tone
  petr: {
    eventRegistrations: ["fimuni-0", "cayman-0"],
    orders: [
      {
        items: [
          { quantity: 2, winemakerId: "fimuni", wineName: "Postgres Rollback 2024" },
          { quantity: 2, winemakerId: "lavicka", wineName: "Modrý Blesk 2024" },
        ],
        shopKey: "brnenska_nadrazka",
        status: "delivered" as const,
      },
    ],
    productReviews: [
      {
        body: "Jako backend developer to musím ocenit na metaúrovni. Ten název, ta chuť databázové paniky, ten resin uzávěr, který mírně pouští toxické látky. Čtyři hvězdy, protože pátá patří řešení, které tento produkt nevyžaduje. Zkonzumoval jsem dvě lahve během posledního deploye na produkci.",
        rating: 4,
        shopKey: "brnenska_nadrazka",
        winemakerId: "fimuni",
        wineName: "Postgres Rollback 2024",
      },
    ],
    winemakerReviews: [
      {
        body: "Odvážný projekt, špatně zdokumentovaný, nefungující testy, ale výsledek překvapivě použitelný. Typická FI MUNI metodologie. Oceňuji automatizaci fermentace přes Raspberry Pi, i když ten Python skript je opravdu mizerně napsaný. Čtyři hvězdy s tím, že doufám v refaktoring v další verzi.",
        rating: 4,
        winemakerId: "fimuni",
      },
    ],
  },
};

// ── Review content for supporting customers ────────────────────────────────────
export const REVIEW_BODIES = {
  critical: [
    "Přinesl jsem to na luxusní večeři a všichni se mnou přestali mluvit.",
    "Absolutně odporné. Vylil jsem to do dřezu a ten dřez mě poprosil o sklenici vody.",
  ],
  neutral: [
    "Je to ok. Chutná to přesně jako můj nenaplněný potenciál a blížící se krize středního věku.",
    "Vypil jsem to. Neoslepl jsem. Považuji to za úspěšný nákup.",
    "Předražené, přehypované a upřímně trochu nuda. Ale opil jsem se, takže tři hvězdy.",
    "Popis sliboval tóny pouličního přežití, ale mně to chutnalo prostě jen jako špinavé drobné.",
  ],
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
