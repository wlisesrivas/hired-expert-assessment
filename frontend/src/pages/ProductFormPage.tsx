import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createProduct, getProduct, updateProduct } from "../api/products";
import type { ProductFormData } from "../types";

const EMPTY: ProductFormData = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "0",
  is_active: true,
};

export function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [form, setForm] = useState<ProductFormData>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    setFetching(true);
    getProduct(id!)
      .then((p) =>
        setForm({
          name: p.name,
          description: p.description,
          price: p.price,
          category: p.category,
          stock: String(p.stock),
          is_active: p.is_active,
        })
      )
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { error?: { message?: string } } } })
            ?.response?.data?.error?.message ?? "Failed to load product.";
        setApiError(msg);
      })
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  function set<K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof ProductFormData, string>> = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.category.trim()) errs.category = "Category is required.";
    const priceNum = Number(form.price);
    if (!form.price || isNaN(priceNum) || priceNum <= 0)
      errs.price = "Price must be a positive number.";
    const stockNum = Number(form.stock);
    if (form.stock === "" || isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum))
      errs.stock = "Stock must be a non-negative integer.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setApiError("");
    setLoading(true);
    try {
      if (isEdit) {
        await updateProduct(id!, form);
      } else {
        await createProduct(form);
      }
      navigate("/products");
    } catch (err: unknown) {
      const apiErr = (
        err as { response?: { data?: { error?: { message?: string; details?: Record<string, string[]> } } } }
      )?.response?.data?.error;

      if (apiErr?.details) {
        const mapped: Partial<Record<keyof ProductFormData, string>> = {};
        for (const [field, msgs] of Object.entries(apiErr.details)) {
          mapped[field as keyof ProductFormData] = (msgs as string[]).join(", ");
        }
        setFieldErrors(mapped);
      } else {
        setApiError(apiErr?.message ?? "Failed to save product.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div className="state-msg">Loading…</div>;

  return (
    <div>
      <nav>
        <div className="nav-inner">
          <span className="nav-title">Product Catalog</span>
          <button className="nav-btn" onClick={() => navigate("/products")}>
            ← Back to list
          </button>
        </div>
      </nav>

      <div className="container" style={{ maxWidth: 640 }}>
        <div className="card">
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>
            {isEdit ? "Edit Product" : "New Product"}
          </h2>

          {apiError && <div className="alert alert-error">{apiError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                autoFocus
              />
              {fieldErrors.name && <p className="error-text">{fieldErrors.name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="price">Price *</label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                />
                {fieldErrors.price && <p className="error-text">{fieldErrors.price}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="stock">Stock *</label>
                <input
                  id="stock"
                  type="number"
                  step="1"
                  min="0"
                  value={form.stock}
                  onChange={(e) => set("stock", e.target.value)}
                />
                {fieldErrors.stock && <p className="error-text">{fieldErrors.stock}</p>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <input
                id="category"
                type="text"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                placeholder="e.g. electronics"
              />
              {fieldErrors.category && <p className="error-text">{fieldErrors.category}</p>}
            </div>

            <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                id="is_active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => set("is_active", e.target.checked)}
                style={{ width: "auto" }}
              />
              <label htmlFor="is_active" style={{ marginBottom: 0 }}>
                Active
              </label>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Saving…" : isEdit ? "Save changes" : "Create product"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/products")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
