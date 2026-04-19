import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteProduct, listProducts } from "../api/products";
import { useAuth } from "../contexts/AuthContext";
import type { PaginatedProducts } from "../types";

export function ProductListPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [data, setData] = useState<PaginatedProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  // filter inputs (uncommitted)
  const [categoryInput, setCategoryInput] = useState("");
  const [statusInput, setStatusInput] = useState("");

  // committed filter state that triggers fetch
  const [category, setCategory] = useState("");
  const [isActive, setIsActive] = useState("");
  const [page, setPage] = useState(1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listProducts({
        page,
        category: category || undefined,
        is_active: isActive || undefined,
      });
      setData(result);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? "Failed to load products.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, category, isActive]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function applyFilters() {
    setCategory(categoryInput);
    setIsActive(statusInput);
    setPage(1);
  }

  function clearFilters() {
    setCategoryInput("");
    setStatusInput("");
    setCategory("");
    setIsActive("");
    setPage(1);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this product?")) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      await fetchProducts();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? "Failed to delete product.";
      setError(msg);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <nav>
        <div className="nav-inner">
          <span className="nav-title">Product Catalog</span>
          <button className="nav-btn" onClick={logout}>
            Sign out
          </button>
        </div>
      </nav>

      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Products</h2>
          <button className="btn btn-primary" onClick={() => navigate("/products/new")}>
            + New Product
          </button>
        </div>

        <div className="card">
          {/* Filters */}
          <div className="filters">
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                placeholder="e.g. electronics"
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={statusInput} onChange={(e) => setStatusInput(e.target.value)}>
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={applyFilters}>
              Search
            </button>
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {/* Table */}
          {loading ? (
            <div className="state-msg">Loading…</div>
          ) : !data || data.results.length === 0 ? (
            <div className="state-msg">No products found.</div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((product) => (
                    <tr key={product.id}>
                      <td style={{ fontWeight: 500 }}>{product.name}</td>
                      <td>{product.category}</td>
                      <td>${product.price}</td>
                      <td>{product.stock}</td>
                      <td>
                        <span
                          className={`badge ${
                            product.is_active ? "badge-active" : "badge-inactive"
                          }`}
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/products/${product.id}/edit`)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(product.id)}
                          disabled={deleting === product.id}
                        >
                          {deleting === product.id ? "…" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {data.total_pages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                  >
                    ← Prev
                  </button>
                  <span>
                    Page {data.page} of {data.total_pages} &nbsp;·&nbsp; {data.count} items
                  </span>
                  <button
                    className="page-btn"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === data.total_pages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
