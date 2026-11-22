
/* DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");

/* Product data and selected products */
let allProducts = [];

const STORAGE_KEY = "lorealSelectedProducts";

let selectedProducts = JSON.parse(
  localStorage.getItem(STORAGE_KEY) || "[]"
);

/* Find or create the selected products list */
const generateButton = Array.from(
  document.querySelectorAll("button")
).find(button =>
  button.textContent.includes("Generate Routine")
);

const selectedList = document.createElement("div");
selectedList.id = "selectedProductsList";

if (generateButton) {
  generateButton.before(selectedList);
}

/* Create Clear All button */
const clearButton = document.createElement("button");

clearButton.setAttribute("data-i18n", "clearAllSelections");
clearButton.textContent = "Clear All Selections";
clearButton.type = "button";
clearButton.style.marginTop = "10px";
clearButton.style.padding = "8px";
clearButton.style.cursor = "pointer";

selectedList.after(clearButton);

/* Unique product identifier */
function productId(product) {
  return `${product.brand}::${product.name}`;
}

/* Save selections */
function saveSelections() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(selectedProducts)
  );
}

/* Check whether a product is selected */
function isSelected(product) {
  return selectedProducts.some(
    item => productId(item) === productId(product)
  );
}

/* Display selected products */
function renderSelectedProducts() {
  selectedList.innerHTML = "";

  if (selectedProducts.length === 0) {
    selectedList.textContent = "No products selected yet.";
    clearButton.hidden = true;
    return;
  }

  clearButton.hidden = false;

  selectedProducts.forEach(product => {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.alignItems = "center";
    row.style.gap = "10px";
    row.style.margin = "10px 0";

    const name = document.createElement("span");
    name.textContent = product.name;

    const removeButton = document.createElement("button");
    removeButton.setAttribute("data-i18n", "remove");
removeButton.textContent =
  translations[document.documentElement.lang]?.remove || "Remove";
    removeButton.type = "button";

    removeButton.addEventListener("click", () => {
      toggleProduct(product);
    });

    row.append(name, removeButton);
    selectedList.appendChild(row);
  });
}

/* Select or deselect product */
function toggleProduct(product) {
  if (isSelected(product)) {
    selectedProducts = selectedProducts.filter(
      item => productId(item) !== productId(product)
    );
  } else {
    selectedProducts.push(product);
  }

  saveSelections();
  renderSelectedProducts();
  displayCurrentCategory();
}

/* Load products from JSON */
async function loadProducts() {
  const response = await fetch("products.json");

  if (!response.ok) {
    throw new Error("Unable to load products.json");
  }

  const data = await response.json();
  return data.products;
}

/* Display product cards */
function displayProducts(products) {
  productsContainer.innerHTML = "";

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.name;

    const info = document.createElement("div");
    info.className = "product-info";

    const title = document.createElement("h3");
    title.textContent = product.name;

    const brand = document.createElement("p");
    brand.textContent = product.brand;

    info.append(title, brand);
    const productHeader = document.createElement("div");
productHeader.className = "product-header";
productHeader.append(image, info);
card.appendChild(productHeader);


    /* Create View Details button */
    const detailsButton = document.createElement("button");
    detailsButton.textContent = "View Details";
    detailsButton.type = "button";
    detailsButton.className = "view-details-btn";

    /* Create hidden product description */
    const details = document.createElement("div");
    details.className = "product-details";
    details.hidden = true;

    const description = document.createElement("p");
    description.textContent =
      product.description || "No description available.";

    details.appendChild(description);

    /* Show or hide details without selecting product */
    detailsButton.addEventListener("click", event => {
      event.stopPropagation();

      details.hidden = !details.hidden;

      detailsButton.textContent = details.hidden
        ? "View Details"
        : "Hide Details";

      detailsButton.setAttribute(
        "aria-expanded",
        String(!details.hidden)
      );
    });

    detailsButton.setAttribute("aria-expanded", "false");

    /* Prevent keyboard events from selecting the product */
    detailsButton.addEventListener("keydown", event => {
      event.stopPropagation();
    });

    card.append(detailsButton, details);


    if (isSelected(product)) {
      card.style.border = "3px solid #ff003b";
      card.style.backgroundColor = "#fff0f3";
      card.setAttribute("aria-pressed", "true");
    } else {
      card.setAttribute("aria-pressed", "false");
    }

    card.addEventListener("click", () => {
      toggleProduct(product);
    });

    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleProduct(product);
      }
    });

    productsContainer.appendChild(card);
  });
}

