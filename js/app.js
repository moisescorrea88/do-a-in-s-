(() => {
  "use strict";

  const STORAGE_KEY = "costeo-platillos:dishes";

  /** @typedef {{id:string,name:string,ingredients:Array<{id:string,name:string,grams:number,costPerKg:number}>,updatedAt:number}} Dish */

  const currencyFormatter = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  });

  const formatCurrency = (value) => currencyFormatter.format(Number.isFinite(value) ? value : 0);

  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

  // ---------- Persistencia ----------

  /** @returns {Dish[]} */
  function loadDishes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /** @param {Dish[]} dishes */
  function saveDishes(dishes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dishes));
  }

  let dishes = loadDishes();
  /** @type {Dish|null} */
  let currentDish = null;

  // ---------- Cálculo ----------

  const ingredientSubtotal = (ing) => (Number(ing.grams) || 0) / 1000 * (Number(ing.costPerKg) || 0);

  const dishTotal = (dish) => dish.ingredients.reduce((sum, ing) => sum + ingredientSubtotal(ing), 0);

  // ---------- Elementos DOM ----------

  const viewList = document.getElementById("view-list");
  const viewEditor = document.getElementById("view-editor");
  const dishListEl = document.getElementById("dish-list");
  const emptyStateEl = document.getElementById("empty-state");
  const btnNewDish = document.getElementById("btn-new-dish");
  const btnBack = document.getElementById("btn-back");
  const btnDeleteDish = document.getElementById("btn-delete-dish");
  const dishNameInput = document.getElementById("dish-name");
  const ingredientListEl = document.getElementById("ingredient-list");
  const btnAddIngredient = document.getElementById("btn-add-ingredient");
  const totalAmountEl = document.getElementById("total-amount");
  const ingredientRowTemplate = document.getElementById("ingredient-row-template");

  // ---------- Navegación ----------

  function showList() {
    currentDish = null;
    viewEditor.classList.add("hidden");
    viewList.classList.remove("hidden");
    renderDishList();
  }

  function showEditor(dish) {
    currentDish = dish;
    viewList.classList.add("hidden");
    viewEditor.classList.remove("hidden");
    btnDeleteDish.classList.toggle("hidden", !dishes.some((d) => d.id === dish.id));
    dishNameInput.value = dish.name;
    renderIngredientList();
  }

  // ---------- Render: lista de platillos ----------

  function renderDishList() {
    dishListEl.innerHTML = "";
    const sorted = [...dishes].sort((a, b) => b.updatedAt - a.updatedAt);
    emptyStateEl.classList.toggle("hidden", sorted.length > 0);

    for (const dish of sorted) {
      const li = document.createElement("li");
      li.className = "dish-card";

      const info = document.createElement("div");
      info.className = "dish-card-info";

      const name = document.createElement("div");
      name.className = "dish-card-name";
      name.textContent = dish.name || "Platillo sin nombre";

      const meta = document.createElement("div");
      meta.className = "dish-card-meta";
      const count = dish.ingredients.length;
      meta.textContent = `${count} ${count === 1 ? "ingrediente" : "ingredientes"}`;

      info.append(name, meta);

      const total = document.createElement("div");
      total.className = "dish-card-total";
      total.textContent = formatCurrency(dishTotal(dish));

      li.append(info, total);
      li.addEventListener("click", () => showEditor(dish));
      dishListEl.appendChild(li);
    }
  }

  // ---------- Render: editor de ingredientes ----------

  function renderIngredientList() {
    ingredientListEl.innerHTML = "";
    for (const ingredient of currentDish.ingredients) {
      ingredientListEl.appendChild(buildIngredientRow(ingredient));
    }
    updateTotal();
  }

  function buildIngredientRow(ingredient) {
    const node = ingredientRowTemplate.content.firstElementChild.cloneNode(true);

    const nameInput = node.querySelector(".ing-name");
    const gramsInput = node.querySelector(".ing-grams");
    const costInput = node.querySelector(".ing-cost");
    const subtotalEl = node.querySelector(".ing-subtotal-amount");
    const removeBtn = node.querySelector(".ing-remove");

    nameInput.value = ingredient.name;
    gramsInput.value = ingredient.grams || "";
    costInput.value = ingredient.costPerKg || "";
    subtotalEl.textContent = formatCurrency(ingredientSubtotal(ingredient));

    nameInput.addEventListener("input", () => {
      ingredient.name = nameInput.value;
      persistCurrentDish();
    });

    gramsInput.addEventListener("input", () => {
      ingredient.grams = parseFloat(gramsInput.value) || 0;
      subtotalEl.textContent = formatCurrency(ingredientSubtotal(ingredient));
      updateTotal();
      persistCurrentDish();
    });

    costInput.addEventListener("input", () => {
      ingredient.costPerKg = parseFloat(costInput.value) || 0;
      subtotalEl.textContent = formatCurrency(ingredientSubtotal(ingredient));
      updateTotal();
      persistCurrentDish();
    });

    removeBtn.addEventListener("click", () => {
      currentDish.ingredients = currentDish.ingredients.filter((i) => i.id !== ingredient.id);
      node.remove();
      updateTotal();
      persistCurrentDish();
    });

    return node;
  }

  function updateTotal() {
    totalAmountEl.textContent = formatCurrency(dishTotal(currentDish));
  }

  // ---------- Persistencia del platillo actual ----------

  function persistCurrentDish() {
    if (!currentDish) return;
    currentDish.updatedAt = Date.now();
    const index = dishes.findIndex((d) => d.id === currentDish.id);
    if (index === -1) {
      dishes.push(currentDish);
    } else {
      dishes[index] = currentDish;
    }
    saveDishes(dishes);
    btnDeleteDish.classList.remove("hidden");
  }

  // ---------- Eventos ----------

  btnNewDish.addEventListener("click", () => {
    const dish = { id: uid(), name: "", ingredients: [], updatedAt: Date.now() };
    showEditor(dish);
    dishNameInput.focus();
  });

  btnBack.addEventListener("click", () => {
    // Descarta platillos vacíos sin nombre ni ingredientes.
    if (currentDish && !currentDish.name.trim() && currentDish.ingredients.length === 0) {
      dishes = dishes.filter((d) => d.id !== currentDish.id);
      saveDishes(dishes);
    }
    showList();
  });

  btnDeleteDish.addEventListener("click", () => {
    if (!currentDish) return;
    if (!confirm(`¿Eliminar "${currentDish.name || "este platillo"}"?`)) return;
    dishes = dishes.filter((d) => d.id !== currentDish.id);
    saveDishes(dishes);
    showList();
  });

  dishNameInput.addEventListener("input", () => {
    if (!currentDish) return;
    currentDish.name = dishNameInput.value;
    persistCurrentDish();
  });

  btnAddIngredient.addEventListener("click", () => {
    const ingredient = { id: uid(), name: "", grams: 0, costPerKg: 0 };
    currentDish.ingredients.push(ingredient);
    const row = buildIngredientRow(ingredient);
    ingredientListEl.appendChild(row);
    row.querySelector(".ing-name").focus();
    persistCurrentDish();
  });

  // ---------- Inicio ----------

  showList();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch(() => {});
    });
  }
})();
