# Smart Khata Book 🌐

**Smart Khata Book** is a modern MERN-stack business-management web application built for **Retailers**, **Wholesalers**, and **Customers**.

The web frontend is built with **React.js + Vite** and connects to the Smart Khata backend API for authentication, inventory management, smart supplier selection, order management, demo payments, billing, digital ledger tracking, employee management, attendance, in-app notifications, reports, reviews, and customer-facing business data.

> **Academic note:** All payment flows in this project are mock/demo workflows. No real money is transferred.

---

## 🌐 Live Project

| Resource    | Link                                               |
| ----------- | -------------------------------------------------- |
| Web App     | https://smartkhatabooks.netlify.app/               |
| Backend API | https://backend-of-smartkhata-book-vkcv.vercel.app |

---

## 🚀 Repositories

| Repository       | Link                                                          |
| ---------------- | ------------------------------------------------------------- |
| Web Frontend     | https://github.com/Rakshitsoni1410/web-smartkhatabook         |
| Backend          | https://github.com/Rakshitsoni1410/backend-of-smartkhata-book |
| Flutter / Mobile | https://github.com/Rakshitsoni1410/smartkhatabook             |

---

## ⚙️ Installation

```bash
# 1. Clone the repository
git clone https://github.com/Rakshitsoni1410/web-smartkhatabook.git

# 2. Enter the project directory
cd web-smartkhatabook

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Development server runs at:

```
http://localhost:5173
```

### Production Build

```bash
npm run build
# Output → dist/
```

---

## 🛠️ Tech Stack

| Technology       | Usage                       |
| ---------------- | --------------------------- |
| React.js         | Frontend Library            |
| Vite             | Development & Build Tool    |
| React Router DOM | Navigation & Routing        |
| Axios            | Backend API Requests        |
| CSS3             | Styling                     |
| React Icons      | UI Icons                    |
| Local Storage    | Session & Theme Persistence |
| PWA              | Installable Web Experience  |
| Netlify          | Frontend Deployment         |

---

## 📁 Project Structure

```
web-smartkhatabook/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── GenerateBillButton.jsx
│   │   ├── FakePaymentModal.jsx
│   │   └── ...
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Stock.jsx
│   │   ├── Employees.jsx
│   │   ├── EmployeeDetail.jsx
│   │   ├── Orders.jsx
│   │   ├── OrderDetails.jsx
│   │   ├── Billing.jsx
│   │   ├── Ledger.jsx
│   │   ├── Report.jsx
│   │   ├── Reviews.jsx
│   │   └── ...
│   │
│   ├── api.js
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
├── vite.config.js
└── README.md
```

---

## ✨ Features

### 🔐 Authentication

- User Registration & Login
- Phone / Email login support
- Retailer / Wholesaler / Customer roles
- JWT authentication with protected routes
- Role-based access control
- Forgot password & OTP reset flow
- Automatic logout on `401` / session expiry
- Single active session enforcement

**Single Session Flow:**

```
Laptop Login
     ↓
Mobile Login with Same Account
     ↓
Mobile Becomes the Active Session
     ↓
Laptop Session Invalidated
     ↓
Laptop Automatically Logs Out
```

---

### 👥 User Roles

| Role       | Description                                                       |
| ---------- | ----------------------------------------------------------------- |
| Retailer   | Places orders, pays demo invoices, views bills & ledger           |
| Wholesaler | Manages products, approves orders, requests payments, sends bills |
| Customer   | Views account, ledger, and transaction history                    |

---

### 📊 Dashboard

Role-aware business overview featuring:

- Business summary & product statistics
- Order & inventory information
- Employee overview & recent activity
- Quick actions & review summary
- Responsive UI with dark mode support

---

### 📦 Product & Inventory Management

- Add / Edit / Delete products
- Search by name or category
- Purchase price, selling price, stock quantity
- Stock availability & low-stock alerts
- Responsive product cards with dark mode
- Retailers can initiate a restock order directly from the Stock page

---

### 🛒 Order Management

**Order lifecycle:**

```
Pending → Approved → Advance Pending → Processing → On The Way → Delivered → Completed
```

**Supported actions:**

- Place order (Smart Auto or Choose Myself)
- View & filter orders by status
- View order details
- Approve / Reject order
- Request & pay demo advance
- Mark On The Way / Delivered
- Request & complete demo final payment
- Generate / Send bill
- View payment history

---

### 🤝 Smart Supplier Selection

Two ordering modes are available when a retailer places an order.

#### ⚡ Smart Auto

The backend automatically selects an eligible wholesaler using a rule-based scoring strategy. Selection considers:

- Product availability & required quantity
- Selling price (with price-protection rule)
- Available stock
- Rating & review count
- Fair order distribution across suppliers

#### 👤 Choose Myself + Smart Suggestions

Retailers can browse available wholesaler recommendations and make the final decision themselves. Each suggestion shows:

- Shop / wholesaler name
- Current price & available stock
- Rating & review count
- Recommendation reasons & smart badge
- Price range indicator
- Estimated total for the chosen quantity

> The recommendation system is rule-based / heuristic — not a trained AI/ML model. The selected `wholesalerId` and `productId` are sent to the backend, which revalidates stock and price before creating the order.

**API calls:**

```js
// Smart Auto
await api.post("/api/orders/create", {
  productName,
  quantity,
  unit,
  selectionMode: "auto",
});

// Manual — step 1: get recommendations
const res = await api.post("/api/orders/recommendations", {
  productName,
  quantity,
});

// Manual — step 2: place order with chosen supplier
await api.post("/api/orders/create", {
  productName,
  quantity,
  unit,
  selectionMode: "manual",
  selectedWholesalerId,
  selectedProductId,
});
```

---

### 💳 Demo Payment Gateway

> ⚠️ **Demo only — no real money is transferred.**

Supported demo methods: **UPI · Card · Net Banking**

```
Retailer Clicks Pay
        ↓
Smart Khata Pay Opens
        ↓
Select Demo Method
        ↓
Confirm Demo Payment
        ↓
Processing...
        ↓
Payment Successful ✓
        ↓
