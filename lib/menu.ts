// All prices are in Toman (T)
export type Topping = {
  id: string;
  name: string;
  price: number;
  category: "protein" | "veggie" | "cheese" | "sauce";
};

export type Sandwich = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  basePrice: number;
  includedIngredients: string[];
  image: string;
  badge?: string;
  hero?: boolean;
};

export const SANDWICHES: Sandwich[] = [
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
  },
];

export const PROTEINS: Topping[] = [
  { id: "p-steak", name: "استیک", price: 410, category: "protein" },
  { id: "p-roastbeef", name: "رست بیف", price: 350, category: "protein" },
  {
    id: "p-turkey-process",
    name: "سینه پروسس بوقلمون",
    price: 340,
    category: "protein",
  },
  { id: "p-chicken-fillet", name: "فیله مرغ", price: 250, category: "protein" },
  { id: "p-bacon", name: "بیکن", price: 190, category: "protein" },
  { id: "p-salami", name: "سالامی", price: 185, category: "protein" },
];

export const CHEESES: Topping[] = [
  {
    id: "c-parmesan-dip",
    name: "دیپ پنیر پارمزان",
    price: 85,
    category: "cheese",
  },
  {
    id: "c-cream-dip",
    name: "دیپ پنیر خامه‌ای",
    price: 85,
    category: "cheese",
  },
  { id: "c-mozzarella", name: "پنیر موزارلا", price: 70, category: "cheese" },
  { id: "c-kuze", name: "پنیر کوزه", price: 70, category: "cheese" },
  { id: "c-gouda", name: "پنیر گودا", price: 35, category: "cheese" },
];

export const VEGGIES: Topping[] = [
  { id: "v-mushroom", name: "قارچ کره‌ای", price: 60, category: "veggie" },
  { id: "v-olive-green", name: "زیتون سبز", price: 70, category: "veggie" },
  { id: "v-olive-black", name: "زیتون سیاه", price: 70, category: "veggie" },
  {
    id: "v-roasted-pepper",
    name: "فلفل دلمه‌ای رست",
    price: 35,
    category: "veggie",
  },
  { id: "v-cabbage", name: "کلم", price: 30, category: "veggie" },
  { id: "v-lettuce", name: "کاهو", price: 25, category: "veggie" },
  {
    id: "v-pickle-pepper",
    name: "ترشی فلفل شیرین",
    price: 25,
    category: "veggie",
  },
  { id: "v-pickle", name: "خیارشور", price: 25, category: "veggie" },
  {
    id: "v-tomato-marinated",
    name: "گوجه مرینت",
    price: 20,
    category: "veggie",
  },
  { id: "v-cucumber-sweet", name: "خیار شیرین", price: 20, category: "veggie" },
  { id: "v-onion", name: "پیاز خلالی", price: 20, category: "veggie" },
];

export const SAUCES: Topping[] = [
  { id: "s-balsamic", name: "بالزامیک", price: 55, category: "sauce" },
  { id: "s-mayo-caramel", name: "مایو کارامل", price: 50, category: "sauce" },
  { id: "s-garlic", name: "سس سیر", price: 45, category: "sauce" },
  { id: "s-butter-mustard", name: "کره خردل", price: 45, category: "sauce" },
  { id: "s-sweet-chili", name: "سویت چیلی", price: 45, category: "sauce" },
  { id: "s-bbq", name: "باربیکیو", price: 45, category: "sauce" },
  {
    id: "s-mustard-paprika",
    name: "خردل پاپریکا",
    price: 40,
    category: "sauce",
  },
  { id: "s-ranch", name: "رنچ", price: 35, category: "sauce" },
  { id: "s-parsley", name: "جعفری", price: 35, category: "sauce" },
  { id: "s-french", name: "فرنچ کباب", price: 25, category: "sauce" },
];

export const ALL_TOPPINGS: Topping[] = [
  ...PROTEINS,
  ...CHEESES,
  ...VEGGIES,
  ...SAUCES,
];

export function getSandwich(slug: string) {
  return SANDWICHES.find((s) => s.slug === slug);
}

export function getTopping(id: string) {
  return ALL_TOPPINGS.find((t) => t.id === id);
}

export function formatPrice(t: number) {
  return new Intl.NumberFormat("fa-IR").format(t);
}
