export interface SeedRecipe {
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  tags: string[];
  ingredients: string[];
  steps: string[];
}

export const seedRecipes: SeedRecipe[] = [
  {
    title: "Shopska Salad",
    slug: "shopska-salad",
    description:
      "A crisp Bulgarian salad with tomatoes, cucumbers, roasted peppers, parsley, and a snowy layer of grated sirene cheese.",
    imageUrl: "/images/recipes/shopska-salad.jpg",
    imageAlt: "Fresh Shopska salad topped with grated white cheese",
    prepTimeMinutes: 20,
    cookTimeMinutes: 0,
    servings: 4,
    difficulty: "easy",
    category: "Salads",
    tags: ["vegetarian", "fresh", "summer", "sirene"],
    ingredients: [
      "4 ripe tomatoes, chopped",
      "1 cucumber, chopped",
      "2 roasted red peppers, sliced",
      "1 small red onion, thinly sliced",
      "3 tablespoons chopped parsley",
      "150 g sirene cheese, grated",
      "2 tablespoons sunflower oil",
      "1 tablespoon red wine vinegar",
      "Salt to taste"
    ],
    steps: [
      "Combine the tomatoes, cucumber, peppers, onion, and parsley in a large bowl.",
      "Season with salt, sunflower oil, and vinegar, then toss gently.",
      "Pile the salad onto a serving plate and cover with grated sirene cheese.",
      "Serve chilled or at room temperature."
    ]
  },
  {
    title: "Banitsa with Sirene",
    slug: "banitsa-with-sirene",
    description:
      "Flaky filo pastry layered with eggs, yogurt, and tangy sirene cheese for a classic Bulgarian breakfast or snack.",
    imageUrl: "/images/recipes/banitsa-with-sirene.jpg",
    imageAlt: "Golden baked banitsa sliced into squares",
    prepTimeMinutes: 25,
    cookTimeMinutes: 40,
    servings: 8,
    difficulty: "medium",
    category: "Bakes",
    tags: ["vegetarian", "breakfast", "pastry", "sirene"],
    ingredients: [
      "500 g filo pastry sheets",
      "350 g sirene cheese, crumbled",
      "4 eggs",
      "250 g plain yogurt",
      "80 ml sunflower oil",
      "1 teaspoon baking soda",
      "2 tablespoons melted butter"
    ],
    steps: [
      "Whisk the eggs, yogurt, baking soda, and sunflower oil until smooth.",
      "Brush a baking pan with melted butter and layer several filo sheets inside.",
      "Add spoonfuls of filling and crumbled sirene between loose layers of filo.",
      "Finish with butter on top and bake at 180 C until puffed and golden.",
      "Rest for 10 minutes before slicing."
    ]
  },
  {
    title: "Kavarma Pork Stew",
    slug: "kavarma-pork-stew",
    description:
      "A hearty clay-pot style stew with tender pork, onions, peppers, tomatoes, mushrooms, and savory herbs.",
    imageUrl: "/images/recipes/kavarma-pork-stew.jpg",
    imageAlt: "Rustic pork kavarma stew in a clay bowl",
    prepTimeMinutes: 25,
    cookTimeMinutes: 75,
    servings: 4,
    difficulty: "medium",
    category: "Mains",
    tags: ["pork", "stew", "comfort-food", "winter"],
    ingredients: [
      "700 g pork shoulder, cubed",
      "2 onions, sliced",
      "2 red peppers, sliced",
      "250 g mushrooms, quartered",
      "300 g chopped tomatoes",
      "120 ml dry white wine",
      "2 tablespoons sunflower oil",
      "1 teaspoon paprika",
      "1 teaspoon dried savory",
      "Salt and black pepper to taste"
    ],
    steps: [
      "Brown the pork in sunflower oil over medium-high heat.",
      "Add onions, peppers, and mushrooms, then cook until softened.",
      "Stir in paprika, savory, tomatoes, wine, salt, and pepper.",
      "Cover and simmer gently until the pork is tender.",
      "Serve hot with crusty bread or mashed potatoes."
    ]
  },
  {
    title: "Tarator Cold Cucumber Soup",
    slug: "tarator-cold-cucumber-soup",
    description:
      "A refreshing chilled yogurt soup with cucumber, garlic, dill, walnuts, and a light drizzle of oil.",
    imageUrl: "/images/recipes/tarator-cold-cucumber-soup.jpg",
    imageAlt: "Bowl of chilled tarator soup with dill and walnuts",
    prepTimeMinutes: 15,
    cookTimeMinutes: 0,
    servings: 4,
    difficulty: "easy",
    category: "Soups",
    tags: ["vegetarian", "cold", "summer", "yogurt"],
    ingredients: [
      "500 g plain yogurt",
      "300 ml cold water",
      "1 large cucumber, finely diced or grated",
      "2 garlic cloves, minced",
      "3 tablespoons chopped dill",
      "40 g walnuts, chopped",
      "1 tablespoon sunflower oil",
      "Salt to taste"
    ],
    steps: [
      "Whisk yogurt and cold water until smooth.",
      "Stir in cucumber, garlic, dill, walnuts, oil, and salt.",
      "Chill for at least 20 minutes.",
      "Serve cold with extra dill and walnuts on top."
    ]
  },
  {
    title: "Kyufte Grilled Meat Patties",
    slug: "kyufte-grilled-meat-patties",
    description:
      "Juicy Bulgarian-style meat patties seasoned with onion, cumin, parsley, and savory, then grilled until smoky.",
    imageUrl: "/images/recipes/kyufte-grilled-meat-patties.jpg",
    imageAlt: "Grilled kyufte meat patties served with salad",
    prepTimeMinutes: 20,
    cookTimeMinutes: 15,
    servings: 4,
    difficulty: "easy",
    category: "Mains",
    tags: ["beef", "pork", "grill", "weeknight"],
    ingredients: [
      "400 g ground pork",
      "300 g ground beef",
      "1 small onion, finely grated",
      "2 tablespoons chopped parsley",
      "1 teaspoon ground cumin",
      "1 teaspoon dried savory",
      "1 teaspoon salt",
      "1/2 teaspoon black pepper",
      "1 tablespoon cold water"
    ],
    steps: [
      "Mix the meats with onion, parsley, cumin, savory, salt, pepper, and cold water.",
      "Knead briefly until the mixture becomes sticky, then chill for 30 minutes.",
      "Shape into flat patties.",
      "Grill or pan-sear until browned outside and cooked through.",
      "Serve with Shopska salad, fries, or lyutenitsa."
    ]
  },
  {
    title: "Stuffed Peppers with Rice",
    slug: "stuffed-peppers-with-rice",
    description:
      "Sweet bell peppers filled with seasoned rice, vegetables, and herbs, baked in a light tomato sauce.",
    imageUrl: "/images/recipes/stuffed-peppers-with-rice.jpg",
    imageAlt: "Baked stuffed peppers with tomato sauce",
    prepTimeMinutes: 30,
    cookTimeMinutes: 55,
    servings: 6,
    difficulty: "medium",
    category: "Mains",
    tags: ["vegetarian", "rice", "baked", "family"],
    ingredients: [
      "6 bell peppers, tops removed and seeds cleaned",
      "200 g white rice, rinsed",
      "1 onion, finely chopped",
      "1 carrot, grated",
      "300 g chopped tomatoes",
      "2 tablespoons sunflower oil",
      "1 teaspoon paprika",
      "1 teaspoon dried savory",
      "2 tablespoons chopped parsley",
      "Salt and black pepper to taste"
    ],
    steps: [
      "Cook onion and carrot in oil until softened.",
      "Stir in rice, paprika, savory, half the tomatoes, salt, and pepper.",
      "Cook for a few minutes, then add parsley.",
      "Fill the peppers loosely with the rice mixture and place them in a baking dish.",
      "Add remaining tomatoes and a splash of water, then bake covered until tender."
    ]
  },
  {
    title: "Mish-Mash Eggs and Peppers",
    slug: "mish-mash-eggs-and-peppers",
    description:
      "A quick skillet dish of roasted peppers, tomatoes, eggs, and sirene cheese, finished with parsley.",
    imageUrl: "/images/recipes/mish-mash-eggs-and-peppers.jpg",
    imageAlt: "Mish-mash eggs with peppers and sirene in a skillet",
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 3,
    difficulty: "easy",
    category: "Quick Meals",
    tags: ["vegetarian", "eggs", "skillet", "sirene"],
    ingredients: [
      "4 roasted red peppers, chopped",
      "2 tomatoes, chopped",
      "1 onion, finely chopped",
      "4 eggs, beaten",
      "150 g sirene cheese, crumbled",
      "2 tablespoons sunflower oil",
      "2 tablespoons chopped parsley",
      "Salt and black pepper to taste"
    ],
    steps: [
      "Cook onion in oil until translucent.",
      "Add peppers and tomatoes, then simmer until the mixture thickens.",
      "Pour in beaten eggs and stir gently until softly set.",
      "Fold in crumbled sirene and season to taste.",
      "Finish with parsley and serve warm."
    ]
  },
  {
    title: "Bob Chorba Bean Soup",
    slug: "bob-chorba-bean-soup",
    description:
      "A comforting Bulgarian bean soup with onions, carrots, peppers, tomatoes, mint, and savory.",
    imageUrl: "/images/recipes/bob-chorba-bean-soup.jpg",
    imageAlt: "Bowl of Bulgarian bean soup with herbs",
    prepTimeMinutes: 20,
    cookTimeMinutes: 90,
    servings: 6,
    difficulty: "medium",
    category: "Soups",
    tags: ["vegan", "beans", "comfort-food", "budget"],
    ingredients: [
      "350 g dried white beans, soaked overnight",
      "1 onion, chopped",
      "1 carrot, diced",
      "1 red pepper, diced",
      "250 g chopped tomatoes",
      "2 tablespoons sunflower oil",
      "1 teaspoon paprika",
      "1 teaspoon dried mint",
      "1 teaspoon dried savory",
      "Salt and black pepper to taste"
    ],
    steps: [
      "Drain soaked beans and simmer in fresh water until nearly tender.",
      "Cook onion, carrot, and pepper in oil until softened.",
      "Add paprika, tomatoes, mint, savory, salt, and pepper.",
      "Stir the vegetable mixture into the beans and simmer until creamy and tender.",
      "Adjust seasoning before serving."
    ]
  },
  {
    title: "Tikvenik Pumpkin Pastry",
    slug: "tikvenik-pumpkin-pastry",
    description:
      "A sweet rolled filo pastry filled with grated pumpkin, walnuts, cinnamon, and sugar.",
    imageUrl: "/images/recipes/tikvenik-pumpkin-pastry.jpg",
    imageAlt: "Slices of tikvenik pumpkin pastry dusted with powdered sugar",
    prepTimeMinutes: 30,
    cookTimeMinutes: 40,
    servings: 8,
    difficulty: "medium",
    category: "Desserts",
    tags: ["vegetarian", "pumpkin", "pastry", "holiday"],
    ingredients: [
      "500 g filo pastry sheets",
      "700 g pumpkin, grated",
      "120 g walnuts, chopped",
      "120 g sugar",
      "1 teaspoon cinnamon",
      "80 ml sunflower oil",
      "2 tablespoons powdered sugar for serving"
    ],
    steps: [
      "Mix grated pumpkin with walnuts, sugar, and cinnamon.",
      "Brush filo sheets lightly with oil and spread pumpkin filling along one edge.",
      "Roll each sheet into a log and arrange the rolls in a baking pan.",
      "Bake at 180 C until crisp and golden.",
      "Cool slightly and dust with powdered sugar."
    ]
  }
];
