// ─────────────────────────────────────────────────────────────────────────────
// Demo seed data file
// Keys are symbolic — the seed script resolves them to IDs.
// ─────────────────────────────────────────────────────────────────────────────

export type ReviewData = {
  rating: number;
  body: string;
};

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
  demoReviews?: ReviewData[];
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
  demoComments?: string[];
};

export type WinemakerData = {
  key: string;
  ownerKey: "pavlov" | "test_user" | null;
  email: string;
  name: string;
  description: string;
  phone: string;
  websiteUrl: string;
  city: string;
  imageUrl?: string;
  wines: WineData[];
  events: EventData[];
  demoReviews?: ReviewData[];
};

export type BundleData = {
  name: string;
  description: string;
  wineNames: string[];
  price: number;
};

export type ShopData = {
  key: string;
  ownerKey: "boutique" | "test_user" | null;
  email: string;
  name: string;
  description: string;
  city: string;
  imageUrl?: string;
  sourceWinemakerKeys: string[];
  bundles: BundleData[];
};

// ── Featured users ───────────────────────────────────────────────────────────
export const FEATURED_USERS = {
  test_user: {
    email: "willy@winery.demo",
    fname: "Willy",
    lname: "the Kid",
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
    ownerKey: "test_user",
    email: "info@chateau-lavicka.cz",
    name: "Château de la Lavička",
    description:
      "Nachází se strategicky mezi třetím nástupištěm a zastávkou nočních rozjezdů. Toto urbanistické vinařství se zaměřuje na absolutní cenovou dostupnost. Naše ročníky přirozeně fermentují pod moravským sluncem v autentických recyklovaných PET lahvích. Cílíme výhradně na studenty přesně tři dny před výplatou a na otrlé veterány ulice.",
    phone: "+420 777 528 425",
    websiteUrl: "https://chateau-lavicka.cz",
    city: "Brno - Hlavní nádraží",
    imageUrl: "/uploads/winemaker/la_lavicka.webp",
    demoReviews: [
      {
        rating: 5,
        body: "Château de la Lavička je zjevení. Konečně vinařství pro nás normální lidi, kteří si nemohou dovolit utrácet tři stovky za jednu lahev.",
      },
      {
        rating: 5,
        body: "Pán za třetím nástupištěm je skutečný vizionář. Brno potřebuje více takových průkopníků.",
      },
      { rating: 5, body: "Pan majitel mi dovolil přespat v sudu. Velmi lidský přístup." },
    ],
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
        demoReviews: [
          {
            rating: 5,
            body: "Ten neonový vzhled mě zaujal, ta chuť mě naprosto zničila v tom nejlepším slova smyslu. Vypila jsem celou dvoulitrovou lahev za pochodu k tramvaji a nikdy jsem se necítila tak svobodně.",
          },
          { rating: 5, body: "Ta modrá barva mi krásně ladí s modřinami z rozjezdu. 10/10." },
          { rating: 4, body: "Chutná to jako dětství, když jsme olizovali baterie." },
          {
            rating: 5,
            body: "Překvapivě pitelné! Skvěle to doplnilo studený kebab ve 4 ráno na České.",
          },
        ],
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
        demoReviews: [
          {
            rating: 5,
            body: "Ano, chuť je trochu jako žvýkat asfalt na D1, ale to dává charakter! Pro autentický brněnský zážitek není nad toto.",
          },
          {
            rating: 4,
            body: "Ten plastový uzávěr se okamžitě strhl, ale šroubovák to spravil. Solidní, robustní volba na páteční večery.",
          },
          {
            rating: 5,
            body: "Ta plastová flaška byla trochu zdeformovaná, asi od tepla z radiátoru, ale obsah byl vysoce efektivní.",
          },
        ],
      },
    ],
    events: [
      {
        name: "Půlnoční degustace pod Orlojem",
        description:
          "Vysoce neformální, neautorizované setkání přímo u nechvalně známých černých hodin na Náměstí Svobody. Očekávejte syrovou, autentickou pouliční atmosféru, kde budeme ochutnávat ty nejlepší PET lahvové ročníky přímo od zdroje.",
        isPast: false,
        daysOffset: 21,
        durationHours: 3,
        capacity: 35,
        visibility: "public",
        imageUrl: "/uploads/event/event_placeholder.webp",
        demoComments: [
          "Jdu na streetovou degustaci poprvé! Je zvykem si přinést vlastní skládací židličku, nebo se prostě sedí na obrubníku?",
          "@Kamil vole musíme jít, slyšel jsem, že o půlnoci narážejí čerstvý plastový sud.",
          "Konečně akce, kde se nemusím stydět za to, že piju z plastového kelímku.",
          "Doufám, že tentokrát nebudou ty PET lahve vystavené přímému slunci déle než týden.",
        ],
      },
    ],
  },
  {
    key: "ego",
    ownerKey: null,
    email: "prestige@maisondego.cz",
    name: "Maison de l'Ego",
    description:
      "Maison de l'Ego bylo založeno výhradně proto, aby si technologičtí miliardáři a startupisté měli co odepsat z daní. Neprodáváme víno, prodáváme nalahvovanou nadřazenost a tekutou aroganci.",
    phone: "+420 900 346 000",
    websiteUrl: "https://maisondego.cz",
    city: "Brno - Titanium Nové Sady",
    imageUrl: "/uploads/winemaker/maison_de.webp",
    demoReviews: [
      {
        rating: 5,
        body: "Oceňuji tu čistou drzost účtovat si tolik peněz za zkvašený hroznový džus. Odvážný byznysový tah.",
      },
      { rating: 4, body: "Chuťový profil: 404 Not Found. Ale aspoň to má prestižní etiketu." },
    ],
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
          "Víno tak exkluzivní, že vás reálně soudí, když ho naléváte do sklenice. Ve vůni dominují bílé lanýže, kaviár a zřetelný náznak offshorových účtů.",
        basePrice: 45000,
        imageUrl: "/uploads/wine/arrogance.webp",
        demoReviews: [
          {
            rating: 5,
            body: "Absolutní mistrovské dílo moderních daňových úniků. Chuťový profil je komplexní, ale ta pravá radost přichází až s kapitálovými výnosy.",
          },
          {
            rating: 5,
            body: "Při každém doušku cítím, jak mi stoupá IQ a klesá zůstatek na účtu. Dokonalé.",
          },
          {
            rating: 4,
            body: "Čekal jsem víc zlata v dochuti, ale ta arogance je cítit už při otevírání.",
          },
        ],
      },
      {
        name: "10x Developer",
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
          "Navrženo pro lidi, kteří píší kód rovnou do produkce a nikdy nepoužívají komentáře.",
        basePrice: 8500,
        imageUrl: "/uploads/wine/10xdeveloper.webp",
        demoReviews: [
          {
            rating: 5,
            body: "Víno tak dobré, že mi po něm odpustili i ten incident s produkční databází.",
          },
          {
            rating: 4,
            body: "V dochuti jasně ucítíte nefalšované pohrdání ostatními programátory.",
          },
          {
            rating: 5,
            body: "Po třetí skleničce jsem začal vidět kód v binární soustavě. Matrix existuje.",
          },
        ],
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
      "Zrozeno z čirého zoufalství během zkouškového období. Naše sudy jsou ukryté pod palandami a pečlivě zrají vedle ústředního topení.",
    phone: "+420 603 565 353",
    websiteUrl: "https://kolejni-vino.cz",
    city: "Brno - Pisárky",
    imageUrl: "/uploads/winemaker/winery_placeholder.webp",
    demoReviews: [
      {
        rating: 5,
        body: "Tohle víno je jediný důvod, proč ještě bydlím na Vinařské a ne v Silicon Valley.",
      },
    ],
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
          "Zrálo přesně tři týdny za vařícím radiátorem na sdíleném pokoji na Vinařské. Tento urychlený termální proces stárnutí dodává vínu unikátní chuť.",
        basePrice: 22,
        imageUrl: "/uploads/wine/ranni_rozjezd.webp",
        demoReviews: [
          {
            rating: 5,
            body: "Zrálo přesně tři týdny za vařícím radiátorem. Ten dojezd je prostě božský.",
          },
          { rating: 4, body: "Oceňuji ten šroubovací uzávěr. Vývrtku jsem zastavil v zastavárně." },
        ],
      },
      {
        name: "Slzy Zkouškového",
        color: "white",
        type: "still",
        region: "Pisárecká Kolejní Oblast",
        vintageYear: 2024,
        alcoholContent: "10.00",
        volumeMl: 1500,
        quantity: 320,
        attribution: "Corridor Reserve",
        composition: "Hope + Despair",
        description: "Vytvořeno specificky pro studenty čelící blížícím se deadlinům.",
        basePrice: 18,
        imageUrl: "/uploads/wine/skuskove.webp",
        demoReviews: [
          {
            rating: 5,
            body: "Pomohlo mi přežít moje bakalářky, i když za cenu lehké amnézie na celý víkend.",
          },
          {
            rating: 5,
            body: "Konečně víno, které mi rozumí. Je smutné, levné a dostupné v suterénu.",
          },
          {
            rating: 5,
            body: "Koupil jsem to jako úplatek pro zkoušejícího. Nejenže jsem prošel, ale dostal jsem i jeho dceru za ženu.",
          },
        ],
      },
    ],
    events: [
      {
        name: "Kolaudačka na Vinařské 2025",
        description:
          "Extrémně chaotická degustace konaná ve sdílené kuchyňce na kolejích Vinařská. Atmosféra byla hustá vlhkostí z vařených těstovin a aromatem vín zrajících na radiátoru.",
        isPast: true,
        daysOffset: -45,
        durationHours: 3,
        capacity: 40,
        visibility: "public",
        imageUrl: "/uploads/event/event_placeholder.webp",
        demoComments: [
          "Rezervuju si místo u radiátoru! Minule mi tam bylo nejlíp.",
          "Když jsem se toho účastnil minule, vzbudil jsem se v jiném časovém pásmu.",
          "Hledám doprovod na tuhle akci. Podmínka: vlastní otvírák a odolný žaludek.",
        ],
      },
    ],
  },
  {
    key: "cayman",
    ownerKey: null,
    email: "dao@kryptonvineyards.io",
    name: "Krypton & Cayman Vineyards",
    description:
      "Původně spuštěno jako blockchainový smart kontrakt. Produkce fyzického vína byla jen nehoda.",
    phone: "+420 900 278 966",
    websiteUrl: "https://kryptonvineyards.dao",
    city: "Brno - CEITEC Bohunice",
    imageUrl: "/uploads/winemaker/winery_placeholder.webp",
    wines: [
      {
        name: "Bull Run",
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
          "Vydáno speciálně k oslavě raketového růstu akcií. Cena divoce kolísá podle algoritmů na sociálních sítích.",
        basePrice: 2800,
        imageUrl: "/uploads/wine/bull_run.webp",
        demoReviews: [
          {
            rating: 5,
            body: "Nejlepší investice od dob, co jsem koupil Bitcoin za 10 dolarů. A tohle se dá aspoň vypít.",
          },
          { rating: 4, body: "Můžu platit v dogecoinech? Ptám se pro kamaráda." },
        ],
      },
    ],
    events: [
      {
        name: "Spielberk Tower Crypto-Gala",
        description:
          "Tento networkingový event se zaměřuje na Web3 investice a nalévají se vína, která stojí více než byt 2+kk v Králově Poli.",
        isPast: false,
        daysOffset: 56,
        durationHours: 4,
        capacity: 60,
        visibility: "private",
        imageUrl: "/uploads/event/event_placeholder.webp",
        demoComments: [
          "Můžu platit v dogecoinech, nebo jedete jen v hotovosti pod pultem?",
          "Dá se tam někde bezpečně odložit ego, nebo si ho musím vzít s sebou?",
          "Můj osobní asistent mi tuhle akci doporučil jako 'vhodnou pro budování charakteru'.",
        ],
      },
    ],
  },
  {
    key: "fimuni",
    ownerKey: null,
    email: "root@fimuni.winery",
    name: "FI MUNI Basement Brewery",
    description:
      "Udržováno skupinou vývojářů, kteří neviděli denní světlo od roku 2021. Proces fermentace je plně automatizován pomocí zrezivělého Raspberry Pi.",
    phone: "+420 549 494 212",
    websiteUrl: "https://fimuni.winery",
    city: "Brno - Botanická",
    imageUrl: "/uploads/winemaker/fi_muni_basement.webp",
    demoReviews: [
      {
        rating: 4,
        body: "Typická FI MUNI metodologie. Odvážný projekt, špatně zdokumentovaný, ale výsledek překvapivě použitelný.",
      },
    ],
    wines: [
      {
        name: "Postgres Rollback 2019",
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
          "Těžké červené víno, které vzniklo chybou v Docker kontejneru během nasazování do produkce.",
        basePrice: 35,
        imageUrl: "/uploads/wine/postgress.webp",
        demoReviews: [
          {
            rating: 4,
            body: "Jako backend developer to musím ocenit na metaúrovni. Ta chuť databázové paniky je autentická.",
          },
          {
            rating: 4,
            body: "Oceňuji tu automatizaci přes Raspberry Pi, i když ten Python skript je opravdu mizerně napsaný.",
          },
        ],
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
          "Vzniklo, když dva vývojáři omylem přepsali produkční databázi a museli pít, aby zapomněli.",
        basePrice: 55,
        imageUrl: "/uploads/wine/git_push.webp",
        demoReviews: [
          {
            rating: 5,
            body: "Chutná to jako pushování do masteru bez review. Adrenalin v každém doušku.",
          },
          { rating: 5, body: "Přijdu, jen pokud slíbíte, že se nebude mluvit o JavaScriptu." },
        ],
      },
    ],
    events: [
      {
        name: "FI MUNI Debug & Drink",
        description:
          "Vystresovaní studenti informatiky párovali naše vysokokofeinová Server Room vína se studenou pizzou.",
        isPast: true,
        daysOffset: -60,
        durationHours: 4,
        capacity: 50,
        visibility: "public",
        imageUrl: "/uploads/event/event_placeholder.webp",
        demoComments: [
          "Bude se degustovat i ten ročník, co zral vedle serveru v suterénu? Slyšel jsem, že má unikátní digitální dochuť.",
          "Přijdu, jen pokud slíbíte, že se nebude mluvit o politice ani o JavaScriptu.",
          "Za 35 korun jsem nečekal zázraky, ale tohle mi spolehlivě vymazalo paměť na celý víkend.",
        ],
      },
    ],
  },
  {
    key: "oligarch",
    ownerKey: null,
    email: "butler@baronvon.estate",
    name: "Baron von Oligarch Estates",
    description:
      "Postaveno na staletích generačního bohatství a vysoce pochybných tržních monopolech.",
    phone: "+420 900 000 000",
    websiteUrl: "https://baronvon.oligarch.estate",
    city: "Brno - Spielberk Tower",
    imageUrl: "/uploads/winemaker/winery_placeholder.webp",
    demoReviews: [
      {
        rating: 5,
        body: "Pití tohoto vína statisticky zvyšuje šanci, že si koupíte jachtu a spácháte hospodářskou kriminalitu.",
      },
      {
        rating: 5,
        body: "Vůně připomíná čerstvě vytištěné peníze a spálené naděje mých konkurentů. Miluju to.",
      },
    ],
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
          "Fermentováno s reálným diamantovým prachem, aby každý doušek jemně provedl peeling vašeho trávicího traktu.",
        basePrice: 75000,
        imageUrl: "/uploads/wine/diamond.webp",
        demoReviews: [
          {
            rating: 5,
            body: "Láhev vypadá tak luxusně, že jsem ji musel pojistit dřív, než jsem ji otevřel.",
          },
          { rating: 5, body: "Toto víno nepolykáte, vy do něj interně investujete." },
          { rating: 5, body: "Bublá s lehkostí čerstvě vytištěných peněz." },
        ],
      },
    ],
    events: [
      {
        name: "Villa Tugendhat Elite Auction 2026",
        description:
          "Striktně VIP událost pouze pro zvané, kde se funkcionalistická architektura setkává s neregulovaným kapitalismem.",
        isPast: false,
        daysOffset: 35,
        durationHours: 3,
        capacity: 30,
        visibility: "private",
        imageUrl: "/uploads/event/event_placeholder.webp",
        demoComments: [
          "Je poblíž místa konání hlídané parkoviště pro Maybach, nebo mám říct řidiči, ať krouží kolem bloku?",
          "Rychlý dotaz na organizátory: je dress code striktně oblek a kravata, nebo projde i nechutně drahý rolák?",
          "Můj osobní asistent mi tuhle akci doporučil jako 'vhodnou pro budování charakteru'.",
        ],
      },
    ],
  },
];

