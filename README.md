# UM Studio — Handmade Jewellery E-Commerce

A full-featured e-commerce portfolio project for a handmade jewellery brand. Built with React and deployed on Vercel — no backend or database required.

**Live demo:** [bd-shop-gray.vercel.app](https://bd-shop-gray.vercel.app)

---

## Features

- Product catalogue with filtering, sorting and pagination
- Product detail pages with size and colour selection
- Shopping bag drawer with quantity management
- Checkout flow with shipping and pickup options
- Order history saved to browser localStorage
- User registration and login (localStorage-based demo auth)
- Wishlist / favourites
- EN / LT bilingual support
- Responsive design — mobile, tablet and desktop
- Admin panel for order and product management (demo)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| State management | Zustand |
| Routing | React Router v6 |
| Data storage | localStorage (orders, auth) |
| Product data | Static JS file |
| Hosting | Vercel (free tier) |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Project Structure

```
src/
├── components/       # Reusable UI and layout components
├── context/          # Language context (EN/LT translations)
├── data/             # Static product data
├── hooks/            # Custom React hooks
├── pages/            # Page components
├── store/            # Zustand state stores (auth, cart, bag)
└── utils/            # Helper utilities
```

---

## Demo Notes

This is a portfolio project. All data is stored locally in the browser:

- **Auth** — register and log in with any email and password
- **Orders** — saved to localStorage after checkout
- **Favourites** — saved to localStorage
- **Payments** — simulated (no real payment processing)

---

## Author

Ugnė Miklovaitė
