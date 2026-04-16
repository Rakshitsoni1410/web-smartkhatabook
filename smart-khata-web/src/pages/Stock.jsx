import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiSearch, FiPlus, FiX, FiArrowLeft } from "react-icons/fi";
import "./Stock.css";

export default function Stock() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const [form, setForm] = useState({
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

  useEffect(() => {
    fetchProducts();
    fetchSuggestions();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        `http://localhost:4000/api/product/list/${user._id}`,
      );

      setProducts(res.data.products);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await axios.get(
        `http://localhost:4000/api/product/suggestions/${user._id}`,
      );

      setSuggestions(res.data.suggestions);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAdd = async () => {
    try {
      await axios.post("http://localhost:4000/api/product/add", {
        ownerId: user._id,
        businessType: user.businessType,
        ...form,
      });

      setOpen(false);

      setForm({
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

      fetchProducts();
    } catch (error) {
      console.log(error);
    }
  };

  const filtered = products.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="stock-page">
      {/* TOPBAR */}
      <div className="stock-topbar">
        <div className="left-head">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            <FiArrowLeft />
          </button>

          <h2>Stock</h2>
        </div>

        <button className="add-btn" onClick={() => setOpen(true)}>
          <FiPlus />
          Add Product
        </button>
      </div>

      {/* SEARCH */}
      <div className="search-box">
        <FiSearch />

        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* PRODUCT GRID */}
      <div className="product-grid">
        {filtered.map((item) => (
          <div className="product-card" key={item._id}>
            <h3>{item.name}</h3>

            <div className="tags">
              <span>{item.category}</span>

              <span className="green">{item.inStock ? "In Stock" : "Out"}</span>
            </div>

            <div className="mini-grid">
              <div>
                <small>Selling</small>
                <p>₹{item.selling}</p>
              </div>

              <div>
                <small>Profit</small>
                <p>₹{item.profit}</p>
              </div>

              <div>
                <small>Stock</small>
                <p>{item.stockQty}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {open && (
        <div className="modal-bg">
          <div className="modal-box">
            <div className="modal-head">
              <h3>Add Product</h3>

              <FiX onClick={() => setOpen(false)} />
            </div>

          
          {/* Suggestions */}
<div className="suggest-box">

  <p>
    Suggested for {user.businessType}
  </p>

  <div className="chips">

    {suggestions.map((item, index) => (
      <span
        key={index}
        onClick={() =>
          setForm({
            name: item.name,
            category: item.category,
            description: item.description,
            purchase: item.purchase,
            selling: item.selling,
            stockQty: item.stockQty,
            inStock: true,
            inWeight: item.inWeight,
            weight: item.weight,
            weightUnit: item.weightUnit,
          })
        }
      >
        {item.name}
      </span>
    ))}

  </div>

</div>

            {/* FORM */}
            <div className="form-grid">
              <input
                name="name"
                placeholder="Product Name"
                value={form.name}
                onChange={handleChange}
              />

              <input
                name="category"
                placeholder="Category"
                value={form.category}
                onChange={handleChange}
              />

              <input
                name="purchase"
                placeholder="Purchase ₹"
                value={form.purchase}
                onChange={handleChange}
              />

              <input
                name="selling"
                placeholder="Selling ₹"
                value={form.selling}
                onChange={handleChange}
              />

              <input
                name="stockQty"
                placeholder="Stock Qty"
                value={form.stockQty}
                onChange={handleChange}
              />

              <input
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            {/* Checkbox */}
            <div className="check-row">
              <label>
                <input
                  type="checkbox"
                  name="inStock"
                  checked={form.inStock}
                  onChange={handleChange}
                />
                In Stock
              </label>

              <label>
                <input
                  type="checkbox"
                  name="inWeight"
                  checked={form.inWeight}
                  onChange={handleChange}
                />
                Sell in Weight
              </label>
            </div>

            {/* Weight */}
            {form.inWeight && (
              <div className="form-grid">
                <input
                  name="weight"
                  placeholder="Weight"
                  value={form.weight}
                  onChange={handleChange}
                />

                <select
                  name="weightUnit"
                  value={form.weightUnit}
                  onChange={handleChange}
                >
                  <option>kg</option>
                  <option>g</option>
                  <option>ltr</option>
                </select>
              </div>
            )}

            <button className="save-btn" onClick={handleAdd}>
              Save Product
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
