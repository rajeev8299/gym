const toggleButton = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
const yearElements = document.querySelectorAll('#year');
const slides = Array.from(document.querySelectorAll('.slide'));
const body = document.body;
const navBar = document.querySelector('.nav-bar');

if (navBar && !navBar.querySelector('.theme-toggle')) {
  const themeToggle = document.createElement('button');
  themeToggle.className = 'theme-toggle';
  themeToggle.type = 'button';
  themeToggle.setAttribute('aria-label', 'Toggle color mode');
  navBar.insertBefore(themeToggle, navBar.querySelector('.site-nav') || navBar.lastElementChild);
}

const themeToggleButton = navBar ? navBar.querySelector('.theme-toggle') : null;

function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  if (themeToggleButton) {
    themeToggleButton.innerHTML = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
    themeToggleButton.setAttribute('aria-pressed', String(theme === 'dark'));
  }
}

const savedTheme = localStorage.getItem('theme');
const systemTheme = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
applyTheme(savedTheme || systemTheme);

if (themeToggleButton) {
  themeToggleButton.addEventListener('click', () => {
    const nextTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });
}

if (toggleButton && nav) {
  toggleButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggleButton.setAttribute('aria-expanded', String(isOpen));
  });
}

yearElements.forEach((el) => {
  el.textContent = new Date().getFullYear();
});

if (slides.length) {
  let activeIndex = 0;
  setInterval(() => {
    slides[activeIndex].classList.remove('active');
    activeIndex = (activeIndex + 1) % slides.length;
    slides[activeIndex].classList.add('active');
  }, 4000);
}

const siteHeader = document.querySelector('.site-header');
if (siteHeader) {
  const toggleHeaderScrolled = () => {
    siteHeader.classList.toggle('scrolled', window.scrollY > 40);
  };
  toggleHeaderScrolled();
  window.addEventListener('scroll', toggleHeaderScrolled, { passive: true });
}


const dietForm = document.querySelector('#diet-form');
const dietResult = document.querySelector('#diet-result');
const foodModal = document.querySelector('#food-modal');
const foodModalClose = document.querySelector('#food-modal-close');
const foodModalImage = document.querySelector('#food-modal-image');
const foodModalName = document.querySelector('#food-modal-name');
const foodModalCategory = document.querySelector('#food-modal-category');
const foodModalType = document.querySelector('#food-modal-type');
const foodModalDesc = document.querySelector('#food-modal-desc');
const foodModalNutrition = document.querySelector('#food-modal-nutrition');

