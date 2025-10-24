
const STORAGE_KEY = "tft_catalog_products_v1";
const SHORTLIST_KEY = "tft_catalog_shortlist_v1";

const el = (sel, root=document) => root.querySelector(sel);
const elAll = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const state = {
  products: [],
  shortlist: [],
  admin: false,
  query: "",
  category: "All",
};

function init() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    state.products = Array.isArray(saved) ? saved : [];
  } catch { state.products = []; }

  try {
    const s = JSON.parse(localStorage.getItem(SHORTLIST_KEY) || "[]");
    state.shortlist = Array.isArray(s) ? s : [];
  } catch { state.shortlist = []; }

  if (state.products.length === 0) {
    seedSamples();
    persist();
  }

  wireUI();
  render();
}

function seedSamples() {
  state.products = [
    { id: uid(), name: "Oslo Ceramic Planter", category: "Planter", price: "₹2,950", size: "38 x 38 x 45 cm", sku: "PLN-OSLO-38", description: "Sleek ceramic planter with matte finish. Ideal for indoor palms and aglaonemas.", image: "assets/planter.svg" },
    { id: uid(), name: "Terra Fiber Pot (Large)", category: "Planter", price: "₹3,600", size: "55 x 40 x 50 cm", sku: "PLN-TERRA-L", description: "Lightweight FRP planter suited for balconies and terraces.", image: "assets/planter.svg" },
    { id: uid(), name: "Areca Palm – Indoor Variety", category: "Plant", price: "₹1,250", size: "12\" pot, 4 ft", sku: "PLT-ARECA-4FT", description: "Air-purifying indoor palm; bright, indirect light; water when top soil is dry.", image: "assets/plant.svg" },
    { id: uid(), name: "Teak Lounge Chair", category: "Furniture", price: "₹18,500", size: "65 x 72 x 85 cm", sku: "FUR-TEAK-LNG", description: "Outdoor-grade teak with weather-resistant joinery. Pair with side table.", image: "assets/furniture.svg" },
    { id: uid(), name: "White Pebbles – Medium Grade", category: "Pebbles", price: "₹85/kg", size: "20–40 mm", sku: "DEC-PEB-WHT-M", description: "Washed white pebbles for planters, borders and water features.", image: "assets/pebbles.svg" },
  ];
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.products));
  localStorage.setItem(SHORTLIST_KEY, JSON.stringify(state.shortlist));
}

function wireUI() {
  el("#adminToggle").addEventListener("click", () => {
    state.admin = !state.admin;
    render();
  });

  el("#searchInput").addEventListener("input", (e) => {
    state.query = e.target.value.toLowerCase();
    render();
  });

  el("#categoryFilter").addEventListener("change", (e) => {
    state.category = e.target.value;
    render();
  });

  el("#exportCsv").addEventListener("click", exportCSV);
  el("#printBtn").addEventListener("click", printCatalog);
  el("#copyShortlist").addEventListener("click", copyShortlist);

  // Admin form
  const form = el("#productForm");
  const fileInput = form.image;
  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await toDataURL(file);
    form.dataset.imageDataUrl = dataUrl;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const product = {
      id: data.id || uid(),
      name: data.name?.trim(),
      category: data.category || "Planter",
      price: data.price || "",
      size: data.size || "",
      sku: data.sku || "",
      description: data.description || "",
      image: form.dataset.imageDataUrl || findExistingImage(data.id) || "",
    };
    if (!product.name) {
      alert("Please add a product name");
      return;
    }
    const idx = state.products.findIndex(p => p.id === data.id);
    if (idx >= 0) state.products[idx] = product;
    else state.products.unshift(product);

    form.reset();
    delete form.dataset.imageDataUrl;
    form.id.value = "";
    persist();
    render();
  });

  el("#resetForm").addEventListener("click", () => {
    el("#productForm").reset();
    el("#productForm").id.value = "";
    delete el("#productForm").dataset.imageDataUrl;
  });

  el("#clearAll").addEventListener("click", () => {
    if (!confirm("Clear all products and shortlist?")) return;
    state.products = [];
    state.shortlist = [];
    persist();
    render();
  });
}

function findExistingImage(id){
  const p = state.products.find(x => x.id === id);
  return p?.image || "";
}

