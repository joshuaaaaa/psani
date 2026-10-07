'use strict';
// Texty pro cvičení. Slova se filtrují podle písmen, která už žák zná.
const DATA = (() => {
  const WORDS = `
a ale ach aha akce akt alej alba album anděl ano archa asi auto autor
baba babička balík balon banka barva báseň bažina bedna běh běžet bez beton bída bílý blízko bláto blesk blok bobr boj bolest bota bouře brada brambor brána brát bratr brod brouk brzy bude budova bych byl byla bylo byt být bydlet
cela celek celý cena cesta cestovat cibule cíl cit cítit citron cizí cukr cvičit cvičení cyklista
čaj čáp čas často čekat čelo černý čerstvý červený česky český četa čí čin činnost číslo číst článek člověk člun čtení čtvrtek čtyři
dal dala dalo daleko další dar dárek dát datum dcera děda dědeček dech deka deset deska déšť dětství děti dílo divadlo dívka dlaň dlouho dlouhý dnes dobrý dobře docela dodat doklad doktor dole doma domov domů dopis doprava dost dostat dovolená drak drahý druh druhý drž držet dub duha duše dva dvacet dveře dvůr dům dýchat
ekonomie elektřina energie
fakt farma fazole fialový film firma flétna fotka fotbal fronta fungovat
galaxie garáž gauč gól guma
had hádat hala hlad hlas hlava hledat hlídat hlína hloupý hluk hned hnědý hodina hodiny hodně holka hora horký hospoda host hotel hotovo houba housle hra hrad hrát hračka hrnek hrozný hruška hřiště hudba hůl hvězda
chata chladno chléb chlapec chodit chodník chtít chuť chudý chvíle chyba chytrý
i idea ihned informace
já jablko jahoda jak jaký jaro jasný jazyk jde jdu jedna jeden jedno jehla jeho jejich jelen jemný jen jenom jestli jet jezero jídlo jih jinak jiný jíst již jít jízda jméno
kabát kachna kalhoty kam kámen kamarád kapr kapsa kaše káva každý kde kdo kdy když kino klávesa klid klíč kluk kniha kočka kolo konec konev kopec koruna kost košile koupit kousek kráva krása krásný kraj krajina krátký krev kropit kruh kuchyně kudy kufr kus květ květina kytara
laskavý látka lavice lázně led leden lehký lék lékař les let léto letadlo levý lev lidé lípa list listopad lístek loď  loket lopata louka ložnice luk lžíce
máma maminka malý málo malina mapa mrak mít mlýn moc moře most motor moudrý mouka mrkev muset muž můj my mýdlo myš myslet
na nad nahoru najít nákup nalevo náměstí napravo národ náš nebe nebo něco neděle někdo někdy není nést nic nikdo noc noha nos nový nůž
o oba obchod oběd obec obloha oblek obraz obrázek oči odpověď oheň okno oko on ona oni ono opravdu oranžový oslava osel otec otevřít ovoce ovce
pak palec pan paní papír park pátek patro péct pečivo pekař pero pes písek píseň pít pivo plavat plot pod podzim pokoj pole polévka pomalu pomoc pondělí pták poslední postel potok práce pracovat pravda pravý pro proč prosím prsten první přítel příroda půda
rád rádio rameno rok rodina rodiče roh rohlík rostlina rovně ruka rukavice rychle rychlý ryba rýže řeka řeč říct říjen řidič
sad sál sám sedm sejít sestra sever sídlo síla silnice sklep sklo skoro skříň slabý sladký slavný slovo slunce smát sníh snídaně sobota sova spát spolu sport srdce stát starý stav stůl strom středa student suchý svět světlo svetr sýr
šála šaty šest šeptat široký škola šplhat štěstí šťastný šuplík
tady tak také tam tanec táta teď teplo teplý tichý tráva trh trochu tričko trubka tma tu tužka tvar týden typ
u učit učitel ucho úkol ulice umět úsměv úterý uvidět už užít
v váza vědět večer večeře velký veselý vesnice vidět vítr voda vlak vlas vlna voják volno  vůz vzduch vždy
z za záda zahrada zajíc zámek západ zase zástěra zavřít zelený země zima zítra zlato zlatý zmrzlina známý zpívat zprávy zub zvíře zvon
žába žádný žák žena žlutý život živý
sada slaď dlaha kasa hlas dal had sad lak jak hala lada sklad  jedla  dala kalhoty hledala sklad jahody lada hala salaš
ses lesk ples les lesa sele sedla jelen jeli seděl deka  kde hle hledej sledej sejdi  ideál
kreslit krk skrýš sluha skutek strach tvrdý tvář trolej rostla ostrov ruda tuha trup stroj
pozor  koza zuby  puding  poprvé pospíchat pole pilot pirát pokus podpis
lovec vlk mrkev mlha kavka vrba vosa voják mávat malovat klubko kolečko cvik cukrovar most
banán bobule nebe nábytek běhat budík bubeník nabídka barevný bobek bonbon
počítač klávesnice obrazovka myška program internet aplikace soubor složka tiskárna
cvičení písmeno slabika věta odstavec rychlost přesnost úhoz chybovost trénink lekce
spolužák tělocvična přestávka svačina vysvědčení prázdniny vyučování tabule sešit penál
nádraží jízdenka zastávka autobus tramvaj metro letiště přístav silnice dálnice
`;

  const COMMON = `a se na je že v to s z do o i k ve by ale jak tak co jsem být který pro jeho jako už jen po si ten za od mít když také než jsou jsme není bylo byl ještě mi jsi nebo při jejich aby další všechno my vy oni ona on já ty tady tam kde kdy proč protože teď dnes zítra včera velmi moc hodně málo dobře rok den čas člověk lidé práce život svět dům město země voda ruka oko hlava slovo věc místo cesta otázka škola dítě rodina mluvit říct vědět chtít moci muset jít dělat vidět dát přijít nový starý velký malý dobrý první druhý celý jiný sám každý všichni nic něco někdo nikdo tento tato toto`;

  const SENTENCES = [
    'Babička peče v neděli jablečný koláč.',
    'Vlak do Brna odjíždí z prvního nástupiště.',
    'Na zahradě kvetou růže a tulipány.',
    'Pes štěká na pošťáka každé ráno.',
    'Kdo jinému jámu kopá, sám do ní padá.',
    'Ve škole se učíme psát všemi deseti prsty.',
    'Máma koupila v obchodě chleba, máslo a mléko.',
    'Za oknem prší a vítr ohýbá stromy.',
    'Petr hraje na kytaru a Jana zpívá.',
    'Řeka Vltava protéká Prahou.',
    'V lese jsme našli hodně hub.',
    'Zítra pojedeme na výlet do hor.',
    'Kočka spí na gauči u okna.',
    'Děti stavěly na pláži hrad z písku.',
    'Na stole leží kniha, pero a sešit.',
    'Dědeček vypráví příběhy z dětství.',
    'Pomalu a přesně je lepší než rychle a s chybami.',
    'V zimě bobujeme na kopci za vesnicí.',
    'Moje sestra studuje medicínu.',
    'Večer se díváme na hvězdy.',
    'Jak se jmenuješ a kde bydlíš?',
    'Proč je nebe modré?',
    'Pozor, schod!',
    'To je ale krásný den!',
    'Nakup: chleba, sýr, rajčata a jablka.',
    'Upozornění: obchod bude zavřený.',
    'Prosím, zavři okno; je tu zima.',
    'Pan Novák (náš soused) má nové auto.',
    'Napiš mi zprávu, až dorazíš domů.',
    'Kniha "Malý princ" je moje oblíbená.',
    'Sleva činí 20 % z původní ceny.',
    'Kolik je hodin? Je přesně půl osmé.',
    'Ahoj! Jak se máš?',
    'Turisté vystoupali až na vrchol Sněžky.',
    'Hasiči rychle uhasili požár stodoly.',
    'Ryby plavou v čisté vodě rybníka.',
    'Učitel napsal na tabuli nové slovo.',
    'Na podzim padá z javorů barevné listí.',
    'Medvěd hledal v lese med a maliny.',
    'Ondřej rád čte detektivky.',
    'Ťuk, ťuk, kdo je za dveřmi?',
    'Loďka se houpala na vlnách.',
    'Ó, jak je tu krásně!',
    'Úterý je druhý den v týdnu.',
    'Ústí nad Labem leží na severu Čech.',
    'Žluťoučký kůň úpěl ďábelské ódy.',
    'Příliš žluťoučký kůň úpěl ďábelské ódy.',
    'Čtyři sta čtyřicet čtyři stříbrných stříkaček stříkalo přes čtyři sta čtyřicet čtyři stříbrných střech.',
    'Strč prst skrz krk.',
    'Šel pes do lesa a nevrátil se.',
    'Rychlá hnědá liška skáče přes líného psa.',
    'Tatínek opravuje kolo v garáži.',
    'Eva a Adam jedou na kole k jezeru.',
    'Zdeněk vyhrál závod v běhu.',
    'Igor je kamarád z Ostravy.',
  ];

  const PROVERBS = [
    'Bez práce nejsou koláče.',
    'Kdo se moc ptá, moc se dozví.',
    'Ranní ptáče dál doskáče.',
    'Lepší vrabec v hrsti nežli holub na střeše.',
    'Kdo jinému jámu kopá, sám do ní padá.',
    'Mluviti stříbro, mlčeti zlato.',
    'Opakování je matka moudrosti.',
    'Komu se nelení, tomu se zelení.',
    'Kdo maže, ten jede.',
    'Všeho moc škodí.',
    'Tichá voda břehy mele.',
    'Jablko nepadá daleko od stromu.',
    'Ráno moudřejší večera.',
    'Co se v mládí naučíš, ve stáří jako když najdeš.',
    'Kdo chce psa bít, hůl si vždycky najde.',
    'Darovanému koni na zuby nehleď.',
    'Kdo hledá, najde.',
    'Pomalu jdi, dál dojdeš.',
    'Dvakrát měř, jednou řež.',
    'Co můžeš udělat dnes, neodkládej na zítřek.',
    'Těžko na cvičišti, lehko na bojišti.',
    'Bez peněz do hospody nelez.',
    'Kdo seje vítr, sklízí bouři.',
    'Hlad je nejlepší kuchař.',
    'I mistr tesař se někdy utne.',
    'Kde se dva perou, třetí se směje.',
    'Kdo nic nedělá, nic nezkazí.',
    'Na každém šprochu pravdy trochu.',
    'Sejde z očí, sejde z mysli.',
    'Trpělivost růže přináší.',
  ];

  const TEXTS = [
    { title: 'Proč psát všemi deseti', text: 'Psaní všemi deseti je dovednost, která se vyplatí celý život. Kdo píše bez dívání na klávesnici, může se soustředit na to, co chce sdělit, a ne na hledání písmen. Na začátku je to pomalé a ruce se pletou, ale po několika týdnech pravidelného cvičení se prsty naučí cestu samy. Důležité je cvičit krátce a často, raději deset minut každý den než dvě hodiny jednou za týden. Přesnost je důležitější než rychlost. Rychlost přijde sama.' },
    { title: 'Jaro na vesnici', text: 'Když na jaře roztaje sníh, vesnice se probouzí. Na zahradách se objevují první sněženky a petrklíče, ptáci se vracejí z teplých krajin a staví si hnízda pod střechami. Sedláci vyjíždějí na pole a orají půdu, aby mohli zasít obilí. Děti pouštějí po potoce lodičky z kůry a babičky sedí na lavičce před domem. Vzduch voní čerstvou trávou a celý den je slyšet bzučení včel.' },
    { title: 'Praha', text: 'Praha je hlavní město České republiky a leží na řece Vltavě. Každý rok ji navštíví miliony turistů z celého světa. Nejznámější památkou je Pražský hrad, který stojí na kopci nad Malou Stranou. Ke hradu vede Karlův most, ozdobený třiceti sochami světců. Na Staroměstském náměstí se lidé scházejí u orloje, aby viděli, jak se každou celou hodinu v okénkách objevují apoštolové.' },
    { title: 'Počítače', text: 'První počítače byly obrovské stroje, které zabíraly celé místnosti a vážily mnoho tun. Pracovaly s nimi jen vědci a inženýři. Dnes nosíme v kapse telefon, který je tisíckrát výkonnější. Přesto zůstala klávesnice jedním z nejdůležitějších způsobů, jak s počítačem komunikovat. Rozložení kláves pochází ještě z dob psacích strojů a od té doby se změnilo jen málo.' },
    { title: 'V lese', text: 'Les je domovem mnoha zvířat a rostlin. Ve stínu starých buků a smrků rostou houby, borůvky a kapradiny. Veverka skáče z větve na větev a sbírá oříšky na zimu. Datel bubnuje do kmene a hledá pod kůrou hmyz. Pokud budeme potichu, můžeme zahlédnout srnu, jak se pase na pasece. Les nás chrání před větrem, čistí vzduch a dává nám dřevo.' },
    { title: 'Čaj o páté', text: 'Čaj se pije už tisíce let. Pochází z Číny, odkud se rozšířil do celého světa. Angličané si oblíbili odpolední čaj s mlékem a malým pečivem. U nás se nejčastěji pije čaj s citronem a medem, hlavně když je venku zima nebo když nás bolí v krku. Bylinkové čaje z máty, heřmánku nebo lípy si můžeme nasbírat i sami na louce.' },
    { title: 'Běhání', text: 'Běh je jeden z nejjednodušších sportů. Nepotřebujeme drahé vybavení, stačí pohodlné boty a trocha vůle. Začátečníci by měli běhat pomalu a střídat běh s chůzí. Tělo si postupně zvykne a za několik týdnů uběhneme bez zastavení i pět kilometrů. Pravidelný pohyb posiluje srdce, zlepšuje náladu a pomáhá lépe spát.' },
    { title: 'Vesmír', text: 'Když se za jasné noci podíváme na oblohu, uvidíme tisíce hvězd. Každá z nich je slunce, mnohdy větší než to naše. Světlo některých hvězd k nám letí stovky let, takže je vidíme takové, jaké byly dávno v minulosti. Naše Země obíhá kolem Slunce spolu s dalšími sedmi planetami. Největší z nich je Jupiter, nejbližší Merkur.' },
    { title: 'Spánek', text: 'Spánek je pro zdraví stejně důležitý jako jídlo a pohyb. Během noci si mozek třídí všechno, co se přes den naučil, a tělo odpočívá a obnovuje síly. Děti potřebují spát deset i více hodin, dospělí kolem osmi. Před spaním je dobré vypnout obrazovky, vyvětrat ložnici a chodit spát každý den ve stejnou dobu.' },
    { title: 'Knihovna', text: 'V knihovně je ticho a voní to papírem. Na dlouhých regálech stojí tisíce knih, od pohádek přes romány až po odborné encyklopedie. Knihovnice nám poradí, co si vybrat, a půjčí knihu na celý měsíc zdarma. Čtení rozšiřuje slovní zásobu, zlepšuje pravopis a rozvíjí fantazii. Kdo hodně čte, ten také lépe píše.' },
    { title: 'Cesta vlakem', text: 'Cestování vlakem má své kouzlo. Za oknem ubíhají pole, lesy a malé vesnice s kostelíky. Můžeme si číst, povídat si nebo jen tak koukat ven. Průvodčí projde vagonem a zkontroluje jízdenky. Na větších nádražích vlak stojí několik minut, takže si můžeme koupit kávu. Do cíle dorazíme odpočatí a bez starostí s parkováním.' },
    { title: 'Bramborová polévka', text: 'Na bramborovou polévku potřebujeme brambory, mrkev, celer, cibuli, houby a trochu másla. Cibuli osmahneme na másle, přidáme nakrájenou zeleninu a zalijeme vodou. Vaříme asi dvacet minut, dokud zelenina nezměkne. Nakonec přidáme brambory, sušené houby, majoránku, česnek a sůl. Hotovou polévku podáváme s chlebem. Dobrou chuť!' },
    { title: 'Krkonoše', text: 'Krkonoše jsou nejvyšší pohoří v Česku. Na jejich hřebenech leží Sněžka, která měří tisíc šest set dva metry. V zimě sem jezdí lyžaři a v létě turisté, kteří chodí po značených cestách mezi horskými boudami. Podle pověsti v horách vládne Krakonoš, vousatý pán hor, který pomáhá poctivým lidem a trestá zlé a líné.' },
    { title: 'Klávesnice', text: 'Základní řada klávesnice je místo, kam se prsty vždy vracejí. Levá ruka leží na písmenech A, S, D a F, pravá na J, K, L a Ů. Na klávesách F a J jsou malé výstupky, podle kterých najdeme správnou polohu i bez dívání. Palce odpočívají na mezerníku. Každý prst má na starosti jen svůj sloupec kláves, a proto se nikdy nemusí natahovat daleko.' },
  ];

  const NUM_TEMPLATES = [
    'Dne {d}. {m}. {y} jsme jeli na výlet.',
    'Vlak odjíždí v {h}:{mm} z nástupiště {s}.',
    'Kniha stojí {p} Kč a sešit {s} Kč.',
    'Naše třída má {t} žáků.',
    'Do cíle zbývá {k} km.',
    'Telefon: {tel}',
    'Bydlím v ulici Lipová {s}, PSČ {psc}.',
    'Rok {y} byl velmi teplý.',
    'Na koncert přišlo {n} lidí.',
    'Sněžka měří 1603 m.',
    'Teplota vystoupala na {t} stupňů.',
    'Objednávka číslo {n} byla odeslána.',
    'Za {s} dny začínají prázdniny.',
    'Vypočítej {s} krát {t}.',
    'Mám {t} let a sestra {s}.',
  ];

  function words(str) { return str.split(/\s+/).filter(Boolean); }

  return {
    WORDS: Array.from(new Set(words(WORDS))),
    COMMON: words(COMMON),
    SENTENCES, PROVERBS, TEXTS, NUM_TEMPLATES,
  };
})();
