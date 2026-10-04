"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import type { Tables } from "@/lib/db/types";
import { addressSchema, firstIssueMessage } from "@/lib/validation";

type Address = Tables<"addresses">;

const emptyForm = {
  label: "Home",
  full_name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "US",
};

export default function AddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    const res = await fetch("/api/account/addresses", { cache: "no-store" }).catch(() => null);
    setAddresses(res?.ok ? (await res.json()).addresses : []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function addAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const parsed = addressSchema.safeParse(form);
    if (!parsed.success) {
      setFormError(firstIssueMessage(parsed.error));
      return;
    }
    setFormError(null);

    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    }).catch(() => null);
    if (!res?.ok) {
      setFormError((await res?.json().catch(() => null))?.error ?? "Something went wrong saving the address.");
      return;
    }
    setForm(emptyForm);
    setShowForm(false);
    load();
  }

  async function removeAddress(id: string) {
    await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    load();
  }

  async function makeDefault(id: string) {
    if (!user) return;
    await fetch(`/api/account/addresses/${id}`, { method: "PATCH" });
    load();
  }

  return (
    <div>
      <h1>Addresses</h1>

      <div className="grid cols-3" style={{ marginBottom: "1.5rem" }}>
        {addresses.map((address) => (
          <div key={address.id} className="card address-card">
            {address.is_default && <span className="tag">Default</span>}
            <strong>{address.label}</strong>
            <p>
              {address.full_name}
              <br />
              {address.line1}
              {address.line2 ? <><br />{address.line2}</> : null}
              <br />
              {address.city}, {address.state} {address.postal_code}
              <br />
              {address.country}
            </p>
            <div className="address-card-actions">
              {!address.is_default && (
                <button className="button secondary small" onClick={() => makeDefault(address.id)}>
                  Make default
                </button>
              )}
              <button className="button secondary small" onClick={() => removeAddress(address.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {!showForm && (
        <button
          className="button"
          onClick={() => {
            setFormError(null);
            setShowForm(true);
          }}
        >
          Add address
        </button>
      )}

      {showForm && (
        <form className="card address-form" onSubmit={addAddress}>
          <label htmlFor="label">Label</label>
          <input id="label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          <label htmlFor="full_name">Full name</label>
          <input
            id="full_name"
            required
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
          <label htmlFor="line1">Address line 1</label>
          <input id="line1" required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
          <label htmlFor="line2">Address line 2</label>
          <input id="line2" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
          <div className="address-form-row">
            <div>
              <label htmlFor="city">City</label>
              <input id="city" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label htmlFor="state">State</label>
              <input id="state" required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
            <div>
              <label htmlFor="postal_code">ZIP</label>
              <input
                id="postal_code"
                required
                value={form.postal_code}
                onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
              />
            </div>
          </div>
          {formError && <p className="form-error">{formError}</p>}
          <div className="address-form-actions">
            <button className="button" type="submit">
              Save address
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