function toDataURL(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function render() {
  // toggle admin UI
  el("#adminCard").style.display = state.admin ? "block" : "none";
  el("#adminToggle").textContent = state.admin ? "Exit Admin" : "Admin";

  // filter products
  const list = state.products.filter(p => {
    if (state.category !== "All" && p.category !== state.category) return false;
    if (state.query) {
      const hay = `${p.name} ${p.sku} ${p.description}`.toLowerCase();
      if (!hay.includes(state.query)) return false;
    }
    return true;
  });

  // render cards
  const grid = el("#productGrid");
  grid.innerHTML = "";
  list.forEach(p => grid.appendChild(card(p)));

  // render shortlist
  const pane = el("#shortlistPane");
  const count = el("#shortlistCount");
  count.textContent = String(state.shortlist.length);
  pane.innerHTML = "";
  if (state.shortlist.length === 0) {
    pane.textContent = "No items shortlisted yet.";
  } else {
    state.shortlist.map(id => state.products.find(p => p.id === id))
      .filter(Boolean)
      .forEach(p => {
        const row = document.createElement("div");
        row.className = "hstack gap small";
        row.innerHTML = `<span>${p.name}</span><button class="btn outline" data-edit="${p.id}">Edit</button>`;
        row.querySelector("button").addEventListener("click", () => editProduct(p.id));
        pane.appendChild(row);
      });
  }
}

function card(p){
  const c = document.createElement("div");
  c.className = "card";
  c.innerHTML = `
    <div class="thumb">${p.image ? `<img src="${p.image}">` : `<span class="muted small">No image</span>`}</div>
    <h4>${escapeHtml(p.name)}</h4>
    <div class="chips">${p.category} • ${p.size || ""} • ${p.sku || ""}</div>
    <p class="small">${escapeHtml(p.description || "")}</p>
    <div class="product-actions">
      <div class="hstack gap">
        <button class="btn outline" data-copy="${p.id}">Copy</button>
        <a class="btn outline" target="_blank" rel="noreferrer" href="https://wa.me/?text=${encodeURIComponent(p.name + ' - ' + (p.price||'') + ' ' + location.href)}">WhatsApp</a>
      </div>
      <div class="hstack gap">
        <button class="btn ${isShortlisted(p.id) ? '' : 'outline'}" data-shortlist="${p.id}">${isShortlisted(p.id) ? 'Shortlisted' : 'Shortlist'}</button>
        <button class="btn outline admin-only" data-edit="${p.id}">Edit</button>
        <button class="btn danger outline admin-only" data-del="${p.id}">Delete</button>
      </div>
    </div>
  `;

  // Wire actions
  c.querySelector(`[data-copy="${p.id}"]`).addEventListener("click", () => copyProduct(p));
  c.querySelector(`[data-shortlist="${p.id}"]`).addEventListener("click", () => toggleShortlist(p.id));
  c.querySelectorAll(".admin-only").forEach(btn => btn.style.display = state.admin ? "inline-block" : "none");
  c.querySelector(`[data-edit="${p.id}"]`).addEventListener("click", () => editProduct(p.id));
  c.querySelector(`[data-del="${p.id}"]`).addEventListener("click", () => deleteProduct(p.id));

  return c;
}

function toggleShortlist(id){
  const i = state.shortlist.indexOf(id);
  if (i >= 0) state.shortlist.splice(i,1);
  else state.shortlist.unshift(id);
  persist();
  render();
}

function isShortlisted(id){
  return state.shortlist.includes(id);
}

function copyProduct(p){
  const txt = `Product: ${p.name}
Category: ${p.category}
Price: ${p.price}
Size: ${p.size}
SKU: ${p.sku}

${p.description}`.trim();
  navigator.clipboard.writeText(txt).then(() => alert("Product summary copied to clipboard"));
}

function copyShortlist(){
  const list = state.shortlist.map(id => state.products.find(p=>p.id===id)).filter(Boolean);
  const txt = list.map(p => `${p.name} | ${p.category} | ${p.price}`).join("\n");
  navigator.clipboard.writeText(txt || "No items in shortlist").then(() => alert("Shortlist copied to clipboard"));
}

function editProduct(id){
  state.admin = true;
  const p = state.products.find(x => x.id === id);
  const form = document.getElementById("productForm");
  form.id.value = p.id;
  form.name.value = p.name;
  form.category.value = p.category;
  form.price.value = p.price;
  form.size.value = p.size;
  form.sku.value = p.sku;
  form.description.value = p.description;
  delete form.dataset.imageDataUrl;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteProduct(id){
  if (!confirm("Delete this product?")) return;
  state.products = state.products.filter(x => x.id !== id);
  state.shortlist = state.shortlist.filter(x => x !== id);
  persist();
  render();
}

function exportCSV(){
  const rows = [
    ["Name","Category","Price","Size","SKU","Description"],
    ...state.products.map(p => [p.name, p.category, p.price, p.size, p.sku, p.description])
  ];
  const csv = rows.map(r => r.map(c => `"${String(c||'').replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "catalog.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function printCatalog(){
  window.print();
}

function escapeHtml(s){
  return (s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}

function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

document.addEventListener("DOMContentLoaded", init);
