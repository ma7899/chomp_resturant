import type { Sandwich, Tag, TasteForm, Topping } from "./types";

/**
 * Default tag catalog — chef-curated flavor / dietary descriptors.
 * Admin can edit / extend these from the admin panel.
 */
export const SEED_TAGS: Tag[] = [
  { id: "t-sweet", name: "شیرین", color: "rose" },
  { id: "t-spicy", name: "تند", color: "red" },
  { id: "t-smoky", name: "دودی", color: "stone" },
  { id: "t-savory", name: "نمکی", color: "amber" },
  { id: "t-creamy", name: "خامه‌ای", color: "yellow" },
  { id: "t-cheesy", name: "پنیری", color: "amber" },
  { id: "t-garlic", name: "سیر", color: "lime" },
  { id: "t-tangy", name: "ترش", color: "emerald" },
  { id: "t-fresh", name: "تازه", color: "green" },
  { id: "t-meaty", name: "گوشتی", color: "rose" },
  { id: "t-chicken", name: "مرغی", color: "orange" },
  { id: "t-light", name: "سبک", color: "sky" },
  { id: "t-rich", name: "سنگین", color: "stone" },
  { id: "t-grilled", name: "گریل‌شده", color: "orange" },
  { id: "t-herby", name: "سبزیجاتی", color: "emerald" },
];

const tag = (...ids: string[]) => ids;

export const SEED_SANDWICHES: Sandwich[] = [
  {
    id: "beef",
    slug: "roast-beef",
    name: "ساندویچ رست بیف",
    tagline: "پادشاه منوی چاپ",
    description:
      "رست بیف مخصوص با سس باربیکیو دودی، پنیر گودا و قارچ تازه؛ ترکیبی که عاشق‌های گوشت سرخ نمی‌توانند از آن بگذرند.",
    basePrice: 600,
    includedIngredients: [
      "رست بیف",
      "سس بالزامیک",
      "کاهو و پیازچه",
      "سس خامه‌ای",
      "سس باربیکیو",
      "پنیر گودا",
      "قارچ",
      "زیتون سبز",
    ],
    image: "/images/roastbeef.png",
    badge: "پرفروش",
    hero: true,
    tagIds: tag("t-meaty", "t-smoky", "t-rich", "t-savory", "t-cheesy"),
  },
  {
    id: "turkey",
    slug: "turkey",
    name: "ساندویچ بوقلمون",
    tagline: "سبک، خوش‌طعم، بی‌نظیر",
    description:
      "سینه بوقلمون دودی همراه با مایوی کارامل و فلفل دلمه‌ای رست؛ انتخابی متعادل و دلچسب برای روزهای پرکار.",
    basePrice: 510,
    includedIngredients: [
      "سینه بوقلمون",
      "سس بالزامیک",
      "فلفل دلمه‌ای رست",
      "سس رنچ",
      "سس باربیکیو",
      "مایو کارامل",
      "نخود",
      "زیتون سیاه",
    ],
    image: "/images/turkey.png",
    tagIds: tag("t-light", "t-sweet", "t-smoky", "t-creamy"),
  },
  {
    id: "bacon",
    slug: "bacon",
    name: "ساندویچ بیکن",
    tagline: "ترد، دودی، اعتیادآور",
    description:
      "بیکن ترد همراه با سس چری و فلفل دلمه‌ای رست؛ تجربه‌ای دودی و خاص که در هر گاز شما را غافلگیر می‌کند.",
    basePrice: 480,
    includedIngredients: [
      "بیکن",
      "سس چری",
      "سالاد چری",
      "کاهو و پیازچه",
      "خیارشور",
      "فلفل دلمه‌ای رست",
    ],
    image: "/images/bacon.png",
    badge: "ویژه",
    tagIds: tag("t-smoky", "t-meaty", "t-savory", "t-tangy"),
  },
  {
    id: "chicken",
    slug: "chicken",
    name: "ساندویچ مرغ",
    tagline: "کلاسیکی که هرگز کهنه نمی‌شود",
    description:
      "فیله مرغ گریل با ترکیب سه پنیر موزارلا، جعفری و پارمزان؛ یک انتخاب بی‌خطر و خوش‌طعم برای همه سلیقه‌ها.",
    basePrice: 390,
    includedIngredients: [
      "فیله مرغ",
      "پنیر موزارلا",
      "پنیر جعفری",
      "پنیر پارمزان",
      "فلفل دلمه‌ای",
      "سالاد چری",
      "کلم",
      "پاپریکا",
      "زیتون سیاه",
    ],
    image: "/images/chicken.png",
    badge: "اقتصادی",
    tagIds: tag("t-chicken", "t-cheesy", "t-grilled", "t-light", "t-creamy"),
  },
];

export const SEED_TOPPINGS: Topping[] = [
  // proteins
  {
    id: "p-steak",
    name: "استیک",
    price: 410,
    category: "protein",
    tagIds: tag("t-meaty", "t-grilled", "t-rich"),
  },
  {
    id: "p-roastbeef",
    name: "رست بیف",
    price: 350,
    category: "protein",
    tagIds: tag("t-meaty", "t-smoky", "t-rich"),
  },
  {
    id: "p-turkey-process",
    name: "سینه پروسس بوقلمون",
    price: 340,
    category: "protein",
    tagIds: tag("t-light", "t-smoky"),
  },
  {
    id: "p-chicken-fillet",
    name: "فیله مرغ",
    price: 250,
    category: "protein",
    tagIds: tag("t-chicken", "t-grilled", "t-light"),
  },
  {
    id: "p-bacon",
    name: "بیکن",
    price: 190,
    category: "protein",
    tagIds: tag("t-smoky", "t-meaty", "t-savory"),
  },
  {
    id: "p-salami",
    name: "سالامی",
    price: 185,
    category: "protein",
    tagIds: tag("t-savory", "t-meaty", "t-spicy"),
  },

  // cheeses
  {
    id: "c-parmesan-dip",
    name: "دیپ پنیر پارمزان",
    price: 85,
    category: "cheese",
    tagIds: tag("t-cheesy", "t-creamy", "t-rich"),
  },
  {
    id: "c-cream-dip",
    name: "دیپ پنیر خامه‌ای",
    price: 85,
    category: "cheese",
    tagIds: tag("t-creamy", "t-cheesy"),
  },
  {
    id: "c-mozzarella",
    name: "پنیر موزارلا",
    price: 70,
    category: "cheese",
    tagIds: tag("t-cheesy", "t-creamy", "t-light"),
  },
  {
    id: "c-kuze",
    name: "پنیر کوزه",
    price: 70,
    category: "cheese",
    tagIds: tag("t-cheesy", "t-tangy"),
  },
  {
    id: "c-gouda",
    name: "پنیر گودا",
    price: 35,
    category: "cheese",
    tagIds: tag("t-cheesy", "t-smoky"),
  },

  // veggies
  {
    id: "v-mushroom",
    name: "قارچ کره‌ای",
    price: 60,
    category: "veggie",
    tagIds: tag("t-creamy", "t-savory", "t-herby"),
  },
  {
    id: "v-olive-green",
    name: "زیتون سبز",
    price: 70,
    category: "veggie",
    tagIds: tag("t-tangy", "t-savory"),
  },
  {
    id: "v-olive-black",
    name: "زیتون سیاه",
    price: 70,
    category: "veggie",
    tagIds: tag("t-savory"),
  },
  {
    id: "v-roasted-pepper",
    name: "فلفل دلمه‌ای رست",
    price: 35,
    category: "veggie",
    tagIds: tag("t-smoky", "t-sweet", "t-herby"),
  },
  {
    id: "v-cabbage",
    name: "کلم",
    price: 30,
    category: "veggie",
    tagIds: tag("t-fresh", "t-light", "t-herby"),
  },
  {
    id: "v-lettuce",
    name: "کاهو",
    price: 25,
    category: "veggie",
    tagIds: tag("t-fresh", "t-light"),
  },
  {
    id: "v-pickle-pepper",
    name: "ترشی فلفل شیرین",
    price: 25,
    category: "veggie",
    tagIds: tag("t-tangy", "t-sweet"),
  },
  {
    id: "v-pickle",
    name: "خیارشور",
    price: 25,
    category: "veggie",
    tagIds: tag("t-tangy", "t-spicy"),
  },
  {
    id: "v-tomato-marinated",
    name: "گوجه مرینت",
    price: 20,
    category: "veggie",
    tagIds: tag("t-fresh", "t-tangy", "t-herby"),
  },
  {
    id: "v-cucumber-sweet",
    name: "خیار شیرین",
    price: 20,
    category: "veggie",
    tagIds: tag("t-fresh", "t-sweet"),
  },
  {
    id: "v-onion",
    name: "پیاز خلالی",
    price: 20,
    category: "veggie",
    tagIds: tag("t-spicy", "t-tangy", "t-fresh"),
  },

  // sauces
  {
    id: "s-balsamic",
    name: "بالزامیک",
    price: 55,
    category: "sauce",
    tagIds: tag("t-tangy", "t-sweet"),
  },
  {
    id: "s-mayo-caramel",
    name: "مایو کارامل",
    price: 50,
    category: "sauce",
    tagIds: tag("t-sweet", "t-creamy"),
  },
  {
    id: "s-garlic",
    name: "سس سیر",
    price: 45,
    category: "sauce",
    tagIds: tag("t-garlic", "t-creamy", "t-savory"),
  },
  {
    id: "s-butter-mustard",
    name: "کره خردل",
    price: 45,
    category: "sauce",
    tagIds: tag("t-creamy", "t-tangy"),
  },
  {
    id: "s-sweet-chili",
    name: "سویت چیلی",
    price: 45,
    category: "sauce",
    tagIds: tag("t-sweet", "t-spicy"),
  },
  {
    id: "s-bbq",
    name: "باربیکیو",
    price: 45,
    category: "sauce",
    tagIds: tag("t-smoky", "t-sweet", "t-savory"),
  },
  {
    id: "s-mustard-paprika",
    name: "خردل پاپریکا",
    price: 40,
    category: "sauce",
    tagIds: tag("t-spicy", "t-tangy"),
  },
  {
    id: "s-ranch",
    name: "رنچ",
    price: 35,
    category: "sauce",
    tagIds: tag("t-creamy", "t-herby"),
  },
  {
    id: "s-parsley",
    name: "جعفری",
    price: 35,
    category: "sauce",
    tagIds: tag("t-herby", "t-fresh"),
  },
  {
    id: "s-french",
    name: "فرنچ کباب",
    price: 25,
    category: "sauce",
    tagIds: tag("t-sweet", "t-tangy"),
  },
];

