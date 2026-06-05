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
  alcoholContent: string;
  volumeMl: 375 | 750 | 1500;
  quantity: number;
  attribution: string;
  composition: string;
  description: string;
  basePrice: number;
  imageUrls?: string[];
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
  imageUrls?: string[];
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
  imageUrls?: string[];
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
  imageUrls?: string[];
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

// ── Supporting customers ─────────────────────────────────────────────────────
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
    { city: "Bratislava", email: "igor.moravec@demo.sk", fname: "Igor", lname: "Moravec" },
    { city: "Bratislava", email: "jana.vlckova@demo.sk", fname: "Jana", lname: "Vlčková" },
    { city: "Nitra", email: "majo.someliér@demo.sk", fname: "Majo", lname: "Somelier" },
    { city: "Košice", email: "vlado.cerny@demo.sk", fname: "Vladimír", lname: "Černý" },
    { city: "Trnava", email: "zuzana.horakova@demo.sk", fname: "Zuzana", lname: "Horáková" },
  ];

// ── Winemakers ────────────────────────────────────────────────────────────────
export const WINEMAKERS: WinemakerData[] = [
  // ── REALISTIC SLOVAK WINEMAKERS ──────────────────────────────────────────

  {
    city: "Mužla",
    demoReviews: [
      {
        body: "Absolútna špička medzi slovenskými vinárstvami. Dunaj z Karpatskej Perle je pre mňa definícia toho, čo dokáže slovenský juh.",
        rating: 5,
      },
      {
        body: "Navštívil som ich priamo v Mužle a bol to zážitok na celý život. Pan Štefánik je vášnivý rozprávač o terroir Južného Slovenska.",
        rating: 5,
      },
      {
        body: "Rizling Rýnsky Terroir je fascinujúce víno. Tá jemná mineralita a citrusová svežosť sú presne to, čo hľadám v bielom víne.",
        rating: 4,
      },
      {
        body: "Connoisseur odporúča: Dunaj Barrique 2021 k hovädziemu steaku. Nenašiel som lepšie párovanie za posledné roky.",
        rating: 5,
      },
      {
        body: "Veľmi seriózne vinárstvo s jasnou víziou. Oceňujem, že stavajú na slovenských odrodách a nie na medzinárodných kultivaroch.",
        rating: 4,
      },
    ],
    description:
      "Rodinné vinárstvo z Mužle v Južnoslovenskej vinohradníckej oblasti, jedno z najväčších na Slovensku. Karpatská Perla sa špecializuje na slovenské novošľachtené odrody – predovšetkým Dunaj a Devín. Ich vína sú výrazom juhu Slovenska: plná tela, bohaté na extrakt, s jemnou korenistosťou a dlhou dochuťou.",
    email: "info@karpatska-perla.sk",
    events: [
      {
        capacity: 14,
        daysOffset: 25,
        demoComments: [
          "Konečne taká akcia! Vertikálna degustácia Dunaja je pre mňa ako somelier must-attend podujatie roka.",
          "Rezervovala som dve miesta. Beriem aj priateľa, ktorý si myslel, že Dunaj je len rieka. To sa zmení.",
          "14 miest a cena lístka 35€? Za 6 ročníkov od Štefánika je to smiešne lacné. Okamžite sa registrujem.",
          "Bol som na minuloročnej vertikálke Frankovky a bolo to neskutočné. Tento rok Dunaj – určite prídem.",
          "Otázka pre organizátorov: bude k dispozícii aj nejaký gastro sprievod, alebo len suché degustovanie?",
        ],
        description:
          "Unikátna príležitosť ochutnať šesť ročníkov Dunaja Barrique od Karpatskej Perle, od ročníka 2015 až po 2021. Na vlastné oči a jazyk spoznáte, ako sa toto víno v čase vyvíja a naberá na komplexnosti. Degustáciu vedie hlavný enológ vinárstva Ing. Peter Štefánik a someliér Jakub Kráľ.",
        durationHours: 3,
        imageUrls: ["/uploads/event/ev_degustation.webp", "/uploads/event/ev_s1.webp"],
        isPast: false,
        name: "Vertikálna Degustácia: Dunaj zo starých vinohradov",
        visibility: "public",
      },
    ],
    imageUrls: ["/uploads/winemaker/wm_karpat.webp"],
    key: "karpatska_perla",
    name: "Karpatská Perla",
    ownerKey: null,
    phone: "+421 036 756 23 45",
    websiteUrl: "https://karpatska-perla.sk",
    wines: [
      {
        alcoholContent: "15.00",
        attribution: "Barrique Exclusive",
        basePrice: 28.5,
        color: "red",
        composition: "100% Dunaj",
        demoReviews: [
          {
            body: "Mohutné, plné telo s výraznými tónmi horkej čokolády, prezretých višní a jemným dymovým záverom. K hovädziemu steaku sadol ako uliaty. Určite si kúpim ďalší kartón.",
            rating: 5,
          },
          {
            body: "Tento ročník sa naozaj podaril. Po hodine v dekantéri sa krásne otvoril, tá čokoláda v závere je neskutočná.",
            rating: 5,
          },
          {
            body: "Robustné víno s obrovským potenciálom. Teraz je ešte trochu zviavé, ale cítim, že o 2-3 roky to bude zázrak.",
            rating: 4,
          },
          {
            body: "Bol som skeptický k Dunaju ako odrode, ale toto víno ma úplne zmenilo. Komplexnosť na úrovni dobrého Bordeaux za tretinu ceny.",
            rating: 5,
          },
          {
            body: "K diviaciemu guláši nenájdete nič lepšie. Tá zemitosť a korenistosť perfektne dopĺňajú pikantné mäso.",
            rating: 4,
          },
        ],
        description:
          "Vrcholné zobrazenie našej najznámejšej novošľachtenej odrody. Víno tmavej, nepriehľadnej farby, s vôňou po prezretých čiernych ríbezliach a horkej čokoláde. Dlhé, 24-mesačné zrenie v nových barikových sudoch mu dodalo robustnú štruktúru, zamatové triesloviny a jemný dymový podtón v dochuti. Skutočný 'Medveď' medzi vínami.",
        imageUrls: [
          "/uploads/wine/dunaj.webp",
          "/uploads/wine/wine_s1.webp",
          "/uploads/wine/wine_s2.webp",
        ],
        name: "Dunaj 2021, Barrique Exclusive",
        quantity: 420,
        region: "Južnoslovenská",
        type: "still",
        vintageYear: 2021,
        volumeMl: 750,
      },
      {
        alcoholContent: "12.50",
        attribution: "Terroir",
        basePrice: 21.9,
        color: "white",
        composition: "100% Rizling Rýnsky",
        demoReviews: [
          {
            body: "Krásna petrolejová vôňa, presne ako to má pri kvalitnom rizlingu byť. Kyslinka stále drží, víno s obrovským potenciálom zrenia.",
            rating: 5,
          },
          {
            body: "Elegantný a čistý Rizling. Krásna citrusová aróma, pevná kyselinka a dlhá, minerálna dochuť. Víno mimoriadnych kvalít.",
            rating: 5,
          },
          {
            body: "Skvelý rizling, len by som si prial trochu viac tej typickej 'petrolejovej' stopy. Ale inak výborná práca s odrodou.",
            rating: 4,
          },
          {
            body: "K morským plodám a grilovanej rybe nenájdete lepšie slovenské biele. Tá mineralita je presne to, čo potrebujete.",
            rating: 5,
          },
        ],
        description:
          "Ikonický rizling z Južnoslovenskej vinohradníckej oblasti. Víno s iskrivou, zlato-zelenou farbou. Vo vôni dominujú elegantné citrusové tóny, lipový kvet a typická jemná mineralita, ktorá sa bude vekom zvýrazňovať. V chuti je plné, s pevnou kyselinkou a dlhou perzistenciou.",
        imageUrls: [
          "/uploads/wine/rizling.webp",
          "/uploads/wine/wine_s3.webp",
          "/uploads/wine/wine_s4.webp",
        ],
        name: "Rizling Rýnsky 2023, Terroir",
        quantity: 380,
        region: "Južnoslovenská",
        type: "still",
        vintageYear: 2023,
        volumeMl: 750,
      },
    ],
  },

  {
    city: "Nitra",
    demoReviews: [
      {
        body: "Mrva & Stanko sú pre mňa referenčný bod slovenského červeného vína. Frankovka zo starých vinohradov je absolútna klasika.",
        rating: 5,
      },
      {
        body: "Navštívil som ich degustačnú miestnosť v Nitre a páni Mrva a Stanko sú skutočne srdečný a vášniví ľudia. Ich príbeh je inšpiratívny.",
        rating: 5,
      },
      {
        body: "Alibernet Barrique je odvážna voľba, ale výborne vychádza. Tá tmavá farba a zemitosť sú nezabudnuteľné.",
        rating: 4,
      },
      {
        body: "Konzistentná kvalita rok čo rok. Viem, čo dostanem, a vždy je to viac než výborné.",
        rating: 5,
      },
    ],
    description:
      "Legendárne nitrianske vinárstvo s dlhoročnou tradíciou, zamerané na klasické stredoeurópske odrody. Mrva & Stanko sú synonymom Frankovky Modrej zo starých vinohradov a precíznej práce v pivnici. Ich vína vynikajú čistotou odrody, rovnováhou a schopnosťou krásne zrieť.",
    email: "info@mrva-stanko.sk",
    events: [
      {
        capacity: 20,
        daysOffset: 42,
        demoComments: [
          "Konečne sa naučím, ako správne ochutnávať víno! Registrujem sa hneď.",
          "Brala som ich kurz vlani a odporúčam každému. Tomáš Mrva je výborný lektor, vie zaujímavo vysvetliť aj technické veci.",
          "Je to vhodné aj pre úplných začiatočníkov? Pýtam sa, lebo viem len toľko, že víno je červené alebo biele.",
          "150€ za víkendový certifikovaný kurz je absolútna cena. Prihlásila som celú partiu z práce.",
          "Objednali sme firemný teambuilding pre 18 ľudí. Pán Mrva nám vyšiel veľmi vstretne.",
          "Sú tu miesta pre ľudí z Česka? Radi by sme prišli z Brna špeciálne na tento kurz.",
        ],
        description:
          "Dvojdňový kurz zameraný na základy vinohradníctva, vinárstva, degustačných techník a párovania vína s jedlom. Naučíte sa správne ochutnávať, spoznáte hlavné odrody a vinárske regióny sveta. Kurz je certifikovaný a určený pre úplných začiatočníkov. Lektori: Tomáš Mrva a someliér Jakub Kráľ.",
        durationHours: 8,
        imageUrls: ["/uploads/event/ev_kurz.webp", "/uploads/event/ev_s3.webp"],
        isPast: false,
        name: "Vinársky Kurz Level 1: Základy pre milovníkov vína",
        visibility: "public",
      },
    ],
    imageUrls: ["/uploads/winemaker/wm_mrva.webp"],
    key: "mrva_stanko",
    name: "Mrva & Stanko",
    ownerKey: null,
    phone: "+421 037 651 22 10",
    websiteUrl: "https://mrva-stanko.sk",
    wines: [
      {
        alcoholContent: "13.50",
        attribution: "Varieto",
        basePrice: 18.2,
        color: "red",
        composition: "100% Frankovka Modrá",
        demoReviews: [
          {
            body: "Typická korenistá Frankovka zo starých vinohradov. Vôňa po kôstkovom ovocí a jemnom korení. V chuti vystupujú tóny sliviek a škorice s príjemnou, elegantnou trieslovinou.",
            rating: 4,
          },
          {
            body: "Toto je presne to, prečo milujem Frankovku. Žiadne zbytočné drevo, čistá odroda, elegantná a dlhá dochuť. Párovanie s kačacou pečienkou bolo dokonalé.",
            rating: 5,
          },
          {
            body: "Ročník 2020 bol výnimočný pre Frankovku na Slovensku. Toto víno to dokazuje. Trochu tuhšie triesloviny, ale s trochou vzduchu sa pekne otvorí.",
            rating: 4,
          },
          {
            body: "Kupujem každý ročník a tento je jeden z najlepších. Tá višňová aróma s nádychom škorice je nezameniteľná.",
            rating: 5,
          },
          {
            body: "Dobré víno, ale čakal som trochu viac komplexnosti za túto cenu. Možno ešte rok-dva v pivnici by to posunulo.",
            rating: 3,
          },
        ],
        description:
          "Hlboká, rubínová farba. Vôňa je plná kôstkového ovocia, najmä višní a čiernych sliviek, doplnená o jemné tóny korenia a horkej čokolády. Chuť je harmonická, s pevnou štruktúrou trieslovín a príjemnou, korenistou dochuťou. Skvelá ukážka toho, ako vie Frankovka zo starých vinohradov krásne zrieť.",
        imageUrls: [
          "/uploads/wine/frankovka.webp",
          "/uploads/wine/wine_s5.webp",
          "/uploads/wine/wine_s6.webp",
        ],
        name: "Frankovka Modrá 2020, Varieto",
        quantity: 310,
        region: "Nitrianska",
        type: "still",
        vintageYear: 2020,
        volumeMl: 750,
      },
      {
        alcoholContent: "14.50",
        attribution: "Barrique",
        basePrice: 19.8,
        color: "red",
        composition: "100% Alibernet",
        demoReviews: [
          {
            body: "Brutálne víno. Farba čierna ako atrament, vonia to po maku a dyme. Robili sme diviačí guláš a sadlo to k nemu neskutočne.",
            rating: 5,
          },
          {
            body: "Farba čierna, chutí to ako tekutý mak s čokoládou. Po otvorení nechajte aspoň 2 hodiny dýchať. Potom je to zázrak.",
            rating: 5,
          },
          {
            body: "V chuti je to dosť zvieravé, treba to nechať poriadne predýchať alebo ešte rok v pivnici postáť. Ale potenciál je obrovský.",
            rating: 4,
          },
          {
            body: "K pečenému baranovi nenájdete nič lepšie zo slovenských vín. Tá zemitosť a robustnosť sú presne to, čo potrebujete.",
            rating: 4,
          },
        ],
        description:
          "Atramentovo čierna farba. Robustné a zemité víno. Vôňa po čiernom maku, horkej čokoláde, slivkovom lekvári a dyme. Triesloviny sú po 18 mesiacoch v sudoch Barrique vyhladené, ale stále dominantné a pevné. Víno s obrovským potenciálom zrenia v pivnici.",
        imageUrls: [
          "/uploads/wine/alibernet.webp",
          "/uploads/wine/wine_s7.webp",
          "/uploads/wine/wine_s8.webp",
        ],
        name: "Alibernet 2022, Barrique",
        quantity: 185,
        region: "Nitrianska",
        type: "still",
        vintageYear: 2022,
        volumeMl: 750,
      },
    ],
  },

  {
    city: "Modra",
    demoReviews: [
      {
        body: "Elesko je príjemná správa pre slovenské biele víno. Devín 2024 je medzi milovníkmi aromatických vín absolútne hit.",
        rating: 5,
      },
      {
        body: "Kryomacerácia Veltlínu je zaujímavý experiment a myslím, že sa im vydaril. Svieže, čisté víno s dobrým charakterom odrody.",
        rating: 4,
      },
      {
        body: "Wine Park v Modre je nádherné miesto. Architektúra, degustačná miestnosť, výhľad na vinohrady – všetko na výbornej úrovni.",
        rating: 5,
      },
      {
        body: "Cabernet Rose 2025 je skvelé letné víno. Tá farba, aróma jahôd – ideálne na terasu.",
        rating: 4,
      },
    ],
    description:
      "Moderné vinárstvo z Modry v Malokarpatskej vinohradníckej oblasti. Elesko spája tradičné slovenské odrody s modernými vinárskymi technikami. Sú priekopníkmi kryomacerácie a šetrnej práce v pivnici. Ich portfolio zahŕňa elegantné biele vína aj sviežu ružovku.",
    email: "info@elesko.sk",
    events: [],
    imageUrls: ["/uploads/winemaker/wm_elesko.webp"],
    key: "elesko",
    name: "Elesko Wine Park",
    ownerKey: null,
    phone: "+421 033 647 45 67",
    websiteUrl: "https://elesko.sk",
    wines: [
      {
        alcoholContent: "12.50",
        attribution: "Neskorý zber",
        basePrice: 14.5,
        color: "white",
        composition: "100% Devín",
        demoReviews: [
          {
            body: "Na môj vkus trochu sladšie, ale priniesla som ho na babskú jazdu a kamošky ho zlikvidovali za pol hodinu. Veľmi voňavé a príjemné pitie.",
            rating: 4,
          },
          {
            body: "Extrémne voňavé víno, marhule a med v nose. V chuti je ale krásne svieže a suché, kyselinka funguje výborne. Veľmi elegantné.",
            rating: 5,
          },
          {
            body: "Devín od Eleskovcov je ročne môj obľúbený piknikový spoločník. Ľahký, svieži, s krásnou arómou. Perfektné na letné večery.",
            rating: 4,
          },
          {
            body: "K thajskej kuchyni je toto víno úžasné. Tá sladkosť a aromatika perfektne vyvažujú pikantnosť jedla.",
            rating: 5,
          },
        ],
        description:
          "Vysoko aromatické slovenské biele víno. Žiarivá, žlto-zelená farba. Vo vôni explózia tónov muškátového kvetu, marhúľ a kvitnúcej lipy. V chuti je víno plné, ovocné, s príjemnou, sviežou kyselinkou, ktorá vyvažuje vyšší extrakt. Veľmi elegantné a svieže pitie.",
        imageUrls: ["/uploads/wine/wine_s9.webp", "/uploads/wine/wine_s10.webp"],
        name: "Devín 2024, Neskorý zber",
        quantity: 290,
        region: "Malokarpatská",
        type: "still",
        vintageYear: 2024,
        volumeMl: 750,
      },
      {
        alcoholContent: "12.00",
        attribution: "Kryomacerácia",
        basePrice: 12.9,
        color: "white",
        composition: "100% Veltlínske Zelené",
        demoReviews: [
          {
            body: "Svieži a minerálny Veltlín. Vôňa bieleho korenia a zeleného jablka. Dobré a moderné víno na každodennú konzumáciu.",
            rating: 4,
          },
          {
            body: "Čakal som trochu viac tej minerality, je skôr ovocný a korenistý. Ale inak fajn, svieže víno na poobedie.",
            rating: 4,
          },
          {
            body: "Kryomacerácia robí s týmto Veltlínom zázraky. Čistota arómy je vynikajúca, žiadne nechcené tóny. Odporúčam k šalátom a morským plodám.",
            rating: 5,
          },
          {
            body: "Typický Veltlín s tou charakteristickou mandľovou dochuťou. Ľahký a pitný, ideálny na terasu s priateľmi.",
            rating: 4,
          },
        ],
        description:
          "Svieži a minerálny Veltlín vyrobený metódou kryomacerácie (podchladenie rmutu). Víno s iskrivou farbou, vôňou po bielom korení a zelenom jablku. V chuti je iskrivé, s pevnou kyselinkou a typickou jemne mandľovou dochuťou. Moderné a elegantné zobrazenie tejto klasickej odrody.",
        imageUrls: ["/uploads/wine/wine_s11.webp", "/uploads/wine/wine_s12.webp"],
        name: "Veltlínske Zelené 2023, Kryomacerácia",
        quantity: 340,
        region: "Malokarpatská",
        type: "still",
        vintageYear: 2023,
        volumeMl: 750,
      },
      {
        alcoholContent: "11.00",
        attribution: "ViaJur",
        basePrice: 11.8,
        color: "rosé",
        composition: "100% Cabernet Sauvignon",
        demoReviews: [
          {
            body: "Explózia lesných jahôd a malín. Svieže, hravé rosé so šťavnatou kyselinkou. Poriadne vychladiť na letnú terasu.",
            rating: 4,
          },
          {
            body: "K grilovaným krevetám a caesarovému šalátu je toto rosé dokonalé. Ľahké, ovocné a s krásnou ružovou farbou.",
            rating: 5,
          },
          {
            body: "Moje letné víno číslo jeden. Kúpila som celý kartón a mám ho vychladený v chladničke na celé leto.",
            rating: 4,
          },
          {
            body: "Pekné ľahké rosé, ale pre mňa trochu príliš jednoduché. Skôr na terasu ako k vážnej degustácii.",
            rating: 3,
          },
        ],
        description:
          "Živá, iskrivá ružová farba. Vôňa plná drobného červeného ovocia, najmä lesných jahôd, malín a červených ríbezlí. V chuti je víno svieže, ľahké, s príjemnou kyselinkou a ovocným záverom. Ideálne na letnú terasu k ľahkým šalátom alebo len tak, na osvieženie.",
        imageUrls: ["/uploads/wine/wine_s13.webp", "/uploads/wine/wine_s14.webp"],
        name: "Cabernet Sauvignon Rosé 2025",
        quantity: 260,
        region: "Malokarpatská",
        type: "still",
        vintageYear: 2025,
        volumeMl: 750,
      },
    ],
  },

  {
    city: "Hustopeče",
    demoReviews: [
      {
        body: "Sonberk je pre mňa referenčné vinárstvo pre moravské aromatické biele vína. Pálava od nich je neopakovateľná.",
        rating: 5,
      },
      {
        body: "Navštívil som ich winery a architektonicky je to jeden z najkrajších vinárskych areálov na Morave. A vína sú ešte lepšie ako budova.",
        rating: 5,
      },
      {
        body: "Sekt Pálffy od Sonberku je príjemné prekvapenie. Nie je to Champagne, ale za tú cenu je to vynikajúca voľba.",
        rating: 4,
      },
      {
        body: "Pálava k dessertom, Noria k aperitívu, Sekt na prípitok. Celé portfolio je výborne zostavené.",
        rating: 5,
      },
    ],
    description:
      "Prémiové vinárstvo z Hustopeče na Morave, zamerané na aromatické biele odrody a tradičné metódy spracovania. Sonberk je synonymom Pálavy – klenoту moravského vinárstva. Ich vína sú plné, extraktívne, s dlhou a príjemnou dochuťou.",
    email: "info@sonberk.cz",
    events: [],
    imageUrls: ["/uploads/winemaker/wm_sonberk.webp"],
    key: "sonberk",
    name: "Sonberk",
    ownerKey: null,
    phone: "+420 519 422 881",
    websiteUrl: "https://sonberk.cz",
    wines: [
      {
        alcoholContent: "11.50",
        attribution: "Výber z hrozna",
        basePrice: 22.0,
        color: "white",
        composition: "100% Pálava",
        // intentionally no imageUrls — shows wine.webp placeholder
        demoReviews: [
          {
            body: "Na mňa trochu príliš sladké na bežné pitie, ale minulý víkend sme ho otvorili k vanilkovému dezertu a bola to absolútna pecka.",
            rating: 5,
          },
          {
            body: "K thajskému kari nič lepšie nepoznám. Tá aromatika líči a manga sa k pikantnému jedlu hodí dokonale.",
            rating: 5,
          },
          {
            body: "Zlatistá farba, vôňa exotického ovocia. Pre milovníkov sladkých vín je toto poklad. Pre mňa trošku sladšie, ale kvality nepopieram.",
            rating: 4,
          },
          {
            body: "K syrom s modrou plesňou je Pálava od Sonberku absolutne neprekonateľná. Tá harmónia sladkosti a vône je dokonalá.",
            rating: 5,
          },
        ],
        description:
          "Klenot z Moravy. Zlatistá farba, explózia vône exotického ovocia, líči, manga a medu. V chuti je víno plné, extraktívne, s dlhou a príjemnou sladkou dochuťou, ktorú krásne vyvažuje svieža kyselinka. Ideálne k dezertom, syrom s modrou plesňou alebo k husacej pečeni.",
        name: "Pálava 2024, Výber z hrozna",
        quantity: 180,
        region: "Jihomoravský kraj",
        type: "dessert",
        vintageYear: 2024,
        volumeMl: 750,
      },
      {
        alcoholContent: "11.50",
        attribution: "Neskorý zber",
        basePrice: 10.5,
        color: "white",
        composition: "100% Noria",
        demoReviews: [
          {
            body: "Očakával som trochu viac aromatiky a minerality, je skôr ovocný a medový. Ale inak fajn, svieže víno na poobedie.",
            rating: 3,
          },
          {
            body: "Sladšie, ako som očakávala, ale k jahodovému dezertu to bola pecka. Marhuľová aróma je veľmi výrazná.",
            rating: 4,
          },
          {
            body: "Ľahké, svieže, nepretenciózne víno. Presne to, čo chcete v lete na terase s priateľmi.",
            rating: 4,
          },
        ],
        description:
          "Svieže slovenské novošľachtenie. Víno s príjemnou, zlato-žltou farbou. Vôňa je plná tónov zrelých marhúľ, medu a kvitnúcej lipy. V chuti je plné, ovocné, s vyváženým pomerom zvyškového cukru a kyselinky. Veľmi pitné a osviežujúce víno.",
        imageUrls: ["/uploads/wine/wine_s1.webp", "/uploads/wine/wine_s2.webp"],
        name: "Noria 2024, Neskorý zber",
        quantity: 220,
        region: "Jihomoravský kraj",
        type: "still",
        vintageYear: 2024,
        volumeMl: 750,
      },
      {
        alcoholContent: "12.00",
        attribution: "Tradičná metóda",
        basePrice: 13.2,
        color: "white",
        composition: "Chardonnay, Pinot Blanc",
        demoReviews: [
          {
            body: "Fajn sekt za rozumnú cenu. Nie je to žiadne prémiové Champagne, ale na prípitok alebo na Silvestra poslúži skvele.",
            rating: 3,
          },
          {
            body: "Jemné bublinky a príjemná ovocná chuť. Na každodennú oslavu je to perfektná voľba, nemusíte šetriť Champagne.",
            rating: 4,
          },
          {
            body: "Skvelý aperitív! Otvárame každý večer pred večerou. Cena je výborná, kvalita prekvapí.",
            rating: 4,
          },
        ],
        description:
          "Tradičný sekt vyrobený metódou Charmat. Jemné a vytrvalé perlenie, vôňa po zelenom jablku, bielej broskyne a biskvitu. V chuti je svieži, vyvážený, s príjemným zvyškovým cukrom a elegantným záverom. Skvelý na prípitok alebo ako aperitív.",
        imageUrls: ["/uploads/wine/wine_s3.webp", "/uploads/wine/wine_s4.webp"],
        name: "Sekt Pálffy, Extra Dry",
        quantity: 150,
        region: "Jihomoravský kraj",
        type: "sparkling",
        vintageYear: 2024,
        volumeMl: 750,
      },
    ],
  },

  // ── FUNNY / SATIRICAL WINEMAKERS (kept for character) ────────────────────

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
        imageUrls: ["/uploads/event/ev_4.webp", "/uploads/event/ev_s5.webp"],
        isPast: false,
        name: "Půlnoční degustace pod Orlojem",
        visibility: "public",
      },
    ],
    imageUrls: ["/uploads/winemaker/la_lavicka.webp", "/uploads/winemaker/wm_s5.webp"],
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
            body: "Ten neonový vzhled mě zaujal, ta chuť mě naprosto zničila v tom nejlepším slova smyslu. Vypila jsem celou dvoulitrovou lahev za pochodu k tramvaji.",
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
        imageUrls: ["/uploads/wine/modry_blesk.webp", "/uploads/wine/wine_s5.webp"],
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
        imageUrls: ["/uploads/wine/hradni_svice.webp", "/uploads/wine/wine_s6.webp"],
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
    imageUrls: ["/uploads/winemaker/maison_de.webp", "/uploads/winemaker/wm_s6.webp"],
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
        imageUrls: ["/uploads/wine/arrogance.webp", "/uploads/wine/wine_s7.webp"],
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
        imageUrls: ["/uploads/wine/10xdeveloper.webp", "/uploads/wine/wine_s8.webp"],
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
        // intentionally no imageUrls — shows event.webp placeholder
        demoComments: [
          "Rezervuju si místo u radiátoru! Minule mi tam bylo nejlíp.",
          "Když jsem se toho účastnil minule, vzbudil jsem se v jiném časovém pásmu.",
          "Hledám doprovod na tuhle akci. Podmínka: vlastní otvírák a odolný žaludek.",
        ],
        description:
          "Extrémně chaotická degustace konaná ve sdílené kuchyňce na kolejích Vinařská. Atmosféra byla hustá vlhkostí z vařených těstovin a aromatem vín zrajících na radiátoru.",
        durationHours: 3,
        isPast: true,
        name: "Kolaudačka na Vinařské 2025",
        visibility: "public",
      },
    ],
    imageUrls: ["/uploads/winemaker/wm_s7.webp"],
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
        imageUrls: ["/uploads/wine/ranni_rozjezd.webp", "/uploads/wine/wine_s9.webp"],
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
        imageUrls: [
          "/uploads/wine/skuskove.webp",
          "/uploads/wine/tears_of_peasant.webp",
          "/uploads/wine/wine_s10.webp",
        ],
        name: "Slzy Zkouškového",
        quantity: 320,
        region: "Pisárecká Kolejní Oblast",
        type: "still",
        vintageYear: 2024,
        volumeMl: 1500,
      },
      {
        alcoholContent: "13.50",
        attribution: "Dragon Reserve",
        basePrice: 16,
        color: "red",
        composition: "100% Unknown Terror",
        demoReviews: [
          { body: "Nevím, co jsem pil, ale ráno jsem byl v jiném bytě. Pět hvězd.", rating: 5 },
          {
            body: "Ten drak na etiketě mě přiměl koupit, chuť mě přiměla zůstat. Záhadné.",
            rating: 4,
          },
          { body: "Ideálne k nočnému štúdiu a filozofickým otázkam o živote.", rating: 5 },
        ],
        description:
          "Tajomné červené víno, ktoré sa zjavilo raz ráno v chladničke na chodbe. Nikto nevie, kto ho tam dal, ani z čoho je. Chuť pripomína dym, lesné plody a mierne pochybné rozhodnutia.",
        imageUrls: ["/uploads/wine/drak.webp", "/uploads/wine/tears_of_peasant.webp"],
        name: "Brněnský Drak",
        quantity: 180,
        region: "Pisárecká Kolejní Oblast",
        type: "still",
        vintageYear: 2023,
        volumeMl: 750,
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
        imageUrls: ["/uploads/event/ev_3.webp", "/uploads/event/ev_s6.webp"],
        isPast: false,
        name: "Spielberk Tower Crypto-Gala",
        visibility: "private",
      },
    ],
    imageUrls: ["/uploads/winemaker/wm_s8.webp"],
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
        imageUrls: ["/uploads/wine/bull_run.webp", "/uploads/wine/wine_s11.webp"],
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
          "Bude se degustovat i ten ročník, co zral vedle serveru v suterénu?",
          "Přijdu, jen pokud slíbíte, že se nebude mluvit o politice ani o JavaScriptu.",
          "Za 35 korun jsem nečekal zázraky, ale tohle mi spolehlivě vymazalo paměť na celý víkend.",
        ],
        description:
          "Vystresovaní studenti informatiky párovali naše vysokokofeinová Server Room vína se studenou pizzou.",
        durationHours: 4,
        imageUrls: ["/uploads/event/ev_5.webp", "/uploads/event/ev_s2.webp"],
        isPast: true,
        name: "FI MUNI Debug & Drink",
        visibility: "public",
      },
    ],
    imageUrls: ["/uploads/winemaker/fi_muni_basement.webp", "/uploads/winemaker/wm_s9.webp"],
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
        imageUrls: ["/uploads/wine/postgress.webp", "/uploads/wine/wine_s12.webp"],
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
        imageUrls: ["/uploads/wine/git_push.webp", "/uploads/wine/wine_s13.webp"],
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
    // intentionally no imageUrls — shows winery.webp placeholder
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
        imageUrls: ["/uploads/event/ev_6.webp", "/uploads/event/ev_s4.webp"],
        isPast: false,
        name: "Villa Tugendhat Elite Auction 2026",
        visibility: "private",
      },
    ],
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
        imageUrls: ["/uploads/wine/diamond.webp", "/uploads/wine/wine_s14.webp"],
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
        description:
          "Selekcia troch prémiových červených vín, ktoré reprezentujú to najlepšie z našich vinohradov. Od robustného Dunaja, cez elegantnú Frankovku, až po zemitý Alibernet. Skvelý darček pre fajnšmekra.",
        name: "Ikonické Červené zo Slovenska",
        price: 64.0,
        wineNames: [
          "Dunaj 2021, Barrique Exclusive",
          "Frankovka Modrá 2020, Varieto",
          "Alibernet 2022, Barrique",
        ],
      },
      {
        description:
          "Šesť fliaš sviežich a ovocných vín, ktoré sú ideálne na horúce letné dni. Minerálny Veltlín, voňavý Devín a hravé Rosé. Kompletný pitný režim na víkend na chate.",
        name: "Svieži Letný Výber",
        price: 75.0,
        wineNames: [
          "Veltlínske Zelené 2023, Kryomacerácia",
          "Devín 2024, Neskorý zber",
          "Cabernet Sauvignon Rosé 2025",
        ],
      },
      {
        description:
          "Degustačná sada troch úspešných slovenských novošľachtených odrôd. Spoznajte plnosť a robustnosť Dunaja, aromatiku Devína a sviežosť Norie. Objavte slovenské vinárske bohatstvo.",
        name: "Novošľachtence z Karpatov",
        price: 58.0,
        wineNames: [
          "Dunaj 2021, Barrique Exclusive",
          "Devín 2024, Neskorý zber",
          "Noria 2024, Neskorý zber",
        ],
      },
      {
        description:
          "Šesť fliaš šumivého a ružového vína na každú oslavu. Tradičný sekt a hravé Rosé. Pre tých, ktorí chcú oslavovať bez kompromisov.",
        name: "Bublinkové Šialenstvo",
        price: 69.0,
        wineNames: ["Sekt Pálffy, Extra Dry", "Cabernet Sauvignon Rosé 2025"],
      },
      {
        description:
          "Vybrané trio vín pre náročných degustátorov. Petrolový Rizling, aromatická Pálava a silný Alibernet. Ideálny darčekový set pre milovníka slovenského vinárstva.",
        name: "Slovenská Elegancia",
        price: 65.0,
        wineNames: [
          "Rizling Rýnsky 2023, Terroir",
          "Pálava 2024, Výber z hrozna",
          "Alibernet 2022, Barrique",
        ],
      },
      {
        description:
          "Štyri biele vína pre tých, ktorí preferujú elegantné biele. Od suchého Veltlínu cez minerálny Rizling až po aromatickú Pálavu a Devín. Kompletná prehliadka slovenských a moravských bielych vín.",
        name: "Darčekový Výber: Biele Perly",
        price: 68.0,
        wineNames: [
          "Rizling Rýnsky 2023, Terroir",
          "Veltlínske Zelené 2023, Kryomacerácia",
          "Devín 2024, Neskorý zber",
          "Pálava 2024, Výber z hrozna",
        ],
      },
    ],
    city: "Brno",
    description:
      "Prémiový vinársky obchod v srdci Brna s tímom skúseného someliéra. Nesieme výber toho najlepšieho zo slovenského a moravského vinárstva – od klasických odrôd po moderné experimenty. Každé víno v našom portfóliu sme osobne vybrali a ochutnali.",
    email: "info@wine-enjoyers.cz",
    imageUrls: [
      "/uploads/shop/shop_wine_enjoyers.webp",
      "/uploads/shop/shop_s4.webp",
      "/uploads/shop/shop_s5.webp",
    ],
    key: "wine_enjoyers",
    name: "Wine Enjoyers",
    ownerKey: "test_user",
    sourceWinemakerKeys: ["karpatska_perla", "mrva_stanko", "elesko", "sonberk"],
  },

  {
    bundles: [
      {
        description:
          "Dve prémiovné červené vína z južného a malokarpatského Slovenska. Mohutný Dunaj od Karpatskej Perle a ľahká Rosé od Eleskovcov. Ideálna kombinácia pre večeru.",
        name: "Červené Duo Juhu Slovenska",
        price: 42.0,
        wineNames: ["Dunaj 2021, Barrique Exclusive", "Cabernet Sauvignon Rosé 2025"],
      },
      {
        description:
          "Dvojica bielych vín pre fanúšikov sviežej aromatiky. Minerálny Rizling z juhu a kryomacerovaný Veltlín z Modry. Skvelé k morským plodom a ľahkej kuchyni.",
        name: "Elegantné Slovenské Biele",
        price: 37.0,
        wineNames: ["Rizling Rýnsky 2023, Terroir", "Veltlínske Zelené 2023, Kryomacerácia"],
      },
      {
        description:
          "Tri sviežé vína na teplé ostravské leto. Devín, Rosé a Veltlín — ideálni spoločníci na grilovačku.",
        name: "Letný Ostravský Set",
        price: 41.0,
        wineNames: [
          "Devín 2024, Neskorý zber",
          "Cabernet Sauvignon Rosé 2025",
          "Veltlínske Zelené 2023, Kryomacerácia",
        ],
      },
    ],
    city: "Ostrava",
    description:
      "Vinársky obchod s dlholetou tradíciou v centre Ostravy. Špecializujeme sa na slovenské červené vína a sviežu Malokarpatskú produkciu. Naším cieľom je priniesť slovenské vinárske bohatstvo priamo do Moravskosliezskeho kraja.",
    email: "info@ostravsky-sklep.cz",
    imageUrls: ["/uploads/shop/shop_ostrava.webp", "/uploads/shop/shop_s6.webp"],
    key: "ostravsky_sklep",
    name: "Ostravský Vinný Sklep",
    ownerKey: null,
    sourceWinemakerKeys: ["karpatska_perla", "elesko"],
  },

  {
    bundles: [
      {
        description:
          "Tri aromatické biele vína pre tých, ktorí milujú bohaté vône a extraktívnu chuť. Pálava, Noria a Devín — najlepšie slovenské a moravské aromatické odrody pohromade.",
        name: "Aromatické Biele Trio",
        price: 48.0,
        wineNames: [
          "Pálava 2024, Výber z hrozna",
          "Noria 2024, Neskorý zber",
          "Devín 2024, Neskorý zber",
        ],
      },
      {
        description:
          "Trio červených vín z westernú Slovenského vinohradníctva. Frankovka a Alibernet od Mrva & Stanko spolu s ľahkou Rosé od Eleskovcov. Klasika a modernosť v jednom.",
        name: "Slovenský Západ: Červené Výber",
        price: 40.0,
        wineNames: ["Frankovka Modrá 2020, Varieto", "Alibernet 2022, Barrique"],
      },
      {
        description:
          "Sekt Pálffy a Pálava — dokonalá kombinácia na každú slávnosť. Bublinky na otvorenie a zlatistá aromatická Pálava k dezertom. Kompletný vinársky zážitok pre špeciálny večer.",
        name: "Slavnostný Prípitok",
        price: 37.0,
        wineNames: ["Sekt Pálffy, Extra Dry", "Pálava 2024, Výber z hrozna"],
      },
    ],
    city: "Bratislava",
    description:
      "Prémiová vinotéka v centre Bratislavy s dôrazom na moravské a stredoeurópske vína. Ponúkame osobný prístup, odborné poradenstvo a pravidelné degustačné večery. Naša kolekcia Sonberku a slovenských novošľachtencov je unikátna v rámci celého mesta.",
    email: "info@vinoteka-bratislava.sk",
    imageUrls: ["/uploads/shop/shop_bratislava.webp", "/uploads/shop/shop_s7.webp"],
    key: "vinoteka_bratislava",
    name: "Vinotéka Bratislava",
    ownerKey: null,
    sourceWinemakerKeys: ["mrva_stanko", "sonberk", "elesko"],
  },

  {
    bundles: [
      {
        description: "Kompletná výbava pre prežitie brněnskej noci. Tri lahve, žiadne otázky.",
        name: "Nočná Záchranná Sada",
        price: 29,
        wineNames: ["Modrý Blesk 2024", "Hradní Svíce Black Label", "Brněnský Drak"],
      },
      {
        description:
          "Dve lahve pre dlhé nočné štúdium pred skúškami. Overené generáciami študentov.",
        name: "Zkouškové Prežitie",
        price: 25,
        wineNames: ["Slzy Zkouškového", "Modrý Blesk 2024"],
      },
    ],
    city: "Brno - Centrum",
    description:
      "Posledný maják nádeje v oceáne brnianskej noci. Ponúkame exkluzívny výber vín a bagety, ktoré majú viac skúseností ako tvoj priemerný profesor na FI.",
    email: "zachrana@vecerka.sk",
    imageUrls: ["/uploads/shop/vecerka_u_joska.webp", "/uploads/shop/shop_s5.webp"],
    key: "vecerka_posledna_zachrana",
    name: "Večerka Posledná Záchrana",
    ownerKey: "test_user",
    sourceWinemakerKeys: ["lavicka", "vinarska"],
  },

  {
    bundles: [
      {
        description:
          "Dve vína pre skutočných miliardárov. Diamond Infusion a Liquid Arrogance. Na daňové odpisy odporúčame konzultáciu s vašim advokátom.",
        name: "Offshorový Balíček",
        price: 120000,
        wineNames: ["Diamond Infusion Cuvée", "Liquid Arrogance"],
      },
    ],
    city: "Brno - Nové Sady",
    description:
      "Miesto tak exkluzívne, že aj tvoj tieň potrebuje previerku od SIS. Naše vína sú tak drahé, že po ich kúpe ti zostane už len na suchý rohlík z vedľajšej Večerky.",
    email: "bunker@miliardari.biz",
    key: "miliardarsky_bunker",
    name: "Miliardársky Bunker",
    ownerKey: null,
    // intentionally no imageUrls — shows shop.webp placeholder
    sourceWinemakerKeys: ["ego", "oligarch"],
  },
];

// ── Curated story interactions ────────────────────────────────────────────────
export const STORY = {
  jana: {
    eventRegistrations: ["karpatska_perla-0", "mrva_stanko-0"],
    orders: [
      {
        items: [
          {
            quantity: 2,
            winemakerId: "karpatska_perla",
            wineName: "Dunaj 2021, Barrique Exclusive",
          },
          { quantity: 1, winemakerId: "karpatska_perla", wineName: "Rizling Rýnsky 2023, Terroir" },
        ],
        shopKey: "wine_enjoyers",
        status: "delivered" as const,
      },
      {
        items: [
          { quantity: 1, winemakerId: "elesko", wineName: "Cabernet Sauvignon Rosé 2025" },
          { quantity: 2, winemakerId: "elesko", wineName: "Devín 2024, Neskorý zber" },
        ],
        shopKey: "wine_enjoyers",
        status: "delivered" as const,
      },
    ],
    productReviews: [
      {
        body: "Dunaj 2021 od Karpatskej Perle je víno, pre ktoré sa oplatí žiť. K hovädziej roštenke absolútna klasika.",
        rating: 5,
        shopKey: "wine_enjoyers",
        winemakerId: "karpatska_perla",
        wineName: "Dunaj 2021, Barrique Exclusive",
      },
    ],
    winemakerReviews: [
      {
        body: "Karpatská Perla je to najlepšie, čo sa stalo slovenským červeným vínam. Gratulujem pánovi Štefánikovi.",
        rating: 5,
        winemakerId: "karpatska_perla",
      },
    ],
  },
  petr: {
    eventRegistrations: ["mrva_stanko-0", "karpatska_perla-0"],
    orders: [
      {
        items: [
          {
            quantity: 2,
            winemakerId: "karpatska_perla",
            wineName: "Dunaj 2021, Barrique Exclusive",
          },
          { quantity: 1, winemakerId: "elesko", wineName: "Veltlínske Zelené 2023, Kryomacerácia" },
        ],
        shopKey: "ostravsky_sklep",
        status: "delivered" as const,
      },
    ],
    productReviews: [
      {
        body: "Dunaj 2021 od Karpatskej Perle je víno, ktoré som dlho hľadal. K diviaciemu gulášu absolútne neprekonateľné.",
        rating: 5,
        shopKey: "ostravsky_sklep",
        winemakerId: "karpatska_perla",
        wineName: "Dunaj 2021, Barrique Exclusive",
      },
    ],
    winemakerReviews: [
      {
        body: "Karpatská Perla je revelácia pre milovníkov slovenských červených vín. Dunaj v tomto ročníku je výnimočný.",
        rating: 5,
        winemakerId: "karpatska_perla",
      },
    ],
  },
};

// ── Fallback content for faker ────────────────────────────────────────────────
export const FALLBACK_REVIEWS = [
  "Výborné víno, odporúčam každému milovníkovi kvality.",
  "Skvelý pomer cena/výkon. Kupujem pravidelne.",
  "Svieže, čisté víno s peknou dochuťou. Spokojný zákazník.",
  "Párovanie s grilovaným mäsom bolo vynikajúce.",
  "Elegantné víno s dobrým potenciálom zrenia.",
  "Príjemne ma prekvapilo. Vrátim sa pre viac.",
  "Čistá odroda, dobre vyjadrený terroir. Palec hore.",
  "Ideálne na stretnutia s priateľmi. Ľahké a pitné.",
];

export const FALLBACK_EVENT_COMMENTS = [
  "Už sa na tuhle akci moc těším!",
  "Hledám doprovod, má někdo volno?",
  "Bude se nalévat hned od začátku?",
  "Doufám, že bude skvělá atmosféra jako minule.",
  "Reservujem si miesto pre dvoch!",
  "Skvelá akcia, bol som tu minule a bolo to úžasné.",
];