Demo Transaction ID Generated (e.g. SKPAY-MABC123-XYZ89)
```

**Never enter real:** UPI PIN · CVV · Bank password · Real card credentials.

---

### 💰 Advance & Final Payment

**Advance:**

```
Wholesaler Requests Advance → Retailer Pays Demo → Advance Recorded → Order Processing
```

**Final:**

```
Order Delivered → Final Payment Requested → Retailer Pays Demo → Order Completed
```

The frontend shows advance percentage, advance amount, remaining balance, payment status, and transaction details.

---

### 🧾 Billing & Invoice Management

**Wholesaler flow:**

```
Order Delivered → Generate Bill → Send Bill → Retailer Sees Bill
```

Wholesaler can: Generate · Preview · Print · Send bill — and see the sent confirmation.

**Retailer view** (bills visible only after the wholesaler sends them):

- Invoice number, wholesaler name, product, quantity, price per unit, total
- Order & payment status, bill date
- Print / download option

Example invoice number:

```
ARBROS-14-09-2026-0001
```

---

### 📒 Ledger Management

Digital ledger displays:

- Debit & credit entries
- Order, advance payment, and final payment entries
- Transaction notes & business parties
- Filters, totals, and printable ledger view

---

### 👨‍💼 Employee Management

- Add / Edit / Delete employees
- Search employees
- Salary information & payment records
- Pending salary tracking
- Daily attendance (Present / Absent / Leave)
- Attendance history

**One record per day:**

```
24 Sep → Present
24 Sep → Update to Absent   ← updates same record, no duplicate
25 Sep → New record
```

---

### 🔔 In-App Notifications

Events that trigger notifications:

- New order · Order status update
- Advance requested / paid
- Final payment requested / completed
- Bill sent

User actions: View · See unread count · Mark one or all as read · Delete · Clear all

> The web frontend uses periodic polling for new notifications.

**API routes:**

```
GET    /api/notifications
GET    /api/notifications/unread-count
PATCH  /api/notifications/read-all
PATCH  /api/notifications/:id/read
DELETE /api/notifications/:id
DELETE /api/notifications/clear-all
```

---

### ⭐ Reviews

- Add & view reviews with ratings
- Business feedback linked to orders
- Ratings contribute to smart supplier scoring

---

### 📈 Reports

Available at `/reports`:

- Orders & recent orders
- Payment status & stock information
- Reviews, ledger activity, business performance

---

### 👤 Customer Portal

- Customer account & ledger information
- Transaction history
- Customer-specific business records

---

### 🌙 Dark Mode

Shared light / dark theme with browser persistence via `localStorage`.

---

### 📱 Responsive Design

Optimised for Desktop · Laptop · Tablet · Mobile Browser.

Includes:

- Flexible cards & layouts
- Mobile-friendly actions
- Bottom-sheet style modals on small screens
- Overflow-safe long values
- Touch-friendly buttons
- Reduced-motion support

---

### 📲 Progressive Web App (PWA)

The Vite frontend includes PWA support for an installable web-app experience. On iOS, use Safari's **Add to Home Screen**.

---

### 🤖 Rule-Based Help Chatbot

A lightweight keyword-based help assistant for common in-app questions covering: Stock · Employees · Salary · Attendance · Orders · Billing · Ledger · Reviews · Login.

> Does not require an external AI model.

---

## 🔐 Frontend Security

- JWT token storage & automatic attachment to API requests
- Protected routes with role-aware screens
- Automatic logout on `401`
- Session expiry detection & single-session UX

> Frontend guards improve UX. Real authorization is enforced by the backend.

---

## 🌐 API Integration

```js
// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://backend-of-smartkhata-book-vkcv.vercel.app",
});

export default api;
```

---

## 🔄 Complete Application Flow

```
User Registers / Logs In
        ↓
Role-Based Dashboard
        ↓
Retailer Needs Stock
        ↓
   ┌────┴──────────────┐
   ↓                   ↓
Smart Auto        Choose Myself
   ↓                   ↓
Auto Selection    Smart Suggestions
   ↓                   ↓
   └─────────┬─────────┘
             ↓
       Order Created
             ↓
     Wholesaler Notified
             ↓
     Wholesaler Approves
             ↓
      Advance Requested
             ↓
  Retailer Pays (Demo Gateway)
             ↓
         Processing
             ↓
          On The Way
             ↓
          Delivered
             ↓
    Bill Generated & Sent
             ↓
  Final Payment Requested
             ↓
  Retailer Pays (Demo Gateway)
             ↓
          Completed
             ↓
  Ledger / Billing / Reports Updated
```

---

## 📌 Future Improvements

- Real payment gateway integration
- Native push notifications
- WebSocket real-time order updates
- GST invoice support
- Advanced PDF billing
- Advanced analytics & demand forecasting
- Multi-shop support
- Admin dashboard
- Automated payment reminders

---

## 🎓 Project Information

| Detail       | Information                |
| ------------ | -------------------------- |
| Project      | Smart Khata Book           |
| Type         | Business Management System |
| Course       | MCA — Semester 2           |
| Project Type | Group Mini Project         |
| Web Frontend | React.js + Vite            |
| Backend      | Node.js + Express.js       |
| Database     | MongoDB                    |
| Mobile       | Flutter                    |

---

## 👨‍💻 Author

Developed by **rrsoni**
GitHub: https://github.com/Rakshitsoni1410

---

## 📄 License

Developed for **educational and academic purposes**.

---

> ⭐ If you find Smart Khata Book useful, consider starring the repositories on GitHub!
>
> **Smart Khata Book — Orders, Inventory, Smart Supplier Selection, Ledger, Billing, Employees & Business Management 🚀**