// ── Shops ─────────────────────────────────────────────────────────────────────
export const SHOPS: ShopData[] = [
  {
    key: "vecerka_posledna_zachrana",
    ownerKey: "test_user",
    email: "zachrana@vecerka.sk",
    name: "Večerka Posledná Záchrana",
    description:
      "Posledný maják nádeje v oceáne brnianskej noci. Ponúkame exkluzívny výber vín a bagety, ktoré majú viac skúseností ako tvoj priemerný profesor na FI.",
    city: "Brno - Centrum",
    imageUrl: "/uploads/shop/vecerka_u_joska.webp",
    sourceWinemakerKeys: ["lavicka", "vinarska"],
    bundles: [
      {
        name: "Nočná Záchranná Sada",
        description: "Kompletní výbava pro přežití brněnské noci. Tři PET lahve, žádné otázky.",
        wineNames: ["Modrý Blesk 2024", "Hradní Svíce Black Label", "Brněnský Drak"],
        price: 29,
      },
    ],
  },
  {
    key: "miliardarsky_bunker",
    ownerKey: null,
    email: "bunker@miliardari.biz",
    name: "Miliardársky Bunker",
    description:
      "Miesto tak exkluzívne, že aj tvoj tieň potrebuje previerku od SIS. Naše vína sú tak drahé, že po ich kúpe ti zostane už len na suchý rohlík z vedľajšej Večerky.",
    city: "Brno - Nové Sady",
    imageUrl: "/uploads/shop/shop_placeholder.webp",
    sourceWinemakerKeys: ["ego", "oligarch"],
    bundles: [],
  },
];

// ── Curated story interactions ────────────────────────────────────────────────
export const STORY = {
  jana: {
    orders: [
      {
        shopKey: "vecerka_posledna_zachrana",
        status: "delivered" as const,
        items: [
          { wineName: "Modrý Blesk 2024", winemakerId: "lavicka", quantity: 3 },
          { wineName: "Hradní Svíce Black Label", winemakerId: "lavicka", quantity: 1 },
        ],
      },
    ],
    productReviews: [
      {
        wineName: "Modrý Blesk 2024",
        winemakerId: "lavicka",
        shopKey: "vecerka_posledna_zachrana",
        rating: 5,
        body: "Absolutní klasika, kupuji pravidelně každý čtvrtek.",
      },
    ],
    winemakerReviews: [
      {
        winemakerId: "lavicka",
        rating: 5,
        body: "Skvělý přístup a lidové ceny.",
      },
    ],
    eventRegistrations: ["vinarska-0", "lavicka-0"],
  },
  petr: {
    orders: [
      {
        shopKey: "vecerka_posledna_zachrana",
        status: "delivered" as const,
        items: [{ wineName: "Postgres Rollback 2019", winemakerId: "fimuni", quantity: 2 }],
      },
    ],
    productReviews: [
      {
        wineName: "Postgres Rollback 2019",
        winemakerId: "fimuni",
        shopKey: "vecerka_posledna_zachrana",
        rating: 4,
        body: "Zkonzumoval jsem dvě lahve během posledního deploye na produkci.",
      },
    ],
    winemakerReviews: [
      {
        winemakerId: "fimuni",
        rating: 4,
        body: "Oceňuji technologický přístup.",
      },
    ],
    eventRegistrations: ["fimuni-0", "cayman-0"],
  },
};

// ── Fallback content for faker ────────────────────────────────────────────────
export const FALLBACK_REVIEWS = [
  "Překvapivě pitelné! Skvěle to doplnilo večer.",
  "Neurazí, nenadchne, ale spolehlivě zanechá dobrou náladu.",
  "Je to ok. Chutná to přesně jako úspěšný nákup.",
  "Vypil jsem to. Neoslepl jsem. Doporučuji.",
];

export const FALLBACK_EVENT_COMMENTS = [
  "Už se na tuhle akci moc těším!",
  "Hledám doprovod, má někdo volno?",
  "Bude se nalévat hned od začátku?",
  "Doufám, že bude skvělá atmosféra jako minule.",
];
