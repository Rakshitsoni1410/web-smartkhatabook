import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../api";

import {
  getStoredUser,
} from "../utils/session";

import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiEdit2,
  FiMoon,
  FiPackage,
  FiPlus,
  FiSearch,
  FiShoppingCart,
  FiSun,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import "./Stock.css";

// =====================================================
// MONEY
// =====================================================

const formatMoney = (value) => {
  const amount =
    Number(value || 0);

  if (
    !Number.isFinite(amount)
  ) {
    return "₹0";
  }

  return `₹${amount.toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  )}`;
};

// =====================================================
// DEFAULT FORM
// =====================================================

const getDefaultForm = () => ({
  name: "",
  category: "",
  description: "",
  purchase: "",
  selling: "",
  stockQty: "",
  inStock: true,
  inWeight: false,
  weight: "",
  weightUnit: "kg",
});

// =====================================================
// STOCK
// =====================================================

export default function Stock() {
  const navigate =
    useNavigate();

  const user =
    getStoredUser() || {};

  const role =
    String(
      user?.role || ""
    )
      .trim()
      .toLowerCase();

  const isRetailer =
    role === "retailer";

  // =====================================================
  // DATA
  // =====================================================

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    suggestions,
    setSuggestions,
  ] = useState([]);

  const [
    wholesalers,
    setWholesalers,
  ] = useState({});

  // =====================================================
  // UI
  // =====================================================

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  const [
    orderingId,
    setOrderingId,
  ] = useState(null);

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    editOpen,
    setEditOpen,
  ] = useState(false);

  const [
    selected,
    setSelected,
  ] = useState(null);

  const [
    form,
    setForm,
  ] = useState(
    getDefaultForm()
  );

  const [
    toast,
    setToast,
  ] = useState({
    msg: "",
    type: "success",
  });

  // =====================================================
  // DARK MODE
  // =====================================================

  const [
    darkMode,
    setDarkMode,
  ] = useState(() => {
    try {
      const saved =
        localStorage.getItem(
          "smartkhata-theme"
        );

      if (saved === "dark") {
        return true;
      }

      if (saved === "light") {
        return false;
      }

      return (
        window.matchMedia?.(
          "(prefers-color-scheme: dark)"
        )?.matches || false
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "smartkhata-theme",
        darkMode
          ? "dark"
          : "light"
      );
    } catch {
      // Ignore storage error
    }
  }, [darkMode]);

  // =====================================================
  // TOAST
  // =====================================================

  const showToast = (
    msg,
    type = "success"
  ) => {
    setToast({
      msg,
      type,
    });
  };

  useEffect(() => {
    if (!toast.msg) {
      return;
    }

    const timer =
      setTimeout(() => {
        setToast({
          msg: "",
          type: "success",
        });
      }, 3000);

    return () =>
      clearTimeout(timer);
  }, [toast]);

  // =====================================================
  // WHOLESALERS
  // =====================================================

  const fetchWholesalers =
    useCallback(
      async (category) => {
        if (!category) {
          return;
        }

        try {
          const res =
            await api.get(
              `/api/user/wholesalers/${encodeURIComponent(
                category
              )}`
            );

          setWholesalers(
            (previous) => ({
              ...previous,

              [category]:
                res.data
                  ?.users || [],
            })
          );
        } catch (error) {
          console.error(
            "FETCH WHOLESALERS ERROR:",
            error
          );
        }
      },
      []
    );

  // =====================================================
  // PRODUCTS
  // =====================================================

  const fetchProducts =
    useCallback(async () => {
      if (!user?._id) {
        setProducts([]);

        setLoading(false);

        return;
      }

      try {
        const res =
          await api.get(
            `/api/product/list/${user._id}`
          );

        const data =
          Array.isArray(
            res.data?.products
          )
            ? res.data.products
            : [];

        setProducts(data);

        const categories = [
          ...new Set(
            data
              .map(
                (item) =>
                  item.category
              )
              .filter(Boolean)
          ),
        ];

        categories.forEach(
          (category) => {
            fetchWholesalers(
              category
            );
          }
        );
      } catch (error) {
        console.error(
          "FETCH PRODUCTS ERROR:",
          error
        );

        showToast(
          error?.response?.data
            ?.message ||
            "Unable to load products.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    }, [
      user?._id,
      fetchWholesalers,
    ]);

  // =====================================================
  // SUGGESTIONS
  // =====================================================

  const fetchSuggestions =
    useCallback(async () => {
      if (!user?._id) {
        return;
      }

      try {
        const res =
          await api.get(
            `/api/product/suggestions/${user._id}`
          );

        setSuggestions(
          Array.isArray(
            res.data?.suggestions
          )
            ? res.data
                .suggestions
            : []
        );
      } catch (error) {
        console.error(
          "FETCH SUGGESTIONS ERROR:",
          error
        );
      }
    }, [user?._id]);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchProducts();

    fetchSuggestions();
  }, [
    fetchProducts,
    fetchSuggestions,
  ]);

  // =====================================================
  // MODAL BODY LOCK
  // =====================================================

  useEffect(() => {
    if (
      !open &&
      !editOpen
    ) {
      return;
    }

    const oldOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        oldOverflow;
    };
  }, [
    open,
    editOpen,
  ]);

  // =====================================================
  // ESCAPE MODAL
  // =====================================================

  useEffect(() => {
    const handleEscape = (
      event
    ) => {
      if (
        event.key !==
        "Escape"
      ) {
        return;
      }

      if (
        saving
      ) {
        return;
      }

      setOpen(false);

      setEditOpen(false);
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleEscape
      );
  }, [saving]);

  // =====================================================
  // FORM
  // =====================================================

  const resetForm = () => {
    setForm(
      getDefaultForm()
    );

    setSelected(null);
  };

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm(
      (previous) => ({
        ...previous,

        [name]:
          type ===
          "checkbox"
            ? checked
            : value,
      })
    );
  };

  // =====================================================
  // OPEN ADD
  // =====================================================

  const openAddModal = () => {
    resetForm();

    setOpen(true);
  };

  const closeAddModal = () => {
    if (saving) {
      return;
    }

    setOpen(false);

    resetForm();
  };

  // =====================================================
  // ADD PRODUCT
  // =====================================================

  const handleAdd =
    async () => {
      if (saving) {
        return;
      }

      if (!form.name.trim()) {
        showToast(
          "Product name is required.",
          "error"
        );

        return;
      }

      if (
        !form.category.trim()
      ) {
        showToast(
          "Category is required.",
          "error"
        );

        return;
      }

      try {
        setSaving(true);

        await api.post(
          "/api/product/add",
          {
            ownerId:
              user._id,

            businessType:
              user.businessType,

            ...form,

            name:
              form.name.trim(),

            category:
              form.category.trim(),
          }
        );

        setOpen(false);

        resetForm();

        showToast(
          "Product added successfully."
        );

        await fetchProducts();
      } catch (error) {
        console.error(
          "ADD PRODUCT ERROR:",
          error
        );

        showToast(
          error?.response?.data
            ?.message ||
            "Unable to add product.",
          "error"
        );
      } finally {
        setSaving(false);
      }
    };

  // =====================================================
  // EDIT
  // =====================================================

  const openEdit = (
    item
  ) => {
    setSelected(item);

    setForm({
      name:
        item?.name || "",

      category:
        item?.category ||
        "",

      description:
        item?.description ||
        "",

      purchase:
        item?.purchase ??
        "",

      selling:
        item?.selling ??
        "",

      stockQty:
        item?.stockQty ??
        "",

      inStock:
        item?.inStock ??
        true,

      inWeight:
        item?.inWeight ??
        false,

      weight:
        item?.weight ??
        "",

      weightUnit:
        item?.weightUnit ||
        "kg",
    });

    setEditOpen(true);
  };

  const closeEditModal = () => {
    if (saving) {
      return;
    }

    setEditOpen(false);

    resetForm();
  };

  // =====================================================
  // UPDATE
  // =====================================================

  const handleUpdate =
    async () => {
      if (
        saving ||
        !selected?._id
      ) {
        return;
      }

      if (!form.name.trim()) {
        showToast(
          "Product name is required.",
          "error"
        );

        return;
      }

      try {
        setSaving(true);

        await api.put(
          `/api/product/update/${selected._id}`,
          {
            ...form,

            name:
              form.name.trim(),

            category:
              form.category.trim(),
          }
        );

        setEditOpen(false);

        resetForm();

        showToast(
          "Product updated successfully."
        );

        await fetchProducts();
      } catch (error) {
        console.error(
          "UPDATE PRODUCT ERROR:",
          error
        );

        showToast(
          error?.response?.data
            ?.message ||
            "Unable to update product.",
          "error"
        );
      } finally {
        setSaving(false);
      }
    };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete =
    async (id) => {
      if (
        !id ||
        deletingId
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Delete this product?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(id);

        await api.delete(
          `/api/product/delete/${id}`
        );

        showToast(
          "Product deleted."
        );

        await fetchProducts();
      } catch (error) {
        console.error(
          "DELETE PRODUCT ERROR:",
          error
        );

        showToast(
          error?.response?.data
            ?.message ||
            "Unable to delete product.",
          "error"
        );
      } finally {
        setDeletingId(null);
      }
    };

  // =====================================================
  // ORDER NOW
  // =====================================================

  const handleOrderNow =
    async (item) => {
      if (
        !item?._id ||
        !item?.name
      ) {
        showToast(
          "Invalid product",
          "error"
        );

        return;
      }

      if (orderingId) {
        return;
      }

      try {
        setOrderingId(
          item._id
        );

        const orderUnit =
          item.inWeight
            ? item.weightUnit ||
              "kg"
            : item.weightUnit ||
              "piece";

        const res =
          await api.post(
            "/api/orders/create",
            {
              productName:
                item.name.trim(),

              quantity: 1,

              unit:
                orderUnit,
            }
          );

        const selectedShop =
          res.data
            ?.selectedWholesaler
            ?.shopName ||
          res.data
            ?.selectedWholesaler
            ?.name;

        const selectedPrice =
          res.data
            ?.selection
            ?.selectedPrice;

        let message =
          "Order placed successfully";

        if (selectedShop) {
          message +=
            ` • ${selectedShop}`;
        }

        if (
          selectedPrice !==
          undefined
        ) {
          message +=
            ` • ${formatMoney(
              selectedPrice
            )}`;
        }

        showToast(
          message,
          "success"
        );

        await fetchProducts();
      } catch (error) {
        const backendData =
          error?.response
            ?.data;

        console.error(
          "CREATE ORDER FAILED:",
          {
            status:
              error?.response
                ?.status,

            data:
              backendData,

            message:
              error?.message,
          }
        );

        showToast(
          backendData
            ?.message ||
            "Failed to place order",
          "error"
        );
      } finally {
        setOrderingId(null);
      }
    };

  // =====================================================
  // FILTER
  // =====================================================

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return products;
      }

      return products.filter(
        (item) => {
          const name =
            String(
              item?.name ||
                ""
            ).toLowerCase();

          const category =
            String(
              item?.category ||
                ""
            ).toLowerCase();

          return (
            name.includes(
              query
            ) ||
            category.includes(
              query
            )
          );
        }
      );
    }, [
      products,
      search,
    ]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalProducts =
    products.length;

  const inStockCount =
    products.filter(
      (item) =>
        item?.inStock &&
        Number(
          item?.stockQty || 0
        ) > 0
    ).length;

  const lowStockCount =
    products.filter(
      (item) => {
        const quantity =
          Number(
            item?.stockQty ||
              0
          );

        return (
          quantity > 0 &&
          quantity <= 5
        );
      }
    ).length;

  // =====================================================
  // FORM MODAL
  // =====================================================

  const renderProductForm = (
    mode
  ) => {
    const isEdit =
      mode === "edit";

    return (
      <>
        {!isEdit &&
          suggestions.length >
            0 && (
            <div className="stock-suggest-box">
              <div className="stock-suggest-header">
                <span>
                  Suggested Products
                </span>

                <small>
                  For{" "}
                  {user?.businessType ||
                    "your business"}
                </small>
              </div>

              <div className="stock-chips">
                {suggestions.map(
                  (
                    item,
                    index
                  ) => (
                    <button
                      type="button"
                      className="stock-chip"
                      key={
                        item?._id ||
                        `${item?.name}-${index}`
                      }
                      onClick={() =>
                        setForm({
                          name:
                            item?.name ||
                            "",

                          category:
                            item?.category ||
                            "",

                          description:
                            item?.description ||
                            "",

                          purchase:
                            item?.purchase ??
                            "",

                          selling:
                            item?.selling ??
                            "",

                          stockQty:
                            item?.stockQty ??
                            "",

                          inStock:
                            true,

                          inWeight:
                            item?.inWeight ??
                            false,

                          weight:
                            item?.weight ??
                            "",

                          weightUnit:
                            item?.weightUnit ||
                            "kg",
                        })
                      }
                    >
                      {item?.name ||
                        "Product"}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

        <div className="stock-form-grid">
          <label className="stock-field">
            <span>
              Product Name
            </span>

            <input
              name="name"
              placeholder="e.g. Premium Rice"
              value={
                form.name
              }
              onChange={
                handleChange
              }
            />
          </label>

          <label className="stock-field">
            <span>
              Category
            </span>

            <input
              name="category"
              placeholder="e.g. Grocery"
              value={
                form.category
              }
              onChange={
                handleChange
              }
            />
          </label>

          <label className="stock-field">
            <span>
              Purchase Price
            </span>

            <div className="stock-money-input">
              <span>
                ₹
              </span>

              <input
                type="number"
                min="0"
                name="purchase"
                placeholder="0"
                value={
                  form.purchase
                }
                onChange={
                  handleChange
                }
              />
            </div>
          </label>

          <label className="stock-field">
            <span>
              Selling Price
            </span>

            <div className="stock-money-input">
              <span>
                ₹
              </span>

              <input
                type="number"
                min="0"
                name="selling"
                placeholder="0"
                value={
                  form.selling
                }
                onChange={
                  handleChange
                }
              />
            </div>
          </label>

          <label className="stock-field">
            <span>
              Stock Quantity
            </span>

            <input
              type="number"
              min="0"
              name="stockQty"
              placeholder="0"
              value={
                form.stockQty
              }
              onChange={
                handleChange
              }
            />
          </label>

          <label className="stock-field">
            <span>
              Unit
            </span>

            <select
              name="weightUnit"
              value={
                form.weightUnit
              }
              onChange={
                handleChange
              }
            >
              <option value="piece">
                Piece
              </option>

              <option value="kg">
                Kilogram
              </option>

              <option value="gram">
                Gram
              </option>

              <option value="litre">
                Litre
              </option>

              <option value="ml">
                Millilitre
              </option>

              <option value="box">
                Box
              </option>

              <option value="packet">
                Packet
              </option>
            </select>
          </label>

          <label className="stock-field stock-field-full">
            <span>
              Description
            </span>

            <textarea
              name="description"
              placeholder="Optional product description..."
              value={
                form.description
              }
              onChange={
                handleChange
              }
            />
          </label>

          <div className="stock-toggle-row stock-field-full">
            <label className="stock-toggle">
              <input
                type="checkbox"
                name="inStock"
                checked={
                  Boolean(
                    form.inStock
                  )
                }
                onChange={
                  handleChange
                }
              />

              <span className="stock-toggle-control" />

              <span>
                Available in stock
              </span>
            </label>

            <label className="stock-toggle">
              <input
                type="checkbox"
                name="inWeight"
                checked={
                  Boolean(
                    form.inWeight
                  )
                }
                onChange={
                  handleChange
                }
              />

              <span className="stock-toggle-control" />

              <span>
                Weight based
              </span>
            </label>
          </div>
        </div>

        <button
          type="button"
          className="stock-save-btn"
          onClick={
            isEdit
              ? handleUpdate
              : handleAdd
          }
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="stock-spinner" />

              {isEdit
                ? "Updating..."
                : "Saving..."}
            </>
          ) : (
            <>
              <FiCheckCircle />

              {isEdit
                ? "Update Product"
                : "Save Product"}
            </>
          )}
        </button>
      </>
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className={`stock-page ${
        darkMode
          ? "stock-dark"
          : ""
      }`}
    >
      {/* =====================================
          TOAST
      ====================================== */}

      {toast.msg && (
        <div
          className={`stock-toast ${
            toast.type ===
            "success"
              ? "stock-toast-success"
              : "stock-toast-error"
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.type ===
          "success" ? (
            <FiCheckCircle />
          ) : (
            <FiAlertCircle />
          )}

          <span>
            {toast.msg}
          </span>
        </div>
      )}

      {/* =====================================
          TOPBAR
      ====================================== */}

      <header className="stock-topbar">
        <div className="stock-left-head">
          <button
            type="button"
            className="stock-back-btn"
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
            aria-label="Back to dashboard"
          >
            <FiArrowLeft />
          </button>

          <div>
            <span className="stock-page-label">
              INVENTORY
            </span>

            <h1>
              Stock
            </h1>

            <p>
              Manage products,
              pricing and inventory
            </p>
          </div>
        </div>

        <div className="stock-top-actions">
          <button
            type="button"
            className="stock-theme-btn"
            onClick={() =>
              setDarkMode(
                (
                  previous
                ) =>
                  !previous
              )
            }
            aria-label={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            title={
              darkMode
                ? "Light mode"
                : "Dark mode"
            }
          >
            {darkMode ? (
              <FiSun />
            ) : (
              <FiMoon />
            )}
          </button>

          <button
            type="button"
            className="stock-add-btn"
            onClick={
              openAddModal
            }
          >
            <FiPlus />

            <span>
              Add Product
            </span>
          </button>
        </div>
      </header>

      {/* =====================================
          SUMMARY
      ====================================== */}

      <section className="stock-summary">
        <div className="stock-summary-card">
          <div className="stock-summary-icon stock-summary-blue">
            <FiPackage />
          </div>

          <div>
            <span>
              Total Products
            </span>

            <strong>
              {totalProducts}
            </strong>
          </div>
        </div>

        <div className="stock-summary-card">
          <div className="stock-summary-icon stock-summary-green">
            <FiCheckCircle />
          </div>

          <div>
            <span>
              In Stock
            </span>

            <strong>
              {inStockCount}
            </strong>
          </div>
        </div>

        <div className="stock-summary-card">
          <div className="stock-summary-icon stock-summary-orange">
            <FiAlertCircle />
          </div>

          <div>
            <span>
              Low Stock
            </span>

            <strong>
              {lowStockCount}
            </strong>
          </div>
        </div>
      </section>

      {/* =====================================
          SEARCH
      ====================================== */}

      <div className="stock-search-box">
        <FiSearch />

        <input
          type="search"
          placeholder="Search product or category..."
          value={search}
          onChange={(
            event
          ) =>
            setSearch(
              event.target
                .value
            )
          }
        />

        {search && (
          <button
            type="button"
            className="stock-search-clear"
            onClick={() =>
              setSearch("")
            }
            aria-label="Clear search"
          >
            <FiX />
          </button>
        )}
      </div>

      {/* =====================================
          LOADING
      ====================================== */}

      {loading && (
        <div className="stock-state">
          <div className="stock-loader" />

          <h3>
            Loading stock
          </h3>

          <p>
            Getting your latest
            products...
          </p>
        </div>
      )}

      {/* =====================================
          EMPTY
      ====================================== */}

      {!loading &&
        filtered.length ===
          0 && (
          <div className="stock-state">
            <div className="stock-state-icon">
              <FiPackage />
            </div>

            <h3>
              {search
                ? "No products found"
                : "No products yet"}
            </h3>

            <p>
              {search
                ? "Try another product name or category."
                : "Add your first product to start managing inventory."}
            </p>

            {!search && (
              <button
                type="button"
                className="stock-empty-add"
                onClick={
                  openAddModal
                }
              >
                <FiPlus />

                Add Product
              </button>
            )}
          </div>
        )}

      {/* =====================================
          PRODUCT GRID
      ====================================== */}

      {!loading &&
        filtered.length >
          0 && (
          <section className="stock-product-grid">
            {filtered.map(
              (item) => {
                const stockQty =
                  Number(
                    item?.stockQty ||
                      0
                  );

                const isLowStock =
                  stockQty <= 5;

                const inStock =
                  Boolean(
                    item?.inStock
                  ) &&
                  stockQty > 0;

                const supplierCount =
                  wholesalers[
                    item?.category
                  ]?.length || 0;

                return (
                  <article
                    className="stock-product-card"
                    key={
                      item._id
                    }
                  >
                    {/* HEAD */}

                    <div className="stock-card-head">
                      <div className="stock-product-title">
                        <div className="stock-product-icon">
                          <FiPackage />
                        </div>

                        <div>
                          <h2>
                            {item?.name ||
                              "Unnamed Product"}
                          </h2>

                          <span>
                            {item?.category ||
                              "Uncategorized"}
                          </span>
                        </div>
                      </div>

                      <div className="stock-card-actions">
                        <button
                          type="button"
                          className="stock-icon-btn stock-edit-btn"
                          onClick={() =>
                            openEdit(
                              item
                            )
                          }
                          aria-label="Edit product"
                          title="Edit product"
                        >
                          <FiEdit2 />
                        </button>

                        <button
                          type="button"
                          className="stock-icon-btn stock-delete-btn"
                          disabled={
                            deletingId ===
                            item._id
                          }
                          onClick={() =>
                            handleDelete(
                              item._id
                            )
                          }
                          aria-label="Delete product"
                          title="Delete product"
                        >
                          {deletingId ===
                          item._id ? (
                            <span className="stock-mini-spinner" />
                          ) : (
                            <FiTrash2 />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* TAGS */}

                    <div className="stock-tags">
                      <span className="stock-category-pill">
                        {item?.category ||
                          "General"}
                      </span>

                      <span
                        className={`stock-availability-pill ${
                          inStock
                            ? "stock-in-stock"
                            : "stock-out-stock"
                        }`}
                      >
                        {inStock
                          ? "In Stock"
                          : "Out of Stock"}
                      </span>
                    </div>

                    {/* DESCRIPTION */}

                    {item?.description && (
                      <p className="stock-description">
                        {
                          item.description
                        }
                      </p>
                    )}

                    {/* STATS */}

                    <div className="stock-mini-grid">
                      <div>
                        <small>
                          Selling
                        </small>

                        <strong>
                          {formatMoney(
                            item?.selling
                          )}
                        </strong>
                      </div>

                      <div>
                        <small>
                          Profit
                        </small>

                        <strong>
                          {formatMoney(
                            item?.profit
                          )}
                        </strong>
                      </div>

                      <div>
                        <small>
                          Stock
                        </small>

                        <strong>
                          {stockQty}
                        </strong>
                      </div>
                    </div>

                    {/* RETAILER ORDER */}

                    {isRetailer && (
                      <div
                        className={`stock-order-box ${
                          isLowStock
                            ? "stock-low-stock"
                            : ""
                        }`}
                      >
                        <div className="stock-order-copy">
                          <div className="stock-order-status">
                            <FiAlertCircle />

                            <span>
                              {isLowStock
                                ? "Low Stock"
                                : "Need Extra Stock?"}
                            </span>
                          </div>

                          <p>
                            {isLowStock
                              ? "Your stock is running low. Reorder now."
                              : "Order additional stock in advance."}
                          </p>

                          {supplierCount >
                            0 && (
                            <small>
                              {
                                supplierCount
                              }{" "}
                              wholesaler
                              {supplierCount ===
                              1
                                ? ""
                                : "s"}{" "}
                              available
                            </small>
                          )}
                        </div>

                        <button
                          type="button"
                          className="stock-order-btn"
                          onClick={() =>
                            handleOrderNow(
                              item
                            )
                          }
                          disabled={
                            Boolean(
                              orderingId
                            )
                          }
                        >
                          {orderingId ===
                          item._id ? (
                            <>
                              <span className="stock-spinner" />

                              Ordering...
                            </>
                          ) : (
                            <>
                              <FiShoppingCart />

                              Order Now
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </article>
                );
              }
            )}
          </section>
        )}

      {/* =====================================
          ADD MODAL
      ====================================== */}

      {open && (
        <div
          className="stock-modal-bg"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeAddModal();
            }
          }}
        >
          <div
            className="stock-modal-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="stock-add-title"
          >
            <div className="stock-modal-head">
              <div>
                <span>
                  INVENTORY
                </span>

                <h2 id="stock-add-title">
                  Add Product
                </h2>

                <p>
                  Add a new item to
                  your stock.
                </p>
              </div>

              <button
                type="button"
                className="stock-modal-close"
                onClick={
                  closeAddModal
                }
                disabled={saving}
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>

            {renderProductForm(
              "add"
            )}
          </div>
        </div>
      )}

      {/* =====================================
          EDIT MODAL
      ====================================== */}

      {editOpen && (
        <div
          className="stock-modal-bg"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeEditModal();
            }
          }}
        >
          <div
            className="stock-modal-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="stock-edit-title"
          >
            <div className="stock-modal-head">
              <div>
                <span>
                  INVENTORY
                </span>

                <h2 id="stock-edit-title">
                  Edit Product
                </h2>

                <p>
                  Update product,
                  pricing or stock
                  information.
                </p>
              </div>

              <button
                type="button"
                className="stock-modal-close"
                onClick={
                  closeEditModal
                }
                disabled={saving}
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>

            {renderProductForm(
              "edit"
            )}
          </div>
        </div>
      )}
    </div>
  );
}