import React, { useEffect, useMemo, useState } from "react";
import api from "../../api";
import {
  FaSearch,
  FaStore,
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaBoxOpen,
  FaExclamationTriangle,
  FaRedo,
} from "react-icons/fa";

const API = "/api";

const CustomerProducts = () => {
  const [retailers, setRetailers] = useState([]);
  const [selectedRetailer, setSelectedRetailer] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState({});

  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [placing, setPlacing] = useState(false);

  const [cartOpen, setCartOpen] = useState(false);

  const [orderSuccess, setOrderSuccess] = useState(false);

  const [retailerError, setRetailerError] = useState("");
  const [productsError, setProductsError] = useState("");
  const [orderError, setOrderError] = useState("");

  // =====================================================
  // HELPERS
  // =====================================================

  const formatCurrency = (amount = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  const getProductPrice = (product) => {
    return Number(
      product?.price ??
        product?.selling ??
        product?.pricePerUnit ??
        0
    );
  };

  const getProductStock = (product) => {
    return Number(
      product?.quantity ??
        product?.stockQty ??
        0
    );
  };

  const getProductName = (product) => {
    return String(
      product?.name ||
        product?.productName ||
        "Product"
    );
  };

  const getRetailerName = (retailer) => {
    return (
      retailer?.shopName ||
      retailer?.name ||
      "Retailer"
    );
  };

  // =====================================================
  // FETCH RETAILERS
  // =====================================================

  const fetchRetailers = async () => {
    try {
      setLoading(true);
      setRetailerError("");

      const res = await api.get(
        `${API}/customer-portal/my-retailers`
      );

      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.retailers || [];

      setRetailers(list);

      if (list.length > 0) {
        setSelectedRetailer((current) => {
          if (
            current &&
            list.some(
              (retailer) =>
                retailer._id === current._id
            )
          ) {
            return current;
          }

          return list[0];
        });
      } else {
        setSelectedRetailer(null);
        setProducts([]);
        setCart({});
      }
    } catch (err) {
      console.error(
        "Failed to fetch customer retailers:",
        err
      );

      setRetailers([]);
      setSelectedRetailer(null);
      setProducts([]);

      setRetailerError(
        err.response?.data?.message ||
          "Unable to load your retailers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRetailers();
  }, []);

  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

  const fetchProducts = async (retailerId) => {
    if (!retailerId) {
      setProducts([]);
      return;
    }

    try {
      setProductsLoading(true);
      setProductsError("");
      setOrderError("");

      const res = await api.get(
        `${API}/customer-portal/retailer/${retailerId}/products`
      );

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.products || [];

      setProducts(data);
    } catch (err) {
      console.error(
        "Failed to fetch retailer products:",
        err
      );

      setProducts([]);

      setProductsError(
        err.response?.data?.message ||
          "Unable to load products for this retailer."
      );
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedRetailer?._id) {
      return;
    }

    setCart({});
    setCartOpen(false);
    setSearch("");

    fetchProducts(selectedRetailer._id);
  }, [selectedRetailer]);

  // =====================================================
  // CART
  // =====================================================

  const updateCart = (id, delta) => {
    setCart((prev) => {
      const product = products.find(
        (item) => item._id === id
      );

      if (!product) {
        return prev;
      }

      const stock =
        getProductStock(product);

      const currentQty =
        Number(prev[id] || 0);

      const next =
        currentQty + delta;

      if (next <= 0) {
        const {
          [id]: removed,
          ...rest
        } = prev;

        return rest;
      }

      if (stock <= 0) {
        return prev;
      }

      if (next > stock) {
        return prev;
      }

      return {
        ...prev,
        [id]: next,
      };
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => {
      const {
        [id]: removed,
        ...rest
      } = prev;

      return rest;
    });
  };

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([id, qty]) => ({
        product: products.find(
          (product) =>
            product._id === id
        ),
        qty: Number(qty),
      }))
      .filter(
        ({ product, qty }) =>
          product && qty > 0
      );
  }, [cart, products]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (sum, { product, qty }) =>
        sum +
        getProductPrice(product) *
          qty,
      0
    );
  }, [cartItems]);

  const cartCount = useMemo(() => {
    return Object.values(cart).reduce(
      (sum, qty) =>
        sum + Number(qty || 0),
      0
    );
  }, [cart]);

  // =====================================================
  // PLACE ORDER
  // =====================================================

  const placeOrder = async () => {
    if (!selectedRetailer?._id) {
      setOrderError(
        "Please select a retailer first."
      );
      return;
    }

    if (cartItems.length === 0) {
      setOrderError(
        "Your cart is empty."
      );
      return;
    }

    try {
      setPlacing(true);
      setOrderError("");

      await api.post(
        `${API}/customer-portal/orders`,
        {
          retailerId:
            selectedRetailer._id,

          items: cartItems.map(
            ({
              product,
              qty,
            }) => ({
              productId:
                product._id,

              name:
                getProductName(
                  product
                ),

              price:
                getProductPrice(
                  product
                ),

              quantity:
                qty,
            })
          ),

          totalAmount:
            cartTotal,
        }
      );

      setCart({});
      setCartOpen(false);
      setOrderSuccess(true);

      setTimeout(() => {
        setOrderSuccess(false);
      }, 3500);

      // Refresh stock after order
      await fetchProducts(
        selectedRetailer._id
      );
    } catch (err) {
      console.error(
        "Failed to place order:",
        err
      );

      setOrderError(
        err.response?.data?.message ||
          "Unable to place your order. Please try again."
      );
    } finally {
      setPlacing(false);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredProducts = useMemo(() => {
    const term = search
      .trim()
      .toLowerCase();

    if (!term) {
      return products;
    }

    return products.filter(
      (product) =>
        getProductName(product)
          .toLowerCase()
          .includes(term) ||
        String(
          product?.category || ""
        )
          .toLowerCase()
          .includes(term)
    );
  }, [products, search]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <FaSpinner className="animate-spin text-indigo-500 text-3xl" />

        <p className="text-sm text-gray-500">
          Loading marketplace...
        </p>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-5">
      {/* Success */}

      {orderSuccess && (
        <div className="fixed top-5 right-5 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <FaCheckCircle />

          Order placed successfully!
        </div>
      )}

      {/* Header */}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Browse Products
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Shop from your connected retailers
          </p>
        </div>

        {cartCount > 0 && (
          <button
            type="button"
            onClick={() =>
              setCartOpen(true)
            }
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium shadow-md"
          >
            <FaShoppingCart />

            Cart

            <span className="bg-white text-indigo-600 rounded-full min-w-5 h-5 px-1 flex items-center justify-center text-xs font-bold">
              {cartCount}
            </span>
          </button>
        )}
      </div>

      {/* Retailer Error */}

      {retailerError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-red-500 mt-0.5" />

            <div>
              <p className="text-sm font-semibold text-red-700">
                Unable to load retailers
              </p>

              <p className="text-xs text-red-500 mt-1">
                {retailerError}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchRetailers}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
          >
            <FaRedo />
            Retry
          </button>
        </div>
      )}

      {/* No retailers */}

      {!retailerError &&
      retailers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <FaStore className="text-4xl text-gray-300 mx-auto mb-3" />

          <p className="text-gray-500 font-medium">
            No retailers connected yet
          </p>

          <p className="text-sm text-gray-400 mt-1">
            A retailer needs to add you as a customer first.
          </p>
        </div>
      ) : (
        retailers.length > 0 && (
          <>
            {/* Retailer selector */}

            <div className="flex gap-2 overflow-x-auto pb-1">
              {retailers.map(
                (retailer) => (
                  <button
                    type="button"
                    key={
                      retailer._id
                    }
                    onClick={() =>
                      setSelectedRetailer(
                        retailer
                      )
                    }
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      selectedRetailer?._id ===
                      retailer._id
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                        : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    <FaStore className="text-xs" />

                    {getRetailerName(
                      retailer
                    )}
                  </button>
                )
              )}
            </div>

            {/* Search */}

            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              />
            </div>

            {/* Product error */}

            {productsError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="text-red-500 mt-0.5" />

                  <div>
                    <p className="text-sm font-semibold text-red-700">
                      Unable to load products
                    </p>

                    <p className="text-xs text-red-500 mt-1">
                      {productsError}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    fetchProducts(
                      selectedRetailer?._id
                    )
                  }
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
                >
                  <FaRedo />
                  Retry
                </button>
              </div>
            )}

            {/* Products */}

            {productsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <FaSpinner className="animate-spin text-indigo-400 text-2xl" />

                <p className="text-sm text-gray-400">
                  Loading products...
                </p>
              </div>
            ) : filteredProducts.length ===
              0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-16 text-center">
                <FaBoxOpen className="text-4xl text-gray-300 mx-auto mb-3" />

                <p className="text-gray-500 font-medium">
                  No products found
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  {search
                    ? "Try another search."
                    : "This retailer currently has no products available."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(
                  (product) => {
                    const qty =
                      Number(
                        cart[
                          product._id
                        ] || 0
                      );

                    const price =
                      getProductPrice(
                        product
                      );

                    const stock =
                      getProductStock(
                        product
                      );

                    const oos =
                      stock <= 0;

                    return (
                      <div
                        key={
                          product._id
                        }
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition"
                      >
                        <div className="w-full h-32 bg-indigo-50 rounded-xl flex items-center justify-center">
                          <FaBoxOpen className="text-3xl text-indigo-300" />
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800 text-sm truncate">
                            {getProductName(
                              product
                            )}
                          </p>

                          <p className="text-xs text-gray-400 mt-0.5">
                            {product.category ||
                              "General"}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-auto gap-2">
                          <span className="text-indigo-700 font-bold text-base">
                            {formatCurrency(
                              price
                            )}
                          </span>

                          {oos ? (
                            <span className="text-xs text-red-500 font-medium">
                              Out of stock
                            </span>
                          ) : qty ===
                            0 ? (
                            <button
                              type="button"
                              onClick={() =>
                                updateCart(
                                  product._id,
                                  1
                                )
                              }
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1"
                            >
                              <FaPlus />
                              Add
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                aria-label="Decrease quantity"
                                onClick={() =>
                                  updateCart(
                                    product._id,
                                    -1
                                  )
                                }
                                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 flex items-center justify-center"
                              >
                                <FaMinus
                                  size={
                                    10
                                  }
                                />
                              </button>

                              <span className="text-sm font-bold w-5 text-center">
                                {qty}
                              </span>

                              <button
                                type="button"
                                aria-label="Increase quantity"
                                disabled={
                                  qty >=
                                  stock
                                }
                                onClick={() =>
                                  updateCart(
                                    product._id,
                                    1
                                  )
                                }
                                className="w-7 h-7 rounded-lg bg-indigo-100 hover:bg-indigo-200 disabled:opacity-40 text-indigo-700 flex items-center justify-center"
                              >
                                <FaPlus
                                  size={
                                    10
                                  }
                                />
                              </button>
                            </div>
                          )}
                        </div>

                        {stock <= 5 &&
                          stock >
                            0 && (
                            <p className="text-xs text-orange-500 font-medium">
                              Only{" "}
                              {
                                stock
                              }{" "}
                              left!
                            </p>
                          )}
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </>
        )
      )}

      {/* Cart Drawer */}

      {cartOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <button
            type="button"
            aria-label="Close cart"
            className="flex-1 bg-black bg-opacity-40"
            onClick={() =>
              setCartOpen(false)
            }
          />

          <div className="w-full max-w-sm bg-white shadow-2xl flex flex-col">
            {/* Cart Header */}

            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <h2 className="font-bold text-gray-800 text-lg">
                  Your Cart
                </h2>

                <p className="text-xs text-gray-400 mt-0.5">
                  {cartCount}{" "}
                  {cartCount === 1
                    ? "item"
                    : "items"}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close cart"
                onClick={() =>
                  setCartOpen(false)
                }
                className="text-gray-400 hover:text-red-500"
              >
                <FaTimes />
              </button>
            </div>

            {/* Order Error */}

            {orderError && (
              <div className="mx-5 mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2">
                <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />

                <p className="text-xs text-red-600">
                  {orderError}
                </p>
              </div>
            )}

            {/* Cart Items */}

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {cartItems.length ===
              0 ? (
                <div className="text-center py-12">
                  <FaShoppingCart className="text-4xl text-gray-200 mx-auto mb-3" />

                  <p className="text-sm text-gray-400">
                    Your cart is empty.
                  </p>
                </div>
              ) : (
                cartItems.map(
                  ({
                    product,
                    qty,
                  }) => {
                    const price =
                      getProductPrice(
                        product
                      );

                    return (
                      <div
                        key={
                          product._id
                        }
                        className="flex items-center gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {getProductName(
                              product
                            )}
                          </p>

                          <p className="text-xs text-gray-400">
                            {formatCurrency(
                              price
                            )}{" "}
                            ×{" "}
                            {qty}
                          </p>
                        </div>

                        <p className="font-semibold text-sm text-indigo-700 whitespace-nowrap">
                          {formatCurrency(
                            price *
                              qty
                          )}
                        </p>

                        <button
                          type="button"
                          aria-label="Remove item"
                          onClick={() =>
                            removeFromCart(
                              product._id
                            )
                          }
                          className="text-gray-300 hover:text-red-400"
                        >
                          <FaTimes
                            size={
                              12
                            }
                          />
                        </button>
                      </div>
                    );
                  }
                )
              )}
            </div>

            {/* Footer */}

            <div className="px-5 py-4 border-t space-y-3">
              <div className="flex justify-between font-bold text-gray-800">
                <span>
                  Total
                </span>

                <span>
                  {formatCurrency(
                    cartTotal
                  )}
                </span>
              </div>

              <p className="text-xs text-gray-400">
                Order from:{" "}
                <strong>
                  {getRetailerName(
                    selectedRetailer
                  )}
                </strong>
              </p>

              <button
                type="button"
                onClick={
                  placeOrder
                }
                disabled={
                  placing ||
                  cartItems.length ===
                    0
                }
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                {placing ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaShoppingCart />
                )}

                {placing
                  ? "Placing..."
                  : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProducts;