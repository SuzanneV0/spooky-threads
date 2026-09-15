"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";

type Product = Tables<"products">;

const emptyForm = {
  slug: "",
  name: "",
  description: "",
  price_cents: 0,
  wash_instructions: "Machine wash cold, tumble dry low.",
  product_type: "shirt",
  is_new: false,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const supabase = createClient();

  async function load() {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      slug: product.slug,
      name: product.name,
      description: product.description,
      price_cents: product.price_cents,
      wash_instructions: product.wash_instructions,
      product_type: product.product_type,
      is_new: product.is_new,
    });
    setShowForm(true);
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await supabase.from("products").update(form).eq("id", editingId);
    } else {
      await supabase.from("products").insert(form);
    }
    setShowForm(false);
    load();
  }

  async function deleteProduct(id: string) {
    await supabase.from("products").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <div className="admin-header-row">
        <h1>Products</h1>
        <button className="button" onClick={startCreate}>
          + New product
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Price</th>
            <th>New</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.product_type}</td>
              <td>${(p.price_cents / 100).toFixed(2)}</td>
              <td>{p.is_new ? "Yes" : ""}</td>
              <td className="admin-table-actions">
                <button className="button secondary small" onClick={() => startEdit(p)}>
                  Edit
                </button>
                <button className="button secondary small" onClick={() => deleteProduct(p.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <form className="card admin-form" onSubmit={saveProduct}>
          <h3>{editingId ? "Edit product" : "New product"}</h3>
          <label htmlFor="name">Name</label>
          <input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label htmlFor="slug">Slug</label>
          <input id="slug" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <label htmlFor="price">Price (USD)</label>
          <input
            id="price"
            type="number"
            step="0.01"
            value={form.price_cents / 100}
            onChange={(e) => setForm({ ...form, price_cents: Math.round(Number(e.target.value) * 100) })}
          />
          <label htmlFor="type">Product type</label>
          <select
            id="type"
            value={form.product_type}
            onChange={(e) => setForm({ ...form, product_type: e.target.value })}
          >
            {["sweater", "shirt", "hat", "mug", "tumbler", "blanket"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <label htmlFor="wash">Wash instructions</label>
          <textarea
            id="wash"
            value={form.wash_instructions}
            onChange={(e) => setForm({ ...form, wash_instructions: e.target.value })}
          />
          <label>
            <input
              type="checkbox"
              checked={form.is_new}
              onChange={(e) => setForm({ ...form, is_new: e.target.checked })}
              style={{ marginRight: "0.4rem" }}
            />
            Mark as new arrival
          </label>
          <div className="address-form-actions">
            <button className="button" type="submit">
              Save
            </button>
            <button className="button secondary" type="button" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
