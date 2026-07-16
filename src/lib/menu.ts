export type Category = "Snacks" | "Main" | "Drinks" | "Desserts";

export interface MenuItem {
  id: number;
  name: string;
  category: Category;
  price: number;
  emoji: string;
  desc: string;
  veg: boolean;
}

export const MENU: MenuItem[] = [
  // Snacks
  { id: 1,  name: "Samosa",         category: "Snacks",   price: 15,  emoji: "🥟", desc: "Crispy fried pastry with spiced potatoes",    veg: true  },
  { id: 2,  name: "Vada Pav",       category: "Snacks",   price: 25,  emoji: "🍔", desc: "Mumbai's favourite street burger",             veg: true  },
  { id: 3,  name: "Bread Pakoda",   category: "Snacks",   price: 30,  emoji: "🍞", desc: "Deep fried bread with stuffing",               veg: true  },
  { id: 4,  name: "Pav Bhaji",      category: "Snacks",   price: 60,  emoji: "🧆", desc: "Spiced veggies with buttered pav",             veg: true  },
  // Main
  { id: 5,  name: "Misal Pav",      category: "Main",     price: 80,  emoji: "🍲", desc: "Spicy sprouted curry with pav",                veg: true  },
  { id: 6,  name: "Chole Bhature",  category: "Main",     price: 90,  emoji: "🫓", desc: "Punjabi chickpea with fried bread",            veg: true  },
  { id: 7,  name: "Egg Bhurji Pav", category: "Main",     price: 70,  emoji: "🍳", desc: "Spiced scrambled eggs with pav",               veg: false },
  { id: 8,  name: "Chicken Roll",   category: "Main",     price: 120, emoji: "🌯", desc: "Grilled chicken wrapped in paratha",           veg: false },
  // Drinks
  { id: 9,  name: "Masala Chai",    category: "Drinks",   price: 20,  emoji: "☕", desc: "Hot spiced Indian tea",                        veg: true  },
  { id: 10, name: "Cold Coffee",    category: "Drinks",   price: 60,  emoji: "🥤", desc: "Blended chilled coffee",                       veg: true  },
  { id: 11, name: "Nimbu Pani",     category: "Drinks",   price: 25,  emoji: "🍋", desc: "Fresh lemon water with salt & sugar",          veg: true  },
  { id: 12, name: "Lassi",          category: "Drinks",   price: 50,  emoji: "🥛", desc: "Sweet chilled yogurt drink",                   veg: true  },
  // Desserts
  { id: 13, name: "Gulab Jamun",    category: "Desserts", price: 40,  emoji: "🟤", desc: "Soft milk dumplings in sugar syrup",           veg: true  },
  { id: 14, name: "Kulfi",          category: "Desserts", price: 45,  emoji: "🍦", desc: "Traditional Indian ice cream",                 veg: true  },
];

export const CATEGORIES: Category[] = ["Snacks", "Main", "Drinks", "Desserts"];