// Food database: har food item ke liye image, description, aur nutrition info
// Images from Unsplash (free, no API key needed)
const foodDatabase = {
  'besan chilla': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Chilla_besan.JPG/500px-Chilla_besan.JPG', category: 'Breakfast', type: 'Protein-rich', desc: 'Besan chilla gram flour se banta hai - high protein aur fiber. Green chutney ke saath khana perfect breakfast hai.', nutrition: { calories: '180 kcal', protein: '10 g', carbs: '20 g', fats: '6 g' } },
  'greek yogurt': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Plain_Curd_Rice.jpg/500px-Plain_Curd_Rice.jpg', category: 'Dairy', type: 'High Protein', desc: 'Greek yogurt mein regular yogurt se 2x zyada protein hota hai. Gut health ke liye bhi accha hai.', nutrition: { calories: '100 kcal', protein: '17 g', carbs: '6 g', fats: '0.7 g' } },
  'oats': { image: 'https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=600&q=80', category: 'Carbs', type: 'Whole Grain', desc: 'Oats mein soluble fiber beta-glucan hota hai jo cholesterol kam karta hai aur pet lambe time tak bharta hai.', nutrition: { calories: '150 kcal', protein: '5 g', carbs: '27 g', fats: '3 g' } },
  'apple': { image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&q=80', category: 'Fruit', type: 'Fiber-rich', desc: 'Apple mein pectin fiber hota hai jo digestion improve karta hai. "An apple a day keeps the doctor away."', nutrition: { calories: '95 kcal', protein: '0.5 g', carbs: '25 g', fats: '0.3 g' } },
  'green tea': { image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&q=80', category: 'Beverage', type: 'Antioxidant', desc: 'Green tea mein catechins hote hain jo metabolism 4-5% tak badhate hain. Fat loss mein madadgar.', nutrition: { calories: '2 kcal', protein: '0 g', carbs: '0 g', fats: '0 g' } },
  'oats banana shake': { image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&q=80', category: 'Shake', type: 'Mass Gainer', desc: 'Oats, banana, milk aur peanut butter ka shake - weight gain ke liye best homemade option.', nutrition: { calories: '420 kcal', protein: '14 g', carbs: '65 g', fats: '12 g' } },
  'poha': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Poha%2C_a_snack_made_of_flattened_rice.jpg/500px-Poha%2C_a_snack_made_of_flattened_rice.jpg', category: 'Breakfast', type: 'Light & Healthy', desc: 'Poha flattened rice se banta hai - light on stomach aur quick to make. Maharashtrian style with peanuts.', nutrition: { calories: '180 kcal', protein: '3 g', carbs: '35 g', fats: '4 g' } },
  'boiled eggs': { image: 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=600&q=80', category: 'Protein', type: 'Complete Protein', desc: 'Andar se protein ka king - 1 egg mein 6g protein. Boiled eggs mein zero extra oil hota hai.', nutrition: { calories: '78 kcal', protein: '6 g', carbs: '0.6 g', fats: '5 g' } },
  'paneer bhurji': { image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80', category: 'Protein', type: 'Vegetarian', desc: 'Paneer crumbled aur spices ke saath bhuna hua. High protein, calcium rich, aur tasty.', nutrition: { calories: '265 kcal', protein: '18 g', carbs: '8 g', fats: '20 g' } },
  'banana': { image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80', category: 'Fruit', type: 'Energy', desc: 'Banana natural energy source hai - workout se pehle ya baad mein best. Potassium bhi milta hai.', nutrition: { calories: '105 kcal', protein: '1.3 g', carbs: '27 g', fats: '0.4 g' } },
  'almonds': { image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&q=80', category: 'Nuts', type: 'Healthy Fats', desc: 'Badam mein vitamin E, magnesium aur healthy fats hain. Roz 8-10 pcs khao brain aur heart ke liye.', nutrition: { calories: '164 kcal', protein: '6 g', carbs: '6 g', fats: '14 g' } },
  'daliya': { image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80', category: 'Carbs', type: 'High Fiber', desc: 'Daliya broken wheat hai - high fiber, low glycemic index. Diabetes wale logon ke liye best.', nutrition: { calories: '150 kcal', protein: '5 g', carbs: '32 g', fats: '1 g' } },
  'chapati': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg', category: 'Carbs', type: 'Whole Wheat', desc: 'Whole wheat chapati - 1 piece mein 100 kcal aur 3g protein. Ghee ke saath taste aur badhta hai.', nutrition: { calories: '100 kcal', protein: '3 g', carbs: '20 g', fats: '0.5 g' } },
  'brown rice': { image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80', category: 'Carbs', type: 'Complex Carb', desc: 'White rice se zyada fiber aur nutrients. Body ko slow energy deta hai - weight management mein best.', nutrition: { calories: '216 kcal', protein: '5 g', carbs: '45 g', fats: '1.8 g' } },
  'dal': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Dal_tadka_and_naan.jpg/500px-Dal_tadka_and_naan.jpg', category: 'Protein', type: 'Vegetarian', desc: 'Dal har ghar ki daily protein. Moong, arhar, masoor - sabhi mein protein aur iron hota hai.', nutrition: { calories: '198 kcal', protein: '11 g', carbs: '28 g', fats: '5 g' } },
  'moong dal': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Dal_tadka_and_naan.jpg/500px-Dal_tadka_and_naan.jpg', category: 'Protein', type: 'Easy to Digest', desc: 'Moong dal light aur easy to digest hai. Protein rich aur detoxifying bhi. Bodybuilding mein best.', nutrition: { calories: '212 kcal', protein: '14 g', carbs: '30 g', fats: '1 g' } },
  'paneer': { image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80', category: 'Protein', type: 'Calcium-rich', desc: '100g paneer mein 18g protein aur 200mg calcium. Vegans ke liye best protein source.', nutrition: { calories: '265 kcal', protein: '18 g', carbs: '1.2 g', fats: '21 g' } },
  'chicken breast': { image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&q=80', category: 'Protein', type: 'Lean Meat', desc: 'Chicken breast bodybuilders ka best friend. 100g mein 31g protein, almost zero fat.', nutrition: { calories: '165 kcal', protein: '31 g', carbs: '0 g', fats: '3.6 g' } },
  'fish': { image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80', category: 'Protein', type: 'Omega-3', desc: 'Fish mein omega-3 fatty acids hote hain - brain aur heart ke liye. Roli aur Bangda common hain.', nutrition: { calories: '206 kcal', protein: '22 g', carbs: '0 g', fats: '12 g' } },
  'chicken curry': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg', category: 'Main Course', type: 'Non-Veg', desc: 'Desi style chicken curry - protein aur spices ka perfect combo. Brown rice ya chapati ke saath khayein.', nutrition: { calories: '320 kcal', protein: '28 g', carbs: '8 g', fats: '20 g' } },
  'mutton': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg', category: 'Protein', type: 'Iron-rich', desc: 'Mutton mein high protein, iron aur B12 hota hai. Weight gain aur strength ke liye best.', nutrition: { calories: '294 kcal', protein: '25 g', carbs: '0 g', fats: '21 g' } },
  'egg bhurji': { image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80', category: 'Breakfast', type: 'Quick Protein', desc: 'Egg bhurji scrambled eggs hain - 5 minute mein ready. Pyaz, mirchi, dhania ke saath tastiest.', nutrition: { calories: '210 kcal', protein: '14 g', carbs: '4 g', fats: '15 g' } },
  'egg curry': { image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&q=80', category: 'Main Course', type: 'Non-Veg', desc: 'Egg curry anda masala - protein rich aur budget friendly. Roti ya rice ke saath perfect meal.', nutrition: { calories: '240 kcal', protein: '14 g', carbs: '8 g', fats: '17 g' } },
  'chicken sandwich': { image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80', category: 'Snack', type: 'High Protein', desc: 'Grilled chicken breast brown bread mein - gym ke baad best recovery snack.', nutrition: { calories: '320 kcal', protein: '28 g', carbs: '30 g', fats: '8 g' } },
  'tofu': { image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80', category: 'Protein', type: 'Plant-based', desc: 'Tofu soya paneer hai - 100g mein 8g protein. Vegans aur vegetarians ke liye best option.', nutrition: { calories: '76 kcal', protein: '8 g', carbs: '1.9 g', fats: '4.8 g' } },
  'rajma': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Rajma_Chawal_by_Rama_Bhave.jpg/500px-Rajma_Chawal_by_Rama_Bhave.jpg', category: 'Protein', type: 'Kidney Beans', desc: 'Rajma kidney beans hai - protein aur fiber dono rich. Chawal ke saath classic North Indian combo.', nutrition: { calories: '245 kcal', protein: '15 g', carbs: '42 g', fats: '1 g' } },
  'chana': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Chana_Masala_in_Paul%C3%ADnia%2C_2023-10-16.jpg/500px-Chana_Masala_in_Paul%C3%ADnia%2C_2023-10-16.jpg', category: 'Protein', type: 'Chickpeas', desc: 'Chana chickpeas hai - high protein, fiber aur iron. Chole ya boiled chana dono healthy hain.', nutrition: { calories: '269 kcal', protein: '15 g', carbs: '45 g', fats: '4 g' } },
  'sprouts': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Sprouts_Salad_with_Corn.JPG/500px-Sprouts_Salad_with_Corn.JPG', category: 'Protein', type: 'Live Food', desc: 'Sprouts mein enzymes hote hain jo digestion improve karte hain. Protein aur vitamins rich.', nutrition: { calories: '100 kcal', protein: '7 g', carbs: '17 g', fats: '0.7 g' } },
  'yogurt': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Plain_Curd_Rice.jpg/500px-Plain_Curd_Rice.jpg', category: 'Dairy', type: 'Probiotic', desc: 'Dahi mein probiotics hote hain jo gut health ke liye zaroori hain. Calcium bhi milta hai.', nutrition: { calories: '60 kcal', protein: '3.5 g', carbs: '5 g', fats: '3 g' } },
  'curd': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Plain_Curd_Rice.jpg/500px-Plain_Curd_Rice.jpg', category: 'Dairy', type: 'Probiotic', desc: 'Curd probiotic hai - digestion ke liye best. Rice ya khichdi ke saath combo perfect hai.', nutrition: { calories: '60 kcal', protein: '3.5 g', carbs: '5 g', fats: '3 g' } },
  'milk': { image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80', category: 'Dairy', type: 'Calcium', desc: 'Doodh mein calcium, protein aur vitamin D hota hai. Raat ko sone se pehle ek glass piyo.', nutrition: { calories: '150 kcal', protein: '8 g', carbs: '12 g', fats: '8 g' } },
  'peanut butter': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Peanut_butter_glass.jpg/500px-Peanut_butter_glass.jpg', category: 'Fats', type: 'Healthy Fats', desc: 'Peanut butter mein healthy fats aur protein. Bread ya shake mein mix karke khao.', nutrition: { calories: '188 kcal', protein: '8 g', carbs: '6 g', fats: '16 g' } },
  'trail mix': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg', category: 'Snack', type: 'Energy', desc: 'Mixed nuts, raisins, seeds ka combo - hiking aur gym ke liye perfect portable snack.', nutrition: { calories: '170 kcal', protein: '5 g', carbs: '13 g', fats: '11 g' } },
  'cheese': { image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&q=80', category: 'Dairy', type: 'Protein', desc: 'Cheese mein protein aur calcium dono hote hain. Sandwich ya salad mein add karo.', nutrition: { calories: '113 kcal', protein: '7 g', carbs: '0.4 g', fats: '9 g' } },
  'buttermilk': { image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&q=80', category: 'Beverage', type: 'Probiotic', desc: 'Chaas digestive aid hai. Nimbu, dhania, zeera powder add karke piyo - refreshing aur healthy.', nutrition: { calories: '40 kcal', protein: '3 g', carbs: '4 g', fats: '1 g' } },
  'fruit': { image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=600&q=80', category: 'Fruit', type: 'Vitamins', desc: 'Seasonal fruits vitamins aur fiber dete hain. Variety mein khao - banana, apple, orange, papaya.', nutrition: { calories: '80 kcal', protein: '1 g', carbs: '20 g', fats: '0.3 g' } },
  'mixed fruit': { image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=600&q=80', category: 'Fruit', type: 'Vitamins', desc: 'Mixed fruit bowl se alag alag nutrients milte hain. Apple, banana, papaya, grapes mix karke khao.', nutrition: { calories: '110 kcal', protein: '1.5 g', carbs: '28 g', fats: '0.5 g' } },
  'sweet potato': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Shakarkandi_Chaat-_Homemade-Indian_Subcontinent-Image_no._2.jpg/500px-Shakarkandi_Chaat-_Homemade-Indian_Subcontinent-Image_no._2.jpg', category: 'Carbs', type: 'Complex Carb', desc: 'Shakarkandi mein vitamin A aur fiber hota hai. Glycemic index low hai - weight loss ke liye best.', nutrition: { calories: '103 kcal', protein: '2 g', carbs: '24 g', fats: '0.1 g' } },
  'cucumber': { image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&q=80', category: 'Vegetable', type: 'Hydrating', desc: 'Kheere mein 95% paani hota hai. Low calorie, refreshing - salad mein ya khali khao.', nutrition: { calories: '16 kcal', protein: '0.7 g', carbs: '4 g', fats: '0.1 g' } },
  'salad': { image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', category: 'Vegetable', type: 'Fiber-rich', desc: 'Mixed salad - kheera, tamatar, pyaaz, gajar, palak. Vitamins aur fiber ka treasure.', nutrition: { calories: '50 kcal', protein: '2 g', carbs: '10 g', fats: '0.3 g' } },
  'moong dal chilla': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Moonglet_chilla_with_curd_and_hot_tea.jpg/500px-Moonglet_chilla_with_curd_and_hot_tea.jpg', category: 'Breakfast', type: 'High Protein', desc: 'Moong dal paste se bana chilla - 100g mein 7g protein. Weight loss ke liye best breakfast.', nutrition: { calories: '160 kcal', protein: '9 g', carbs: '18 g', fats: '5 g' } },
  'idli': { image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80', category: 'Breakfast', type: 'Fermented', desc: 'Idli fermented batter se banti hai - light, easy to digest, probiotic bhi. Sambar ke saath perfect.', nutrition: { calories: '58 kcal', protein: '2 g', carbs: '12 g', fats: '0.4 g' } },
  'sambar': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Idli_Sambar%28South_Indian%29.jpg/500px-Idli_Sambar%28South_Indian%29.jpg', category: 'Lentil Curry', type: 'South Indian', desc: 'Sambar dal aur sabziyon se banta hai. Protein aur fiber dono milte hain. Idli, dosa ke saath.', nutrition: { calories: '120 kcal', protein: '6 g', carbs: '18 g', fats: '3 g' } },
  'keema': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg', category: 'Protein', type: 'Minced Meat', desc: 'Keema minced meat hai - chicken ya mutton dono. High protein, paratha ya rice ke saath.', nutrition: { calories: '250 kcal', protein: '26 g', carbs: '0 g', fats: '17 g' } },
  'chicken soup': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Chicken_Noodle_Soup_US.jpg/500px-Chicken_Noodle_Soup_US.jpg', category: 'Soup', type: 'Immunity', desc: 'Chicken soup cold mein immunity badhata hai. Low calorie aur high protein - diet mein best.', nutrition: { calories: '120 kcal', protein: '15 g', carbs: '5 g', fats: '4 g' } },
  'palak': { image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', category: 'Vegetable', type: 'Iron-rich', desc: 'Palak spinach hai - iron, folate aur vitamin K. Paneer ya tofu ke saath palak paneer banao.', nutrition: { calories: '23 kcal', protein: '2.9 g', carbs: '3.6 g', fats: '0.4 g' } },
  'lauki': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Lauki_ki_Sabzi.jpg/500px-Lauki_ki_Sabzi.jpg', category: 'Vegetable', type: 'Low Calorie', desc: 'Lauki bottle gourd hai - 100g mein sirf 12 kcal. Weight loss ke liye best sabzi.', nutrition: { calories: '12 kcal', protein: '0.6 g', carbs: '2.5 g', fats: '0.02 g' } },
  'bhindi': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Bhindi_fry.jpg/500px-Bhindi_fry.jpg', category: 'Vegetable', type: 'Fiber', desc: 'Bhindi okra hai - fiber aur vitamin C rich. Low calorie aur diabetes friendly.', nutrition: { calories: '33 kcal', protein: '1.9 g', carbs: '7 g', fats: '0.2 g' } },
  'mixed vegetable': { image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80', category: 'Vegetable', type: 'Mixed', desc: 'Mix sabzi - gobhi, matar, gajar, beans. Vitamins aur minerals ka balanced mix.', nutrition: { calories: '80 kcal', protein: '3 g', carbs: '12 g', fats: '2 g' } },
  'vegetable soup': { image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80', category: 'Soup', type: 'Low Calorie', desc: 'Mixed vegetable soup - light dinner ke liye best. Low calorie, high fiber, aur filling.', nutrition: { calories: '70 kcal', protein: '2.5 g', carbs: '12 g', fats: '1 g' } },
  'sattu': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg', category: 'Protein', type: 'Bihar Specialty', desc: 'Sattu roasted chana ka powder hai - Bihar ka super food. Protein, fiber, iron sab milta hai.', nutrition: { calories: '160 kcal', protein: '9 g', carbs: '25 g', fats: '2 g' } },
  'makhana': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Foxnut_Makhana_-_Nawada_District_-_Bihar_-_1.jpg/500px-Foxnut_Makhana_-_Nawada_District_-_Bihar_-_1.jpg', category: 'Snack', type: 'Low Calorie', desc: 'Makhana fox nuts hai - 100g mein sirf 90 kcal. Crunchy, healthy snack - weight loss ke liye best.', nutrition: { calories: '90 kcal', protein: '4 g', carbs: '16 g', fats: '0.5 g' } },
  'coconut water': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Coconut_Drink%2C_Pangandaran.JPG/500px-Coconut_Drink%2C_Pangandaran.JPG', category: 'Beverage', type: 'Electrolyte', desc: 'Nariyal paani natural electrolyte hai. Workout ke baad piyo - dehydration door karta hai.', nutrition: { calories: '19 kcal', protein: '0.7 g', carbs: '3.7 g', fats: '0.2 g' } },
  'tuna': { image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80', category: 'Protein', type: 'Omega-3', desc: 'Tuna fish mein omega-3 aur protein dono hain. Bodybuilding aur brain health ke liye best.', nutrition: { calories: '132 kcal', protein: '28 g', carbs: '0 g', fats: '1 g' } },
  'dry fruits': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg', category: 'Nuts', type: 'Energy', desc: 'Mixed dry fruits - badam, akhrot, kaju, kishmish. Energy boost ke liye best snack.', nutrition: { calories: '180 kcal', protein: '5 g', carbs: '15 g', fats: '12 g' } },
  'khichdi': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Khichadi_%2849683829713%29.jpg/500px-Khichadi_%2849683829713%29.jpg', category: 'Main Course', type: 'Comfort Food', desc: 'Khichdi dal aur chawal ka mix hai - light on stomach, easy to digest. Dahi ke saath perfect.', nutrition: { calories: '220 kcal', protein: '8 g', carbs: '40 g', fats: '4 g' } },
  'paneer tikka': { image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80', category: 'Snack', type: 'High Protein', desc: 'Paneer tikka grilled paneer with spices - high protein, low carb. Diet friendly starter.', nutrition: { calories: '210 kcal', protein: '16 g', carbs: '6 g', fats: '14 g' } },
  'grilled chicken': { image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&q=80', category: 'Main Course', type: 'Lean Protein', desc: 'Grilled chicken breast - 100g mein 31g protein. Best post-workout meal.', nutrition: { calories: '165 kcal', protein: '31 g', carbs: '0 g', fats: '3.6 g' } },
  'butter chicken': { image: 'https.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80', category: 'Main Course', type: 'Rich', desc: 'Butter chicken creamy aur rich hai - protein bhi milta hai par calories zyada. Occasional treat.', nutrition: { calories: '390 kcal', protein: '24 g', carbs: '12 g', fats: '28 g' } },
  'naan': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Indian_naan_bread.jpg/500px-Indian_naan_bread.jpg', category: 'Carbs', type: 'Refined', desc: 'Naan refined flour se banta hai - calories zyada. Butter chicken ke saath taste acha par limit mein khayein.', nutrition: { calories: '262 kcal', protein: '9 g', carbs: '45 g', fats: '5 g' } },
  'jeera rice': { image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80', category: 'Carbs', type: 'Flavored', desc: 'Jeera rice plain rice mein zeera aur ghee. Digestion mein madad karta hai. Dal ke saath perfect.', nutrition: { calories: '230 kcal', protein: '4 g', carbs: '45 g', fats: '5 g' } },
  'chicken biryani': { image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80', category: 'Main Course', type: 'Festive', desc: 'Chicken biryani layered rice with chicken aur spices. Protein milta hai par calories zyada.', nutrition: { calories: '490 kcal', protein: '25 g', carbs: '60 g', fats: '18 g' } },
  'stuffed paratha': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Aloo_Paratha_2.jpg/500px-Aloo_Paratha_2.jpg', category: 'Breakfast', type: 'Heavy', desc: 'Aloo ya paneer stuffed paratha - tasty par calorie dense. Ghee ke saath khao, dahi ke saath balance.', nutrition: { calories: '290 kcal', protein: '7 g', carbs: '35 g', fats: '14 g' } },
  'mushroom': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Mushroom_Tikka_Masala_by_Preeti_Tamilarasan.jpg/500px-Mushroom_Tikka_Masala_by_Preeti_Tamilarasan.jpg', category: 'Vegetable', type: 'Protein', desc: 'Mushroom mein plant-based protein hota hai. Vitamin D bhi milta hai - rare for vegetarian foods.', nutrition: { calories: '22 kcal', protein: '3.1 g', carbs: '3.3 g', fats: '0.3 g' } },
  'mix veg': { image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80', category: 'Vegetable', type: 'Mixed', desc: 'Mix vegetable sabzi - gobhi, matar, gajar, beans. Balanced micronutrients milte hain.', nutrition: { calories: '85 kcal', protein: '3 g', carbs: '13 g', fats: '2.5 g' } },
  'moong dal chilla 2': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Moonglet_chilla_with_curd_and_hot_tea.jpg/500px-Moonglet_chilla_with_curd_and_hot_tea.jpg', category: 'Breakfast', type: 'High Protein', desc: 'Moong dal ka chilla - protein aur fiber rich. Weight loss ke liye perfect dinner bhi.', nutrition: { calories: '180 kcal', protein: '10 g', carbs: '20 g', fats: '6 g' } },
  'daliya khichdi': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Khichadi_%2849683829713%29.jpg/500px-Khichadi_%2849683829713%29.jpg', category: 'Main Course', type: 'Healthy', desc: 'Daliya khichdi - broken wheat aur sabziyon se bana. Low glycemic, fiber rich.', nutrition: { calories: '210 kcal', protein: '7 g', carbs: '38 g', fats: '3 g' } },
  'cucumber raita': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Plain_Curd_Rice.jpg/500px-Plain_Curd_Rice.jpg', category: 'Side', type: 'Cooling', desc: 'Kheere ka raita - cooling effect, low calorie, probiotic. Biryani ya pulao ke saath best.', nutrition: { calories: '60 kcal', protein: '3 g', carbs: '6 g', fats: '2.5 g' } },
  'mixed vegetable salad': { image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', category: 'Vegetable', type: 'Fiber', desc: 'Mixed salad kheera, tamatar, pyaaz, gajar, palak, lemon. Fiber aur vitamins ka powerhouse.', nutrition: { calories: '55 kcal', protein: '2 g', carbs: '10 g', fats: '0.5 g' } },
  'coconut': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Coconuts_-_single_and_cracked_open.jpg/500px-Coconuts_-_single_and_cracked_open.jpg', category: 'Fats', type: 'MCT', desc: 'Nariyal mein medium chain fatty acids hote hain. Energy boost ke liye best.', nutrition: { calories: '99 kcal', protein: '1 g', carbs: '4 g', fats: '9 g' } },
  'spinach': { image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', category: 'Vegetable', type: 'Iron-rich', desc: 'Palak iron aur folate ka best source. Smoothie ya sabzi dono mein use karo.', nutrition: { calories: '23 kcal', protein: '2.9 g', carbs: '3.6 g', fats: '0.4 g' } },
  'methi': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Lauki_ki_Sabzi.jpg/500px-Lauki_ki_Sabzi.jpg', category: 'Vegetable', type: 'Bitter', desc: 'Methi fenugreek hai - diabetes control mein madad karta hai. Thepla ya sabzi banao.', nutrition: { calories: '49 kcal', protein: '4.4 g', carbs: '6 g', fats: '0.9 g' } },
  'bottle gourd': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Lauki_ki_Sabzi.jpg/500px-Lauki_ki_Sabzi.jpg', category: 'Vegetable', type: 'Detox', desc: 'Lauki detoxifying hai. Juice ya sabzi dono healthy. Weight loss ke liye best.', nutrition: { calories: '12 kcal', protein: '0.6 g', carbs: '2.5 g', fats: '0.02 g' } },
  'boiled egg whites': { image: 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=600&q=80', category: 'Protein', type: 'Pure Protein', desc: 'Egg whites mein 100% protein, zero fat. Cutting phase mein bodybuilders best friend.', nutrition: { calories: '52 kcal', protein: '11 g', carbs: '0.7 g', fats: '0.2 g' } },
  'egg white omelette': { image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80', category: 'Breakfast', type: 'Low Fat', desc: 'Egg white omelette veggies ke saath - low fat high protein. Diet friendly breakfast.', nutrition: { calories: '120 kcal', protein: '14 g', carbs: '4 g', fats: '5 g' } },
  'chicken biryani small': { image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80', category: 'Main Course', type: 'Festive', desc: 'Small portion chicken biryani - occasional treat ke liye. Protein milta hai.', nutrition: { calories: '350 kcal', protein: '18 g', carbs: '45 g', fats: '12 g' } },
  'mutton soup': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Chicken_Noodle_Soup_US.jpg/500px-Chicken_Noodle_Soup_US.jpg', category: 'Soup', type: 'Recovery', desc: 'Mutton soup recovery ke liye best. Iron aur protein rich. Cold mein perfect.', nutrition: { calories: '150 kcal', protein: '18 g', carbs: '2 g', fats: '8 g' } },
  'guava': { image: 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=600&q=80', category: 'Fruit', type: 'Vitamin C', desc: 'Amrood vitamin C ka best source. Diabetes patients ke liye bhi accha - glycemic index low.', nutrition: { calories: '68 kcal', protein: '2.6 g', carbs: '14 g', fats: '1 g' } },
  'boiled egg': { image: 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=600&q=80', category: 'Protein', type: 'Complete Protein', desc: '1 boiled egg = 6g protein. Quick, easy, aur kahi bhi kha sakte ho.', nutrition: { calories: '78 kcal', protein: '6 g', carbs: '0.6 g', fats: '5 g' } },
  'cucumber chaat': { image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&q=80', category: 'Snack', type: 'Low Calorie', desc: 'Kheera chaat nimbu, mirchi, zeera ke saath - refreshing snack. Diet friendly.', nutrition: { calories: '30 kcal', protein: '1 g', carbs: '6 g', fats: '0.2 g' } },
  'marie biscuits': { image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80', category: 'Snack', type: 'Refined', desc: 'Marie biscuits simple carbs hain. Chai ke saath kabhi kabhi chalega par overdoing avoid karo.', nutrition: { calories: '28 kcal', protein: '0.5 g', carbs: '5 g', fats: '0.7 g' } },
  'chana chaat': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Chana_Masala_in_Paul%C3%ADnia%2C_2023-10-16.jpg/500px-Chana_Masala_in_Paul%C3%ADnia%2C_2023-10-16.jpg', category: 'Snack', type: 'Street Food', desc: 'Chana chaat boiled chana, pyaaz, tamatar, nimbu ke saath. Protein aur fiber rich street food.', nutrition: { calories: '180 kcal', protein: '9 g', carbs: '28 g', fats: '3 g' } },
  'chaas': { image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&q=80', category: 'Beverage', type: 'Probiotic', desc: 'Chaas spiced buttermilk hai. Digestion improve karta hai. Garam mosam mein refreshing.', nutrition: { calories: '40 kcal', protein: '3 g', carbs: '4 g', fats: '1 g' } },
  'sprout chaat': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Sprouts_Salad_with_Corn.JPG/500px-Sprouts_Salad_with_Corn.JPG', category: 'Snack', type: 'Enzyme-rich', desc: 'Sprout chaat moong sprouts, pyaaz, tamatar, nimbu. Live enzymes aur protein.', nutrition: { calories: '120 kcal', protein: '8 g', carbs: '18 g', fats: '1.5 g' } },
  'peanuts': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg', category: 'Nuts', type: 'Protein', desc: 'Moong phali protein aur healthy fats deta hai. Budget friendly snack. 30g = 7g protein.', nutrition: { calories: '170 kcal', protein: '7 g', carbs: '5 g', fats: '14 g' } },
  'sprouts salad': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Sprouts_Salad_with_Corn.JPG/500px-Sprouts_Salad_with_Corn.JPG', category: 'Salad', type: 'Live Food', desc: 'Sprouts salad boiled sprouts, kheera, nimbu, mirchi. Raw protein aur enzymes.', nutrition: { calories: '110 kcal', protein: '8 g', carbs: '16 g', fats: '1 g' } },
  'bournvita': { image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80', category: 'Beverage', type: 'Fortified', desc: 'Bournvita fortified drink hai - vitamins aur minerals add kiye hain. Doodh ke saath.', nutrition: { calories: '150 kcal', protein: '8 g', carbs: '20 g', fats: '4 g' } },
  'omelette': { image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80', category: 'Breakfast', type: 'High Protein', desc: 'Omelette 3 eggs ka - 18g protein. Brown bread toast ke saath complete breakfast.', nutrition: { calories: '230 kcal', protein: '18 g', carbs: '2 g', fats: '16 g' } },
  'brown bread': { image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80', category: 'Carbs', type: 'Whole Wheat', desc: 'Brown bread whole wheat se bana - fiber zyada, white bread se better. Toast ya sandwich mein.', nutrition: { calories: '81 kcal', protein: '4 g', carbs: '14 g', fats: '1 g' } },
  'chicken wrap': { image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80', category: 'Snack', type: 'Travel Food', desc: 'Chicken wrap whole wheat roti mein chicken aur veggies. Travel ke liye perfect.', nutrition: { calories: '320 kcal', protein: '25 g', carbs: '30 g', fats: '10 g' } },
  'palak sabzi': { image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', category: 'Vegetable', type: 'Iron', desc: 'Palak ki sabzi iron aur folate rich. Roti ya chapati ke saath perfect combo.', nutrition: { calories: '60 kcal', protein: '3 g', carbs: '5 g', fats: '3 g' } },
  'dal rice': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Dal_tadka_and_naan.jpg/500px-Dal_tadka_and_naan.jpg', category: 'Main Course', type: 'Comfort', desc: 'Dal chawal har ghar ka comfort food. Balanced protein aur carbs. Indian classic.', nutrition: { calories: '350 kcal', protein: '12 g', carbs: '60 g', fats: '6 g' } },
  'dal makhani': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Dal_tadka_and_naan.jpg/500px-Dal_tadka_and_naan.jpg', category: 'Main Course', type: 'Rich', desc: 'Dal makhani black lentils aur butter se banti hai. Rich taste par high calorie.', nutrition: { calories: '350 kcal', protein: '12 g', carbs: '30 g', fats: '20 g' } },
  'chole': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Chana_Masala_in_Paul%C3%ADnia%2C_2023-10-16.jpg/500px-Chana_Masala_in_Paul%C3%ADnia%2C_2023-10-16.jpg', category: 'Main Course', type: 'High Protein', desc: 'Chole chickpeas ki sabzi - protein aur fiber rich. Bhature ya rice ke saath.', nutrition: { calories: '280 kcal', protein: '14 g', carbs: '40 g', fats: '8 g' } },
  'palak paneer': { image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80', category: 'Main Course', type: 'Iron + Protein', desc: 'Palak paneer iron aur protein ka best combo. Roti ya naan ke saath serve karo.', nutrition: { calories: '320 kcal', protein: '14 g', carbs: '12 g', fats: '24 g' } },
  'roti': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg', category: 'Carbs', type: 'Whole Wheat', desc: 'Roti whole wheat ki - daily Indian meal ka base. Ghee lagao taste aur energy ke liye.', nutrition: { calories: '100 kcal', protein: '3 g', carbs: '20 g', fats: '0.5 g' } },
  'rice': { image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80', category: 'Carbs', type: 'Simple', desc: 'Chawal quick energy deta hai. Dal ya curry ke saath balance karo. Limit 1-1.5 katori.', nutrition: { calories: '206 kcal', protein: '4 g', carbs: '45 g', fats: '0.4 g' } },
  'palak soup': { image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80', category: 'Soup', type: 'Iron', desc: 'Palak soup low calorie aur iron rich. Weight loss dinner ke liye perfect.', nutrition: { calories: '50 kcal', protein: '3 g', carbs: '6 g', fats: '1.5 g' } },
  'aloo paratha': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Aloo_Paratha_2.jpg/500px-Aloo_Paratha_2.jpg', category: 'Breakfast', type: 'Heavy', desc: 'Aloo stuffed paratha ghee ke saath. Tasty par calorie dense. Dahi ke saath balance.', nutrition: { calories: '290 kcal', protein: '7 g', carbs: '35 g', fats: '14 g' } },
  'vegetable pulao': { image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80', category: 'Main Course', type: 'Festive', desc: 'Vegetable pulao basmati rice with veggies aur spices. Raita ke saath best.', nutrition: { calories: '320 kcal', protein: '6 g', carbs: '55 g', fats: '9 g' } },
  'mushroom curry': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Mushroom_Tikka_Masala_by_Preeti_Tamilarasan.jpg/500px-Mushroom_Tikka_Masala_by_Preeti_Tamilarasan.jpg', category: 'Main Course', type: 'Plant Protein', desc: 'Mushroom curry protein rich aur low calorie. Roti ya rice ke saath serve karo.', nutrition: { calories: '180 kcal', protein: '8 g', carbs: '12 g', fats: '10 g' } },
  'lauki sabzi': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Lauki_ki_Sabzi.jpg/500px-Lauki_ki_Sabzi.jpg', category: 'Vegetable', type: 'Low Calorie', desc: 'Lauki ki sabzi - weight loss ke liye best. Detoxyfing bhi.', nutrition: { calories: '40 kcal', protein: '1.5 g', carbs: '5 g', fats: '2 g' } },
  'dal tadka': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Dal_tadka_and_naan.jpg/500px-Dal_tadka_and_naan.jpg', category: 'Main Course', type: 'Daily Dal', desc: 'Dal tadka tempered with ghee, jeera, hing. Daily Indian meal staple.', nutrition: { calories: '210 kcal', protein: '11 g', carbs: '28 g', fats: '6 g' } },
  'keema paratha': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Aloo_Paratha_2.jpg/500px-Aloo_Paratha_2.jpg', category: 'Breakfast', type: 'Non-Veg', desc: 'Keema stuffed paratha - high protein, tasty. Weekend breakfast ke liye perfect.', nutrition: { calories: '350 kcal', protein: '18 g', carbs: '35 g', fats: '16 g' } },
  'tuna salad': { image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80', category: 'Salad', type: 'High Protein', desc: 'Tuna salad leafy greens aur tuna ke saath. Omega-3 aur protein ka best combo.', nutrition: { calories: '220 kcal', protein: '25 g', carbs: '8 g', fats: '10 g' } },
  'vegetable stew': { image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80', category: 'Soup', type: 'Light', desc: 'Vegetable stew mix veggies in tomato base. Light dinner ke liye perfect.', nutrition: { calories: '80 kcal', protein: '2.5 g', carbs: '13 g', fats: '1.5 g' } },
  'egg bhurji with roti': { image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80', category: 'Main Course', type: 'Quick Meal', desc: 'Egg bhurji roti ke saath - 10 minute mein ready. Protein rich quick meal.', nutrition: { calories: '320 kcal', protein: '17 g', carbs: '23 g', fats: '17 g' } },
  'khichdi with chicken': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Khichadi_%2849683829713%29.jpg/500px-Khichadi_%2849683829713%29.jpg', category: 'Main Course', type: 'Comfort', desc: 'Chicken khichdi dal, chawal aur chicken ka mix. Recovery meal ke liye best.', nutrition: { calories: '380 kcal', protein: '22 g', carbs: '50 g', fats: '8 g' } },
  'chicken soup with bread': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Chicken_Noodle_Soup_US.jpg/500px-Chicken_Noodle_Soup_US.jpg', category: 'Soup', type: 'Light Dinner', desc: 'Chicken soup brown bread ke saath - light dinner, easy to digest.', nutrition: { calories: '220 kcal', protein: '20 g', carbs: '20 g', fats: '5 g' } },
  'fish curry': { image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80', category: 'Main Course', type: 'Coastal', desc: 'Fish curry coconut aur spices ke saath. Omega-3 aur protein rich.', nutrition: { calories: '260 kcal', protein: '24 g', carbs: '8 g', fats: '15 g' } },
  'apple or guava': { image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&q=80', category: 'Fruit', type: 'Fiber', desc: 'Apple ya guava - dono high fiber aur low calorie. Snack ke liye perfect.', nutrition: { calories: '80 kcal', protein: '1 g', carbs: '20 g', fats: '0.3 g' } },
  'apple or orange': { image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&q=80', category: 'Fruit', type: 'Vitamin C', desc: 'Apple ya orange - vitamin C aur fiber. Energy ke liye great snack.', nutrition: { calories: '85 kcal', protein: '1 g', carbs: '21 g', fats: '0.3 g' } },
  'orange': { image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&q=80', category: 'Fruit', type: 'Vitamin C', desc: 'Santara vitamin C ka best source. Immunity boost aur skin ke liye best.', nutrition: { calories: '62 kcal', protein: '1.2 g', carbs: '15 g', fats: '0.2 g' } },
  'papaya': { image: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=600&q=80', category: 'Fruit', type: 'Digestion', desc: 'Papaya mein enzymes hote hain digestion ke liye. Weight loss mein madad karta hai.', nutrition: { calories: '43 kcal', protein: '0.5 g', carbs: '11 g', fats: '0.3 g' } },
  'moong chilla': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Moonglet_chilla_with_curd_and_hot_tea.jpg/500px-Moonglet_chilla_with_curd_and_hot_tea.jpg', category: 'Breakfast', type: 'High Protein', desc: 'Moong chilla moong dal paste se bana. High protein, low fat - diet friendly.', nutrition: { calories: '160 kcal', protein: '9 g', carbs: '18 g', fats: '5 g' } },
  'besan chilla with chutney': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Chilla_besan.JPG/500px-Chilla_besan.JPG', category: 'Breakfast', type: 'High Protein', desc: 'Besan ka chilla green chutney ke saath - high protein breakfast option.', nutrition: { calories: '200 kcal', protein: '11 g', carbs: '22 g', fats: '7 g' } },
  'boiled eggs 3': { image: 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=600&q=80', category: 'Protein', type: 'Quick', desc: '3 boiled eggs = 18g protein. Gym wale logon ka favorite snack.', nutrition: { calories: '234 kcal', protein: '18 g', carbs: '1.8 g', fats: '15 g' } },
  'omelette 3 eggs': { image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80', category: 'Breakfast', type: 'Mass Meal', desc: '3 egg omelette brown bread ke saath - bodybuilders ka classic breakfast.', nutrition: { calories: '350 kcal', protein: '24 g', carbs: '15 g', fats: '20 g' } },
  'mixed nuts': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg', category: 'Nuts', type: 'Energy', desc: 'Mixed nuts - badam, akhrot, kaju, pista. Energy aur healthy fats.', nutrition: { calories: '180 kcal', protein: '5 g', carbs: '6 g', fats: '16 g' } },
  'cheese sandwich': { image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80', category: 'Snack', type: 'Quick', desc: 'Cheese sandwich brown bread mein. Calcium aur protein dono milte hain.', nutrition: { calories: '280 kcal', protein: '14 g', carbs: '30 g', fats: '11 g' } },
  'chicken keema': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg', category: 'Protein', type: 'Minced', desc: 'Chicken keema minced chicken hai - high protein. Roti ya rice ke saath.', nutrition: { calories: '220 kcal', protein: '26 g', carbs: '0 g', fats: '13 g' } },
  'kheera': { image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&q=80', category: 'Vegetable', type: 'Hydrating', desc: 'Kheera 95% paani hai. Hydration ke liye perfect. Almost zero calorie.', nutrition: { calories: '16 kcal', protein: '0.7 g', carbs: '4 g', fats: '0.1 g' } },
  'palak tofu': { image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80', category: 'Main Course', type: 'Vegan', desc: 'Palak tofu vegan aur protein rich dish. Iron aur calcium dono milte hain.', nutrition: { calories: '180 kcal', protein: '12 g', carbs: '8 g', fats: '10 g' } },
  'eggs and toast': { image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80', category: 'Breakfast', type: 'Classic', desc: 'Boiled eggs with brown bread toast - simple aur balanced breakfast.', nutrition: { calories: '250 kcal', protein: '14 g', carbs: '20 g', fats: '10 g' } },
  'egg and fruit': { image: 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=600&q=80', category: 'Breakfast', type: 'Light', desc: 'Boiled egg aur seasonal fruit - quick light breakfast.', nutrition: { calories: '150 kcal', protein: '7 g', carbs: '20 g', fats: '5 g' } },
  'tofu bhurji': { image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80', category: 'Protein', type: 'Plant-based', desc: 'Tofu bhurji scrambled tofu with spices. Vegan protein option.', nutrition: { calories: '180 kcal', protein: '14 g', carbs: '6 g', fats: '11 g' } },
  'paneer butter masala': { image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80', category: 'Main Course', type: 'Rich', desc: 'Paneer butter masala creamy aur rich. Protein milta hai par calories high.', nutrition: { calories: '380 kcal', protein: '14 g', carbs: '15 g', fats: '30 g' } },
  'cucumber raita 1': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Plain_Curd_Rice.jpg/500px-Plain_Curd_Rice.jpg', category: 'Side', type: 'Probiotic', desc: 'Kheere ka raita - cooling effect, probiotic. Pulao ya biryani ke saath.', nutrition: { calories: '50 kcal', protein: '2.5 g', carbs: '4 g', fats: '2 g' } },
  'sattu drink': { image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&q=80', category: 'Beverage', type: 'Bihar Special', desc: 'Sattu drink roasted chana powder, paani, nimbu, namak. Bihar ka summer drink.', nutrition: { calories: '120 kcal', protein: '7 g', carbs: '18 g', fats: '1.5 g' } },
  'chicken breast or fish': { image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&q=80', category: 'Protein', type: 'Lean', desc: 'Grilled chicken ya fish - dono lean protein sources. 100g mein 25-30g protein.', nutrition: { calories: '180 kcal', protein: '28 g', carbs: '0 g', fats: '6 g' } },
  'chicken or paneer curry': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg', category: 'Main Course', type: 'Protein-rich', desc: 'Chicken ya paneer curry - dono high protein. 150-200g portion best hai.', nutrition: { calories: '300 kcal', protein: '25 g', carbs: '8 g', fats: '19 g' } },
  'chicken or tofu': { image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&q=80', category: 'Protein', type: 'Lean', desc: 'Grilled chicken ya tofu - 150g portion. Both are lean protein options.', nutrition: { calories: '170 kcal', protein: '25 g', carbs: '0 g', fats: '7 g' } },
  'grilled chicken or paneer': { image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&q=80', category: 'Main Course', type: 'Lean', desc: 'Grilled chicken ya paneer - diet friendly protein. Roti ya salad ke saath.', nutrition: { calories: '220 kcal', protein: '28 g', carbs: '4 g', fats: '10 g' } },
  'fish or chicken curry': { image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80', category: 'Main Course', type: 'Non-Veg', desc: 'Fish ya chicken curry - both protein rich. Spices ke saath Indian style.', nutrition: { calories: '280 kcal', protein: '26 g', carbs: '6 g', fats: '17 g' } },
  'fish or paneer': { image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80', category: 'Protein', type: 'Non-Veg/Veg', desc: 'Fish ya paneer - dono high protein options. Meal variety ke liye alternate karo.', nutrition: { calories: '230 kcal', protein: '22 g', carbs: '2 g', fats: '14 g' } },
  'fish or paneer curry': { image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80', category: 'Main Course', type: 'Protein', desc: 'Fish ya paneer curry - balanced protein. Roti ya rice ke saath.', nutrition: { calories: '280 kcal', protein: '22 g', carbs: '8 g', fats: '18 g' } },
  'eggs or paneer': { image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80', category: 'Protein', type: 'Versatile', desc: 'Eggs ya paneer - dono versatile protein. Different recipes mein use karo.', nutrition: { calories: '180 kcal', protein: '12 g', carbs: '2 g', fats: '13 g' } },
  'eggs or tofu bhurji': { image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80', category: 'Breakfast', type: 'Quick Protein', desc: 'Egg bhurji ya tofu bhurji - quick high protein breakfast. 10 minute ready.', nutrition: { calories: '190 kcal', protein: '15 g', carbs: '4 g', fats: '12 g' } },
  'eggs or yogurt': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Plain_Curd_Rice.jpg/500px-Plain_Curd_Rice.jpg', category: 'Protein', type: 'Diverse', desc: 'Eggs ya yogurt - both protein rich. Different meal options.', nutrition: { calories: '130 kcal', protein: '9 g', carbs: '6 g', fats: '7 g' } },
  'chicken or paneer': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg', category: 'Protein', type: 'High Protein', desc: 'Chicken ya paneer - 200g portion dono mein 30g+ protein. Non-veg preference ke hisaab se.', nutrition: { calories: '250 kcal', protein: '28 g', carbs: '4 g', fats: '14 g' } },
  'butter chicken or mutton': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg', category: 'Main Course', type: 'Rich', desc: 'Butter chicken ya mutton curry - both rich non-veg options. Treat meal ke liye.', nutrition: { calories: '400 kcal', protein: '26 g', carbs: '10 g', fats: '30 g' } },
  'chicken curry or mutton': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg', category: 'Main Course', type: 'Non-Veg', desc: 'Chicken curry ya mutton - dono protein rich. Biryani ya chawal ke saath.', nutrition: { calories: '320 kcal', protein: '27 g', carbs: '8 g', fats: '20 g' } },
  'boiled eggs 3 whites': { image: 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=600&q=80', category: 'Protein', type: 'Pure Protein', desc: '3 egg whites = 11g protein, zero fat. Cutting phase ke liye perfect.', nutrition: { calories: '51 kcal', protein: '11 g', carbs: '0.7 g', fats: '0.2 g' } },
  'protein shake': { image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&q=80', category: 'Shake', type: 'Supplement', desc: 'Whey protein shake - 25-30g protein per scoop. Post workout best.', nutrition: { calories: '120 kcal', protein: '25 g', carbs: '3 g', fats: '1 g' } },

  // Items that appear in the generated plan but were missing from the database
  'chicken salad': { image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80', category: 'Salad', type: 'High Protein', desc: 'Chicken salad greens, chicken aur veggies ke saath. Light, filling aur post-workout best.', nutrition: { calories: '220 kcal', protein: '28 g', carbs: '8 g', fats: '9 g' } },
  'tuna sandwich': { image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80', category: 'Snack', type: 'High Protein', desc: 'Tuna sandwich brown bread mein - omega-3 aur protein ka perfect snack.', nutrition: { calories: '290 kcal', protein: '24 g', carbs: '28 g', fats: '8 g' } },
  'banana milkshake': { image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&q=80', category: 'Shake', type: 'Mass Gainer', desc: 'Banana milkshake doodh aur banana se banta hai - weight gain aur recovery ke liye best.', nutrition: { calories: '380 kcal', protein: '12 g', carbs: '58 g', fats: '10 g' } },
  'aloo sabzi': { image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', category: 'Vegetable', type: 'Carb', desc: 'Aloo (potato) ki sabzi - desi style masala. Energy deti hai par carb zyada.', nutrition: { calories: '180 kcal', protein: '3 g', carbs: '30 g', fats: '6 g' } },

  // ===== Indian food items missing earlier - real Unsplash images =====
  // Non-Veg: Murgi (whole chicken)
  'murgi': { image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&q=80', category: 'Protein', type: 'Non-Veg', desc: 'Murgi whole chicken hai - protein, iron aur B12 rich. Curry, tandoori ya grill karke khayein.', nutrition: { calories: '215 kcal', protein: '27 g', carbs: '0 g', fats: '11 g' } },
  'murgi curry': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg', category: 'Main Course', type: 'Non-Veg', desc: 'Desi style murgi curry - protein aur desi masalon ka perfect combo. Brown rice ya chapati ke saath.', nutrition: { calories: '310 kcal', protein: '26 g', carbs: '7 g', fats: '20 g' } },
  'ande': { image: 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=600&q=80', category: 'Protein', type: 'Complete Protein', desc: 'Ande sabse sasta aur best protein source. 1 ande mein 6g protein. Boiled ya bhurji karke khayein.', nutrition: { calories: '78 kcal', protein: '6 g', carbs: '0.6 g', fats: '5 g' } },

  // Veg protein items
  'soybean': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Nutrela_Soya_Chunks_Curry.jpg/500px-Nutrela_Soya_Chunks_Curry.jpg', category: 'Protein', type: 'Plant-based', desc: 'Soybean mein 36g protein per 100g - sabse rich plant protein. Vegans ke liye gold.', nutrition: { calories: '446 kcal', protein: '36 g', carbs: '30 g', fats: '20 g' } },

  // Healthy fats - missing items
  'akhrot': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg', category: 'Nuts', type: 'Omega-3', desc: 'Akhrot (walnuts) mein omega-3 fatty acids hain. Brain health ke liye best - roz 2-3 pieces khayein.', nutrition: { calories: '185 kcal', protein: '4.3 g', carbs: '3.9 g', fats: '18.5 g' } },
  'walnuts': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg', category: 'Nuts', type: 'Omega-3', desc: 'Walnuts omega-3 ka rich source. Memory aur heart health ke liye rozana khayein.', nutrition: { calories: '185 kcal', protein: '4.3 g', carbs: '3.9 g', fats: '18.5 g' } },
  'kaju': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg', category: 'Nuts', type: 'Healthy Fats', desc: 'Kaju (cashews) mein healthy fats, copper aur magnesium hain. Roz 4-5 pieces - energy aur bone health ke liye.', nutrition: { calories: '157 kcal', protein: '5.2 g', carbs: '8.6 g', fats: '12.4 g' } },
  'cashews': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg', category: 'Nuts', type: 'Healthy Fats', desc: 'Cashews protein aur minerals dete hain. Kaju katli ya plain roasted - dono healthy.', nutrition: { calories: '157 kcal', protein: '5.2 g', carbs: '8.6 g', fats: '12.4 g' } },
  'desi ghee': { image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80', category: 'Fats', type: 'Clarified Butter', desc: 'Desi ghee clarified butter hai - limited amount mein health benefits. Butyric acid digestion mein madad karta hai.', nutrition: { calories: '112 kcal', protein: '0 g', carbs: '0 g', fats: '12.7 g' } },
  'ghee': { image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80', category: 'Fats', type: 'Clarified Butter', desc: 'Ghee Indian cooking ka soul hai. 1-2 spoon tak theek - vitamins A, D, E, K absorb karne mein madad.', nutrition: { calories: '112 kcal', protein: '0 g', carbs: '0 g', fats: '12.7 g' } },
  'olive oil': { image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80', category: 'Fats', type: 'Monounsaturated', desc: 'Olive oil mein monounsaturated fats hain jo heart ke liye acche hain. Cooking ya salad dressing mein use karo.', nutrition: { calories: '119 kcal', protein: '0 g', carbs: '0 g', fats: '13.5 g' } },
  'coconut oil': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Coconuts_-_single_and_cracked_open.jpg/500px-Coconuts_-_single_and_cracked_open.jpg', category: 'Fats', type: 'MCT', desc: 'Coconut oil mein medium chain fatty acids hain - quick energy aur metabolism boost. Cooking ke liye best.', nutrition: { calories: '117 kcal', protein: '0 g', carbs: '0 g', fats: '13.6 g' } },
  'flax seeds': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Brown_Flax_Seeds.jpg/500px-Brown_Flax_Seeds.jpg', category: 'Seeds', type: 'Omega-3', desc: 'Flax seeds mein omega-3 aur fiber rich hain. Grind karke smoothie ya dahi mein mix karke khao.', nutrition: { calories: '55 kcal', protein: '1.9 g', carbs: '3 g', fats: '4.3 g' } },
  'chia seeds': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Brown_Flax_Seeds.jpg/500px-Brown_Flax_Seeds.jpg', category: 'Seeds', type: 'Omega-3', desc: 'Chia seeds mein omega-3, fiber aur protein hain. Paani mein bhigokar ya smoothie mein use karo.', nutrition: { calories: '60 kcal', protein: '2 g', carbs: '5 g', fats: '4 g' } },

  // Healthy Carbs - missing items
  'ragi roti': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg', category: 'Carbs', type: 'Millets', desc: 'Ragi roti calcium ka rich source hai. Diabetes patients ke liye best - low glycemic index.', nutrition: { calories: '105 kcal', protein: '2.7 g', carbs: '22 g', fats: '0.8 g' } },
  'jowar': { image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80', category: 'Carbs', type: 'Millets', desc: 'Jowar (sorghum) gluten-free millet hai. Iron aur fiber rich - weight loss ke liye accha.', nutrition: { calories: '329 kcal', protein: '11 g', carbs: '72 g', fats: '3.5 g' } },
  'bajra': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/%22Bajra_ki_roti%22.jpg/500px-%22Bajra_ki_roti%22.jpg', category: 'Carbs', type: 'Millets', desc: 'Bajra (pearl millet) iron aur protein rich hai. Sardi mein bajra roti khana best rehta hai.', nutrition: { calories: '360 kcal', protein: '12 g', carbs: '67 g', fats: '5 g' } },
  'upma': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Delicious_Indian_breakfast_Upma.jpg/500px-Delicious_Indian_breakfast_Upma.jpg', category: 'Breakfast', type: 'South Indian', desc: 'Upma suji se banta hai - quick breakfast. Sabziyon ke saath nutritious aur filling.', nutrition: { calories: '220 kcal', protein: '5 g', carbs: '35 g', fats: '7 g' } },

  // Seasonal Vegetables - missing items
  'tori': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Lauki_ki_Sabzi.jpg/500px-Lauki_ki_Sabzi.jpg', category: 'Vegetable', type: 'Low Calorie', desc: 'Tori (ridge gourd) low calorie sabzi hai. Fiber aur vitamin C rich. Weight loss ke liye best.', nutrition: { calories: '20 kcal', protein: '1.2 g', carbs: '4 g', fats: '0.2 g' } },
  'karela': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Lauki_ki_Sabzi.jpg/500px-Lauki_ki_Sabzi.jpg', category: 'Vegetable', type: 'Bitter', desc: 'Karela (bitter gourd) diabetes control mein best hai. Blood sugar level kam karta hai.', nutrition: { calories: '17 kcal', protein: '1 g', carbs: '3.7 g', fats: '0.2 g' } },
  'gobhi': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Aloo_gobi.jpg/500px-Aloo_gobi.jpg', category: 'Vegetable', type: 'Low Carb', desc: 'Gobhi (cauliflower) low carb aur fiber rich hai. Roti ka healthy replacement banaya ja sakta hai.', nutrition: { calories: '25 kcal', protein: '1.9 g', carbs: '5 g', fats: '0.3 g' } },
  'matar': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Matar_paneer_green_peas.jpg/500px-Matar_paneer_green_peas.jpg', category: 'Vegetable', type: 'Protein', desc: 'Matar (green peas) protein aur fiber rich hai. Matar paneer ya aloo matar sab tasty banayein.', nutrition: { calories: '81 kcal', protein: '5.4 g', carbs: '14 g', fats: '0.4 g' } },
  'kaddu': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Pumpkin_Curry_%28Kaddu_Ki_Sabzi%29.JPG/500px-Pumpkin_Curry_%28Kaddu_Ki_Sabzi%29.JPG', category: 'Vegetable', type: 'Vitamin A', desc: 'Kaddu (pumpkin) vitamin A ka rich source hai. Beta-carotene aur fiber se bhara - immunity boost.', nutrition: { calories: '26 kcal', protein: '1 g', carbs: '7 g', fats: '0.1 g' } },
  'baingan': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Baingan_bharta_special.jpg/500px-Baingan_bharta_special.jpg', category: 'Vegetable', type: 'Fiber', desc: 'Baingan (eggplant/brinjal) fiber aur antioxidants rich hai. Low calorie - diet mein add karo.', nutrition: { calories: '25 kcal', protein: '1 g', carbs: '6 g', fats: '0.2 g' } },
  'tamatar': { image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80', category: 'Vegetable', type: 'Lycopene', desc: 'Tamatar (tomato) mein lycopene hota hai jo skin aur heart ke liye accha hai. Salad ya sabzi mein use karo.', nutrition: { calories: '18 kcal', protein: '0.9 g', carbs: '3.9 g', fats: '0.2 g' } },
  'gajar': { image: 'https://images.unsplash.com/photo-1582515073490-39981397c445?w=600&q=80', category: 'Vegetable', type: 'Vitamin A', desc: 'Gajar (carrot) beta-carotene aur vitamin A se bhara hai. Aankhon aur skin ke liye best.', nutrition: { calories: '41 kcal', protein: '0.9 g', carbs: '10 g', fats: '0.2 g' } },
  'shimla mirch': { image: 'https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=600&q=80', category: 'Vegetable', type: 'Vitamin C', desc: 'Shimla mirch (capsicum/bell pepper) vitamin C ka powerhouse hai. Salad ya sabzi mein use karo.', nutrition: { calories: '31 kcal', protein: '1 g', carbs: '6 g', fats: '0.3 g' } },

  // Seasonal Fruits - missing items
  'amla': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Indian_gooseberry_Amla_IMG_3122.jpg/500px-Indian_gooseberry_Amla_IMG_3122.jpg', category: 'Fruit', type: 'Vitamin C', desc: 'Amla (Indian gooseberry) vitamin C ka sabse rich source hai. Immunity ke liye best - juice ya murabba.', nutrition: { calories: '44 kcal', protein: '0.9 g', carbs: '10 g', fats: '0.6 g' } },
  'watermelon': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Watermelon_yellow_2024_G1.jpg/500px-Watermelon_yellow_2024_G1.jpg', category: 'Fruit', type: 'Hydrating', desc: 'Watermelon 92% paani se bhara hai. Garmi mein best hydrating fruit - low calorie, refreshing.', nutrition: { calories: '30 kcal', protein: '0.6 g', carbs: '8 g', fats: '0.2 g' } },
  'mousambi': { image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&q=80', category: 'Fruit', type: 'Vitamin C', desc: 'Mousambi (sweet lime) vitamin C aur natural sugars deta hai. Juice ya whole fruit dono healthy.', nutrition: { calories: '43 kcal', protein: '0.8 g', carbs: '10 g', fats: '0.3 g' } },
  'anar': { image: 'https://images.unsplash.com/photo-1541344999736-83eca272f6fc?w=600&q=80', category: 'Fruit', type: 'Antioxidant', desc: 'Anar (pomegranate) antioxidants se bhara hai. Heart health aur immunity ke liye best fruit.', nutrition: { calories: '83 kcal', protein: '1.7 g', carbs: '19 g', fats: '1.2 g' } },
  'kiwi': { image: 'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=600&q=80', category: 'Fruit', type: 'Vitamin C', desc: 'Kiwi vitamin C aur fiber ka rich source hai. Digestion aur immunity improve karta hai.', nutrition: { calories: '61 kcal', protein: '1.1 g', carbs: '15 g', fats: '0.5 g' } },
  'berries': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bowl_full_of_mixed_berries_%2840640199055%29.jpg/500px-Bowl_full_of_mixed_berries_%2840640199055%29.jpg', category: 'Fruit', type: 'Antioxidant', desc: 'Berries (strawberry, blueberry, raspberry) antioxidants se bhare hain. Brain health ke liye best.', nutrition: { calories: '57 kcal', protein: '0.7 g', carbs: '14 g', fats: '0.3 g' } },
  'ananas': { image: 'https://images.unsplash.com/photo-1550828520-4cb496926fc9?w=600&q=80', category: 'Fruit', type: 'Enzyme-rich', desc: 'Ananas (pineapple) mein bromelain enzyme hota hai jo digestion mein madad karta hai.', nutrition: { calories: '50 kcal', protein: '0.5 g', carbs: '13 g', fats: '0.1 g' } },
  'santre': { image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&q=80', category: 'Fruit', type: 'Vitamin C', desc: 'Santre (orange) vitamin C ka classic source. Immunity boost aur skin health ke liye best.', nutrition: { calories: '62 kcal', protein: '1.2 g', carbs: '15 g', fats: '0.2 g' } },

  // Common aliases for direct Indian item names from foods.json
  'egg whites': { image: 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=600&q=80', category: 'Protein', type: 'Pure Protein', desc: 'Egg whites mein 100% protein, zero fat. Bodybuilding aur cutting phase ke liye perfect.', nutrition: { calories: '52 kcal', protein: '11 g', carbs: '0.7 g', fats: '0.2 g' } },
  'fish': { image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80', category: 'Protein', type: 'Omega-3', desc: 'Fish mein omega-3 fatty acids hote hain. Brain aur heart ke liye best. Roli aur Bangda common hain.', nutrition: { calories: '206 kcal', protein: '22 g', carbs: '0 g', fats: '12 g' } },
  'machli': { image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80', category: 'Protein', type: 'Omega-3', desc: 'Machli (fish) omega-3 aur protein ka rich source. Tawa, curry ya grill - kisi bhi tarike se khayein.', nutrition: { calories: '206 kcal', protein: '22 g', carbs: '0 g', fats: '12 g' } },
  'mutton': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg', category: 'Protein', type: 'Iron-rich', desc: 'Mutton mein high protein, iron aur B12 hota hai. Weight gain aur strength ke liye best.', nutrition: { calories: '294 kcal', protein: '25 g', carbs: '0 g', fats: '21 g' } },
  'chicken': { image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&q=80', category: 'Protein', type: 'Lean Meat', desc: 'Chicken protein ka best source. 100g chicken breast mein 31g protein - bodybuilders ka favorite.', nutrition: { calories: '165 kcal', protein: '31 g', carbs: '0 g', fats: '3.6 g' } },
  'dahi': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Plain_Curd_Rice.jpg/500px-Plain_Curd_Rice.jpg', category: 'Dairy', type: 'Probiotic', desc: 'Dahi mein probiotics hote hain jo gut health ke liye zaroori hain. Calcium bhi milta hai.', nutrition: { calories: '60 kcal', protein: '3.5 g', carbs: '5 g', fats: '3 g' } },
  'paneer': { image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80', category: 'Protein', type: 'Calcium-rich', desc: '100g paneer mein 18g protein aur 200mg calcium. Vegans ke liye best protein source.', nutrition: { calories: '265 kcal', protein: '18 g', carbs: '1.2 g', fats: '21 g' } },
  'besan': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Chilla_besan.JPG/500px-Chilla_besan.JPG', category: 'Protein', type: 'Plant-based', desc: 'Besan (gram flour) high protein aur fiber deta hai. Chilla, pakode ya cheela bana ke khayein.', nutrition: { calories: '387 kcal', protein: '22 g', carbs: '58 g', fats: '7 g' } },
  'chana': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Chana_Masala_in_Paul%C3%ADnia%2C_2023-10-16.jpg/500px-Chana_Masala_in_Paul%C3%ADnia%2C_2023-10-16.jpg', category: 'Protein', type: 'Chickpeas', desc: 'Chana chickpeas hai - high protein, fiber aur iron. Chole ya boiled chana dono healthy hain.', nutrition: { calories: '269 kcal', protein: '15 g', carbs: '45 g', fats: '4 g' } },
  'rajma': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Rajma_Chawal_by_Rama_Bhave.jpg/500px-Rajma_Chawal_by_Rama_Bhave.jpg', category: 'Protein', type: 'Kidney Beans', desc: 'Rajma kidney beans hai - protein aur fiber dono rich. Chawal ke saath classic North Indian combo.', nutrition: { calories: '245 kcal', protein: '15 g', carbs: '42 g', fats: '1 g' } },
  'sprouts': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Sprouts_Salad_with_Corn.JPG/500px-Sprouts_Salad_with_Corn.JPG', category: 'Protein', type: 'Live Food', desc: 'Sprouts mein enzymes hote hain jo digestion improve karte hain. Protein aur vitamins rich.', nutrition: { calories: '100 kcal', protein: '7 g', carbs: '17 g', fats: '0.7 g' } },
  'milk': { image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80', category: 'Dairy', type: 'Calcium', desc: 'Doodh mein calcium, protein aur vitamin D hota hai. Raat ko sone se pehle ek glass piyo.', nutrition: { calories: '150 kcal', protein: '8 g', carbs: '12 g', fats: '8 g' } },
  'sattu': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg', category: 'Protein', type: 'Bihar Specialty', desc: 'Sattu roasted chana ka powder hai - Bihar ka super food. Protein, fiber, iron sab milta hai.', nutrition: { calories: '160 kcal', protein: '9 g', carbs: '25 g', fats: '2 g' } },
  'makhana': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Foxnut_Makhana_-_Nawada_District_-_Bihar_-_1.jpg/500px-Foxnut_Makhana_-_Nawada_District_-_Bihar_-_1.jpg', category: 'Snack', type: 'Low Calorie', desc: 'Makhana fox nuts hai - 100g mein sirf 90 kcal. Crunchy, healthy snack - weight loss ke liye best.', nutrition: { calories: '90 kcal', protein: '4 g', carbs: '16 g', fats: '0.5 g' } },
  'keema': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg', category: 'Protein', type: 'Minced Meat', desc: 'Keema minced meat hai - chicken ya mutton dono. High protein, paratha ya rice ke saath.', nutrition: { calories: '250 kcal', protein: '26 g', carbs: '0 g', fats: '17 g' } },
  'chicken soup': { image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Chicken_Noodle_Soup_US.jpg/500px-Chicken_Noodle_Soup_US.jpg', category: 'Soup', type: 'Immunity', desc: 'Chicken soup cold mein immunity badhata hai. Low calorie aur high protein - diet mein best.', nutrition: { calories: '120 kcal', protein: '15 g', carbs: '5 g', fats: '4 g' } },
};

// Find food in database by keyword — smarter matching
// Priority: longest-key substring match wins (avoids "chicken" beating "murgi curry")
function findFood(foodText) {
  const lowerText = foodText.toLowerCase();

  // Build sorted list of keys, longest first — so "murgi curry" beats "murgi" beats "chicken"
  const keys = Object.keys(foodDatabase).sort((a, b) => b.length - a.length);

  // Pass 1: full-key substring match (longest first)
  for (const key of keys) {
    if (lowerText.includes(key)) {
      return { key, ...foodDatabase[key] };
    }
  }

  // Pass 2: word-level match — but skip very generic short words
  // that would match too many things (e.g. "ki", "with", "and")
  const GENERIC_STOPWORDS = new Set([
    'with', 'and', 'the', 'for', 'pcs', 'small', 'large', 'glass', 'cup',
    'bowl', 'plate', 'gm', 'ml', 'tsp', 'tbsp', 'ka', 'ke', 'ki', 'mein',
    'aur', 'ya', 'katori', 'scoop', 'slice', 'slices', 'serving', 'limited',
    'khayein', 'khao', 'roti', 'chawal', 'salad', 'shake', 'curry'
  ]);
  for (const key of keys) {
    const keyWords = key.split(/\s+/).filter(w => w.length > 3 && !GENERIC_STOPWORDS.has(w));
    if (keyWords.length === 0) continue;
    // Require the key's main word to appear in the text
    if (keyWords.some(w => lowerText.includes(w))) {
      return { key, ...foodDatabase[key] };
    }
  }

  return null;
}

// Open food modal
function openFoodModal(foodText) {
  const food = findFood(foodText);
  // Inline SVG fallback (kabhi fail nahi hoga) — food emoji + name dikhayega
  const svgFallback = buildFoodSVG(foodText);
  // Make sure the modal image falls back to SVG if Unsplash fails
  foodModalImage.onerror = function() {
    this.onerror = null;
    this.src = svgFallback;
  };
  if (!food) {
    // Generic fallback — SVG placeholder with food emoji
    foodModalImage.src = svgFallback;
    foodModalImage.alt = foodText;
    foodModalName.textContent = foodText;
    foodModalCategory.textContent = 'Food';
    foodModalType.textContent = 'Healthy Choice';
    foodModalDesc.textContent = 'Yeh ek healthy option hai aapke diet plan mein. Balanced nutrition ke liye apne diet plan mein shamil karein.';
    foodModalNutrition.innerHTML = '<span class="nutrition-pill">Healthy <strong>✓</strong></span><span class="nutrition-pill">Balanced <strong>✓</strong></span>';
  } else {
    foodModalImage.src = food.image;
    foodModalImage.alt = food.key;
    foodModalName.textContent = foodText;
    foodModalCategory.textContent = food.category;
    foodModalType.textContent = food.type;
    foodModalDesc.textContent = food.desc;
    foodModalNutrition.innerHTML = `
      <span class="nutrition-pill"><strong>${food.nutrition.calories}</strong> calories</span>
      <span class="nutrition-pill"><strong>${food.nutrition.protein}</strong> protein</span>
      <span class="nutrition-pill"><strong>${food.nutrition.carbs}</strong> carbs</span>
      <span class="nutrition-pill"><strong>${food.nutrition.fats}</strong> fats</span>
    `;
  }
  foodModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// Close food modal
function closeFoodModal() {
  foodModal.classList.remove('open');
  document.body.style.overflow = '';
}

if (foodModalClose) {
  foodModalClose.addEventListener('click', closeFoodModal);
}

if (foodModal) {
  foodModal.addEventListener('click', (e) => {
    if (e.target === foodModal) {
      closeFoodModal();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && foodModal && foodModal.classList.contains('open')) {
    closeFoodModal();
  }
});

// Smart food image lookup: maps exact food keywords to verified Unsplash photo IDs
// Har food ke liye SPECIFIC, UNIQUE image URL — generic duplicates avoid kiye hain
// Note: agar Unsplash image fail ho, to SVG fallback (food emoji + name) show hoga
const foodImageMap = {
  // ===== EGGS — specific egg photos =====
  'omelette': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&q=80',
  'omelette 3 eggs': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&q=80',
  'egg bhurji': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&q=80',
  'egg white omelette': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&q=80',
  'eggs and toast': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&q=80',
  'eggs or tofu bhurji': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&q=80',
  'egg bhurji with roti': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&q=80',
  'boiled eggs': 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=200&q=80',
  'boiled egg': 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=200&q=80',
  'ande': 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=200&q=80',
  'boiled egg whites': 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=200&q=80',
  'egg whites': 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=200&q=80',
  'boiled eggs 3': 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=200&q=80',
  'boiled eggs 3 whites': 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=200&q=80',
  'egg and fruit': 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=200&q=80',
  'eggs or paneer': 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=200&q=80',
  'eggs or yogurt': 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=200&q=80',
  'egg curry': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=200&q=80',
  'egg curry with rice': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=200&q=80',
  'egg curry with paratha': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=200&q=80',

  // ===== DAIRY =====
  'greek yogurt': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Plain_Curd_Rice.jpg/500px-Plain_Curd_Rice.jpg',
  'yogurt': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Plain_Curd_Rice.jpg/500px-Plain_Curd_Rice.jpg',
  'curd': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Plain_Curd_Rice.jpg/500px-Plain_Curd_Rice.jpg',
  'dahi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Plain_Curd_Rice.jpg/500px-Plain_Curd_Rice.jpg',
  'milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80',
  'whole milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80',
  'whole milk with bournvita': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80',
  'whole milk with honey': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80',
  'milk with honey': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80',
  'bournvita': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80',
  'cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&q=80',
  'cheese sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&q=80',
  'cheese omelette': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&q=80',
  'cucumber raita': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Plain_Curd_Rice.jpg/500px-Plain_Curd_Rice.jpg',
  'cucumber raita 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Plain_Curd_Rice.jpg/500px-Plain_Curd_Rice.jpg',

  // ===== PANEER / TOFU =====
  'paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&q=80',
  'paneer bhurji': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&q=80',
  'paneer tikka': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=200&q=80',
  'paneer butter masala': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&q=80',
  'palak paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&q=80',
  'tofu': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80',
  'tofu bhurji': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80',
  'palak tofu': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80',

  // ===== CHICKEN / MUTTON / FISH =====
  'chicken breast': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=200&q=80',
  'chicken': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=200&q=80',
  'murgi': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=200&q=80',
  'murgi curry': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg',
  'grilled chicken': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=200&q=80',
  'grilled chicken or paneer': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=200&q=80',
  'chicken breast or fish': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=200&q=80',
  'chicken curry': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg',
  'chicken curry or mutton': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg',
  'butter chicken': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg',
  'butter chicken or mutton': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg',
  'chicken biryani': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80',
  'chicken biryani small': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80',
  'chicken soup': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Chicken_Noodle_Soup_US.jpg/500px-Chicken_Noodle_Soup_US.jpg',
  'chicken soup with bread': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Chicken_Noodle_Soup_US.jpg/500px-Chicken_Noodle_Soup_US.jpg',
  'chicken sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&q=80',
  'chicken wrap': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&q=80',
  'chicken salad': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80',
  'chicken keema': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg',
  'chicken or paneer': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg',
  'chicken or paneer curry': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg',
  'chicken or tofu': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=200&q=80',
  'keema': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg',
  'keema paratha': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Aloo_Paratha_2.jpg/500px-Aloo_Paratha_2.jpg',
  'keema with chapati': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg',
  'keema with rice': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg',
  'mutton': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg',
  'mutton soup': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Chicken_Noodle_Soup_US.jpg/500px-Chicken_Noodle_Soup_US.jpg',
  'fish': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&q=80',
  'machli': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&q=80',
  'fish curry': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&q=80',
  'fish curry with rice': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&q=80',
  'fish curry with chapati': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&q=80',
  'tuna': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&q=80',
  'tuna sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&q=80',
  'tuna salad': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&q=80',
  'fish or chicken curry': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&q=80',
  'fish or paneer': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&q=80',
  'fish or paneer curry': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&q=80',

  // ===== LENTILS / DALS — har dal/legume ke liye specific image =====
  'moong dal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Dal_tadka_and_naan.jpg/500px-Dal_tadka_and_naan.jpg',
  'moong dal chilla': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Moonglet_chilla_with_curd_and_hot_tea.jpg/500px-Moonglet_chilla_with_curd_and_hot_tea.jpg',
  'moong dal chilla 2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Moonglet_chilla_with_curd_and_hot_tea.jpg/500px-Moonglet_chilla_with_curd_and_hot_tea.jpg',
  'moong chilla': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Moonglet_chilla_with_curd_and_hot_tea.jpg/500px-Moonglet_chilla_with_curd_and_hot_tea.jpg',
  'besan chilla': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Chilla_besan.JPG/500px-Chilla_besan.JPG',
  'besan chilla with chutney': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Chilla_besan.JPG/500px-Chilla_besan.JPG',
  'besan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Chilla_besan.JPG/500px-Chilla_besan.JPG',
  'poha': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Poha%2C_a_snack_made_of_flattened_rice.jpg/500px-Poha%2C_a_snack_made_of_flattened_rice.jpg',
  'upma': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Delicious_Indian_breakfast_Upma.jpg/500px-Delicious_Indian_breakfast_Upma.jpg',
  'idli': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&q=80',
  'dosa': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&q=80',
  'sambar': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&q=80',
  'oats': 'https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=200&q=80',
  'oats with milk': 'https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=200&q=80',
  'oats upma': 'https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=200&q=80',
  'oats with fruit': 'https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=200&q=80',
  'aloo paratha': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Aloo_Paratha_2.jpg/500px-Aloo_Paratha_2.jpg',
  'stuffed paratha': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Aloo_Paratha_2.jpg/500px-Aloo_Paratha_2.jpg',
  'paratha': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Aloo_Paratha_2.jpg/500px-Aloo_Paratha_2.jpg',

  // ===== RICE / ROTIS / BREADS — har grain ke liye specific image =====
  'brown rice': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&q=80',
  'rice': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&q=80',
  'jeera rice': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&q=80',
  'vegetable pulao': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&q=80',
  'chapati': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg',
  'roti': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg',
  'ragi roti': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg',
  'naan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Indian_naan_bread.jpg/500px-Indian_naan_bread.jpg',
  'daliya': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&q=80',
  'sweet potato': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Shakarkandi_Chaat-_Homemade-Indian_Subcontinent-Image_no._2.jpg/500px-Shakarkandi_Chaat-_Homemade-Indian_Subcontinent-Image_no._2.jpg',
  'bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80',
  'brown bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80',
  'jowar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/%22Bajra_ki_roti%22.jpg/500px-%22Bajra_ki_roti%22.jpg',
  'bajra': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/%22Bajra_ki_roti%22.jpg/500px-%22Bajra_ki_roti%22.jpg',

  // ===== FRUITS — har fruit ke liye specific image =====
  'apple': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&q=80',
  'banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&q=80',
  'orange': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=200&q=80',
  'santre': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=200&q=80',
  'mousambi': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=200&q=80',
  'papaya': 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=200&q=80',
  'guava': 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=200&q=80',
  'amla': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Indian_gooseberry_Amla_IMG_3122.jpg/500px-Indian_gooseberry_Amla_IMG_3122.jpg',
  'watermelon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Watermelon_yellow_2024_G1.jpg/500px-Watermelon_yellow_2024_G1.jpg',
  'kiwi': 'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=200&q=80',
  'anar': 'https://images.unsplash.com/photo-1541344999736-83eca272f6fc?w=200&q=80',
  'ananas': 'https://images.unsplash.com/photo-1550828520-4cb496926fc9?w=200&q=80',
  'berries': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bowl_full_of_mixed_berries_%2840640199055%29.jpg/500px-Bowl_full_of_mixed_berries_%2840640199055%29.jpg',
  'fruit': 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=200&q=80',
  'mixed fruit': 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=200&q=80',
  'apple or guava': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&q=80',
  'apple or orange': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&q=80',

  // ===== NUTS / SEEDS / OILS =====
  'almonds': 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=200&q=80',
  'badam': 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=200&q=80',
  'akhrot': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg',
  'walnuts': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg',
  'kaju': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg',
  'cashews': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg',
  'peanuts': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg',
  'mixed nuts': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg',
  'dry fruits': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg',
  'trail mix': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg',
  'peanut butter': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Peanut_butter_glass.jpg/500px-Peanut_butter_glass.jpg',
  'flax seeds': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Brown_Flax_Seeds.jpg/500px-Brown_Flax_Seeds.jpg',
  'chia seeds': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Brown_Flax_Seeds.jpg/500px-Brown_Flax_Seeds.jpg',
  'desi ghee': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&q=80',
  'ghee': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&q=80',
  'olive oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&q=80',
  'coconut oil': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Coconuts_-_single_and_cracked_open.jpg/500px-Coconuts_-_single_and_cracked_open.jpg',
  'makhana': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Foxnut_Makhana_-_Nawada_District_-_Bihar_-_1.jpg/500px-Foxnut_Makhana_-_Nawada_District_-_Bihar_-_1.jpg',
  'sattu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg',
  'sattu drink': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&q=80',
  'soybean': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Nutrela_Soya_Chunks_Curry.jpg/500px-Nutrela_Soya_Chunks_Curry.jpg',

  // ===== VEGETABLES — har sabzi ke liye specific image =====
  'palak': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80',
  'spinach': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80',
  'palak sabzi': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80',
  'palak soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&q=80',
  'lauki': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Lauki_ki_Sabzi.jpg/500px-Lauki_ki_Sabzi.jpg',
  'bottle gourd': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Lauki_ki_Sabzi.jpg/500px-Lauki_ki_Sabzi.jpg',
  'lauki sabzi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Lauki_ki_Sabzi.jpg/500px-Lauki_ki_Sabzi.jpg',
  'tori': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Lauki_ki_Sabzi.jpg/500px-Lauki_ki_Sabzi.jpg',
  'karela': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Lauki_ki_Sabzi.jpg/500px-Lauki_ki_Sabzi.jpg',
  'methi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Lauki_ki_Sabzi.jpg/500px-Lauki_ki_Sabzi.jpg',
  'bhindi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Bhindi_fry.jpg/500px-Bhindi_fry.jpg',
  'mixed vegetable': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&q=80',
  'mix veg': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&q=80',
  'mix veg with rice': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&q=80',
  'aloo sabzi': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80',
  'gobhi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Aloo_gobi.jpg/500px-Aloo_gobi.jpg',
  'matar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Matar_paneer_green_peas.jpg/500px-Matar_paneer_green_peas.jpg',
  'kaddu': 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=200&q=80',
  'baingan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Baingan_bharta_special.jpg/500px-Baingan_bharta_special.jpg',
  'tamatar': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&q=80',
  'gajar': 'https://images.unsplash.com/photo-1582515073490-39981397c445?w=200&q=80',
  'shimla mirch': 'https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=200&q=80',
  'mushroom': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Mushroom_Tikka_Masala_by_Preeti_Tamilarasan.jpg/500px-Mushroom_Tikka_Masala_by_Preeti_Tamilarasan.jpg',
  'mushroom curry': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Mushroom_Tikka_Masala_by_Preeti_Tamilarasan.jpg/500px-Mushroom_Tikka_Masala_by_Preeti_Tamilarasan.jpg',
  'mushroom curry with roti': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg',
  'cucumber': 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=200&q=80',
  'kheera': 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=200&q=80',
  'cucumber chaat': 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=200&q=80',
  'salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80',
  'mixed vegetable salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80',
  'coconut': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Coconuts_-_single_and_cracked_open.jpg/500px-Coconuts_-_single_and_cracked_open.jpg',
  'coconut water': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Coconut_Drink%2C_Pangandaran.JPG/500px-Coconut_Drink%2C_Pangandaran.JPG',
  'sprouts': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Sprouts_Salad_with_Corn.JPG/500px-Sprouts_Salad_with_Corn.JPG',
  'sprout salad': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Sprouts_Salad_with_Corn.JPG/500px-Sprouts_Salad_with_Corn.JPG',
  'sprouts salad': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Sprouts_Salad_with_Corn.JPG/500px-Sprouts_Salad_with_Corn.JPG',
  'sprout chaat': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Sprouts_Salad_with_Corn.JPG/500px-Sprouts_Salad_with_Corn.JPG',
  'chana chaat': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Chana_Masala_in_Paul%C3%ADnia%2C_2023-10-16.jpg/500px-Chana_Masala_in_Paul%C3%ADnia%2C_2023-10-16.jpg',
  'sprouts salad': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Sprouts_Salad_with_Corn.JPG/500px-Sprouts_Salad_with_Corn.JPG',

  // ===== SOUPS =====
  'vegetable soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&q=80',
  'vegetable stew': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&q=80',
  'soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&q=80',

  // ===== SHAKES / BEVERAGES =====
  'green tea': 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=200&q=80',
  'buttermilk': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&q=80',
  'chaas': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&q=80',
  'oats banana shake': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&q=80',
  'oats banana peanut butter shake': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&q=80',
  'banana milkshake': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&q=80',
  'protein shake': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&q=80',
  'banana peanut butter shake': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&q=80',
  'marie biscuits': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&q=80',
  'dry fruits with dates': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg',
  'yogurt with honey': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Plain_Curd_Rice.jpg/500px-Plain_Curd_Rice.jpg',
  'yogurt with nuts': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Plain_Curd_Rice.jpg/500px-Plain_Curd_Rice.jpg',
  'fruit bowl': 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=200&q=80',
  'mixed fruit bowl': 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=200&q=80',
  'protein shake or chaas': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&q=80',
  'brown bread toast with butter': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80',
  'chicken sandwich or aloo paratha': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&q=80',
  'curd rice': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/South_Indian_Curd_Rice.jpg/500px-South_Indian_Curd_Rice.jpg',
  'green salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80',
  'steamed broccoli and salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80',
  'steamed vegetables': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80',
  'steamed veggies': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80',
  'mixed salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80',
  'dal soup': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Dal_tadka_and_naan.jpg/500px-Dal_tadka_and_naan.jpg',
  'green tea with marie biscuits': 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=200&q=80',
  'tofu salad': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80',

  // ===== DALS — har dal ke liye specific image (jo pehle generic thi) =====
  'dal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Dal_tadka_and_naan.jpg/500px-Dal_tadka_and_naan.jpg',
  'dal makhani': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Dal_tadka_and_naan.jpg/500px-Dal_tadka_and_naan.jpg',
  'dal tadka': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Dal_tadka_and_naan.jpg/500px-Dal_tadka_and_naan.jpg',
  'dal rice': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Dal_tadka_and_naan.jpg/500px-Dal_tadka_and_naan.jpg',
  'dal khichdi with ghee': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Khichadi_%2849683829713%29.jpg/500px-Khichadi_%2849683829713%29.jpg',
  'chole': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Chana_Masala_in_Paul%C3%ADnia%2C_2023-10-16.jpg/500px-Chana_Masala_in_Paul%C3%ADnia%2C_2023-10-16.jpg',
  'rajma': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Rajma_Chawal_by_Rama_Bhave.jpg/500px-Rajma_Chawal_by_Rama_Bhave.jpg',
  'rajma chawal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Rajma_Chawal_by_Rama_Bhave.jpg/500px-Rajma_Chawal_by_Rama_Bhave.jpg',
  'chana': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Chana_Masala_in_Paul%C3%ADnia%2C_2023-10-16.jpg/500px-Chana_Masala_in_Paul%C3%ADnia%2C_2023-10-16.jpg',
  'khichdi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Khichadi_%2849683829713%29.jpg/500px-Khichadi_%2849683829713%29.jpg',
  'khichdi with chicken': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Khichadi_%2849683829713%29.jpg/500px-Khichadi_%2849683829713%29.jpg',
  'daliya khichdi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Khichadi_%2849683829713%29.jpg/500px-Khichadi_%2849683829713%29.jpg',
  'chapati with sabzi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg',
  '2 chapati with sabzi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg',
  '2 chapati with lauki sabzi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg',
  '2 chapati with egg curry': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg',
  '2 paratha with butter': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Aloo_Paratha_2.jpg/500px-Aloo_Paratha_2.jpg',
  '2 chapati with chicken curry': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg',
  'mixed vegetable sabzi': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&q=80',
};

// Direct image lookup for the EXACT food strings used in the generated diet plan.
// Yeh sabse pehle check hota hai — agar exact match mil gaya to wahi image return hoga,
// chahe foodImageMap mein koi aur long key match kar jaye.
// Goal: har food chip pe uska SAHI photo dikhe — naam aur photo match karein.
const directFoodImageMap = {
  // ===== EGGS — har boiled/omelette/curry variant ka specific image =====
  'Boiled eggs (3 whites + 1 yellow)': 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=200&q=80',
  'Boiled eggs (2) with brown bread': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&q=80',
  'Boiled eggs (3 pcs)': 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=200&q=80',
  'Boiled eggs (3)': 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=200&q=80',
  'Boiled eggs': 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=200&q=80',
  'Boiled egg (1)': 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=200&q=80',
  'Boiled egg whites (3)': 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=200&q=80',
  'Boiled egg whites': 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=200&q=80',
  '4 boiled eggs OR paneer bhurji': 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=200&q=80',
  'Boiled eggs OR paneer bhurji': 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=200&q=80',
  'Omelette (3 eggs) with brown bread': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&q=80',
  'Egg bhurji with chapati': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&q=80',
  'Egg bhurji with roti': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&q=80',
  'Egg bhurji': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&q=80',
  'Egg curry': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=200&q=80',
  'Egg curry with rice': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=200&q=80',
  'Egg curry with paratha': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=200&q=80',
  'Egg white omelette': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&q=80',
  'Egg white omelette with veggies': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&q=80',
  'Eggs or yogurt': 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=200&q=80',
  'Eggs or tofu bhurji': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&q=80',

  // ===== DAIRY =====
  'Milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80',
  'Whole milk (1 glass)': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80',
  'Whole milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80',
  'Whole milk with Bournvita': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80',
  'Whole milk with honey': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80',
  'Greek yogurt (200g)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Plain_Curd_Rice.jpg/500px-Plain_Curd_Rice.jpg',
  'Greek yogurt': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Plain_Curd_Rice.jpg/500px-Plain_Curd_Rice.jpg',
  'Yogurt': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Plain_Curd_Rice.jpg/500px-Plain_Curd_Rice.jpg',
  'Yogurt with honey': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Plain_Curd_Rice.jpg/500px-Plain_Curd_Rice.jpg',
  'Yogurt with nuts': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Plain_Curd_Rice.jpg/500px-Plain_Curd_Rice.jpg',
  'Curd (1 katori)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Plain_Curd_Rice.jpg/500px-Plain_Curd_Rice.jpg',
  'Curd rice': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/South_Indian_Curd_Rice.jpg/500px-South_Indian_Curd_Rice.jpg',
  'Cheese omelette': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&q=80',
  'Cheese sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&q=80',
  'Cheese sandwich (2 slices)': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&q=80',

  // ===== PANEER / TOFU — har variant specific =====
  'Paneer butter masala (150g)': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&q=80',
  'Paneer bhurji (150g)': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&q=80',
  'Paneer tikka (100g) with salad': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=200&q=80',
  'Tofu or paneer tikka (100g)': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=200&q=80',
  'Paneer or tofu curry': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&q=80',
  'Paneer or tofu curry (100g)': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&q=80',
  'Tofu bhurji': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80',
  'Tofu salad': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80',
  'Palak paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&q=80',

  // ===== CHICKEN / MUTTON / FISH — har variant specific =====
  'Chicken curry (200g) OR mutton': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg',
  'Chicken curry OR paneer bhurji (200g)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg',
  'Chicken or paneer curry (200g)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg',
  'Butter chicken OR mutton curry (200g)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg',
  'Grilled chicken breast (150g) or fish': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=200&q=80',
  'Grilled chicken or fish (150g)': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=200&q=80',
  'Grilled fish or chicken (150g)': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&q=80',
  'Grilled chicken or paneer (150g)': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=200&q=80',
  'Grilled chicken or tofu (150g)': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=200&q=80',
  'Fish curry': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&q=80',
  'Fish curry with chapati': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&q=80',
  'Fish curry with rice': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&q=80',
  'Fish or paneer curry': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&q=80',
  'Fish or chicken curry (150g)': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&q=80',
  'Tuna salad': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&q=80',
  'Tuna sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&q=80',
  'Chicken soup': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Chicken_Noodle_Soup_US.jpg/500px-Chicken_Noodle_Soup_US.jpg',
  'Chicken soup with bread': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Chicken_Noodle_Soup_US.jpg/500px-Chicken_Noodle_Soup_US.jpg',
  'Mutton soup with bread': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Chicken_Noodle_Soup_US.jpg/500px-Chicken_Noodle_Soup_US.jpg',
  'Mutton stew': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg',
  'Mutton keema (small portion)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg',
  'Keema with chapati': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg',
  'Keema with rice': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chicken_Curry_%26_Rice_%283%29.jpg/500px-Chicken_Curry_%26_Rice_%283%29.jpg',
  'Keema with roti': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg',
  'Keema paratha': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Aloo_Paratha_2.jpg/500px-Aloo_Paratha_2.jpg',
  'Chicken sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&q=80',
  'Chicken sandwich OR aloo paratha': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&q=80',
  'Chicken wrap': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&q=80',
  'Chicken salad': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80',
  'Chicken biryani': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80',
  'Chicken biryani (small)': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80',

  // ===== RICE / ROTI / BREADS — har variant specific =====
  'Brown rice (1 katori)': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&q=80',
  'Brown rice (1 small katori)': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&q=80',
  'Rice (1.5 katori)': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&q=80',
  'Rice or 2 chapati': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&q=80',
  'Jeera rice': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&q=80',
  'Vegetable pulao with raita': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&q=80',
  'Roti with ghee': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg',
  '3 chapati': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg',
  '3 chapati with ghee': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg',
  'Chapati with sabzi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg',
  '2 chapati with sabzi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg',
  '2 chapati with lauki sabzi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg',
  '2 chapati with egg curry': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg',
  '2 chapati with chicken curry': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg',
  '2 paratha with butter': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Aloo_Paratha_2.jpg/500px-Aloo_Paratha_2.jpg',
  'Stuffed paratha with butter': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Aloo_Paratha_2.jpg/500px-Aloo_Paratha_2.jpg',
  'Aloo paratha (2) with curd': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Aloo_Paratha_2.jpg/500px-Aloo_Paratha_2.jpg',
  'Naan (2 pcs)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Indian_naan_bread.jpg/500px-Indian_naan_bread.jpg',
  'Brown bread toast with butter': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80',

  // ===== DALS / LENTILS / KICHDI — har dal specific =====
  'Dal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Dal_tadka_and_naan.jpg/500px-Dal_tadka_and_naan.jpg',
  'Dal makhani': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Dal_tadka_and_naan.jpg/500px-Dal_tadka_and_naan.jpg',
  'Dal tadka': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Dal_tadka_and_naan.jpg/500px-Dal_tadka_and_naan.jpg',
  'Dal rice': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Dal_tadka_and_naan.jpg/500px-Dal_tadka_and_naan.jpg',
  'Dal soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&q=80',
  'Dal khichdi with ghee': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Khichadi_%2849683829713%29.jpg/500px-Khichadi_%2849683829713%29.jpg',
  'Khichdi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Khichadi_%2849683829713%29.jpg/500px-Khichadi_%2849683829713%29.jpg',
  'Khichdi with chicken': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Khichadi_%2849683829713%29.jpg/500px-Khichadi_%2849683829713%29.jpg',
  'Khichdi with curd': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Khichadi_%2849683829713%29.jpg/500px-Khichadi_%2849683829713%29.jpg',
  'Daliya khichdi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Khichadi_%2849683829713%29.jpg/500px-Khichadi_%2849683829713%29.jpg',
  'Daliya upma': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&q=80',
  'Moong dal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Dal_tadka_and_naan.jpg/500px-Dal_tadka_and_naan.jpg',
  'Moong dal chilla': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Moonglet_chilla_with_curd_and_hot_tea.jpg/500px-Moonglet_chilla_with_curd_and_hot_tea.jpg',
  'Moong dal chilla (2 pcs)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Moonglet_chilla_with_curd_and_hot_tea.jpg/500px-Moonglet_chilla_with_curd_and_hot_tea.jpg',
  'Besan chilla': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Chilla_besan.JPG/500px-Chilla_besan.JPG',
  'Besan chilla (2 pcs) with green chutney': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Chilla_besan.JPG/500px-Chilla_besan.JPG',
  'Idli sambar': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&q=80',
  'Idli with sambar': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&q=80',
  'Poha or upma': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Delicious_Indian_breakfast_Upma.jpg/500px-Delicious_Indian_breakfast_Upma.jpg',
  'Poha with peanuts and vegetables': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Poha%2C_a_snack_made_of_flattened_rice.jpg/500px-Poha%2C_a_snack_made_of_flattened_rice.jpg',
  'Poha with vegetables': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Poha%2C_a_snack_made_of_flattened_rice.jpg/500px-Poha%2C_a_snack_made_of_flattened_rice.jpg',
  'Oats with milk': 'https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=200&q=80',
  'Oats upma': 'https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=200&q=80',
  'Oats with fruit': 'https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=200&q=80',
  'Oats shake with banana and peanut butter': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&q=80',
  'Oats banana shake with peanut butter': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&q=80',
  'Oats banana peanut butter shake': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&q=80',
  'Banana peanut butter shake': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&q=80',
  'Banana milkshake': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&q=80',
  'Protein shake': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&q=80',
  'Protein shake OR chaas': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&q=80',
  'Sattu drink': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&q=80',
  'Buttermilk': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&q=80',
  'Buttermilk (chaas)': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&q=80',
  'Green tea': 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=200&q=80',
  'Green tea with marie biscuits': 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=200&q=80',

  // ===== VEGETABLES — har sabzi specific, no cross-contamination =====
  'Palak sabzi': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80',
  'Palak sabzi with roti': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80',
  'Palak soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&q=80',
  'Lauki sabzi with 1 chapati': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg',
  'Mushroom curry with roti': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg/500px-Chapati_making_at_the_Chokhi_Dhani_Resort_Panchkula_12.jpg',
  'Mix veg with rice': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&q=80',
  'Mixed sabzi': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&q=80',
  'Mixed vegetable sabzi': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&q=80',
  'Mixed salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80',
  'Mixed vegetable salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80',
  'Green salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80',
  'Salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80',
  'Sprout salad': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Sprouts_Salad_with_Corn.JPG/500px-Sprouts_Salad_with_Corn.JPG',
  'Sprouts salad': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Sprouts_Salad_with_Corn.JPG/500px-Sprouts_Salad_with_Corn.JPG',
  'Sprout chaat': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Sprouts_Salad_with_Corn.JPG/500px-Sprouts_Salad_with_Corn.JPG',
  'Chana chaat': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Chana_Masala_in_Paul%C3%ADnia%2C_2023-10-16.jpg/500px-Chana_Masala_in_Paul%C3%ADnia%2C_2023-10-16.jpg',
  'Cucumber': 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=200&q=80',
  'Cucumber chaat': 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=200&q=80',
  'Cucumber raita': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Plain_Curd_Rice.jpg/500px-Plain_Curd_Rice.jpg',
  'Aloo sabzi': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80',
  'Steamed vegetables': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80',
  'Steamed veggies': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80',
  'Steamed broccoli and salad': 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=200&q=80',
  'Soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&q=80',
  'Vegetable soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&q=80',
  'Vegetable soup with bread': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&q=80',
  'Vegetable stew': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&q=80',

  // ===== NUTS / SEEDS / DRIED FRUITS =====
  'Handful of almonds': 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=200&q=80',
  'Handful of almonds (8-10)': 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=200&q=80',
  'Almonds (8-10 pcs)': 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=200&q=80',
  'Almonds (8-10)': 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=200&q=80',
  'Handful of nuts': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg',
  'Mixed nuts': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg',
  'Trail mix': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg',
  'Trail mix (nuts + raisins)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg',
  'Dry fruits (mixed)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg',
  'Dry fruits with dates': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg',
  'Peanuts': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Walnuts_pistachios_cashew_almonds.jpg/500px-Walnuts_pistachios_cashew_almonds.jpg',
  'Makhana': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Foxnut_Makhana_-_Nawada_District_-_Bihar_-_1.jpg/500px-Foxnut_Makhana_-_Nawada_District_-_Bihar_-_1.jpg',
  'Makhana (fox nuts)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Foxnut_Makhana_-_Nawada_District_-_Bihar_-_1.jpg/500px-Foxnut_Makhana_-_Nawada_District_-_Bihar_-_1.jpg',

  // ===== FRUITS — har fruit specific =====
  'Apple': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&q=80',
  'Banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&q=80',
  'Apple or guava': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&q=80',
  'Apple or orange': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&q=80',
  'Seasonal fruit': 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=200&q=80',
  'Mixed fruit': 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=200&q=80',
  'Mixed fruit bowl': 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=200&q=80',
  'Fruit bowl': 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=200&q=80',
  'Coconut water': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Coconut_Drink%2C_Pangandaran.JPG/500px-Coconut_Drink%2C_Pangandaran.JPG',
};

// Find image for a food text — direct exact match first, then longest-substring match.
function getFoodImage(foodText) {
  // 1. Exact match (case-insensitive) — best. Yeh har diet plan ke exact food string ko
  //    SAHI image dega, chahe foodImageMap mein koi aur key longer ho.
  if (directFoodImageMap[foodText]) return directFoodImageMap[foodText];
  const lower = foodText.toLowerCase();
  if (directFoodImageMap[lower]) return directFoodImageMap[lower];

  // 2. Longest-substring match against the broader food image map
  const keys = Object.keys(foodImageMap).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (lower.includes(key)) {
      return foodImageMap[key];
    }
  }

  // 3. Last-resort generic placeholder
  return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&q=80';
}

// Food emoji map: har food ke liye specific emoji. Yeh fallback image ke liye use hoga
// aur bhi cases mein jab Unsplash image sahi food na dikhaye.
const foodEmojiMap = {
  // Eggs
  'eggs': '🥚', 'egg': '🥚', 'ande': '🥚', 'omelette': '🍳', 'omelette 3 eggs': '🍳',
  'egg bhurji': '🍳', 'egg white omelette': '🍳', 'egg curry': '🍳',
  'boiled eggs': '🥚', 'boiled egg': '🥚', 'boiled egg whites': '🥚',
  'boiled eggs 3': '🥚', 'boiled eggs 3 whites': '🥚',
  'eggs and toast': '🍳', 'eggs or tofu bhurji': '🍳',
  'eggs or paneer': '🥚', 'eggs or yogurt': '🥚',
  'egg and fruit': '🥚', 'egg bhurji with roti': '🍳',
  'egg whites': '🥚',

  // Dairy
  'milk': '🥛', 'curd': '🥛', 'dahi': '🥛', 'yogurt': '🥛', 'greek yogurt': '🥛',
  'paneer': '🧀', 'paneer bhurji': '🧀', 'paneer tikka': '🧀',
  'paneer butter masala': '🧀', 'palak paneer': '🥬',
  'cheese': '🧀', 'cheese sandwich': '🧀',
  'bournvita': '🥛', 'buttermilk': '🥛', 'chaas': '🥛',
  'cucumber raita': '🥒', 'cucumber raita 1': '🥒',

  // Chicken
  'chicken': '🍗', 'chicken breast': '🍗', 'grilled chicken': '🍗',
  'chicken curry': '🍛', 'murgi': '🍗', 'murgi curry': '🍛',
  'butter chicken': '🍛', 'chicken biryani': '🍚', 'chicken biryani small': '🍚',
  'chicken soup': '🍲', 'chicken sandwich': '🥪', 'chicken wrap': '🌯',
  'chicken salad': '🥗', 'chicken keema': '🍗', 'keema': '🍗',
  'keema paratha': '🫓', 'tandoori chicken': '🍗',
  'chicken or paneer': '🍗', 'chicken or paneer curry': '🍛',
  'chicken or tofu': '🍗', 'chicken breast or fish': '🍗',
  'grilled chicken or paneer': '🍗', 'butter chicken or mutton': '🍛',
  'chicken curry or mutton': '🍛', 'fish or chicken curry': '🐟',
  'eggs or paneer': '🥚', 'khichdi with chicken': '🍲',
  'chicken soup with bread': '🍲',

  // Mutton
  'mutton': '🍖', 'mutton soup': '🍲', 'keema': '🍖',

  // Fish
  'fish': '🐟', 'machli': '🐟', 'tuna': '🐟', 'fish curry': '🐟',
  'tuna sandwich': '🥪', 'tuna salad': '🥗',
  'fish or paneer': '🐟', 'fish or paneer curry': '🐟',

  // Lentils / Dals
  'dal': '🍲', 'dal makhani': '🍲', 'dal tadka': '🍲', 'dal rice': '🍲',
  'moong dal': '🍲', 'rajma': '🫘', 'chana': '🫘', 'chole': '🫘',
  'khichdi': '🍲', 'daliya khichdi': '🍲', 'sambar': '🍲',

  // Rice / Rotis / Breads
  'rice': '🍚', 'brown rice': '🍚', 'jeera rice': '🍚', 'vegetable pulao': '🍚',
  'chapati': '🫓', 'roti': '🫓', 'ragi roti': '🫓', 'naan': '🫓',
  'aloo paratha': '🫓', 'stuffed paratha': '🫓', 'paratha': '🫓',
  'daliya': '🌾', 'bread': '🍞', 'brown bread': '🍞',

  // Vegetables
  'palak': '🥬', 'spinach': '🥬', 'palak sabzi': '🥬', 'palak soup': '🥬',
  'lauki': '🥒', 'bottle gourd': '🥒', 'lauki sabzi': '🥒',
  'tori': '🥒', 'karela': '🥒', 'methi': '🌿',
  'bhindi': '🥬', 'mixed vegetable': '🥗', 'mix veg': '🥗',
  'aloo sabzi': '🥔', 'gobhi': '🥦', 'matar': '🟢',
  'kaddu': '🎃', 'baingan': '🍆', 'tamatar': '🍅',
  'gajar': '🥕', 'shimla mirch': '🫑', 'kheera': '🥒', 'cucumber': '🥒',
  'mushroom': '🍄', 'mushroom curry': '🍄',
  'cucumber chaat': '🥒', 'coconut': '🥥',
  'steamed vegetables': '🥗', 'steamed veggies': '🥗', 'steamed broccoli and salad': '🥗',
  'green salad': '🥗', 'salad': '🥗', 'mixed vegetable salad': '🥗', 'mixed salad': '🥗',

  // Salads
  'salad': '🥗', 'mixed vegetable salad': '🥗',

  // Fruits
  'apple': '🍎', 'banana': '🍌', 'orange': '🍊', 'santre': '🍊',
  'mousambi': '🍋', 'papaya': '🟠', 'guava': '🍈', 'amla': '🟢',
  'watermelon': '🍉', 'kiwi': '🥝', 'anar': '🔴', 'ananas': '🍍',
  'berries': '🫐', 'fruit': '🍎', 'mixed fruit': '🍎',
  'apple or guava': '🍎', 'apple or orange': '🍎',

  // Nuts & Seeds
  'almonds': '🌰', 'badam': '🌰', 'akhrot': '🌰', 'walnuts': '🌰',
  'kaju': '🌰', 'cashews': '🌰', 'peanuts': '🥜',
  'mixed nuts': '🌰', 'dry fruits': '🌰', 'trail mix': '🌰',
  'peanut butter': '🥜', 'flax seeds': '🌰', 'chia seeds': '🌰',
  'desi ghee': '🧈', 'ghee': '🧈', 'olive oil': '🫒', 'coconut oil': '🥥',
  'makhana': '🌰', 'sattu': '🌾', 'sattu drink': '🥤',
  'soybean': '🫘', 'besan': '🌾',

  // Soups
  'vegetable soup': '🍲', 'vegetable stew': '🍲',

  // Shakes & Beverages
  'green tea': '🍵', 'oats banana shake': '🥤', 'banana milkshake': '🥤',
  'protein shake': '🥤', 'banana peanut butter shake': '🥤',
  'oats banana peanut butter shake': '🥤',
  'coconut water': '🥥', 'milk with honey': '🥛',
  'whole milk': '🥛', 'whole milk with bournvita': '🥛',

  // Snacks
  'marie biscuits': '🍪', 'chana chaat': '🌶️', 'sprout chaat': '🌱',
  'sprouts salad': '🌱', 'sprouts': '🌱', 'sprout salad': '🌱',
  'cheese omelette': '🍳', 'tofu': '🟦', 'tofu bhurji': '🟦', 'palak tofu': '🥬',
  'moong dal chilla': '🫓', 'moong dal chilla 2': '🫓', 'moong chilla': '🫓',
  'besan chilla': '🫓', 'besan chilla with chutney': '🫓',
  'besan': '🌾', 'idli': '🍚', 'dosa': '🫓', 'sambar': '🍲',
  'poha': '🍚', 'upma': '🍚', 'oats': '🌾',
  'oats with milk': '🌾', 'oats upma': '🌾', 'oats with fruit': '🌾',
  'chapati with sabzi': '🫓', 'dal khichdi with ghee': '🍲',
  'mushroom curry with roti': '🍄', 'mix veg with rice': '🥗',
  'fish curry with rice': '🐟', 'fish curry with chapati': '🐟',
  'keema with chapati': '🍖', 'keema with rice': '🍖',
  'egg curry with rice': '🍳', 'egg curry with paratha': '🍳',
  'rajma chawal': '🫘', 'palak paneer': '🥬',
  'biryani': '🍚', 'chicken or paneer': '🍗',
};

// Food-specific background color gradient — har food ke liye unique visual identity
const foodColorMap = {
  // Eggs — soft yellow
  'eggs': '#fff4c2', 'egg': '#fff4c2', 'ande': '#fff4c2',
  'omelette': '#ffe680', 'omelette 3 eggs': '#ffe680',
  'egg bhurji': '#ffe680', 'egg white omelette': '#fff4c2',
  'egg curry': '#f5c14b', 'boiled eggs': '#fff4c2', 'boiled egg': '#fff4c2',
  'boiled egg whites': '#e6f4ff', 'boiled eggs 3': '#fff4c2',
  'boiled eggs 3 whites': '#e6f4ff', 'eggs and toast': '#fff4c2',
  'eggs or tofu bhurji': '#ffe680', 'eggs or paneer': '#fff4c2',
  'eggs or yogurt': '#fff4c2', 'egg and fruit': '#fff4c2',
  'egg bhurji with roti': '#ffe680', 'egg whites': '#e6f4ff',

  // Dairy — cool blue/white
  'milk': '#e8f1ff', 'curd': '#f0e8ff', 'dahi': '#f0e8ff',
  'yogurt': '#f0e8ff', 'greek yogurt': '#e6f7ff', 'paneer': '#fffbe6',
  'paneer bhurji': '#fff5d6', 'paneer tikka': '#ffd6a5',
  'paneer butter masala': '#ffb84d', 'palak paneer': '#a8d8a8',
  'cheese': '#fff2cc', 'cheese sandwich': '#fff2cc',
  'bournvita': '#d4a574', 'buttermilk': '#f0e8ff', 'chaas': '#f0e8ff',
  'cucumber raita': '#d4f0c0', 'cucumber raita 1': '#d4f0c0',

  // Chicken — warm orange/red
  'chicken': '#f4a460', 'chicken breast': '#f4a460', 'grilled chicken': '#d2691e',
  'chicken curry': '#cd5c5c', 'murgi': '#f4a460', 'murgi curry': '#cd5c5c',
  'butter chicken': '#d2691e', 'chicken biryani': '#e6b800',
  'chicken biryani small': '#e6b800', 'chicken soup': '#ffd9b3',
  'chicken sandwich': '#f4a460', 'chicken wrap': '#d2691e',
  'chicken salad': '#a8d8a8', 'chicken keema': '#cd5c5c',
  'keema': '#cd5c5c', 'keema paratha': '#cd5c5c',
  'chicken or paneer': '#f4a460', 'chicken or paneer curry': '#cd5c5c',
  'chicken or tofu': '#f4a460', 'chicken breast or fish': '#f4a460',
  'grilled chicken or paneer': '#f4a460', 'butter chicken or mutton': '#cd5c5c',
  'chicken curry or mutton': '#cd5c5c', 'khichdi with chicken': '#d4a574',
  'chicken soup with bread': '#ffd9b3',

  // Mutton — deep red
  'mutton': '#8b0000', 'mutton soup': '#a52a2a',

  // Fish — cool blue
  'fish': '#a8d0e6', 'machli': '#a8d0e6', 'tuna': '#ff9999',
  'fish curry': '#ffb380', 'tuna sandwich': '#a8d0e6', 'tuna salad': '#a8d0e6',
  'fish or paneer': '#a8d0e6', 'fish or paneer curry': '#a8d0e6',

  // Lentils — earthy brown
  'dal': '#deb887', 'dal makhani': '#5c3317', 'dal tadka': '#deb887',
  'dal rice': '#deb887', 'moong dal': '#e6d8a8', 'rajma': '#8b4513',
  'chana': '#d2a679', 'chole': '#a0522d', 'khichdi': '#deb887',
  'daliya khichdi': '#deb887', 'sambar': '#cd5c5c',

  // Rice / Rotis / Breads
  'rice': '#fafafa', 'brown rice': '#d2b48c', 'jeera rice': '#faf0d8',
  'vegetable pulao': '#e6d8a8', 'chapati': '#f5deb3', 'roti': '#f5deb3',
  'ragi roti': '#8b6f47', 'naan': '#fff8dc', 'aloo paratha': '#daa520',
  'stuffed paratha': '#daa520', 'paratha': '#daa520', 'daliya': '#d2b48c',
  'bread': '#deb887', 'brown bread': '#a0522d',

  // Vegetables — fresh greens
  'palak': '#2e8b57', 'spinach': '#2e8b57', 'palak sabzi': '#3cb371',
  'palak soup': '#90ee90', 'lauki': '#c1e1c1', 'bottle gourd': '#c1e1c1',
  'lauki sabzi': '#a8d8a8', 'tori': '#90ee90', 'karela': '#556b2f',
  'methi': '#808000', 'bhindi': '#6b8e23', 'mixed vegetable': '#90ee90',
  'mix veg': '#90ee90', 'aloo sabzi': '#daa520', 'gobhi': '#fffacd',
  'matar': '#7cfc00', 'kaddu': '#ff8c00', 'baingan': '#4b0082',
  'tamatar': '#ff6347', 'gajar': '#ff8c00', 'shimla mirch': '#ff0000',
  'kheera': '#90ee90', 'cucumber': '#90ee90', 'mushroom': '#d2b48c',
  'mushroom curry': '#cd853f', 'cucumber chaat': '#90ee90',
  'coconut': '#fffacd', 'salad': '#90ee90', 'mixed vegetable salad': '#90ee90',

  // Fruits
  'apple': '#ff6347', 'banana': '#ffe135', 'orange': '#ffa500',
  'santre': '#ffa500', 'mousambi': '#ffe135', 'papaya': '#ff8c00',
  'guava': '#90ee90', 'amla': '#7cfc00', 'watermelon': '#ff6347',
  'kiwi': '#7cfc00', 'anar': '#dc143c', 'ananas': '#ffd700',
  'berries': '#8b008b', 'fruit': '#ff6347', 'mixed fruit': '#ff6347',
  'apple or guava': '#ff6347', 'apple or orange': '#ff6347',

  // Nuts & Seeds
  'almonds': '#deb887', 'badam': '#deb887', 'akhrot': '#a0522d',
  'walnuts': '#a0522d', 'kaju': '#f5deb3', 'cashews': '#f5deb3',
  'peanuts': '#d2b48c', 'mixed nuts': '#cd853f', 'dry fruits': '#cd853f',
  'trail mix': '#cd853f', 'peanut butter': '#d2b48c', 'flax seeds': '#a0522d',
  'chia seeds': '#2f2f2f', 'desi ghee': '#ffd700', 'ghee': '#ffd700',
  'olive oil': '#808000', 'coconut oil': '#fffacd', 'makhana': '#fffacd',
  'sattu': '#d2b48c', 'sattu drink': '#d2b48c', 'soybean': '#cd853f',
  'besan': '#daa520',

  // Soups
  'vegetable soup': '#90ee90', 'vegetable stew': '#cd5c5c',

  // Shakes & Beverages
  'green tea': '#90ee90', 'oats banana shake': '#ffe135',
  'banana milkshake': '#ffe135', 'protein shake': '#dcdcdc',
  'banana peanut butter shake': '#d2b48c',
  'oats banana peanut butter shake': '#d2b48c',
  'coconut water': '#fffacd',

  // Snacks
  'marie biscuits': '#daa520', 'chana chaat': '#a0522d',
  'sprout chaat': '#7cfc00', 'sprouts salad': '#7cfc00',
  'sprouts': '#7cfc00', 'sprout salad': '#7cfc00',
  'cheese omelette': '#ffe680', 'tofu': '#fffacd', 'tofu bhurji': '#fffacd',
  'palak tofu': '#a8d8a8', 'moong dal chilla': '#daa520',
  'moong dal chilla 2': '#daa520', 'moong chilla': '#daa520',
  'besan chilla': '#daa520', 'besan chilla with chutney': '#daa520',
  'idli': '#fffacd', 'dosa': '#daa520', 'poha': '#faf0d8',
  'upma': '#faf0d8', 'oats': '#d2b48c', 'oats with milk': '#d2b48c',
  'oats upma': '#d2b48c', 'oats with fruit': '#d2b48c',
};

// Find food-specific emoji and color for a food text (longest-key match wins)
function getFoodEmoji(foodText) {
  const lower = foodText.toLowerCase();
  const keys = Object.keys(foodEmojiMap).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (lower.includes(key)) {
      return foodEmojiMap[key];
    }
  }
  return '🍽️'; // Default generic food emoji
}

function getFoodColor(foodText) {
  const lower = foodText.toLowerCase();
  const keys = Object.keys(foodColorMap).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (lower.includes(key)) {
      return foodColorMap[key];
    }
  }
  return '#e6f7ff'; // Default light blue
}

// Build an inline SVG data-URL placeholder with food emoji + name
// Yeh kabhi load fail nahi hoga aur har food ke liye unique dikhta hai
function buildFoodSVG(foodText) {
  const emoji = getFoodEmoji(foodText);
  const bgColor = getFoodColor(foodText);
  // Escape food name for SVG
  const safeName = foodText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  // Use a darker shade of bgColor for the text label
  const textColor = '#1a3a4a';
  // Wrap text to 2 lines if too long
  const maxLen = 18;
  const lines = [];
  if (safeName.length <= maxLen) {
    lines.push(safeName);
  } else {
    // Split by word at midpoint
    const words = safeName.split(' ');
    let cur = '';
    for (const w of words) {
      if ((cur + ' ' + w).trim().length <= maxLen) {
        cur = (cur + ' ' + w).trim();
      } else {
        if (cur) lines.push(cur);
        cur = w;
      }
    }
    if (cur) lines.push(cur);
    // Limit to 2 lines
    if (lines.length > 2) {
      lines.length = 2;
      lines[1] = lines[1].slice(0, maxLen - 1) + '…';
    }
  }
  const lineY = [50, 70];
  const tspans = lines.map((line, i) =>
    `<tspan x="100" y="${lineY[i] || 70}">${line}</tspan>`
  ).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${bgColor}" stop-opacity="1"/>
        <stop offset="100%" stop-color="${bgColor}" stop-opacity="0.65"/>
      </linearGradient>
    </defs>
    <rect width="200" height="200" fill="url(#g)"/>
    <text x="100" y="22" text-anchor="middle" font-size="60" font-family="Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif">${emoji}</text>
    <text x="100" y="100" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-size="13" font-weight="600" fill="${textColor}">${tspans}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// Helper function to render food items as clickable chips WITH real image
// Strategy: pehle Unsplash image try karega, onerror pe inline SVG fallback
// (SVG fallback mein food ka emoji + naam hota hai — kabhi fail nahi hoga)
function renderFoodChips(foods) {
  return foods.map(food => {
    const safeText = food.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
    const imageUrl = getFoodImage(food);
    const fallbackUrl = buildFoodSVG(food);
    return `<span class="food-chip" data-food="${safeText}">
      <img class="food-chip-img" src="${imageUrl}" alt="${food}" loading="lazy"
           onerror="this.onerror=null;if(this.dataset.fallback!=='1'){this.dataset.fallback='1';this.src='${fallbackUrl}';}" />
      <span class="food-chip-text">${food}</span>
    </span>`;
  }).join('');
}

// Attach click handler to food chips
function attachFoodChipHandlers(container) {
  const chips = container.querySelectorAll('.food-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const foodName = chip.getAttribute('data-food');
      openFoodModal(foodName);
    });
  });
}

if (dietForm && dietResult) {
  dietForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const gender = document.querySelector('#gender').value;
    const age = Number(document.querySelector('#age').value);
    const weight = Number(document.querySelector('#weight').value);
    const goal = document.querySelector('#goal').value;
    const dietType = document.querySelector('#diet-type').value;
    const budget = document.querySelector('#budget').value;
    const activity = document.querySelector('#activity').value;

    // BMR (Basal Metabolic Rate) using Mifflin-St Jeor equation
    const bmr = Math.round((10 * weight + 6.25 * age + (gender === 'female' ? -161 : 5)));

    // Activity multipliers for TDEE (Total Daily Energy Expenditure)
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryactive: 1.9,
    };

    let dailyCalories = Math.round(bmr * (activityMultipliers[activity] || 1.55));

    if (goal === 'lose') {
      dailyCalories -= 400;
    } else if (goal === 'gain') {
      dailyCalories += 450;
    }

    const protein = Math.round(weight * 1.6);
    const carbs = Math.round((dailyCalories * 0.4) / 4);
    const fats = Math.round((dailyCalories * 0.3) / 9);

    const genderLabel = gender === 'female' ? 'Female' : 'Male';
    const goalLabel = goal === 'lose' ? 'weight loss' : goal === 'gain' ? 'muscle gain' : 'maintenance';
    const activityLabel = activity === 'sedentary' ? 'Sedentary' : activity === 'light' ? 'Light' : activity === 'moderate' ? 'Moderate' : activity === 'active' ? 'Active' : 'Very Active';

    const breakfastFoods = (dietType === 'vegetarian'
      ? (goal === 'lose'
          ? ['Besan chilla (2 pcs) with green chutney', 'Greek yogurt (200g)', 'Oats with milk', 'Apple', 'Green tea', 'Sprout salad', 'Cucumber raita']
          : goal === 'gain'
            ? ['Oats banana shake with peanut butter', 'Poha with peanuts and vegetables', 'Whole milk (1 glass)', '4 boiled eggs OR paneer bhurji', 'Banana', 'Almonds (8-10 pcs)', 'Daliya upma']
            : ['Poha with vegetables', 'Oats upma', 'Mixed fruit bowl', 'Curd (1 katori)', 'Moong dal chilla', 'Idli with sambar', 'Daliya khichdi'])
      : dietType === 'nonveg'
        ? (goal === 'lose'
            ? ['Boiled eggs (3 whites + 1 yellow)', 'Greek yogurt', 'Oats with milk', 'Apple', 'Green tea', 'Egg white omelette with veggies', 'Sprouts salad']
            : goal === 'gain'
              ? ['Omelette (3 eggs) with brown bread', 'Oats banana peanut butter shake', 'Whole milk', 'Chicken sandwich', 'Banana', 'Boiled eggs (3 pcs)', 'Mutton keema (small portion)']
              : ['Boiled eggs (2) with brown bread', 'Oats upma', 'Seasonal fruit', 'Yogurt', 'Egg bhurji with chapati', 'Chicken soup', 'Mutton stew'])
        : (goal === 'lose'
            ? ['Eggs or tofu bhurji', 'Greek yogurt', 'Oats with milk', 'Apple', 'Green tea', 'Sprout salad', 'Moong dal chilla']
            : goal === 'gain'
              ? ['Oats shake with banana and peanut butter', 'Boiled eggs OR paneer bhurji', 'Whole milk', 'Banana', 'Brown bread toast with butter', 'Chicken sandwich OR aloo paratha', 'Mixed nuts']
            : ['Eggs or yogurt', 'Oats with fruit', 'Chapati with sabzi', 'Poha or upma', 'Idli sambar', 'Besan chilla', 'Curd rice']));

    const lunchFoods = (dietType === 'vegetarian'
      ? (goal === 'lose'
          ? ['Tofu or paneer tikka (100g)', 'Brown rice (1 small katori)', 'Mixed salad', 'Moong dal', '2 chapati with lauki sabzi', 'Palak sabzi', 'Cucumber raita']
          : goal === 'gain'
            ? ['Paneer butter masala (150g)', 'Rice (1.5 katori)', '3 chapati', 'Dal makhani', 'Roti with ghee', 'Aloo sabzi', 'Mixed vegetable salad']
            : ['Paneer or tofu curry', 'Rice or 2 chapati', 'Dal tadka', 'Mixed vegetable sabzi', 'Rajma chawal', 'Chole with rice', 'Palak paneer'])
      : dietType === 'nonveg'
        ? (goal === 'lose'
            ? ['Grilled chicken breast (150g) or fish', 'Brown rice (1 katori)', 'Green salad', 'Dal soup', '2 chapati with chicken curry', 'Egg curry', 'Steamed vegetables']
            : goal === 'gain'
              ? ['Chicken curry (200g) OR mutton', 'Rice (1.5 katori)', '3 chapati with ghee', 'Dal makhani', 'Egg bhurji', 'Fish curry with rice', 'Keema with chapati']
              : ['Fish or chicken curry (150g)', 'Rice or 2 chapati', 'Dal', 'Mixed vegetable sabzi', 'Egg curry with rice', 'Chicken biryani (small)', 'Mutton soup with bread'])
        : (goal === 'lose'
            ? ['Grilled chicken or tofu (150g)', 'Brown rice (1 katori)', 'Salad', 'Dal', 'Chapati with sabzi', 'Egg white omelette', 'Steamed veggies']
            : goal === 'gain'
              ? ['Chicken or paneer curry (200g)', 'Rice (1.5 katori)', '3 chapati', 'Dal makhani', 'Egg curry', 'Keema with rice', 'Fish curry with chapati']
              : ['Fish or paneer curry', 'Rice or 2 chapati', 'Dal', 'Mixed sabzi', 'Egg curry', 'Chicken biryani (small)', 'Rajma chawal']));

    const snackFoods = (dietType === 'vegetarian'
      ? (goal === 'lose'
          ? ['Handful of almonds (8-10)', 'Apple or guava', 'Buttermilk (chaas)', 'Cucumber chaat', 'Green tea with marie biscuits', 'Sprout salad', 'Coconut water']
          : goal === 'gain'
            ? ['Banana peanut butter shake', 'Trail mix (nuts + raisins)', 'Whole milk with Bournvita', 'Cheese sandwich (2 slices)', 'Chana chaat', 'Sattu drink', 'Dry fruits (mixed)']
            : ['Mixed fruit bowl', 'Yogurt with honey', 'Handful of nuts', 'Sprout chaat', 'Makhana (fox nuts)', 'Peanuts', 'Coconut water'])
      : dietType === 'nonveg'
        ? (goal === 'lose'
            ? ['Handful of almonds', 'Apple', 'Protein shake', 'Boiled egg whites (3)', 'Chicken salad', 'Tuna sandwich', 'Buttermilk']
            : goal === 'gain'
              ? ['Banana milkshake', 'Trail mix', 'Whole milk with honey', 'Cheese omelette', 'Boiled eggs (3)', 'Chicken wrap', 'Dry fruits with dates']
              : ['Fruit bowl', 'Yogurt with nuts', 'Boiled egg (1)', 'Chicken soup', 'Makhana', 'Peanuts', 'Coconut water'])
        : (goal === 'lose'
            ? ['Almonds (8-10)', 'Apple or orange', 'Protein shake OR chaas', 'Cucumber', 'Boiled egg whites', 'Sprout salad', 'Green tea']
            : goal === 'gain'
              ? ['Banana peanut butter shake', 'Trail mix (nuts + raisins)', 'Whole milk', 'Cheese sandwich', 'Boiled eggs', 'Sattu drink', 'Dry fruits with dates']
              : ['Mixed fruit', 'Yogurt with honey', 'Handful of nuts', 'Makhana', 'Peanuts', 'Coconut water', 'Boiled egg (1)']));

    const dinnerFoods = (dietType === 'vegetarian'
      ? (goal === 'lose'
          ? ['Paneer tikka (100g) with salad', 'Steamed vegetables', 'Vegetable soup', 'Moong dal chilla (2 pcs)', 'Lauki sabzi with 1 chapati', 'Palak soup', 'Tofu bhurji']
          : goal === 'gain'
            ? ['Paneer bhurji (150g)', 'Aloo paratha (2) with curd', 'Dal khichdi with ghee', 'Vegetable pulao with raita', 'Stuffed paratha with butter', 'Mushroom curry with roti', 'Mix veg with rice']
            : ['Paneer or tofu curry (100g)', '2 chapati with sabzi', 'Dal rice', 'Khichdi with curd', 'Vegetable soup with bread', 'Palak sabzi with roti', 'Rajma with rice'])
      : dietType === 'nonveg'
        ? (goal === 'lose'
            ? ['Grilled fish or chicken (150g)', 'Steamed broccoli and salad', 'Chicken soup', '2 chapati with egg curry', 'Tuna salad', 'Egg white omelette', 'Vegetable stew']
            : goal === 'gain'
              ? ['Butter chicken OR mutton curry (200g)', 'Naan (2 pcs)', 'Jeera rice', 'Egg curry with paratha', 'Chicken biryani', 'Fish curry with rice', 'Keema paratha']
              : ['Grilled chicken or fish (150g)', '2 chapati with sabzi', 'Dal rice', 'Egg bhurji with roti', 'Chicken soup with bread', 'Fish curry', 'Khichdi with chicken'])
        : (goal === 'lose'
            ? ['Grilled chicken or paneer (150g)', 'Steamed vegetables', 'Soup', '2 chapati with egg curry', 'Tofu salad', 'Egg white omelette', 'Vegetable stew']
            : goal === 'gain'
              ? ['Chicken curry OR paneer bhurji (200g)', '2 paratha with butter', 'Jeera rice', 'Egg curry', 'Chicken biryani', 'Fish curry with rice', 'Keema with roti']
              : ['Grilled chicken or paneer (150g)', '2 chapati with sabzi', 'Dal rice', 'Egg bhurji', 'Chicken soup with bread', 'Fish curry', 'Khichdi']));

    const avoidFoods = goal === 'lose'
      ? ['Fried foods (samosa, pakora, chips)', 'Sugary drinks (Coca-Cola, Fanta, packaged juice)', 'Junk food (burger, pizza, noodles)', 'Excess sweets (mithai, chocolates)', 'White rice (zyada quantity)', 'Refined flour (maida) products', 'Late night eating', 'Alcohol']
      : goal === 'gain'
        ? ['Too much processed food', 'Empty calories (chips, cold drinks)', 'Skipping meals', 'Late-night junk food', 'Only eating 2 meals', 'Excess sugar (mithai, toffees)', 'Smoking and alcohol', 'Fast food regularly']
        : ['Ultra-processed snacks (biscuits, namkeen)', 'Excess soft drinks', 'High sugar desserts (mithai, cake)', 'Deep fried food daily', 'Excess alcohol', 'Late night heavy meals', 'Packaged juice', 'Too much chai with sugar'];

    const budgetTips = budget === 'budget'
      ? ['Ande (eggs) sabse sasta aur best protein source', 'Moong dal aur chana - budget friendly protein', 'Daliya (broken wheat) - cheap and healthy carb', 'Seasonal sabziyaan kharido - sasti aur fresh', 'Sattu, chana, rajma - high protein low cost', 'Doodh, dahi, paneer ghar pe banao', 'Local kiranawala se dry fruits kam rate pe milte hain', 'Dabba packing ghar ka khana le jao']
      : budget === 'premium'
        ? ['Whey protein supplement le sakte ho', 'Imported fruits (avocado, berries) try karo', 'Quinoa, chia seeds, flax seeds use karo', 'Greek yogurt aur almond milk options', 'Fresh fish aur lean chicken breast', 'Olive oil aur virgin coconut oil', 'Organic vegetables aur free-range eggs', 'Protein bars aur energy snacks']
        : ['Ande (eggs), paneer, dahi regular rakho', 'Moong dal, chana, rajma, soybean use karo', 'Brown rice aur daliya mix karo', 'Seasonal fruits aur sabziyaan khao', 'Dry fruits roz thode lo (badam, akhrot)', 'Peanut butter homemade banao', 'Sattu aur chana atta use karo', 'Ghar ka khana best hai - oil control rakho'];

    const budgetLabel = budget === 'budget' ? 'budget-friendly' : budget === 'premium' ? 'premium' : 'balanced';

    // Diet plan hero image based on diet type and goal
    // These are verified Unsplash photo IDs that show the actual food
    const dietPlanImages = {
      'vegetarian-lose':   'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=80', // fresh green salad bowl
      'vegetarian-gain':   'https://images.unsplash.com/photo-1567337710282-00832b415979?w=900&q=80', // indian veg thali
      'vegetarian-maintain':'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&q=80', // balanced healthy bowl
      'nonveg-lose':       'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=900&q=80', // grilled chicken breast
      'nonveg-gain':       'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=900&q=80', // chicken curry / protein meal
      'nonveg-maintain':   'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=900&q=80', // fish / balanced non-veg
      'general-lose':      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&q=80', // balanced bowl
      'general-gain':      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&q=80', // mixed protein meal
      'general-maintain':  'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=900&q=80', // mixed fruit / balanced
    };
    const heroImage = dietPlanImages[`${dietType}-${goal}`] || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&q=80';
    const dietNameLabels = {
      'vegetarian-lose':   'Vegetarian Weight Loss Plan',
      'vegetarian-gain':   'Vegetarian Muscle Gain Plan',
      'vegetarian-maintain':'Vegetarian Maintenance Plan',
      'nonveg-lose':       'Non-Veg Weight Loss Plan',
      'nonveg-gain':       'Non-Veg Muscle Gain Plan',
      'nonveg-maintain':   'Non-Veg Maintenance Plan',
      'general-lose':      'Balanced Weight Loss Plan',
      'general-gain':      'Balanced Muscle Gain Plan',
      'general-maintain':  'Balanced Maintenance Plan',
    };
    const planName = dietNameLabels[`${dietType}-${goal}`] || 'Your Personalized Diet Plan';

    dietResult.innerHTML = `
      <h3>📋 Your Diet Plan is Here</h3>
      <div class="plan-hero">
        <img class="plan-hero-image" src="${heroImage}" alt="${planName}" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&q=80'" />
        <div class="plan-hero-badge">${planName}</div>
      </div>
      <p class="result-subtitle">Personalized plan - neeche apne meal options dekho. Kisi bhi food pe click karo - uski photo aur details popup mein dikhegi.</p>
      <div class="result-meta">
        <strong>${genderLabel}</strong> • Age <strong>${age}</strong> • Weight <strong>${weight} kg</strong><br>
        Goal: <strong>${goalLabel}</strong> • ${activityLabel} • ${budgetLabel}
      </div>
      <div class="macros">
        <div class="macro-box">
          <strong>${dailyCalories}</strong>
          <span>kcal/day</span>
        </div>
        <div class="macro-box">
          <strong>${protein}g</strong>
          <span>protein</span>
        </div>
        <div class="macro-box">
          <strong>${carbs}g</strong>
          <span>carbs</span>
        </div>
      </div>
      <div class="macros" style="margin-bottom: 1rem;">
        <div class="macro-box" style="grid-column: span 1;">
          <strong>${fats}g</strong>
          <span>fats</span>
        </div>
        <div class="macro-box" style="grid-column: span 2; background: rgba(14, 165, 168, 0.12);">
          <strong style="color: var(--accent-3);">${Math.round(weight * 30)}ml</strong>
          <span>paani daily</span>
        </div>
      </div>

      <div class="meal-section">
        <strong>🌅 Breakfast (subah 7-9 baje)</strong>
        <div>${renderFoodChips(breakfastFoods)}</div>
      </div>

      <div class="meal-section">
        <strong>🍱 Lunch (dopahar 12-2 baje)</strong>
        <div>${renderFoodChips(lunchFoods)}</div>
      </div>

      <div class="meal-section">
        <strong>🍎 Snack (shaam 4-6 baje)</strong>
        <div>${renderFoodChips(snackFoods)}</div>
      </div>

      <div class="meal-section">
        <strong>🍽️ Dinner (raat 7-9 baje)</strong>
        <div>${renderFoodChips(dinnerFoods)}</div>
      </div>

      <div class="tips-box">
        <strong style="display:block; color: var(--accent-3); margin-bottom: 0.3rem; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">💡 ${budgetLabel} budget tips</strong>
        <ul style="margin: 0; padding-left: 1.1rem;">
          ${budgetTips.map(tip => `<li>${tip}</li>`).join('')}
        </ul>
      </div>

      <div class="avoid-box">
        <strong>🚫 Yeh avoid karo</strong>
        <ul>
          ${avoidFoods.map(food => `<li>${food}</li>`).join('')}
        </ul>
      </div>

      <p style="margin-top: 1rem; font-size: 0.82rem; color: var(--muted); text-align: center;"><em>Har food chip pe click karo - image aur nutrition info popup mein milegi. 💪</em></p>
    `;

    // Attach click handlers to all food chips
    attachFoodChipHandlers(dietResult);
  });
}

// (Duplicate legacy dark-mode code removed — theme is handled by applyTheme above
// using the `data-theme` attribute, which is the only system styles.css supports.)

const bookingModal = document.querySelector('#booking-modal');
if (bookingModal) {
  const bookingModalClose = document.querySelector('#booking-modal-close');
  const bookingPlanLabel = document.querySelector('#booking-plan-label');
  const bookingPlanInput = document.querySelector('#booking-plan');
  const bookingForm = document.querySelector('#booking-form');
  const bookingFormMsg = document.querySelector('#booking-form-msg');
  const bookingSubmitBtn = bookingForm ? bookingForm.querySelector('button[type="submit"]') : null;

  window.openBookingModal = function (planName) {
    bookingPlanLabel.textContent = `${planName} plan`;
    bookingPlanInput.value = planName;
    bookingFormMsg.textContent = '';
    bookingFormMsg.className = 'booking-form-msg';
    bookingModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  function closeBookingModal() {
    bookingModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  bookingModalClose.addEventListener('click', closeBookingModal);
  bookingModal.addEventListener('click', (e) => {
    if (e.target === bookingModal) closeBookingModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bookingModal.classList.contains('open')) closeBookingModal();
  });

  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    bookingFormMsg.textContent = '';
    bookingFormMsg.className = 'booking-form-msg';

    const name = document.querySelector('#booking-name').value.trim();
    const phone = document.querySelector('#booking-phone').value.trim();
    const email = document.querySelector('#booking-email').value.trim();
    const preferredDate = document.querySelector('#booking-date').value;
    const message = document.querySelector('#booking-message').value.trim();
    const plan = bookingPlanInput.value;

    if (!name || !phone) {
      bookingFormMsg.textContent = 'Please enter your name and phone number.';
      bookingFormMsg.className = 'booking-form-msg error';
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      bookingFormMsg.textContent = 'Please enter a valid phone number.';
      bookingFormMsg.className = 'booking-form-msg error';
      return;
    }

    if (bookingSubmitBtn) bookingSubmitBtn.disabled = true;

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, plan, preferredDate, message })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        bookingFormMsg.textContent = data.error || 'Something went wrong. Please try again.';
        bookingFormMsg.className = 'booking-form-msg error';
        if (bookingSubmitBtn) bookingSubmitBtn.disabled = false;
        return;
      }
      bookingFormMsg.textContent = 'Request submitted! Our team will contact you shortly.';
      bookingFormMsg.className = 'booking-form-msg success';
      bookingForm.reset();
      if (bookingSubmitBtn) bookingSubmitBtn.disabled = false;
      setTimeout(closeBookingModal, 2000);
    } catch (err) {
      bookingFormMsg.textContent = 'Network error. Make sure the server is running.';
      bookingFormMsg.className = 'booking-form-msg error';
      if (bookingSubmitBtn) bookingSubmitBtn.disabled = false;
    }
  });
}

function escapeHtmlText(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

const pricingPlansContainer = document.querySelector('#pricing-plans-container');
if (pricingPlansContainer) {
  fetch('/api/pricing')
    .then((res) => res.json())
    .then((data) => {
      const plans = Array.isArray(data.plans) ? data.plans : [];
      if (!plans.length) {
        pricingPlansContainer.innerHTML = '<p>Pricing information coming soon.</p>';
        return;
      }
      pricingPlansContainer.innerHTML = plans.map((plan) => {
        const rows = Array.isArray(plan.rows) ? plan.rows : [];
        const rowsHtml = rows.map((row) => `
          <li><span>${escapeHtmlText(row.label)}</span><strong>${escapeHtmlText(row.price)}</strong></li>
        `).join('');
        const category = escapeHtmlText(plan.category);
        const planForBooking = String(plan.category || '').replace(/'/g, "\\'");
        return `
          <article class="price-table-card">
            <div class="price-table-media">
              <img src="${escapeHtmlText(plan.image)}" alt="${category} training plan" />
              <div class="price-table-badge">
                <strong>R</strong>
                <span>FITNESS</span>
              </div>
            </div>
            <div class="price-table-category">${category}</div>
            <ul class="price-table-rows">${rowsHtml}</ul>
            <button type="button" class="btn btn-primary price-table-cta" onclick="openBookingModal('${planForBooking}')">Book a Visit</button>
          </article>
        `;
      }).join('');
    })
    .catch((err) => {
      console.error('Failed to load pricing:', err);
      pricingPlansContainer.innerHTML = '<p>Unable to load pricing right now. Please try again later.</p>';
    });
}

const bmiForm = document.querySelector('#bmi-form');
if (bmiForm) {
  const bmiUnits = document.querySelector('#bmi-units');
  const bmiGender = document.querySelector('#bmi-gender');
  const bmiAge = document.querySelector('#bmi-age');
  const bmiHeightMetricWrap = document.querySelector('#bmi-height-metric');
  const bmiHeightImperialWrap = document.querySelector('#bmi-height-imperial');
  const bmiHeightCm = document.querySelector('#bmi-height-cm');
  const bmiHeightFt = document.querySelector('#bmi-height-ft');
  const bmiHeightIn = document.querySelector('#bmi-height-in');
  const bmiWeightMetricLabel = document.querySelector('#bmi-weight-metric-label');
  const bmiWeightImperialLabel = document.querySelector('#bmi-weight-imperial-label');
  const bmiWeightKg = document.querySelector('#bmi-weight-kg');
  const bmiWeightLbs = document.querySelector('#bmi-weight-lbs');
  const bmiFormMsg = document.querySelector('#bmi-form-msg');
  const bmiResult = document.querySelector('#bmi-result');

  function toggleBmiUnitFields() {
    const isImperial = bmiUnits.value === 'imperial';
    bmiHeightMetricWrap.style.display = isImperial ? 'none' : '';
    bmiHeightImperialWrap.style.display = isImperial ? '' : 'none';
    bmiWeightMetricLabel.style.display = isImperial ? 'none' : '';
    bmiWeightImperialLabel.style.display = isImperial ? '' : 'none';
  }
  bmiUnits.addEventListener('change', toggleBmiUnitFields);
  toggleBmiUnitFields();

  function bmiCategoryInfo(bmi) {
    if (bmi < 18.5) return { key: 'underweight', label: 'Underweight' };
    if (bmi < 25) return { key: 'normal', label: 'Normal weight' };
    if (bmi < 30) return { key: 'overweight', label: 'Overweight' };
    return { key: 'obese', label: 'Obese' };
  }

  bmiForm.addEventListener('submit', (e) => {
    e.preventDefault();
    bmiFormMsg.textContent = '';
    bmiFormMsg.className = 'booking-form-msg';

    const isImperial = bmiUnits.value === 'imperial';
    const gender = bmiGender.value;
    const age = parseFloat(bmiAge.value);

    let heightM, weightKg, heightDisplay, weightDisplay, healthyMinDisplay, healthyMaxDisplay;

    if (isImperial) {
      const ft = parseFloat(bmiHeightFt.value);
      const inch = parseFloat(bmiHeightIn.value) || 0;
      const lbs = parseFloat(bmiWeightLbs.value);
      if (!ft || ft <= 0 || !lbs || lbs <= 0) {
        bmiFormMsg.textContent = 'Please enter a valid height (feet) and weight (lbs).';
        bmiFormMsg.className = 'booking-form-msg error';
        return;
      }
      const totalInches = ft * 12 + inch;
      heightM = totalInches * 0.0254;
      weightKg = lbs * 0.453592;
      heightDisplay = `${ft} ft ${inch} in`;
      weightDisplay = `${lbs} lbs`;
      const heightInSq = totalInches * totalInches;
      healthyMinDisplay = `${(18.5 * heightInSq / 703).toFixed(1)} lbs`;
      healthyMaxDisplay = `${(24.9 * heightInSq / 703).toFixed(1)} lbs`;
    } else {
      const cm = parseFloat(bmiHeightCm.value);
      const kg = parseFloat(bmiWeightKg.value);
      if (!cm || cm <= 0 || !kg || kg <= 0) {
        bmiFormMsg.textContent = 'Please enter a valid height (cm) and weight (kg).';
        bmiFormMsg.className = 'booking-form-msg error';
        return;
      }
      heightM = cm / 100;
      weightKg = kg;
      heightDisplay = `${cm} cm`;
      weightDisplay = `${kg} kg`;
      healthyMinDisplay = `${(18.5 * heightM * heightM).toFixed(1)} kg`;
      healthyMaxDisplay = `${(24.9 * heightM * heightM).toFixed(1)} kg`;
    }

    if (!age || age <= 0) {
      bmiFormMsg.textContent = 'Please enter a valid age.';
      bmiFormMsg.className = 'booking-form-msg error';
      return;
    }

    const bmi = weightKg / (heightM * heightM);
    const bmiRounded = bmi.toFixed(1);
    const category = bmiCategoryInfo(bmi);
    const clamped = Math.min(Math.max(bmi, 15), 40);
    const markerPercent = ((clamped - 15) / 25) * 100;
    const genderLabel = gender === 'male' ? 'Male' : 'Female';

    bmiResult.innerHTML = `
      <h3>📊 Your BMI Result</h3>
      <p class="result-subtitle">${genderLabel} • Age ${age} • Height ${heightDisplay} • Weight ${weightDisplay}</p>
      <div class="bmi-score-row">
        <span class="bmi-score-value">${bmiRounded}</span>
        <span class="bmi-category-badge ${category.key}">${category.label}</span>
      </div>
      <div class="bmi-gauge">
        <div class="bmi-gauge-segment underweight" style="width:14%;"></div>
        <div class="bmi-gauge-segment normal" style="width:26%;"></div>
        <div class="bmi-gauge-segment overweight" style="width:20%;"></div>
        <div class="bmi-gauge-segment obese" style="width:40%;"></div>
        <div class="bmi-gauge-marker" style="left:${markerPercent}%;"></div>
      </div>
      <div class="bmi-gauge-labels">
        <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40+</span>
      </div>
      <div class="bmi-healthy-range">
        <strong>Healthy weight range for your height:</strong><br>
        ${healthyMinDisplay} – ${healthyMaxDisplay}
      </div>
      <div class="tips-box">
        <strong style="display:block; color: var(--accent-3); margin-bottom: 0.3rem; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">💡 What this means</strong>
        ${category.key === 'normal'
          ? 'Great! Your BMI is in the healthy range. Keep up a balanced diet and regular training.'
          : category.key === 'underweight'
            ? 'Your BMI suggests you are underweight. Talk to our trainers about a structured weight-gain plan.'
            : category.key === 'overweight'
              ? 'Your BMI suggests you are overweight. A mix of strength training, cardio and diet control can help.'
              : 'Your BMI falls in the obese range. Consider a supervised fitness and nutrition program — our trainers can help you build one.'}
      </div>
    `;
    bmiResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}