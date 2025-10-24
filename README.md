# tftgardenkolkata
Digital catalog, specifications, and project assets for all planters, plants, and landscaping items offered by The Finishing Touch Kolkata.
import React, { useState, useEffect } from "react";

// Landscape Catalog App - single-file React component
// - Uses localStorage for persistence
// - Admin mode for add / edit / delete
// - Product categories, search, filters, shortlist (wishlist)
// - Image upload stores base64 (for prototype)
// - Export CSV and Print-to-PDF (use browser Print)

export default function LandscapeCatalogApp() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [shortlist, setShortlist] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(getEmptyForm());

  useEffect(() => {
    const saved = localStorage.getItem("lft_products_v1");
    if (saved) setProducts(JSON.parse(saved));
    const savedShort = localStorage.getItem("lft_shortlist_v1");
    if (savedShort) setShortlist(JSON.parse(savedShort));
  }, []);

  useEffect(() => {
    localStorage.setItem("lft_products_v1", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("lft_shortlist_v1", JSON.stringify(shortlist));
  }, [shortlist]);

  function getEmptyForm() {
    return {
      id: null,
      name: "",
      category: "Planter",
      price: "",
      size: "",
      description: "",
      image: null,
      sku: "",
    };
  }

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, image: reader.result });
    reader.readAsDataURL(file);
  }

  function addOrUpdateProduct(e) {
    e.preventDefault();
    if (!form.name) return alert("Please add a product name");
    if (editing) {
      setProducts((p) => p.map((x) => (x.id === editing ? { ...form, id: editing } : x)));
      setEditing(null);
    } else {
      const id = Date.now().toString();
      setProducts((p) => [{ ...form, id }, ...p]);
    }
    setForm(getEmptyForm());
  }

  function editProduct(id) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setForm(p);
    setEditing(id);
    setIsAdmin(true);
  }

  function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;
    setProducts((p) => p.filter((x) => x.id !== id));
    setShortlist((s) => s.filter((id2) => id2 !== id));
  }

  function toggleShortlist(id) {
    setShortlist((s) => (s.includes(id) ? s.filter((x) => x !== id) : [id, ...s]));
  }

  function exportCSV() {
    const rows = [
      ["Name", "Category", "Price", "Size", "SKU", "Description"],
      ...products.map((p) => [p.name, p.category, p.price, p.size, p.sku, p.description]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${(c || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "landscape_catalog.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function filteredProducts() {
    return products.filter((p) => {
      if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
      if (query && !(`${p.name} ${p.description} ${p.sku}`.toLowerCase().includes(query.toLowerCase()))) return false;
      return true;
    });
  }

  function copyShareLink(p) {
    const data = `Product: ${p.name}\nCategory: ${p.category}\nPrice: ${p.price}\nSize: ${p.size}\nSKU: ${p.sku}\n\n${p.description}`;
    navigator.clipboard.writeText(data).then(() => alert("Product summary copied to clipboard"));
  }

  function printCatalog() {
    // Simple printable layout: open new window with cards and call print
    const html = `
      <html>
      <head>
        <title>Catalog - The Finishing Touch</title>
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <style>body{font-family:Arial,Helvetica,sans-serif;padding:20px} .card{border:1px solid #ddd;padding:12px;margin:8px 0;display:flex;gap:12px} img{max-width:120px;height:auto}</style>
      </head>
      <body>
        <h1>Catalog - The Finishing Touch</h1>
        ${filteredProducts()
          .map(
            (p) => `
          <div class='card'>
            ${p.image ? `<img src='${p.image}'/>` : "<div style='width:120px;height:80px;background:#eee;display:inline-block'></div>"}
            <div>
              <strong>${escapeHtml(p.name)}</strong><br/>
              ${escapeHtml(p.category)} - ${escapeHtml(p.price || "")}<br/>
              <small>${escapeHtml(p.size || "")}</small>
              <p>${escapeHtml(p.description || "")}</p>
            </div>
          </div>`
          )
          .join("")}
      </body>
      </html>
    `;
    const w = window.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
  }

  function escapeHtml(s) {
    if (!s) return "";
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">The Finishing Touch — Catalog Builder</h1>
            <p className="text-sm text-gray-600">Web app prototype — stores data in your browser. Export with Print or CSV.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded border" onClick={() => setIsAdmin((s) => !s)}>{isAdmin ? 'Exit Admin' : 'Admin'}</button>
            <button className="px-3 py-1 rounded border" onClick={exportCSV}>Export CSV</button>
            <button className="px-3 py-1 rounded border" onClick={printCatalog}>Print / Export PDF</button>
          </div>
        </header>

        <section className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2">
            <div className="flex gap-2">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products, SKU or description" className="flex-1 p-2 border rounded" />
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="p-2 border rounded">
                <option>All</option>
                <option>Planter</option>
                <option>Plant</option>
                <option>Furniture</option>
                <option>Pebbles</option>
                <option>Pergola</option>
              </select>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts().map((p) => (
                <div key={p.id} className="bg-white p-3 rounded shadow-sm">
                  <div className="h-40 flex items-center justify-center mb-2 bg-gray-100 rounded overflow-hidden">
                    {p.image ? <img src={p.image} alt={p.name} className="object-contain h-full" /> : <div className="text-sm text-gray-500">No image</div>}
                  </div>
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.category} • {p.size} • {p.sku}</div>
                  <div className="mt-2 text-sm">{p.description}</div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="flex gap-2">
                      <button className="text-xs px-2 py-1 border rounded" onClick={() => copyShareLink(p)}>Copy</button>
                      <a className="text-xs px-2 py-1 border rounded" href={`https://wa.me/?text=${encodeURIComponent(p.name + ' - ' + (p.price||'') + ' ' + window.location.href)}`} target="_blank" rel="noreferrer">WhatsApp</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleShortlist(p.id)} className={`text-xs px-2 py-1 rounded ${shortlist.includes(p.id) ? 'bg-yellow-200' : 'border'}`}>{shortlist.includes(p.id) ? 'Shortlisted' : 'Shortlist'}</button>
                      {isAdmin && (
                        <>
                          <button className="text-xs px-2 py-1 border rounded" onClick={() => editProduct(p.id)}>Edit</button>
                          <button className="text-xs px-2 py-1 border rounded" onClick={() => deleteProduct(p.id)}>Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="bg-white p-4 rounded shadow-sm">
            <h3 className="font-semibold mb-2">Shortlist ({shortlist.length})</h3>
            <div className="flex flex-col gap-2 max-h-80 overflow-auto">
              {shortlist.length === 0 && <div className="text-sm text-gray-500">No items shortlisted yet</div>}
              {shortlist.map((id) => {
                const p = products.find((x) => x.id === id);
                if (!p) return null;
                return (
                  <div key={id} className="flex items-center gap-2">
                    <div className="flex-1 text-sm">{p.name}</div>
                    <button className="text-xs px-2 py-1 border rounded" onClick={() => editProduct(id)}>Edit</button>
                  </div>
                );
              })}

              <div className="mt-4">
                <button className="w-full px-3 py-2 border rounded" onClick={() => {
                  const list = shortlist.map(id => products.find(p=>p.id===id)).filter(Boolean);
                  const csv = list.map(p => `${p.name} | ${p.category} | ${p.price}`).join('\n');
                  navigator.clipboard.writeText(csv);
                  alert('Shortlist copied to clipboard');
                }}>Copy shortlist</button>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold">Enquiry</h4>
              <p className="text-sm text-gray-600">Click WhatsApp on any product card to start a conversation with a client. You can also copy share text.</p>
            </div>
          </aside>
        </section>

        {isAdmin && (
          <section className="bg-white p-4 rounded shadow-sm">
            <h2 className="font-semibold mb-3">Admin — Add / Edit Product</h2>
            <form onSubmit={addOrUpdateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="p-2 border rounded col-span-2" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="p-2 border rounded">
                <option>Planter</option>
                <option>Plant</option>
                <option>Furniture</option>
                <option>Pebbles</option>
                <option>Pergola</option>
              </select>
              <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price (e.g. ₹2,500)" className="p-2 border rounded" />

              <input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="Size / Dimensions" className="p-2 border rounded" />
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU / Code" className="p-2 border rounded" />

              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description / Notes" className="p-2 border rounded col-span-2" />

              <div className="col-span-2 flex items-center gap-2">
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                <div className="flex-1 text-sm text-gray-500">Image will be saved in your browser (base64). Use high-quality photos for client catalogs.</div>
              </div>

              <div className="col-span-2 flex gap-2 mt-2">
                <button type="submit" className="px-3 py-2 border rounded">{editing ? 'Update product' : 'Add product'}</button>
                <button type="button" className="px-3 py-2 border rounded" onClick={() => { setForm(getEmptyForm()); setEditing(null); }}>Reset</button>
                <button type="button" className="px-3 py-2 border rounded" onClick={() => { setProducts([]); setShortlist([]); localStorage.removeItem('lft_products_v1'); localStorage.removeItem('lft_shortlist_v1'); }}>Clear all</button>
              </div>
            </form>
          </section>
        )}

        <footer className="mt-8 text-sm text-gray-500">Prototype — if you'd like, I can prepare this for hosting (GitHub Pages) and add PDF templates, price sheets, and CSV import.</footer>
      </div>
    </div>
  );
}