/* Show products for current category */
function displayCurrentCategory() {
  const selectedCategory = categoryFilter.value;

  if (!selectedCategory) {
    productsContainer.innerHTML = `
      <div class="placeholder-message" data-i18n="selectCategoryMessage">
  Select a category to view products
</div>
    `;
  
  
translatePage(languageSelect.value);
  return;
  }

 
const searchInput = document.getElementById("productSearch");
const searchTerm = searchInput.value.toLowerCase().trim();

const filteredProducts = allProducts.filter(product => {
  const matchesCategory = product.category === selectedCategory;

  const searchableText = [
    product.name,
    product.brand,
    product.category,
    product.description
  ].filter(Boolean).join(" ").toLowerCase();

  const matchesSearch = searchableText.includes(searchTerm);

  return matchesCategory && matchesSearch;
});


  displayProducts(filteredProducts);
}

/* Category change */
categoryFilter.addEventListener(
  "change",
  displayCurrentCategory
);

/* Search products as the user types */
document.getElementById("productSearch").addEventListener(
  "input",
  displayCurrentCategory
);

/* Clear all selected products */
clearButton.addEventListener("click", () => {
  selectedProducts = [];
  saveSelections();
  renderSelectedProducts();
  displayCurrentCategory();
});

/* Initialize application */
async function initializeApp() {
  try {
    allProducts = await loadProducts();
    renderSelectedProducts();
    displayCurrentCategory();
  } catch (error) {
    console.error(error);
    productsContainer.textContent =
      "Unable to load products. Please refresh the page.";
  }
}

initializeApp();


const WORKER_URL =
  "https://loreal-beauty-advisor.londarskiydmitriy.workers.dev/";

const conversation = [
  {
    role: "system",
    content: "You are a helpful L'Oreal beauty advisor. Help users with L'Oreal products, skincare, haircare, makeup, and beauty routines. Keep answers concise. Do not invent product details." +

" IMPORTANT LANGUAGE RULE: Detect the language of the user's latest message. If the user writes in Arabic, respond in Arabic. If the user writes in English, respond in English. Always prioritize the language of the latest message. Keep official L'Oreal product names unchanged when appropriate."


  }
];

chatForm.addEventListener("submit", async event => {
  event.preventDefault();

  const input = chatForm.querySelector("input");
  const message = input.value.trim();

  if (!message) return;

  conversation.push({
    role: "user",
    content: message
  });

  input.value = "";
  chatWindow.textContent = "Thinking...";

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: conversation
      })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error?.message || "API request failed");
    }

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error("No AI response received");
    }

    conversation.push({
      role: "assistant",
      content: reply
    });

    
chatWindow.textContent = reply;
const isArabic = /[\u0600-\u06FF]/.test(reply);
chatWindow.dir = isArabic ? "rtl" : "ltr";


  } catch (error) {
    console.error(error);
    conversation.pop();
    chatWindow.textContent =
      "Sorry, something went wrong: " + error.message;
  }
});





