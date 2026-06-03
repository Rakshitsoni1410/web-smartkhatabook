import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaSearch, FaStore, FaShoppingCart, FaPlus, FaMinus,
  FaTimes, FaSpinner, FaCheckCircle, FaBoxOpen,
} from "react-icons/fa";

const API = "https://backend-of-smartkhata-book-vkcv.vercel.app/api";

const CustomerProducts = () => {
  const [retailers, setRetailers] = useState([]);
  const [selectedRetailer, setSelectedRetailer] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get(`${API}/customer-portal/my-retailers`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      const list = res.data.retailers || [];
      setRetailers(list);
      if (list.length > 0) setSelectedRetailer(list[0]);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedRetailer) return;
    setProductsLoading(true);
    setCart({});
    axios.get(`${API}/customer-portal/retailer/${selectedRetailer._id}/products`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => setProducts(res.data.products || []))
      .catch(console.error)
      .finally(() => setProductsLoading(false));
  }, [selectedRetailer]);

  const updateCart = (id, delta) =>
    setCart((prev) => {
      const next = (prev[id] || 0) + delta;
      if (next <= 0) { const { [id]: _, ...rest } = prev; return rest; }
      return { ...prev, [id]: next };
    });

  const cartItems = Object.entries(cart).map(([id, qty]) => ({
    product: products.find((p) => p._id === id), qty,
  }));
  const cartTotal = cartItems.reduce((s, { product, qty }) => s + (product?.price || 0) * qty, 0);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const placeOrder = async () => {
    setPlacing(true);
    try {
      await axios.post(`${API}/customer-portal/orders`, {
        retailerId: selectedRetailer._id,
        items: cartItems.map(({ product, qty }) => ({
          productId: product._id, name: product.name, price: product.price, quantity: qty,
        })),
        totalAmount: cartTotal,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setCart({}); setCartOpen(false); setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 3500);
    } catch (err) { console.error(err); }
    finally { setPlacing(false); }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <FaSpinner className="animate-spin text-indigo-500 text-3xl" />
    </div>
  );

  return (
    <div className="space-y-5">
      {orderSuccess && (
        <div className="fixed top-5 right-5 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <FaCheckCircle /> Order placed successfully!
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Browse Products</h1>
          <p className="text-sm text-gray-500 mt-1">Shop from your connected retailers</p>
        </div>
        {cartCount > 0 && (
          <button onClick={() => setCartOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium shadow-md">
            <FaShoppingCart /> Cart
            <span className="bg-white text-indigo-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">{cartCount}</span>
          </button>
        )}
      </div>
      {retailers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <FaStore className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No retailers connected yet</p>
          <p className="text-sm text-gray-400 mt-1">A retailer needs to add you as a customer first.</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {retailers.map((r) => (
              <button key={r._id} onClick={() => setSelectedRetailer(r)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all
                  ${selectedRetailer?._id === r._id ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"}`}>
                <FaStore className="text-xs" />{r.name}
              </button>
            ))}
          </div>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
          </div>
          {productsLoading ? (
            <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-indigo-400 text-2xl" /></div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No products found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const qty = cart[product._id] || 0;
                const oos = product.quantity === 0;
                return (
                  <div key={product._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition">
                    <div className="w-full h-32 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <FaBoxOpen className="text-3xl text-indigo-300" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm truncate">{product.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{product.category || "General"}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-indigo-700 font-bold text-base">₹{product.price}</span>
                      {oos ? <span className="text-xs text-red-400 font-medium">Out of stock</span>
                        : qty === 0 ? (
                          <button onClick={() => updateCart(product._id, 1)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
                            <FaPlus /> Add
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateCart(product._id, -1)}
                              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 flex items-center justify-center">
                              <FaMinus size={10} />
                            </button>
                            <span className="text-sm font-bold w-5 text-center">{qty}</span>
                            <button onClick={() => updateCart(product._id, 1)}
                              className="w-7 h-7 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-700 flex items-center justify-center">
                              <FaPlus size={10} />
                            </button>
                          </div>
                        )}
                    </div>
                    {product.quantity <= 5 && product.quantity > 0 && (
                      <p className="text-xs text-orange-500 font-medium">Only {product.quantity} left!</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="flex-1 bg-black bg-opacity-40" onClick={() => setCartOpen(false)} />
          <div className="w-full max-w-sm bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-bold text-gray-800 text-lg">Your Cart</h2>
              <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-red-500"><FaTimes /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {cartItems.map(({ product, qty }) => product ? (
                <div key={product._id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">₹{product.price} × {qty}</p>
                  </div>
                  <p className="font-semibold text-sm text-indigo-700 whitespace-nowrap">₹{product.price * qty}</p>
                  <button onClick={() => setCart((p) => { const { [product._id]: _, ...r } = p; return r; })}
                    className="text-gray-300 hover:text-red-400"><FaTimes size={12} /></button>
                </div>
              ) : null)}
            </div>
            <div className="px-5 py-4 border-t space-y-3">
              <div className="flex justify-between font-bold text-gray-800">
                <span>Total</span><span>₹{cartTotal}</span>
              </div>
              <p className="text-xs text-gray-400">Order from: <strong>{selectedRetailer?.name}</strong></p>
              <button onClick={placeOrder} disabled={placing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
                {placing ? <FaSpinner className="animate-spin" /> : <FaShoppingCart />}
                {placing ? "Placing..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProducts;