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
    city: "Brno",
    email: "willy@winery.demo",
    fname: "Willy",
    lname: "the Kid",
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
    demoReviews: [
      {
        body: "Château de la Lavička je zjevení. Konečně vinařství pro nás normální lidi, kteří si nemohou dovolit utrácet tři stovky za jednu lahev.",
        rating: 5,
      },
      {
        body: "Pán za třetím nástupištěm je skutečný vizionář. Brno potřebuje více takových průkopníků.",
        rating: 5,
      },
      { body: "Pan majitel mi dovolil přespat v sudu. Velmi lidský přístup.", rating: 5 },
    ],
    description:
      "Nachází se strategicky mezi třetím nástupištěm a zastávkou nočních rozjezdů. Toto urbanistické vinařství se zaměřuje na absolutní cenovou dostupnost. Naše ročníky přirozeně fermentují pod moravským sluncem v autentických recyklovaných PET lahvích. Cílíme výhradně na studenty přesně tři dny před výplatou a na otrlé veterány ulice.",
    email: "info@chateau-lavicka.cz",
    events: [
      {
        capacity: 35,
        daysOffset: 21,
        demoComments: [
          "Jdu na streetovou degustaci poprvé! Je zvykem si přinést vlastní skládací židličku, nebo se prostě sedí na obrubníku?",
          "@Kamil vole musíme jít, slyšel jsem, že o půlnoci narážejí čerstvý plastový sud.",
          "Konečně akce, kde se nemusím stydět za to, že piju z plastového kelímku.",
          "Doufám, že tentokrát nebudou ty PET lahve vystavené přímému slunci déle než týden.",
        ],
        description:
          "Vysoce neformální, neautorizované setkání přímo u nechvalně známých černých hodin na Náměstí Svobody. Očekávejte syrovou, autentickou pouliční atmosféru, kde budeme ochutnávat ty nejlepší PET lahvové ročníky přímo od zdroje.",
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
    ownerKey: "test_user",
    phone: "+420 777 528 425",
    websiteUrl: "https://chateau-lavicka.cz",
    wines: [
      {
        alcoholContent: "11.50",
        attribution: "Street Estate",
        basePrice: 9,
        color: "white",
        composition: "100% Mystery Grape",
        demoReviews: [
          {
            body: "Ten neonový vzhled mě zaujal, ta chuť mě naprosto zničila v tom nejlepším slova smyslu. Vypila jsem celou dvoulitrovou lahev za pochodu k tramvaji a nikdy jsem se necítila tak svobodně.",
            rating: 5,
          },
          { body: "Ta modrá barva mi krásně ladí s modřinami z rozjezdu. 10/10.", rating: 5 },
          { body: "Chutná to jako dětství, když jsme olizovali baterie.", rating: 4 },
          {
            body: "Překvapivě pitelné! Skvěle to doplnilo studený kebab ve 4 ráno na České.",
            rating: 5,
          },
        ],
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
        demoReviews: [
          {
            body: "Ano, chuť je trochu jako žvýkat asfalt na D1, ale to dává charakter! Pro autentický brněnský zážitek není nad toto.",
            rating: 5,
          },
          {
            body: "Ten plastový uzávěr se okamžitě strhl, ale šroubovák to spravil. Solidní, robustní volba na páteční večery.",
            rating: 4,
          },
          {
            body: "Ta plastová flaška byla trochu zdeformovaná, asi od tepla z radiátoru, ale obsah byl vysoce efektivní.",
            rating: 5,
          },
        ],
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
    ],
  },
  {
    city: "Brno - Titanium Nové Sady",
    demoReviews: [
      {
        body: "Oceňuji tu čistou drzost účtovat si tolik peněz za zkvašený hroznový džus. Odvážný byznysový tah.",
        rating: 5,
      },
      { body: "Chuťový profil: 404 Not Found. Ale aspoň to má prestižní etiketu.", rating: 4 },
    ],
    description:
      "Maison de l'Ego bylo založeno výhradně proto, aby si technologičtí miliardáři a startupisté měli co odepsat z daní. Neprodáváme víno, prodáváme nalahvovanou nadřazenost a tekutou aroganci.",
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
        demoReviews: [
          {
            body: "Absolutní mistrovské dílo moderních daňových úniků. Chuťový profil je komplexní, ale ta pravá radost přichází až s kapitálovými výnosy.",
            rating: 5,
          },
          {
            body: "Při každém doušku cítím, jak mi stoupá IQ a klesá zůstatek na účtu. Dokonalé.",
            rating: 5,
          },
          {
            body: "Čekal jsem víc zlata v dochuti, ale ta arogance je cítit už při otevírání.",
            rating: 4,
          },
        ],
        description:
          "Víno tak exkluzivní, že vás reálně soudí, když ho naléváte do sklenice. Ve vůni dominují bílé lanýže, kaviár a zřetelný náznak offshorových účtů.",
        imageUrl: "/uploads/wine/arrogance.webp",
        name: "Liquid Arrogance",
        quantity: 12,
        region: "Tax Haven",
        type: "still",
        vintageYear: 2024,
        volumeMl: 750,
      },
      {
        alcoholContent: "14.50",
        attribution: "Single Vineyard",
        basePrice: 8500,
        color: "red",
        composition: "100% Arrogance",
        demoReviews: [
          {
            body: "Víno tak dobré, že mi po něm odpustili i ten incident s produkční databází.",
            rating: 5,
          },
          {
            body: "V dochuti jasně ucítíte nefalšované pohrdání ostatními programátory.",
            rating: 4,
          },
          {
            body: "Po třetí skleničce jsem začal vidět kód v binární soustavě. Matrix existuje.",
            rating: 5,
          },
        ],
        description:
          "Navrženo pro lidi, kteří píší kód rovnou do produkce a nikdy nepoužívají komentáře.",
        imageUrl: "/uploads/wine/10xdeveloper.webp",
        name: "10x Developer",
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
    demoReviews: [
      {
        body: "Tohle víno je jediný důvod, proč ještě bydlím na Vinařské a ne v Silicon Valley.",
        rating: 5,
      },
    ],
    description:
      "Zrozeno z čirého zoufalství během zkouškového období. Naše sudy jsou ukryté pod palandami a pečlivě zrají vedle ústředního topení.",
    email: "info@kolejni-vino.cz",
    events: [
      {
        capacity: 40,
        daysOffset: -45,
        demoComments: [
          "Rezervuju si místo u radiátoru! Minule mi tam bylo nejlíp.",
          "Když jsem se toho účastnil minule, vzbudil jsem se v jiném časovém pásmu.",
          "Hledám doprovod na tuhle akci. Podmínka: vlastní otvírák a odolný žaludek.",
        ],
        description:
          "Extrémně chaotická degustace konaná ve sdílené kuchyňce na kolejích Vinařská. Atmosféra byla hustá vlhkostí z vařených těstovin a aromatem vín zrajících na radiátoru.",
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
    ownerKey: null,
    phone: "+420 603 565 353",
    websiteUrl: "https://kolejni-vino.cz",
    wines: [
      {
        alcoholContent: "15.00",
        attribution: "Radiator Selection",
        basePrice: 22,
        color: "white",
        composition: "100% Dormitory Grapes",
        demoReviews: [
          {
            body: "Zrálo přesně tři týdny za vařícím radiátorem. Ten dojezd je prostě božský.",
            rating: 5,
          },
          { body: "Oceňuji ten šroubovací uzávěr. Vývrtku jsem zastavil v zastavárně.", rating: 4 },
        ],
        description:
          "Zrálo přesně tři týdny za vařícím radiátorem na sdíleném pokoji na Vinařské. Tento urychlený termální proces stárnutí dodává vínu unikátní chuť.",
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
        demoReviews: [
          {
            body: "Pomohlo mi přežít moje bakalářky, i když za cenu lehké amnézie na celý víkend.",
            rating: 5,
          },
          {
            body: "Konečně víno, které mi rozumí. Je smutné, levné a dostupné v suterénu.",
            rating: 5,
          },
          {
            body: "Koupil jsem to jako úplatek pro zkoušejícího. Nejenže jsem prošel, ale dostal jsem i jeho dceru za ženu.",
            rating: 5,
          },
        ],
        description: "Vytvořeno specificky pro studenty čelící blížícím se deadlinům.",
        imageUrl: "/uploads/wine/skuskove.webp",
        name: "Slzy Zkouškového",
        quantity: 320,
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
      "Původně spuštěno jako blockchainový smart kontrakt. Produkce fyzického vína byla jen nehoda.",
    email: "dao@kryptonvineyards.io",
    events: [
      {
        capacity: 60,
        daysOffset: 56,
        demoComments: [
          "Můžu platit v dogecoinech, nebo jedete jen v hotovosti pod pultem?",
          "Dá se tam někde bezpečně odložit ego, nebo si ho musím vzít s sebou?",
          "Můj osobní asistent mi tuhle akci doporučil jako 'vhodnou pro budování charakteru'.",
        ],
        description:
          "Tento networkingový event se zaměřuje na Web3 investice a nalévají se vína, která stojí více než byt 2+kk v Králově Poli.",
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
        demoReviews: [
          {
            body: "Nejlepší investice od dob, co jsem koupil Bitcoin za 10 dolarů. A tohle se dá aspoň vypít.",
            rating: 5,
          },
          { body: "Můžu platit v dogecoinech? Ptám se pro kamaráda.", rating: 4 },
        ],
        description:
          "Vydáno speciálně k oslavě raketového růstu akcií. Cena divoce kolísá podle algoritmů na sociálních sítích.",
        imageUrl: "/uploads/wine/bull_run.webp",
        name: "Bull Run",
        quantity: 77,
        region: "Blockchain Offshore Estate",
        type: "still",
        vintageYear: 2025,
        volumeMl: 750,
      },
    ],
  },
  {
    city: "Brno - Botanická",
    demoReviews: [
      {
        body: "Typická FI MUNI metodologie. Odvážný projekt, špatně zdokumentovaný, ale výsledek překvapivě použitelný.",
        rating: 4,
      },
    ],
    description:
      "Udržováno skupinou vývojářů, kteří neviděli denní světlo od roku 2021. Proces fermentace je plně automatizován pomocí zrezivělého Raspberry Pi.",
    email: "root@fimuni.winery",
    events: [
      {
        capacity: 50,
        daysOffset: -60,
        demoComments: [
          "Bude se degustovat i ten ročník, co zral vedle serveru v suterénu? Slyšel jsem, že má unikátní digitální dochuť.",
          "Přijdu, jen pokud slíbíte, že se nebude mluvit o politice ani o JavaScriptu.",
          "Za 35 korun jsem nečekal zázraky, ale tohle mi spolehlivě vymazalo paměť na celý víkend.",
        ],
        description:
          "Vystresovaní studenti informatiky párovali naše vysokokofeinová Server Room vína se studenou pizzou.",
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
        demoReviews: [
          {
            body: "Jako backend developer to musím ocenit na metaúrovni. Ta chuť databázové paniky je autentická.",
            rating: 4,
          },
          {
            body: "Oceňuji tu automatizaci přes Raspberry Pi, i když ten Python skript je opravdu mizerně napsaný.",
            rating: 4,
          },
        ],
        description:
          "Těžké červené víno, které vzniklo chybou v Docker kontejneru během nasazování do produkce.",
        imageUrl: "/uploads/wine/postgress.webp",
        name: "Postgres Rollback 2019",
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
        demoReviews: [
          {
            body: "Chutná to jako pushování do masteru bez review. Adrenalin v každém doušku.",
            rating: 5,
          },
          { body: "Přijdu, jen pokud slíbíte, že se nebude mluvit o JavaScriptu.", rating: 5 },
        ],
        description:
          "Vzniklo, když dva vývojáři omylem přepsali produkční databázi a museli pít, aby zapomněli.",
        imageUrl: "/uploads/wine/git_push.webp",
        name: "Git Push --Force 2026",
        quantity: 42,
        region: "Botanická Serverová Oblast",
        type: "still",
        vintageYear: 2026,
        volumeMl: 750,
      },
    ],
  },
  {
    city: "Brno - Spielberk Tower",
    demoReviews: [
      {
        body: "Pití tohoto vína statisticky zvyšuje šanci, že si koupíte jachtu a spácháte hospodářskou kriminalitu.",
        rating: 5,
      },
      {
        body: "Vůně připomíná čerstvě vytištěné peníze a spálené naděje mých konkurentů. Miluju to.",
        rating: 5,
      },
    ],
    description:
      "Postaveno na staletích generačního bohatství a vysoce pochybných tržních monopolech.",
    email: "butler@baronvon.estate",
    events: [
      {
        capacity: 30,
        daysOffset: 35,
        demoComments: [
          "Je poblíž místa konání hlídané parkoviště pro Maybach, nebo mám říct řidiči, ať krouží kolem bloku?",
          "Rychlý dotaz na organizátory: je dress code striktně oblek a kravata, nebo projde i nechutně drahý rolák?",
          "Můj osobní asistent mi tuhle akci doporučil jako 'vhodnou pro budování charakteru'.",
        ],
        description:
          "Striktně VIP událost pouze pro zvané, kde se funkcionalistická architektura setkává s neregulovaným kapitalismem.",
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
        demoReviews: [
          {
            body: "Láhev vypadá tak luxusně, že jsem ji musel pojistit dřív, než jsem ji otevřel.",
            rating: 5,
          },
          { body: "Toto víno nepolykáte, vy do něj interně investujete.", rating: 5 },
          { body: "Bublá s lehkostí čerstvě vytištěných peněz.", rating: 5 },
        ],
        description:
          "Fermentováno s reálným diamantovým prachem, aby každý doušek jemně provedl peeling vašeho trávicího traktu.",
        imageUrl: "/uploads/wine/diamond.webp",
        name: "Diamond Infusion Cuvée",
        quantity: 8,
        region: "Exclusive Monopoly",
        type: "sparkling",
        vintageYear: 2024,
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
        name: "Nočná Záchranná Sada",
        price: 29,
        wineNames: ["Modrý Blesk 2024", "Hradní Svíce Black Label", "Brněnský Drak"],
      },
    ],
    city: "Brno - Centrum",
    description:
      "Posledný maják nádeje v oceáne brnianskej noci. Ponúkame exkluzívny výber vín a bagety, ktoré majú viac skúseností ako tvoj priemerný profesor na FI.",
    email: "zachrana@vecerka.sk",
    imageUrl: "/uploads/shop/vecerka_u_joska.webp",
    key: "vecerka_posledna_zachrana",
    name: "Večerka Posledná Záchrana",
    ownerKey: "test_user",
    sourceWinemakerKeys: ["lavicka", "vinarska"],
  },
  {
    bundles: [],
    city: "Brno - Nové Sady",
    description:
      "Miesto tak exkluzívne, že aj tvoj tieň potrebuje previerku od SIS. Naše vína sú tak drahé, že po ich kúpe ti zostane už len na suchý rohlík z vedľajšej Večerky.",
    email: "bunker@miliardari.biz",
    imageUrl: "/uploads/shop/shop_placeholder.webp",
    key: "miliardarsky_bunker",
    name: "Miliardársky Bunker",
    ownerKey: null,
    sourceWinemakerKeys: ["ego", "oligarch"],
  },
];

// ── Curated story interactions ────────────────────────────────────────────────
export const STORY = {
  jana: {
    eventRegistrations: ["vinarska-0", "lavicka-0"],
    orders: [
      {
        items: [
          { quantity: 3, winemakerId: "lavicka", wineName: "Modrý Blesk 2024" },
          { quantity: 1, winemakerId: "lavicka", wineName: "Hradní Svíce Black Label" },
        ],
        shopKey: "vecerka_posledna_zachrana",
        status: "delivered" as const,
      },
    ],
    productReviews: [
      {
        body: "Absolutní klasika, kupuji pravidelně každý čtvrtek.",
        rating: 5,
        shopKey: "vecerka_posledna_zachrana",
        winemakerId: "lavicka",
        wineName: "Modrý Blesk 2024",
      },
    ],
    winemakerReviews: [
      {
        body: "Skvělý přístup a lidové ceny.",
        rating: 5,
        winemakerId: "lavicka",
      },
    ],
  },
  petr: {
    eventRegistrations: ["fimuni-0", "cayman-0"],
    orders: [
      {
        items: [{ quantity: 2, winemakerId: "fimuni", wineName: "Postgres Rollback 2019" }],
        shopKey: "vecerka_posledna_zachrana",
        status: "delivered" as const,
      },
    ],
    productReviews: [
      {
        body: "Zkonzumoval jsem dvě lahve během posledního deploye na produkci.",
        rating: 4,
        shopKey: "vecerka_posledna_zachrana",
        winemakerId: "fimuni",
        wineName: "Postgres Rollback 2019",
      },
    ],
    winemakerReviews: [
      {
        body: "Oceňuji technologický přístup.",
        rating: 4,
        winemakerId: "fimuni",
      },
    ],
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
