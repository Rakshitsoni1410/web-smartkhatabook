# Smart Khata Book 🌐

**Smart Khata Book** is a modern business management web application designed for **Retailers**, **Wholesalers**, and business users.

The web frontend is built using **React.js** and connects with the Smart Khata backend API to provide order management, inventory, billing, ledger tracking, employee management, reports, reviews, customer portal access, authentication, and demo payment workflows.

---

# 🌐 Live Project

https://smartkhatabooks.netlify.app/

---

# 🚀 Project Repositories

## 🌐 Web Frontend Repository

https://github.com/Rakshitsoni1410/web-smartkhatabook

## ⚙️ Backend Repository

https://github.com/Rakshitsoni1410/backend-of-smartkhata-book

## 📱 Flutter / Mobile Repository

https://github.com/Rakshitsoni1410/smartkhatabook

---

# ✨ Main Features

## 🔐 Authentication

Smart Khata includes secure authentication and session handling.

Features:

* User Registration
* User Login
* Phone / Email Login Support
* Retailer Login
* Wholesaler Login
* Customer Role Support
* JWT Authentication
* Protected Routes
* Role-Based Access
* Forgot Password
* Reset Password
* Automatic Logout on Expired Session
* Single Active Session Support

### Single Session Login

If the same user logs in on another device, the old session becomes invalid.

Example:

```text
Laptop Login
     ↓
Mobile Login with Same Account
     ↓
Mobile Becomes Active Session
     ↓
Laptop Session Invalid
     ↓
Laptop Automatically Logs Out
```

---

# 👥 User Roles

The application supports:

* Retailer
* Wholesaler
* Customer

Different screens and actions are available depending on the logged-in user's role.

---

# 📊 Dashboard

The dashboard provides an overview of business activity.

Features include:

* Business Summary
* Product Statistics
* Order Summary
* Inventory Information
* Employee Information
* Recent Activity
* Business Cards
* Clean Responsive UI

---

# 📦 Product & Inventory Management

Wholesalers can manage their products and stock.

Features:

* Add Product
* Edit Product
* Delete Product
* View Products
* Search Products
* Product Categories
* Selling Price
* Stock Quantity
* Stock Availability
* Low Stock Information
* Inventory Management

---

# 🛒 Order Management

Retailers can place orders and wholesalers can manage the order lifecycle.

Order flow:

```text
Pending
   ↓
Approved
   ↓
Advance Pending
   ↓
Processing
   ↓
On The Way
   ↓
Delivered
   ↓
Completed
```

Supported frontend actions include:

* Place Order
* View All Orders
* Filter Orders by Status
* View Order Details
* Approve Order
* Reject Order
* Mark Order On The Way
* Mark Order Delivered
* Request Advance Payment
* Request Final Payment
* Complete Payment

---

# 🔎 Order Filters

The Orders page allows users to filter orders by category/status.

Examples:

```text
All Orders
Pending
Approved
Advance Pending
Processing
On The Way
Delivered
Completed
Rejected
```

---

# 🤝 Smart Wholesaler Selection

When a retailer places an order, the backend automatically finds an appropriate wholesaler.

The frontend displays the selected order and wholesaler information.

Selection can consider:

* Product Availability
* Required Quantity
* Selling Price
* Stock
* Rating
* Reviews

---

# 💳 Demo Payment Gateway

Smart Khata includes a **fake/demo payment gateway** for project demonstration.

No real money is transferred.

Supported demo payment methods:

* UPI
* Card
* Net Banking

Example flow:

```text
Retailer Clicks Pay Advance
        ↓
Smart Khata Pay Opens
        ↓
Select Payment Method
        ↓
Pay Demo Amount
        ↓
Processing
        ↓
Payment Successful
        ↓
Transaction ID Generated
```

The gateway generates demo transaction IDs such as:

```text
SKPAY-MABC123-XYZ89
```

---

# ⚠️ Demo Payment Disclaimer

The payment gateway is for **testing and academic demonstration only**.

Users should never enter real:

* UPI PIN
* CVV
* Bank Password
* Real Card Credentials
* Real Banking Information

The frontend clearly displays **TEST MODE / Demo Payment Gateway**.

---

# 💰 Advance Payment

Wholesalers can request an advance payment.

Flow:

```text
Wholesaler Requests Advance
        ↓
Retailer Receives Request
        ↓
Retailer Opens Demo Payment Gateway
        ↓
Payment Successful
        ↓
Order Moves to Processing
```

The frontend shows:

* Advance Percentage
* Advance Amount
* Remaining Amount
* Payment Status

