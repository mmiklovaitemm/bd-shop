# UM Studio — Jewelry E-Commerce Store

A full-stack e-commerce web application built for a handmade jewelry brand. The project was developed as a bachelor's thesis at SMK University of Applied Sciences.

## Live Demo

- **Frontend:** [bd-shop-gray.vercel.app](https://bd-shop-gray.vercel.app)
- **Backend API:** [bd-shop-gfva.onrender.com](https://bd-shop-gfva.onrender.com)

---

## Features

### Customer Experience

- **Product Collections:** Browse rings, necklaces, bracelets, earrings and more with filtering by material, price, appearance, gemstones and size
- **7 Categories:** Including best sellers and new collection
- **Product Details:** Detailed specifications including adjustable lengths for necklaces, band widths for rings and surface type
- **Personalized Jewelry:** A specialized flow for custom pieces with a step-by-step guide
- **Shopping Cart:** Persistent cart with color and size variant selection
- **Checkout:** Stripe card payments and bank transfer options with order confirmation
- **Image Gallery:** High-resolution lightbox with multi-image support
- **Multilingual Support:** Full switching between English and Lithuanian including real-time error message translation
- **User Accounts:** Registration, login, profile management, order history and secure password updates
- **Wishlist:** Save favorite products with account sync across sessions

### Admin Management

- **Admin Dashboard:** Manage all products and orders from one place
- **Product Editor:** Support for multiple color and size variants, stock per variant, surface type, gemstone properties and image uploads
- **Order Management:** View all orders, update status and delete orders
- **Secure Routes:** Protected admin pages with middleware authentication

---

## Tech Stack

### Frontend

- React + Vite
- Tailwind CSS
- Zustand
- React Router
- Framer Motion

### Backend

- Node.js and Express
- MySQL
- JSON Web Tokens (JWT)
- Stripe API

### Hosting

- Vercel — frontend
- Render — backend

---

## Getting Started

### Prerequisites

- Node.js v16 or higher
- MySQL database

### Installation

1. Clone the repository

```bash
git clone https://github.com/mmiklovaitemm/bd-shop.git
cd bd-shop
```

2. Install frontend dependencies

```bash
npm install
```

3. Install backend dependencies

```bash
cd backend
npm install
```

4. Set up environment variables

Create a `.env` file in the backend folder:

```env
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
```

Create a `.env` file in the root folder:

```env
VITE_API_URL=http://localhost:4000/api
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

5. Run the backend

```bash
cd backend
node server.js
```

6. Run the frontend

```bash
npm run dev
```

---

## Author

Ugnė Miklovaitė
SMK University of Applied Sciences
Multimedia and Programming Study Programme
2026

---

## License

This project is for portfolio and academic purposes. All jewelry designs and branding assets belong to UM Studio.
