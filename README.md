# UM Studio - Timeless Elegance E-Commerce Store

A full-stack modern e-commerce platform designed for a high-end jewelry brand. This project features a clean, minimalist aesthetic focused on high-quality visual representation and seamless user experience.

## Live Demo
* **Frontend:** [bd-shop-gray.vercel.app](https://bd-shop-gray.vercel.app)
* **Backend API:** [bd-shop-gfva.onrender.com](https://bd-shop-gfva.onrender.com)

---

## Features

### Customer Experience
* **Product Collections:** Browse rings, necklaces, bracelets, and earrings with advanced filtering (material, price, gemstones).
* **Dynamic Product Details:** Detailed specifications including adjustable lengths for necklaces, band widths for rings, and technical specs.
* **Personalized Jewelry:** A specialized flow for custom-engraved pieces with a step-by-step guide.
* **Smart Shopping Bag:** Persistent cart logic with automated shipping kit fee handling.
* **Advanced Image Gallery:** High-resolution lightbox with original aspect ratio preservation and multi-image support.
* **Multilingual Support:** Fully dynamic switching between **English (EN)** and **Lithuanian (LT)** including real-time error message translation.
* **User Accounts:** Profile management, order history tracking, and secure password updates.

### Admin Management
* **Unified Admin Dashboard:** Comprehensive interface to manage inventory and view orders.
* **Advanced Product Creator:** Support for multiple variants (colors/sizes), inventory levels per variant, and Cloudinary image hosting integration.
* **Real-time Stock Tracking:** Automated calculations for total stock based on individual variant quantities.
* **Secure Authentication:** Protected admin routes with middleware verification.

---

## Tech Stack

### Frontend
* **React + Vite** (Fast HMR and optimized builds)
* **Tailwind CSS** (Utility-first styling for minimalist design)
* **Zustand** (Global state management for cart and auth)
* **React Router** (Client-side routing)
* **Framer Motion** (Smooth UI transitions and animations)

### Backend
* **Node.js & Express**
* **MySQL** (Structured relational database)
* **Cloudinary API** (Professional image storage and optimization)
* **JSON Web Tokens (JWT)** (Secure session handling)

---

## Key Bug Fixes & Optimizations Implemented
* **Image Normalization:** Developed a robust URL handler to manage local assets, Cloudinary links, and production environments seamlessly.
* **Lightbox Scaling:** Optimized the high-res gallery to prevent image cropping and maintain original proportions across all devices.
* **Live Error Translation:** Refactored the checkout and profile validation logic to ensure error messages translate instantly without requiring page reloads.
* **Database Sync:** Fixed API route handling for the Admin panel to support deep JSON objects for product technical details.

---

## Getting Started

### Prerequisites
* Node.js (v16+)
* MySQL Database

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/mmiklovaitemm/bd-shop.git](https://github.com/mmiklovaitemm/bd-shop.git)
    cd bd-shop
    ```

2.  **Install Frontend Dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**
    Create a `.env` file in the root and add your configuration:
    ```env
    VITE_API_URL=[https://your-api-url.com](https://your-api-url.com)
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

---

## 📄 License
This project is for portfolio purposes. All jewelry designs and branding assets belong to UM Studio.
