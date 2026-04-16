import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiSearch,
  FiPlus,
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import "./Stock.css";

export default function Stock() {
  const navigate = useNavigate();

  const user =
    JSON.parse(localStorage.getItem("user")) || {};

  const [products, setProducts] =
    useState([]);

  const [wholesalers, setWholesalers] =
    useState({});

  const [suggestions, setSuggestions] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [open, setOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [selected, setSelected] =
    useState(null);

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
        `http://localhost:4000/api/product/list/${user._id}`
      );

      const data =
        res.data.products || [];

      setProducts(data);

      data.forEach((item) => {
        fetchWholesalers(
          item.category
        );
      });
    } catch (error) {
      console.log(error);
    }
  };

  const fetchWholesalers =
    async (category) => {
      try {
        const res =
          await axios.get(
            `http://localhost:4000/api/user/wholesalers/${category}`
          );

        setWholesalers(
          (prev) => ({
            ...prev,
            [category]:
              res.data.users ||
              [],
          })
        );
      } catch (error) {
        console.log(error);
      }
    };

  const fetchSuggestions =
    async () => {
      try {
        const res =
          await axios.get(
            `http://localhost:4000/api/product/suggestions/${user._id}`
          );

        setSuggestions(
          res.data
            .suggestions || []
        );
      } catch (error) {
        console.log(error);
      }
    };

  const resetForm = () => {
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
  };

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  const handleAdd = async () => {
    try {
      await axios.post(
        "http://localhost:4000/api/product/add",
        {
          ownerId: user._id,
          businessType:
            user.businessType,
          ...form,
        }
      );

      setOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.log(error);
    }
  };

  const openEdit = (item) => {
    setSelected(item);

    setForm({
      name: item.name,
      category:
        item.category,
      description:
        item.description,
      purchase:
        item.purchase,
      selling:
        item.selling,
      stockQty:
        item.stockQty,
      inStock:
        item.inStock,
      inWeight:
        item.inWeight,
      weight:
        item.weight,
      weightUnit:
        item.weightUnit ||
        "kg",
    });

    setEditOpen(true);
  };

  const handleUpdate =
    async () => {
      try {
        await axios.put(
          `http://localhost:4000/api/product/update/${selected._id}`,
          form
        );

        setEditOpen(false);
        fetchProducts();
      } catch (error) {
        console.log(error);
      }
    };

  const handleDelete =
    async (id) => {
      try {
        await axios.delete(
          `http://localhost:4000/api/product/delete/${id}`
        );

        fetchProducts();
      } catch (error) {
        console.log(error);
      }
    };

  const filtered =
    products.filter(
      (item) =>
        item.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  return (
    <div className="stock-page">

      {/* TOPBAR */}
      <div className="stock-topbar">

        <div className="left-head">

          <button
            className="back-btn"
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
          >
            <FiArrowLeft />
          </button>

          <h2>Stock</h2>

        </div>

        <button
          className="add-btn"
          onClick={() =>
            setOpen(true)
          }
        >
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
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>

      {/* GRID */}
      <div className="product-grid">

        {filtered.map((item) => (
          <div
            className="product-card"
            key={item._id}
          >

            {/* HEADER */}
            <div className="card-head">

              <h3>{item.name}</h3>

              <div className="card-actions">

                <button
                  className="icon-btn edit-mini"
                  onClick={() =>
                    openEdit(
                      item
                    )
                  }
                >
                  <FiEdit2 />
                </button>

                <button
                  className="icon-btn delete-mini"
                  onClick={() =>
                    handleDelete(
                      item._id
                    )
                  }
                >
                  <FiTrash2 />
                </button>

              </div>

            </div>

            {/* TAGS */}
            <div className="tags">

              <span>
                {item.category}
              </span>

              <span className="green">
                {item.inStock
                  ? "In Stock"
                  : "Out"}
              </span>

            </div>

            {/* STATS */}
            <div className="mini-grid">

              <div>
                <small>Selling</small>
                <p>
                  ₹{item.selling}
                </p>
              </div>

              <div>
                <small>Profit</small>
                <p>
                  ₹{item.profit}
                </p>
              </div>

              <div>
                <small>Stock</small>
                <p>
                  {
                    item.stockQty
                  }
                </p>
              </div>

            </div>

            {/* RETAILER */}
            {user.role
              ?.trim()
              .toLowerCase() ===
              "retailer" && (
              <div className="low-stock-box">

                {Number(
                  item.stockQty
                ) <= 5 ? (
                  <p>
                    ⚠️ Low
                    Stock!
                    Reorder
                    now.
                  </p>
                ) : (
                  <p>
                    📦 Need
                    Extra
                    Stock?
                    Order in
                    advance.
                  </p>
                )}

                <div className="whole-list">

                  {wholesalers[
                    item
                      .category
                  ]?.length >
                  0 ? (
                    wholesalers[
                      item
                        .category
                    ].map(
                      (
                        shop
                      ) => (
                        <div
                          className="whole-card"
                          key={
                            shop._id
                          }
                        >

                          <h4>
                            {
                              shop.shopName
                            }
                          </h4>

                          <span>
                            {
                              shop.address
                            }
                          </span>

                          <button
                            onClick={() =>
                              navigate(
                                `/wholesalers/${item.category}`
                              )
                            }
                          >
                            Order
                            Now
                          </button>

                        </div>
                      )
                    )
                  ) : (
                    <p>
                      No
                      wholesalers
                      found
                    </p>
                  )}

                </div>

              </div>
            )}

          </div>
        ))}

      </div>

      {/* ADD MODAL */}
      {open && (
        <div className="modal-bg">

          <div className="modal-box">

            <div className="modal-head">

              <h3>
                Add Product
              </h3>

              <FiX
                onClick={() =>
                  setOpen(false)
                }
              />

            </div>

            <div className="suggest-box">

              <p>
                Suggested
                for{" "}
                {
                  user.businessType
                }
              </p>

              <div className="chips">

                {suggestions.map(
                  (
                    item,
                    index
                  ) => (
                    <span
                      key={index}
                      onClick={() =>
                        setForm({
                          name:
                            item.name,
                          category:
                            item.category,
                          description:
                            item.description,
                          purchase:
                            item.purchase,
                          selling:
                            item.selling,
                          stockQty:
                            item.stockQty,
                          inStock: true,
                          inWeight:
                            item.inWeight,
                          weight:
                            item.weight,
                          weightUnit:
                            item.weightUnit,
                        })
                      }
                    >
                      {item.name}
                    </span>
                  )
                )}

              </div>

            </div>

            <div className="form-grid">

              <input
                name="name"
                placeholder="Product Name"
                value={form.name}
                onChange={
                  handleChange
                }
              />

              <input
                name="category"
                placeholder="Category"
                value={
                  form.category
                }
                onChange={
                  handleChange
                }
              />

              <input
                name="purchase"
                placeholder="Purchase ₹"
                value={
                  form.purchase
                }
                onChange={
                  handleChange
                }
              />

              <input
                name="selling"
                placeholder="Selling ₹"
                value={
                  form.selling
                }
                onChange={
                  handleChange
                }
              />

              <input
                name="stockQty"
                placeholder="Stock Qty"
                value={
                  form.stockQty
                }
                onChange={
                  handleChange
                }
              />

              <input
                name="description"
                placeholder="Description"
                value={
                  form.description
                }
                onChange={
                  handleChange
                }
              />

            </div>

            <button
              className="save-btn"
              onClick={
                handleAdd
              }
            >
              Save Product
            </button>

          </div>

        </div>
      )}

      {/* EDIT MODAL */}
      {editOpen && (
        <div className="modal-bg">

          <div className="modal-box">

            <div className="modal-head">

              <h3>
                Edit Product
              </h3>

              <FiX
                onClick={() =>
                  setEditOpen(
                    false
                  )
                }
              />

            </div>

            <div className="form-grid">

              <input
                name="name"
                value={form.name}
                onChange={
                  handleChange
                }
              />

              <input
                name="category"
                value={
                  form.category
                }
                onChange={
                  handleChange
                }
              />

              <input
                name="purchase"
                value={
                  form.purchase
                }
                onChange={
                  handleChange
                }
              />

              <input
                name="selling"
                value={
                  form.selling
                }
                onChange={
                  handleChange
                }
              />

              <input
                name="stockQty"
                value={
                  form.stockQty
                }
                onChange={
                  handleChange
                }
              />

              <input
                name="description"
                value={
                  form.description
                }
                onChange={
                  handleChange
                }
              />

            </div>

            <button
              className="save-btn"
              onClick={
                handleUpdate
              }
            >
              Update Product
            </button>

          </div>

        </div>
      )}

    </div>
  );
}