export const SEED_TASTE_FORM: TasteForm = {
  title: "ذائقه‌سنج چاپ",
  intro:
    "به چند سؤال کوتاه پاسخ بده تا ساندویچی که با ذائقه‌ی امروزت بیشترین هماهنگی رو داره برات پیشنهاد کنیم.",
  questions: [
    {
      id: "q-mood",
      text: "امروز چه حسی داری؟",
      type: "single",
      options: [
        {
          id: "o-1",
          label: "سبک و سرحال",
          tagBoosts: [
            { tagId: "t-light", weight: 2 },
            { tagId: "t-fresh", weight: 1 },
          ],
        },
        {
          id: "o-2",
          label: "حسابی گرسنه‌ام",
          tagBoosts: [
            { tagId: "t-rich", weight: 2 },
            { tagId: "t-meaty", weight: 2 },
          ],
        },
        {
          id: "o-3",
          label: "هوس یه چیز خاص دارم",
          tagBoosts: [
            { tagId: "t-smoky", weight: 2 },
            { tagId: "t-cheesy", weight: 1 },
          ],
        },
      ],
    },
    {
      id: "q-protein",
      text: "کدوم پروتئین بیشتر می‌چسبه؟",
      type: "single",
      options: [
        {
          id: "o-1",
          label: "گوشت قرمز",
          tagBoosts: [{ tagId: "t-meaty", weight: 3 }],
        },
        {
          id: "o-2",
          label: "مرغ",
          tagBoosts: [
            { tagId: "t-chicken", weight: 3 },
            { tagId: "t-light", weight: 1 },
          ],
        },
        {
          id: "o-3",
          label: "بوقلمون / بیکن",
          tagBoosts: [{ tagId: "t-smoky", weight: 3 }],
        },
      ],
    },
    {
      id: "q-flavors",
      text: "کدوم طعم‌ها رو دوست داری؟ (چندتایی)",
      type: "multi",
      options: [
        {
          id: "o-1",
          label: "تند",
          tagBoosts: [{ tagId: "t-spicy", weight: 2 }],
        },
        {
          id: "o-2",
          label: "شیرین",
          tagBoosts: [{ tagId: "t-sweet", weight: 2 }],
        },
        {
          id: "o-3",
          label: "خامه‌ای / پنیری",
          tagBoosts: [
            { tagId: "t-creamy", weight: 2 },
            { tagId: "t-cheesy", weight: 2 },
          ],
        },
        {
          id: "o-4",
          label: "ترش",
          tagBoosts: [{ tagId: "t-tangy", weight: 2 }],
        },
        {
          id: "o-5",
          label: "سیری / تند",
          tagBoosts: [{ tagId: "t-garlic", weight: 2 }],
        },
      ],
    },
    {
      id: "q-weight",
      text: "چقدر سنگین می‌خوای؟",
      type: "scale",
      options: [
        {
          id: "o-1",
          label: "خیلی سبک",
          tagBoosts: [
            { tagId: "t-light", weight: 3 },
            { tagId: "t-fresh", weight: 1 },
          ],
        },
        {
          id: "o-2",
          label: "متوسط",
          tagBoosts: [{ tagId: "t-savory", weight: 1 }],
        },
        {
          id: "o-3",
          label: "خیلی سنگین",
          tagBoosts: [
            { tagId: "t-rich", weight: 3 },
            { tagId: "t-cheesy", weight: 1 },
          ],
        },
      ],
    },
  ],
};
