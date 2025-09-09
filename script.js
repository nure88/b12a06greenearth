(() => {
  // API base from assignment
  const API_BASE = "https://openapi.programming-hero.com/api";

  // DOM refs
  const categoriesEl = document.getElementById("categories");
  const productGrid = document.getElementById("product-grid");
  const spinner = document.getElementById("spinner");
  const cartList = document.getElementById("cart-list");
  const cartTotalEl = document.getElementById("cart-total");
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modal-content");
  const modalClose = document.getElementById("modal-close");
  const plantForm = document.getElementById("plant-form");
  const plantBtn = document.getElementById("plantBtn");
  const heroCta = document.getElementById("hero-cta");

  // state
  let categories = [];
  let currentCategoryId = null;
  let cart = [];

  // utils
  function showSpinner() {
    spinner.classList.remove("hide");
    spinner.innerHTML = `<div class="loader">Loading...</div>`;
  }
  function hideSpinner() {
    spinner.classList.add("hide");
    spinner.innerHTML = "";
  }

  function formatPrice(num) {
    // ensure numeric and two decimals
    const n = Number(num) || 0;
    return n.toFixed(2);
  }

  function saveCart() {
    localStorage.setItem("greenearth_cart_v1", JSON.stringify(cart));
  }

  function loadCart() {
    try {
      const raw = localStorage.getItem("greenearth_cart_v1");
      cart = raw ? JSON.parse(raw) : [];
    } catch {
      cart = [];
    }
  }

  // fetch helpers
  async function fetchJSON(url) {
    showSpinner();
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Network response not ok");
      const data = await res.json();
      hideSpinner();
      return data;
    } catch (err) {
      hideSpinner();
      console.error("Fetch error:", err);
      alert("Network error. Try again.");
      return null;
    }
  }

  // Render categories left sidebar
  function renderCategories() {
    categoriesEl.innerHTML = "";
    // add "All" button
    const allBtn = document.createElement("button");
    allBtn.className = `btn category-btn`;
    allBtn.textContent = "All";
    allBtn.dataset.id = "all";
    if (currentCategoryId === null || currentCategoryId === "all") {
      allBtn.classList.add("active");
    }
    categoriesEl.appendChild(allBtn);

    categories.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "btn category-btn";
      btn.textContent = cat.name || cat.category_name || `Category ${cat.id || ""}`;
      btn.dataset.id = String(cat.id ?? cat.category_id ?? cat._id ?? "");
      if (String(currentCategoryId) === String(btn.dataset.id)) {
        btn.classList.add("active");
      }
      categoriesEl.appendChild(btn);
    });
  }

  // Render products grid
  function renderProducts(plants = []) {
    productGrid.innerHTML = "";
    if (!Array.isArray(plants) || plants.length === 0) {
      productGrid.innerHTML = `<p class="no-products">No plants found for this category.</p>`;
      return;
    }

    const grid = document.createElement("div");
    grid.className = "flex flex-wrap items-center justify-center gap-6";

    plants.forEach((p) => {
      const card = document.createElement("article");
      card.className = "card bg-base-100 shadow-sm w-85 m-auto";

      // price fallback: if api doesn't give price, fake a price by id for demo
      const price = p.price ?? (p.price_usd ? Number(p.price_usd) : null) ?? (p.id ? (Number(p.id) * 5).toFixed(2) : "9.99");
      const priceStr = formatPrice(price);

      card.innerHTML = `
        <figure class=" rounded-lg overflow-hidden h-44 flex items-center justify-center bg-gray-50">
          <img class="w-full h-full object-cover" src="${p.image || p.thumbnail || "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"}" alt="${escapeHTML(p.name || p.plant_name || "Plant")}">
        </figure>
        <div class="card-body p-4">
          <h3 class="card-title plant-name" data-id="${p.id ?? p._id ?? p.plant_id ?? ""}" tabindex="0" role="button">${escapeHTML(p.name || p.plant_name || "Plant Name")}</h3>
          <p class="desc">${escapeHTML((p.description || p.short_description || (p.care && p.care.summary) || "").slice(0, 120))}${(p.description && p.description.length > 120) ? "..." : ""}</p>
          <div class="mt-3 flex items-center justify-between">
            <span class="badge bg-(--green-200) text-(--green-500)">${escapeHTML(p.category || p.category_name || "General")}</span>
            <strong>$${priceStr}</strong>
          </div>
          <div class="card-actions justify-end mt-3">
            <button class="btn add-to-cart w-full bg-(--green-500)" data-id="${p.id ?? p._id ?? p.plant_id ?? ""}" data-name="${escapeAttr(p.name || p.plant_name || "Plant")}" data-price="${priceStr}">Add to Cart</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    productGrid.appendChild(grid);
  }

  // escape helpers to avoid XSS when injecting strings
  function escapeHTML(str = "") {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function escapeAttr(str = "") {
    return String(str).replace(/"/g, "&quot;");
  }

  // Modal open with details
  function openModalWithPlant(plant) {
    // build details
    const price = plant.price ?? (plant.price_usd ? Number(plant.price_usd) : null) ?? (plant.id ? (Number(plant.id) * 5).toFixed(2) : "9.99");
    const html = `
      <div class="modal-card p-6 max-w-2xl m-auto bg-white rounded-lg">
        <div class="modal-top flex justify-between items-start">
          <h2 class="text-xl font-semibold">${escapeHTML(plant.name || plant.plant_name || "Plant")}</h2>
          <button id="modal-close-inner" class="text-lg" aria-label="close">✕</button>
        </div>
        <div class="modal-body mt-4 grid md:grid-cols-2 gap-4">
          <div>
            <img src="${plant.image || plant.thumbnail || "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"}" alt="${escapeHTML(plant.name || '')}" class="w-full h-64 object-cover rounded" />
          </div>
          <div>
            <p class="mb-2">${escapeHTML(plant.description || plant.long_description || plant.care?.description || "No description available.")}</p>
            <ul class="list-disc ml-5">
              <li><strong>Category:</strong> ${escapeHTML(plant.category || plant.category_name || "General")}</li>
              <li><strong>Price:</strong> $${formatPrice(price)}</li>
              ${plant.origin ? `<li><strong>Origin:</strong> ${escapeHTML(plant.origin)}</li>` : ""}
              ${plant.sun ? `<li><strong>Sun:</strong> ${escapeHTML(plant.sun)}</li>` : ""}
            </ul>
            <div class="mt-4">
              <button class="btn add-to-cart" data-id="${plant.id ?? plant._id ?? plant.plant_id ?? ""}" data-name="${escapeAttr(plant.name || plant.plant_name || "Plant")}" data-price="${formatPrice(price)}">Add to Cart</button>
            </div>
          </div>
        </div>
      </div>
    `;
    modalContent.innerHTML = html;
    modal.classList.remove("hide");
    modal.setAttribute("aria-hidden", "false");

    // attach close for inner button
    const innerClose = document.getElementById("modal-close-inner");
    if (innerClose) innerClose.addEventListener("click", closeModal);
  }

  function closeModal() {
    modal.classList.add("hide");
    modal.setAttribute("aria-hidden", "true");
    modalContent.innerHTML = "";
  }

  // Cart rendering
  function renderCart() {
    cartList.innerHTML = "";
    if (!cart || cart.length === 0) {
      cartList.innerHTML = `<p class="empty">Cart is empty</p>`;
      cartTotalEl.textContent = "0";
      return;
    }
    const ul = document.createElement("ul");
    ul.className = "space-y-3";

    let total = 0;
    cart.forEach((item, idx) => {
      const li = document.createElement("li");
      li.className = "cart-item flex items-center justify-between p-2 bg-white rounded shadow-sm";
      const nameSpan = document.createElement("span");
      nameSpan.textContent = `${item.name} x ${item.qty || 1}`;

      const right = document.createElement("div");
      right.className = "flex items-center gap-3";
      const priceSpan = document.createElement("span");
      priceSpan.textContent = `$${formatPrice(item.price * (item.qty || 1))}`;
      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-btn";
      removeBtn.textContent = "❌";
      removeBtn.dataset.index = String(idx);

      right.appendChild(priceSpan);
      right.appendChild(removeBtn);

      li.appendChild(nameSpan);
      li.appendChild(right);
      ul.appendChild(li);

      total += Number(item.price) * (item.qty || 1);
    });

    cartList.appendChild(ul);
    cartTotalEl.textContent = formatPrice(total);
  }
       
  // add to cart logic
  function addToCart({ id, name, price }) {
    if (!id) {
      // if no id, create a small random one (for demo)
      id = `local-${Date.now()}`;
    }
    const existing = cart.find((c) => String(c.id) === String(id));
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      cart.push({
        id,
        name,
        price: Number(price) || 0,
        qty: 1,
      });
    }
    saveCart();
    renderCart();
  }

  // remove from cart by index
  function removeFromCart(index) {
    const i = Number(index);
    if (isNaN(i) || i < 0 || i >= cart.length) return;
    cart.splice(i, 1);
    saveCart();
    renderCart();
  }

  // fetch categories from API
  async function loadCategories() {
    const resp = await fetchJSON(`${API_BASE}/categories`);
    if (!resp) return;
    // the API shape might be resp.data or resp.data.data etc. We try multiple paths.
    let data = resp.data ?? resp;
    if (Array.isArray(data)) {
      categories = data;
    } else if (Array.isArray(resp.data?.data)) {
      categories = resp.data.data;
    } else if (Array.isArray(resp.data?.categories)) {
      categories = resp.data.categories;
    } else {
      // fallback: try to extract array values
      const arr = Object.values(resp).find((v) => Array.isArray(v));
      categories = arr || [];
    }
    renderCategories();
  }

  // fetch plants for a category id
  async function loadPlantsByCategoryId(catId) {
    // show spinner in product area
    showSpinner();
    // Active state
    currentCategoryId = catId;
    setActiveCategoryButton(catId);

    if (!catId || catId === "all") {
      // get all plants
      const resp = await fetchJSON(`${API_BASE}/plants`);
      if (!resp) return renderProducts([]);
      // shape variations
      let plants = resp.data ?? resp;
      if (Array.isArray(plants)) {
        renderProducts(plants);
      } else if (Array.isArray(resp.data?.data)) {
        renderProducts(resp.data.data);
      } else if (Array.isArray(resp.data?.plants)) {
        renderProducts(resp.data.plants);
      } else {
        const arr = Object.values(resp).find((v) => Array.isArray(v));
        renderProducts(arr || []);
      }
    } else {
      // fetch by category endpoint (assignment gave /api/category/${id})
      const resp = await fetchJSON(`${API_BASE}/category/${catId}`);
      if (!resp) return renderProducts([]);
      let plants = resp.data ?? resp;
      if (Array.isArray(plants)) {
        renderProducts(plants);
      } else if (Array.isArray(resp.data?.data)) {
        renderProducts(resp.data.data);
      } else if (Array.isArray(resp.data?.plants)) {
        renderProducts(resp.data.plants);
      } else {
        const arr = Object.values(resp).find((v) => Array.isArray(v));
        renderProducts(arr || []);
      }
    }
  }

  function setActiveCategoryButton(id) {
    const buttons = categoriesEl.querySelectorAll(".category-btn");
    buttons.forEach((b) => {
      if (String(b.dataset.id) === String(id) || (id === null && b.dataset.id === "all")) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });
  }

  // click handlers (delegated)
  function attachListeners() {
    // categories click
    categoriesEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".category-btn");
      if (!btn) return;
      const id = btn.dataset.id;
      // set active and load
      currentCategoryId = id;
      loadPlantsByCategoryId(id);
    });

    // product grid - event delegation for add-to-cart and plant-name clicks
    productGrid.addEventListener("click", async (e) => {
      const addBtn = e.target.closest(".add-to-cart");
      if (addBtn) {
        const id = addBtn.dataset.id;
        const name = addBtn.dataset.name || "Plant";
        const price = addBtn.dataset.price || "9.99";
        addToCart({ id, name, price });
        // give small feedback
        addBtn.textContent = "Added ✓";
        setTimeout(() => (addBtn.textContent = "Add to Cart"), 900);
        return;
      }

      const nameEl = e.target.closest(".plant-name");
      if (nameEl) {
        const id = nameEl.dataset.id;
        if (!id) return;
        // fetch detail by ID
        showSpinner();
        const resp = await fetchJSON(`${API_BASE}/plant/${id}`);
        if (!resp) return;
        // various shapes
        let plant = resp.data ?? resp;
        if (plant && typeof plant === "object" && !Array.isArray(plant)) {
          // good
        } else if (Array.isArray(resp.data?.data)) {
          plant = resp.data.data[0] ?? resp.data.data;
        } else if (Array.isArray(resp.data?.plants)) {
          plant = resp.data.plants.find((p) => String(p.id) === String(id)) ?? resp.data.plants[0];
        } else {
          const arr = Object.values(resp).find((v) => Array.isArray(v));
          plant = (arr && arr[0]) || resp;
        }
        hideSpinner();
        openModalWithPlant(plant);
      }
    });

    // modal close
    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    // cart remove (delegation)
    cartList.addEventListener("click", (e) => {
      const rem = e.target.closest(".remove-btn");
      if (!rem) return;
      const idx = rem.dataset.index;
      removeFromCart(idx);
    });

    // checkout
    const checkoutBtn = document.getElementById("checkout");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (!cart || cart.length === 0) {
          alert("Cart is empty. Add some trees first 🌱");
          return;
        }
        // simple checkout flow for assignment (no payments)
        const total = cart.reduce((s, it) => s + Number(it.price) * (it.qty || 1), 0);
        alert(`Thanks for supporting Green Earth! Your order total: $${formatPrice(total)}\n(This is a demo — integrate payments in real project.)`);
        cart = [];
        saveCart();
        renderCart();
      });
    }

    // donation form
    if (plantForm) {
      plantForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("donor-name").value.trim();
        const email = document.getElementById("donor-email").value.trim();
        const countVal = Number(document.getElementById("donor-count").value) || 1;

        if (!name || !email || countVal < 1) {
          alert("Please fill valid details.");
          return;
        }

        // simple fake processing
        alert(`Thank you ${name}! 🌿\nWe received your request to plant ${countVal} tree(s). We will email you at ${email} with details.`);

        // reset form
        plantForm.reset();
        document.getElementById("donor-count").value = "1";
      });
    }

    // hero and header CTAs
    if (plantBtn) {
      plantBtn.addEventListener("click", () => {
        // scroll to form
        const footerForm = document.getElementById("plant-form");
        if (footerForm) footerForm.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
    if (heroCta) {
      heroCta.addEventListener("click", () => {
        const about = document.getElementById("about");
        if (about) about.scrollIntoView({ behavior: "smooth" });
      });
    }
  }

  // init
  async function init() {
    loadCart();
    renderCart();
    attachListeners();

    // create a lightweight spinner element if not already styled
    if (spinner) {
      spinner.classList.add("spinner");
    }

    // Fetch categories and then load all plants by default
    await loadCategories();
    // load all plants initially
    await loadPlantsByCategoryId("all");
  }

  // Kickoff
  document.addEventListener("DOMContentLoaded", init);

  // Expose some functions for debugging (optional)
  window.GreenEarth = {
    getCart: () => cart,
    addToCart,
    removeFromCart,
  };
})();