---

# 💵 Final Payment

After delivery, the wholesaler can request the remaining payment.

Flow:

```text
Order Delivered
        ↓
Final Payment Requested
        ↓
Retailer Opens Demo Gateway
        ↓
Payment Successful
        ↓
Order Completed
```

---

# 🧾 Payment History

Demo payment information can be stored with the order.

Payment information includes:

* Transaction ID
* Payment Method
* Payment Type
* Amount
* Payment Status
* Payment Date
* Mock Payment Flag

Example:

```text
Advance Payment
Transaction: SKPAY-ABC123
Method: UPI
Amount: ₹2,500

Final Payment
Transaction: SKPAY-XYZ789
Method: Card
Amount: ₹7,500
```

---

# 🧾 Billing & Invoice Management

Smart Khata includes a complete billing workflow.

## Wholesaler Flow

```text
Order Delivered
        ↓
Billing Section
        ↓
Generate Bill
        ↓
Send Bill
        ↓
Confirmation Dialog
        ↓
Confirm & Send
```

Before delivery, the wholesaler sees:

```text
Available after delivery
```

After delivery:

```text
[ Generate Bill ] [ Send Bill ]
```

After sending:

```text
[ Generate Bill ] [ ✓ Sent ]
```

---

# 🧍 Retailer Billing

Retailers only see bills that have been sent by the wholesaler.

Retailer billing includes:

* Invoice Number
* Wholesaler Name
* Product
* Quantity
* Amount
* Order Status
* Payment Status
* Bill Date
* Download Bill

Example:

```text
Invoice
ARBROS-14-09-2026-0001

Product: Rice
Quantity: 10
Amount: ₹10,000

[ Download Bill ]
```

---

# 📄 Bill Generation

The frontend includes a bill generation component.

Users can:

* Generate Bill
* Preview Bill
* Print Bill
* Save Bill as PDF using browser print
* Download/View Invoice Information

Invoice data includes:

* Business Name
* Customer Name
* Invoice Number
* Product
* Quantity
* Price Per Unit
* Total
* Payment Status
* Order Status
* Date

---

# 📒 Ledger Management

Smart Khata includes digital ledger screens.

Ledger functionality can display:

* Debit Entries
* Credit Entries
* Orders
* Advance Payments
* Final Payments
* Transaction Notes
* Business Parties

This allows retailers and wholesalers to track financial activity.

---

# 👨‍💼 Employee Management

The frontend includes employee-management functionality.

Features include:

* Add Employee
* View Employees
* Edit Employee
* Delete Employee
* Employee Details
* Salary Information
* Pending Salary Tracking
* Employee Payment Information

---

# ⭐ Review Management

Smart Khata includes review functionality.

Users can:

* Add Reviews
* View Reviews
* View Ratings
* Review Business Interactions

---

# 📈 Reports

The application includes a dedicated Reports section.

Reports can display:

* Orders
* Recent Orders
* Payment Status
* Stock Information
* Reviews
* Ledger Activity
* Business Performance Information

Route:

```text
/reports
```

---

# 👤 Customer Portal

Smart Khata includes a customer portal.

Customer functionality can include:

* Customer Account Information
* Ledger Information
* Transaction History
* Business Data
* Customer-Specific Records

---

# 🔔 Status & Notifications

The application uses visual states and toast messages for user feedback.

Examples:

* Payment Successful
* Payment Failed
* Order Updated
* Bill Sent
* Advance Requested
* Final Payment Requested
* Authentication Error
* Session Expired

---

# 🔐 Frontend Security

Frontend security features include:

* JWT Token Storage
* Automatic Token Attachment to API Requests
* Protected Routes
* Role Checks
* Automatic Logout on `401`
* Session Expiry Detection
* Old Session Logout
* Login Security Integration
* Centralized Axios API Configuration

---

# 🌐 API Integration

The frontend connects to the deployed backend:

```text
https://backend-of-smartkhata-book-vkcv.vercel.app
```

A shared Axios instance is used for API communication.

Example:

```js
const api = axios.create({
  baseURL:
    "https://backend-of-smartkhata-book-vkcv.vercel.app",
});
```

Authentication tokens are automatically attached to requests.

---

# 🛠️ Frontend Tech Stack

| Technology       | Usage                    |
| ---------------- | ------------------------ |
| React.js         | Frontend Library         |
| React Router DOM | Navigation & Routing     |
| Axios            | Backend API Requests     |
| CSS3             | Styling                  |
| React Icons      | UI Icons                 |
| Local Storage    | Authentication Session   |
| Vite             | Development / Build Tool |
| Netlify          | Frontend Deployment      |

---

# ⚙️ Backend Tech Stack

The frontend communicates with a backend built using:

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Redis / Upstash
* Cloudinary
* Vercel

---

# 📁 Frontend Project Structure

```text
smart-khata-web/
│
├── public/
│
├── src/
│   │
│   ├── components/
│   │   ├── GenerateBillButton.jsx
│   │   ├── FakePaymentModal.jsx
│   │   └── ...
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Orders.jsx
│   │   ├── OrderDetails.jsx
│   │   ├── Billing.jsx
│   │   ├── Report.jsx
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

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/Rakshitsoni1410/web-smartkhatabook.git
```

---

## 2. Open Project Folder

```bash
cd web-smartkhatabook
```

If the React project is inside another folder:

```bash
cd smart-khata-web
```

---

## 3. Install Dependencies

```bash
npm install
```

---

## 4. Start Development Server

```bash
npm run dev
```

The app will normally open on a Vite development URL such as:

```text
http://localhost:5173
```

---

# 🏗️ Production Build

Create a production build using:

```bash
npm run build
```

The generated production files will be available inside:

```text
dist/
```

---

# 🌐 Deployment

The Smart Khata web frontend is deployed using **Netlify**.

Live application:

```text
https://smartkhatabooks.netlify.app/
```

Backend API:

```text
https://backend-of-smartkhata-book-vkcv.vercel.app
```

---

# 🔄 Complete Application Flow

```text
User Registers / Logs In
        ↓
Role-Based Dashboard
        ↓
Retailer Places Order
        ↓
Wholesaler Receives Order
        ↓
Wholesaler Approves
        ↓
Advance Requested
        ↓
Retailer Uses Demo Payment Gateway
        ↓
Order Processing
        ↓
On The Way
        ↓
Delivered
        ↓
Wholesaler Generates Bill
        ↓
Wholesaler Sends Bill
        ↓
Retailer Sees Bill
        ↓
Final Payment Requested
        ↓
Retailer Completes Demo Payment
        ↓
Order Completed
        ↓
Ledger / Billing / Reports Updated
```

---

# 📱 Responsive Design

The Smart Khata web interface is designed to work across:

* Desktop
* Laptop
* Tablet
* Mobile Browser

Pages such as Billing, Orders, Payment Gateway, and Dashboard include responsive layouts.

---

# 📱 Flutter Application

A separate Flutter repository is available for mobile application development.

Repository:

https://github.com/Rakshitsoni1410/smartkhatabook

The mobile application can be expanded to include:

* Dashboard
* Orders
* Stock
* Billing
* Notifications
* Ledger
* Customer Portal

---

# 📌 Future Improvements

Potential future improvements include:

* Real Payment Gateway Integration
* Push Notifications
* Real-Time Order Updates
* WebSocket Notifications
* GST Invoice Support
* Advanced PDF Billing
* Advanced Analytics
* AI Demand Prediction
* Multi-Language Support
* Dark Mode
* Multi-Shop Support
* Admin Dashboard
* Automated Payment Reminders
* Advanced Business Insights

---

# 🎓 Project Information

| Detail       | Information                |
| ------------ | -------------------------- |
| Project      | Smart Khata Book           |
| Type         | Business Management System |
| Course       | MCA                        |
| Semester     | 2                          |
| Project Type | Group Mini Project         |
| Web Frontend | React.js                   |
| Backend      | Node.js + Express.js       |
| Database     | MongoDB                    |
| Mobile       | Flutter                    |

---

# 👨‍💻 Author

Developed by **rrsoni**

GitHub:

https://github.com/Rakshitsoni1410

---

# 🔗 Important Links

## Live Web Application

https://smartkhatabooks.netlify.app/

## Web Repository

https://github.com/Rakshitsoni1410/web-smartkhatabook

## Backend Repository

https://github.com/Rakshitsoni1410/backend-of-smartkhata-book

## Mobile Repository

https://github.com/Rakshitsoni1410/smartkhatabook

---

# ❤️ Built With

* React.js
* JavaScript
* CSS
* Axios
* React Router
* React Icons
* Node.js
* Express.js
* MongoDB

---

# 📄 License

This project is currently developed for **educational and academic purposes**.

---

# ⭐ Support

If you like Smart Khata Book, consider giving the project repositories a ⭐ on GitHub.

**Smart Khata Book — Orders, Ledger, Billing, Payments & Business Management 🚀**
