/**
 * Club reference content for the Club page, in AR / FR / EN.
 * Source: French Wikipedia, "Wydad Athletic Club (football)", read on 22 Oct 2026.
 * Only facts stated there are kept; figures the article contradicts itself on are left out.
 */

export type L10n = { ar: string; fr: string; en: string };

export const CLUB_SOURCE_URL = 'https://fr.wikipedia.org/wiki/Wydad_Athletic_Club_(football)';

export interface TimelineEntry {
  year: string;
  title: L10n;
  text: L10n;
}

export const TIMELINE: TimelineEntry[] = [
  {
    year: '1937',
    title: { fr: 'Naissance du Wydad', en: 'Wydad is born', ar: 'ميلاد الوداد' },
    text: {
      fr: 'Le 8 mai 1937, dans l’ancienne médina de Casablanca, un groupe de patriotes autour de Hajj Mohamed Ben Lahcen Ould Affani fonde le Wydad Athletic Club.',
      en: 'On 8 May 1937, in Casablanca’s old medina, a group of patriots around Hajj Mohamed Ben Lahcen Ould Affani founds Wydad Athletic Club.',
      ar: 'في 8 ماي 1937، بالمدينة القديمة للدار البيضاء، أسست مجموعة من الوطنيين حول الحاج محمد بن لحسن ولد العفاني نادي الوداد الرياضي.',
    },
  },
  {
    year: '1939',
    title: { fr: 'La section football', en: 'The football section', ar: 'فرع كرة القدم' },
    text: {
      fr: 'Création de la section football, dirigée par le Père Jégo, premier directeur et entraîneur. Premier match : victoire 3-1 face à la réserve de l’US Marocaine.',
      en: 'The football section is created, led by Père Jégo, its first director and coach. First match: a 3-1 win over US Marocaine’s reserves.',
      ar: 'إحداث فرع كرة القدم تحت إشراف الأب جيغو، أول مدير ومدرب للفريق. أول مباراة: فوز بثلاثة أهداف لهدف على رديف الاتحاد الرياضي المغربي.',
    },
  },
  {
    year: '1948',
    title: { fr: 'Premier titre de champion', en: 'First league title', ar: 'أول لقب للبطولة' },
    text: {
      fr: 'Champion du Maroc 1947-48, le Wydad remporte aussi le championnat d’Afrique du Nord, qu’il conservera en 1949 et 1950.',
      en: 'Moroccan champions in 1947-48, Wydad also win the North African Championship, retaining it in 1949 and 1950.',
      ar: 'بطل المغرب في موسم 1947-1948، ويتوج الوداد أيضاً ببطولة شمال إفريقيا التي احتفظ بها سنتي 1949 و1950.',
    },
  },
  {
    year: '1956',
    title: { fr: 'Coupe de l’Indépendance', en: 'Independence Cup', ar: 'كأس الاستقلال' },
    text: {
      fr: 'L’année de l’indépendance, le Wydad remporte la Coupe de l’Indépendance et reçoit le matricule n° 1 de la Fédération royale marocaine de football.',
      en: 'In the year of independence, Wydad win the Independence Cup and receive registration number 1 from the Royal Moroccan Football Federation.',
      ar: 'في سنة الاستقلال، يفوز الوداد بكأس الاستقلال ويحصل على الرقم 1 في سجل الجامعة الملكية المغربية لكرة القدم.',
    },
  },
  {
    year: '1970',
    title: { fr: 'Première Coupe du Trône', en: 'First Throne Cup', ar: 'أول كأس للعرش' },
    text: {
      fr: 'Le Wydad soulève sa première Coupe du Trône en battant le RS Settat 1-0 en finale.',
      en: 'Wydad lift their first Throne Cup, beating RS Settat 1-0 in the final.',
      ar: 'الوداد يحرز أول كأس للعرش في تاريخه بفوزه على النهضة السطاتية بهدف دون رد في المباراة النهائية.',
    },
  },
  {
    year: '1989',
    title: { fr: 'Champion arabe', en: 'Arab champions', ar: 'بطل العرب' },
    text: {
      fr: 'Premier club marocain à remporter la Coupe arabe des clubs champions.',
      en: 'The first Moroccan club to win the Arab Club Champions Cup.',
      ar: 'أول نادٍ مغربي يتوج بكأس الأندية العربية البطلة.',
    },
  },
  {
    year: '1992',
    title: { fr: 'Le sacre africain', en: 'Champions of Africa', ar: 'التتويج الإفريقي' },
    text: {
      fr: 'Premier titre en Coupe d’Afrique des clubs champions, l’actuelle Ligue des champions de la CAF.',
      en: 'First African Cup of Champions Clubs, today’s CAF Champions League.',
      ar: 'أول لقب في كأس إفريقيا للأندية البطلة، دوري أبطال إفريقيا حالياً.',
    },
  },
  {
    year: '2002',
    title: { fr: 'Coupe des vainqueurs de coupe', en: 'Cup Winners’ Cup', ar: 'كأس الكؤوس الإفريقية' },
    text: {
      fr: 'Le Wydad remporte la Coupe d’Afrique des vainqueurs de coupe.',
      en: 'Wydad win the African Cup Winners’ Cup.',
      ar: 'الوداد يتوج بكأس إفريقيا للأندية الفائزة بالكؤوس.',
    },
  },
  {
    year: '2017',
    title: { fr: 'Deuxième étoile africaine', en: 'Second African crown', ar: 'النجمة الإفريقية الثانية' },
    text: {
      fr: 'Victoire en finale de la Ligue des champions de la CAF face à Al Ahly, puis la Supercoupe de la CAF dans la foulée.',
      en: 'CAF Champions League final won against Al Ahly, followed by the CAF Super Cup.',
      ar: 'الفوز بنهائي دوري أبطال إفريقيا أمام الأهلي المصري، ثم التتويج بالكأس الإفريقية الممتازة.',
    },
  },
  {
    year: '2022',
    title: { fr: 'Le doublé', en: 'The double', ar: 'الثنائية' },
    text: {
      fr: 'Troisième Ligue des champions de la CAF et 22e titre de champion du Maroc, un record.',
      en: 'Third CAF Champions League and a record 22nd Moroccan league title.',
      ar: 'ثالث لقب في دوري أبطال إفريقيا واللقب الثاني والعشرون للبطولة الوطنية، وهو رقم قياسي.',
    },
  },
  {
    year: '2025',
    title: { fr: 'Coupe du monde des clubs', en: 'Club World Cup', ar: 'كأس العالم للأندية' },
    text: {
      fr: 'Le Wydad fait partie des quatre clubs africains de la première Coupe du monde des clubs de la FIFA à 32 équipes, aux États-Unis.',
      en: 'Wydad are one of the four African clubs at the first 32-team FIFA Club World Cup, in the United States.',
      ar: 'الوداد ضمن الأندية الإفريقية الأربعة المشاركة في أول نسخة من كأس العالم للأندية بمشاركة 32 فريقاً بالولايات المتحدة.',
    },
  },
];

export interface Trophy {
  name: L10n;
  years: string[];
}

export const TROPHIES_NATIONAL: Trophy[] = [
  {
    name: { fr: 'Championnat du Maroc', en: 'Moroccan Championship', ar: 'البطولة الوطنية' },
    years: ['1947-48', '1948-49', '1949-50', '1950-51', '1954-55', '1956-57', '1965-66', '1968-69', '1975-76', '1976-77', '1977-78', '1985-86', '1989-90', '1990-91', '1992-93', '2005-06', '2009-10', '2014-15', '2016-17', '2018-19', '2020-21', '2021-22'],
  },
  {
    name: { fr: 'Coupe du Trône', en: 'Throne Cup', ar: 'كأس العرش' },
    years: ['1969-70', '1977-78', '1978-79', '1980-81', '1988-89', '1993-94', '1996-97', '1997-98', '2000-01'],
  },
  {
    name: { fr: 'Coupe de l’Indépendance', en: 'Independence Cup', ar: 'كأس الاستقلال' },
    years: ['1956'],
  },
];

export const TROPHIES_INTERNATIONAL: Trophy[] = [
  {
    name: { fr: 'Ligue des champions de la CAF', en: 'CAF Champions League', ar: 'دوري أبطال إفريقيا' },
    years: ['1992', '2017', '2021-22'],
  },
  {
    name: { fr: 'Coupe d’Afrique des vainqueurs de coupe', en: 'African Cup Winners’ Cup', ar: 'كأس إفريقيا للأندية الفائزة بالكؤوس' },
    years: ['2002'],
  },
  {
    name: { fr: 'Supercoupe de la CAF', en: 'CAF Super Cup', ar: 'كأس السوبر الإفريقي' },
    years: ['2018'],
  },
  {
    name: { fr: 'Coupe afro-asiatique', en: 'Afro-Asian Club Championship', ar: 'الكأس الأفرو-آسيوية' },
    years: ['1993'],
  },
  {
    name: { fr: 'Coupe arabe des clubs champions', en: 'Arab Club Champions Cup', ar: 'كأس الأندية العربية البطلة' },
    years: ['1989'],
  },
  {
    name: { fr: 'Championnat d’Afrique du Nord', en: 'North African Championship', ar: 'بطولة شمال إفريقيا' },
    years: ['1948', '1949', '1950'],
  },
];

export interface Figure {
  name: L10n;
  role: L10n;
  text: L10n;
}

export const FIGURES: Figure[] = [
  {
    name: { fr: 'Mohamed Benjelloun Touimi', en: 'Mohamed Benjelloun Touimi', ar: 'محمد بنجلون التويمي' },
    role: { fr: 'Président-fondateur', en: 'Founding president', ar: 'الرئيس المؤسس' },
    text: {
      fr: 'À l’origine du club en 1937 et de sa section football. Le complexe du club porte son nom.',
      en: 'Behind the club’s creation in 1937 and its football section. The club’s training complex bears his name.',
      ar: 'وراء تأسيس النادي سنة 1937 وفرع كرة القدم. يحمل مركب النادي اسمه.',
    },
  },
  {
    name: { fr: 'Père Jégo', en: 'Père Jégo', ar: 'الأب جيغو' },
    role: { fr: 'Premier entraîneur', en: 'First coach', ar: 'أول مدرب' },
    text: {
      fr: 'Premier directeur et entraîneur de la section football, de sa création en 1939 aux premiers titres.',
      en: 'First director and coach of the football section, from its creation in 1939 to the first titles.',
      ar: 'أول مدير ومدرب لفرع كرة القدم، منذ تأسيسه سنة 1939 إلى غاية الألقاب الأولى.',
    },
  },
  {
    name: { fr: 'Mohamed Masson', en: 'Mohamed Masson', ar: 'محمد ماسون' },
    role: { fr: 'Entraîneur', en: 'Coach', ar: 'مدرب' },
    text: {
      fr: 'Entraîneur emblématique des années 1950 et 1960, il a aussi dirigé la sélection marocaine.',
      en: 'Emblematic coach of the 1950s and 1960s, he also managed the Moroccan national team.',
      ar: 'مدرب بارز في خمسينيات وستينيات القرن الماضي، وأشرف أيضاً على المنتخب المغربي.',
    },
  },
  {
    name: { fr: 'Badou Zaki', en: 'Badou Zaki', ar: 'بادو الزاكي' },
    role: { fr: 'Gardien formé au club', en: 'Academy goalkeeper', ar: 'حارس من خريجي النادي' },
    text: {
      fr: 'Formé au Wydad, il devient l’un des plus grands gardiens de l’histoire du football marocain.',
      en: 'Trained at Wydad, he became one of the greatest goalkeepers in Moroccan football history.',
      ar: 'تكوّن في الوداد وأصبح من أعظم حراس المرمى في تاريخ كرة القدم المغربية.',
    },
  },
  {
    name: { fr: 'Abdelmajid Shaita', en: 'Abdelmajid Shaita', ar: 'عبد المجيد شيتا' },
    role: { fr: 'Formé au club', en: 'Academy product', ar: 'من خريجي النادي' },
    text: {
      fr: 'Autre pur produit de la formation rouge, acteur des succès des années 1970.',
      en: 'Another home-grown player, part of the 1970s successes.',
      ar: 'من أبناء مدرسة الوداد، ساهم في نجاحات سبعينيات القرن الماضي.',
    },
  },
  {
    name: { fr: 'Aziz Bouderbala', en: 'Aziz Bouderbala', ar: 'عزيز بودربالة' },
    role: { fr: 'Formé au club', en: 'Academy product', ar: 'من خريجي النادي' },
    text: {
      fr: 'Formé au Wydad, il est l’un des grands noms issus de l’école du club.',
      en: 'Trained at Wydad, one of the great names to come out of the club’s academy.',
      ar: 'تكوّن في الوداد، وهو من أبرز الأسماء التي أنجبتها مدرسة النادي.',
    },
  },
];

export interface Facility {
  id: string;
  name: L10n;
  facts: L10n[];
}

export const FACILITIES: Facility[] = [
  {
    id: 'complex',
    name: { fr: 'Complexe Mohamed Benjelloun', en: 'Mohamed Benjelloun Complex', ar: 'مركب محمد بنجلون' },
    facts: [
      { fr: 'Siège du club et centre d’entraînement, quartier Oasis à Casablanca', en: 'Club headquarters and training centre, Oasis district, Casablanca', ar: 'مقر النادي ومركز التداريب، حي الواحة بالدار البيضاء' },
      { fr: 'Inauguré en 1982', en: 'Opened in 1982', ar: 'افتتح سنة 1982' },
      { fr: 'Trois terrains, un terrain intermédiaire et une salle omnisports', en: 'Three pitches, a mid-sized pitch and a multi-sport hall', ar: 'ثلاثة ملاعب وملعب متوسط وقاعة متعددة الرياضات' },
    ],
  },
  {
    id: 'goalkeepers',
    name: { fr: 'École des gardiens', en: 'Goalkeeper school', ar: 'مدرسة حراس المرمى' },
    facts: [
      { fr: 'Au stade Larbi-Ben-M’barek, l’ancien stade Philip', en: 'At the Larbi Ben M’barek stadium, formerly stade Philip', ar: 'بملعب العربي بنمبارك، ملعب فيليب سابقاً' },
      { fr: 'Dédiée à la formation des gardiens du club', en: 'Dedicated to training the club’s goalkeepers', ar: 'مخصصة لتكوين حراس مرمى النادي' },
    ],
  },
];

/** Stade Mohammed V milestones (capacity on the page comes from the club's own figure) */
export const STADIUM_HISTORY: { year: string; text: L10n }[] = [
  { year: '1955', text: { fr: 'Inauguré sous le nom de stade Marcel-Cerdan', en: 'Opened as Stade Marcel Cerdan', ar: 'افتتح باسم ملعب مارسيل سيردان' } },
  { year: '1956', text: { fr: 'Rebaptisé stade d’Honneur après l’indépendance', en: 'Renamed Stade d’Honneur after independence', ar: 'أعيدت تسميته ملعب الشرف بعد الاستقلال' } },
  { year: '1983', text: { fr: 'Agrandi pour les Jeux méditerranéens et renommé Mohammed-V', en: 'Enlarged for the Mediterranean Games and renamed Mohammed V', ar: 'توسعته بمناسبة ألعاب البحر الأبيض المتوسط وتسميته ملعب محمد الخامس' } },
  { year: '2019', text: { fr: 'Rénové, entièrement en places assises', en: 'Renovated, all-seater', ar: 'تجديده وتجهيزه بالكامل بالمقاعد' } },
];

export const NICKNAMES: L10n[] = [
  { fr: 'Le Doyen', en: 'Le Doyen (the Elder)', ar: 'عميد الأندية المغربية' },
  { fr: 'Château Rouge', en: 'Château Rouge (the Red Castle)', ar: 'القلعة الحمراء' },
  { fr: 'Club de la Nation', en: 'Club of the Nation', ar: 'فريق الأمة' },
  { fr: 'Symbole de la Résistance', en: 'Symbol of the Resistance', ar: 'رمز المقاومة' },
];

export interface Era {
  period: string;
  title: L10n;
  paragraphs: L10n[];
}

/** The club's history in five eras (text supplied by the club) */
export const ERAS: Era[] = [
  {
    period: '1937 — 1956',
    title: { fr: 'Fondation et époque coloniale', en: 'Foundation and the colonial era', ar: 'التأسيس وعهد الحماية' },
    paragraphs: [
      {
        fr: 'Le 8 mai 1937, sous le protectorat français, un groupe de patriotes casablancais autour de Hajj Mohamed Ben Lahcen Ould Affani fonde le Wydad Athletic Club dans l’ancienne médina. Le nom — qui signifie « amour », « affection sincère » en arabe — est choisi en référence à un film de la chanteuse égyptienne Oum Kalthoum. Volontairement, les fondateurs refusent d’inclure « Casablanca » dans le nom : le club doit être marocain, national, et non régional.',
        en: 'On 8 May 1937, under the French Protectorate, a group of Casablanca patriots around Hajj Mohamed Ben Lahcen Ould Affani founds Wydad Athletic Club in the old medina. The name — meaning “love” or “sincere affection” in Arabic — is a reference to a film by the Egyptian singer Umm Kulthum. The founders deliberately leave “Casablanca” out of the name: the club is to be Moroccan and national, not regional.',
        ar: 'في 8 ماي 1937، وفي ظل الحماية الفرنسية، أسست مجموعة من الوطنيين البيضاويين حول الحاج محمد بن لحسن ولد العفاني نادي الوداد الرياضي بالمدينة القديمة. واختير الاسم، الذي يعني المحبة والمودة الصادقة، تيمناً بفيلم للفنانة المصرية أم كلثوم. ورفض المؤسسون عمداً إدراج اسم «الدار البيضاء»، لأن النادي أُريد له أن يكون مغربياً ووطنياً لا جهوياً.',
      },
      {
        fr: 'Dans les années 1940, le WAC remporte ses premiers championnats nationaux des autochtones (1948, 1949, 1950, 1951). Le club devient rapidement un symbole de la résistance culturelle face à l’occupation. En 1956, juste après l’indépendance, il s’impose en Coupe de l’Indépendance, un trophée unique organisé pour célébrer la nouvelle nation.',
        en: 'In the 1940s, WAC win their first national championships for Moroccan clubs (1948, 1949, 1950, 1951). The club quickly becomes a symbol of cultural resistance to the occupation. In 1956, just after independence, they win the Independence Cup, a one-off trophy organised to celebrate the new nation.',
        ar: 'في أربعينيات القرن الماضي، أحرز الوداد أولى بطولاته الوطنية (1948، 1949، 1950، 1951)، وسرعان ما أصبح رمزاً للمقاومة الثقافية في وجه الاستعمار. وفي سنة 1956، مباشرة بعد الاستقلال، توج بكأس الاستقلال، وهي كأس فريدة نُظمت احتفاءً بالأمة الجديدة.',
      },
    ],
  },
  {
    period: '1956 — 1979',
    title: { fr: 'L’après-indépendance et la consolidation', en: 'After independence: consolidation', ar: 'ما بعد الاستقلال والترسيخ' },
    paragraphs: [
      {
        fr: 'Avec l’indépendance, le football marocain se structure. Le WAC est l’un des fondateurs de la Botola, le championnat national. La sélection nationale marocaine s’appuie largement sur les joueurs du Wydad dans les premières années.',
        en: 'With independence, Moroccan football takes shape. WAC is one of the founders of the Botola, the national league. In its early years, the Moroccan national team relies heavily on Wydad players.',
        ar: 'مع الاستقلال، بدأت كرة القدم المغربية تتهيكل. وكان الوداد من مؤسسي البطولة الوطنية، واعتمد المنتخب المغربي في سنواته الأولى بشكل كبير على لاعبي الوداد.',
      },
      {
        fr: 'Les années 1970 amorcent une domination renouvelée : titres de Botola en 1976, 1977 et 1978, première Coupe du Trône en 1970. Le club affine son identité : tribunes populaires, ferveur quotidienne, statut de « club de la nation » (نادي الأمة). Les surnoms s’installent : L’Empereur, Le Doyen.',
        en: 'The 1970s bring renewed dominance: Botola titles in 1976, 1977 and 1978, and a first Throne Cup in 1970. The club’s identity sharpens: popular stands, everyday fervour, the status of “club of the nation” (نادي الأمة). The nicknames stick: L’Empereur, Le Doyen.',
        ar: 'شهدت سبعينيات القرن الماضي عودة الهيمنة: ألقاب البطولة في 1976 و1977 و1978، وأول كأس للعرش سنة 1970. وتعززت هوية النادي: مدرجات شعبية، وحماس يومي، ومكانة «نادي الأمة». وترسخت ألقابه: الإمبراطور والعميد.',
      },
    ],
  },
  {
    period: '1980 — 1995',
    title: { fr: 'La génération dorée et le premier sacre continental', en: 'The golden generation and a first African crown', ar: 'الجيل الذهبي وأول تتويج قاري' },
    paragraphs: [
      {
        fr: 'Les années 1980 et le début des années 1990 constituent la première grande époque du WAC sur la scène africaine. Le club aligne les titres : 1986, 1989, 1990, 1991, 1993. La consécration arrive en 1992 : le Wydad remporte sa première Ligue des champions de la CAF face à Al-Hilal du Soudan.',
        en: 'The 1980s and early 1990s are WAC’s first great era on the African stage. The titles keep coming: 1986, 1989, 1990, 1991, 1993. The crowning moment arrives in 1992: Wydad win their first CAF Champions League against Sudan’s Al-Hilal.',
        ar: 'شكلت ثمانينيات القرن الماضي وبداية التسعينيات أول حقبة كبرى للوداد على الساحة الإفريقية، إذ توالت الألقاب: 1986، 1989، 1990، 1991، 1993. وجاء التتويج سنة 1992 بأول لقب لدوري أبطال إفريقيا على حساب الهلال السوداني.',
      },
      {
        fr: 'Un an plus tard, en 1993, nouveau triomphe : la Coupe afro-asiatique face aux Sud-Coréens du Pohang Steelers. La Coupe arabe des clubs champions (1989) et la Supercoupe arabe complètent une décennie historique.',
        en: 'A year later, in 1993, another triumph: the Afro-Asian Club Championship against South Korea’s Pohang Steelers. The Arab Club Champions Cup (1989) and the Arab Super Cup round off a historic decade.',
        ar: 'وبعد سنة، في 1993، جاء انتصار جديد بالكأس الأفرو-آسيوية على حساب بوهانغ ستيلرز الكوري الجنوبي. وأكملت كأس الأندية العربية البطلة (1989) والكأس العربية الممتازة عقداً تاريخياً.',
      },
    ],
  },
  {
    period: '1996 — 2015',
    title: { fr: 'Le passage à vide et la reconstruction', en: 'Lean years and rebuilding', ar: 'فترة الفراغ وإعادة البناء' },
    paragraphs: [
      {
        fr: 'Après 1993, le WAC traverse une période plus modeste sur la scène continentale, malgré des succès nationaux : Coupes du Trône 1994, 1997, 1998 et 2001 ; Botola 2006, 2010 et 2015 ; et la Coupe d’Afrique des vainqueurs de coupe en 2002.',
        en: 'After 1993, WAC go through a quieter spell on the continental stage, despite domestic success: Throne Cups in 1994, 1997, 1998 and 2001; Botola titles in 2006, 2010 and 2015; and the African Cup Winners’ Cup in 2002.',
        ar: 'بعد 1993، عاش الوداد فترة أكثر تواضعاً على المستوى القاري، رغم نجاحاته الوطنية: كأس العرش في 1994 و1997 و1998 و2001، والبطولة في 2006 و2010 و2015، وكأس إفريقيا للأندية الفائزة بالكؤوس سنة 2002.',
      },
      {
        fr: 'Les années 2000 et 2010 sont marquées par des cycles courts, des changements d’entraîneurs et des résultats en dents de scie. Mais le noyau dur des supporters, l’attachement identitaire et la base populaire ne faiblissent jamais.',
        en: 'The 2000s and 2010s bring short cycles, coaching changes and uneven results. But the hardcore support, the attachment to the club’s identity and its popular base never waver.',
        ar: 'تميزت سنوات الألفين والعقد الثاني بدورات قصيرة وتغييرات في الأطقم التقنية ونتائج متذبذبة، لكن النواة الصلبة من الجماهير والارتباط بالهوية والقاعدة الشعبية لم تضعف أبداً.',
      },
    ],
  },
  {
    period: '2017 — 2022',
    title: { fr: 'La renaissance africaine', en: 'The African renaissance', ar: 'النهضة الإفريقية' },
    paragraphs: [
      {
        fr: 'En 2017, sous Houcine Ammouta, le Wydad remporte sa deuxième Ligue des champions de la CAF, 25 ans après la première, face à Al-Ahly d’Égypte (1-1 au Caire, 1-0 à Casablanca). Une consécration pour une génération talentueuse et un retour aux sommets continentaux.',
        en: 'In 2017, under Houcine Ammouta, Wydad win their second CAF Champions League, 25 years after the first, against Egypt’s Al-Ahly (1-1 in Cairo, 1-0 in Casablanca). A crowning moment for a gifted generation and a return to the top of African football.',
        ar: 'في 2017، وتحت قيادة الحسين عموتة، أحرز الوداد لقبه الثاني في دوري أبطال إفريقيا، بعد 25 سنة من الأول، على حساب الأهلي المصري (1-1 بالقاهرة و1-0 بالدار البيضاء)، تتويجاً لجيل موهوب وعودة إلى القمة القارية.',
      },
      {
        fr: 'Cinq ans plus tard, en 2022, Walid Regragui — qui deviendra dans la foulée sélectionneur du Maroc pour la Coupe du monde 2022 — emmène le WAC vers un troisième sacre : victoire 2-0 face à Al-Ahly au stade Mohammed V, devant des tribunes en feu. Yahya Jabrane soulève le trophée. Le club empile aussi les Botola : 2017, 2019, 2021 et 2022.',
        en: 'Five years later, in 2022, Walid Regragui — who would soon become Morocco’s coach for the 2022 World Cup — leads WAC to a third title: a 2-0 win over Al-Ahly at the Stade Mohammed V, in front of blazing stands. Yahya Jabrane lifts the trophy. The club also piles up Botola titles: 2017, 2019, 2021 and 2022.',
        ar: 'وبعد خمس سنوات، في 2022، قاد وليد الركراكي، الذي سيصبح مباشرة بعدها مدرباً للمنتخب المغربي في كأس العالم 2022، الوداد إلى لقبه الثالث بالفوز على الأهلي بهدفين دون رد بملعب محمد الخامس، أمام مدرجات مشتعلة. ورفع يحيى جبران الكأس. كما راكم النادي ألقاب البطولة: 2017 و2019 و2021 و2022.',
      },
    ],
  },
];