/* Generate an AI routine from selected products */
if (generateButton) {
  generateButton.addEventListener("click", async () => {
    if (selectedProducts.length === 0) {
      chatWindow.textContent =
        "Please select at least one product first.";
      return;
    }

    const productData = selectedProducts.map(product => ({
  name: product.name,
  brand: product.brand,
  category: product.category,
  description: product.description
}));

const productDetails = JSON.stringify(productData, null, 2);

    
const prompt = `
You are a professional L'Oréal beauty and product advisor.

Create a practical, personalized beauty routine using
these customer-selected products:

${productDetails}

Follow these rules:

1. Use the selected products as the foundation of the routine.

2. Identify each product's purpose:
   shampoo, conditioner, cleanser, serum,
   moisturizer, sunscreen, or other category.

3. If two products serve the same purpose,
   explain that they are alternatives.
   Do not recommend using both unnecessarily.

4. Explain the correct order of application.

5. Separate morning, evening, and hair-washing
   routines when appropriate.

6. Ask about hair type, skin type, or concerns
   if more information is needed.

7. Do not invent product benefits or ingredients.

8. Recommend additional products only when
   necessary, and clearly identify them
   as optional suggestions.

9. Keep the routine concise and easy to understand.

10. Use plain text headings and numbered steps.
    Do not use Markdown symbols such as ** or ##.

11. Include a short explanation of why
    the selected products work together.

12. For sunscreen, explain that it belongs
    in the daytime skincare routine.

Return a friendly, professional routine
of approximately 150-200 words.
`;


    chatWindow.textContent =
      "Generating your personalized beauty routine...";

    generateButton.disabled = true;

    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            ...conversation,
            { role: "user", content: prompt }
          ]
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(
          data.error?.message || "API request failed"
        );
      }

      const reply =
        data.choices?.[0]?.message?.content;

      if (!reply) {
        throw new Error("No AI response received");
      }

      conversation.push(
        { role: "user", content: prompt },
        { role: "assistant", content: reply }
      );

      chatWindow.textContent = reply;

    } catch (error) {
      console.error(error);
      chatWindow.textContent =
        "Unable to generate routine: " + error.message;
    } finally {
      generateButton.disabled = false;
    }
  });
}

/* RTL Language Support */
const languageSelect = document.getElementById("languageSelect");

languageSelect.addEventListener("change", function () {
  const selectedLanguage = this.value;

  if (selectedLanguage === "ar") {
    document.documentElement.setAttribute("dir", "rtl");
    document.documentElement.setAttribute("lang", "ar");
  } else {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.setAttribute("lang", "en");
  }
  translatePage(selectedLanguage);
});

/* English and Arabic translations */

const translations = {
  en: {
    siteTitle: "Smart Routine & Product Advisor",
    languageLabel: "Language:",
    chooseCategory: "Choose a Category",
    searchPlaceholder: "Search products by name or keyword...",
    selectedProducts: "Selected Products",
    
generateRoutine: "Generate Routine",

buildRoutine: "Let's Build Your Routine",
clearAllSelections: "Clear All Selections",
selectCategoryMessage: "Select a category to view products",
remove: "Remove",
chatPlaceholder: "Ask me about products or routines...",

privacyPolicy: "Privacy Policy",
termsOfUse: "Terms of Use",
contact: "Contact",
copyright: "© 2025 L'Oréal. All rights reserved.",
  },
  ar: {
    siteTitle: "مستشار الروتين والمنتجات الذكي",
    languageLabel: "اللغة:",
    chooseCategory: "اختر فئة",
    searchPlaceholder: "ابحث عن المنتجات بالاسم أو الكلمة المفتاحية...",
    selectedProducts: "المنتجات المختارة",
    generateRoutine: "إنشاء روتين",

buildRoutine: "لننشئ روتينك",

selectCategoryMessage: "اختر فئة لعرض المنتجات",
clearAllSelections: "مسح جميع الاختيارات",
remove: "إزالة",
chatPlaceholder: "اسألني عن المنتجات أو روتين العناية...",

privacyPolicy: "سياسة الخصوصية",
termsOfUse: "شروط الاستخدام",
contact: "اتصل بنا",
copyright: "© 2025 لوريال. جميع الحقوق محفوظة.",
  }
};


function translatePage(language) {
  const dictionary = translations[language] || translations.en;

  document.querySelectorAll("[data-i18n]").forEach(element => {
    const key = element.getAttribute("data-i18n");

    if (dictionary[key]) {
      element.textContent = dictionary[key];
    }
  });

document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
  const key = element.getAttribute("data-i18n-placeholder");

  if (dictionary[key]) {
    element.placeholder = dictionary[key];
  }
});

}
