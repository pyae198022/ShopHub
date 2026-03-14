# 🛍️ ShopHub

A modern, full-featured e-commerce web application built with **React 18**, **TypeScript**, and **Tailwind CSS**. Powered by **Supabase** for a real-time, scalable backend and **AI-driven Edge Functions** for personalized shopping experiences.

## 📸 Project Gallery

| Main Storefront | Product Analytics |
|:---:|:---:|
| ![Home](https://github.com/pyae198022/ShopHub/blob/0ed423f5ad4ec7cc5aa686995bf2625782a69254/Screenshot%202569-03-14%20at%2012.22.14.png?raw=true) | ![Analytics](https://github.com/pyae198022/ShopHub/blob/0ed423f5ad4ec7cc5aa686995bf2625782a69254/Screenshot%202569-03-14%20at%2012.22.33.png?raw=true) |

| Ordring Cart | Order Checkout |
|:---:|:---:|
| ![AI Recommendations](https://github.com/pyae198022/ShopHub/blob/0ed423f5ad4ec7cc5aa686995bf2625782a69254/Screenshot%202569-03-14%20at%2012.22.54.png?raw=true) | ![Admin](https://github.com/pyae198022/ShopHub/blob/0ed423f5ad4ec7cc5aa686995bf2625782a69254/Screenshot%202569-03-14%20at%2012.23.07.png?raw=true) |

| Confirm order| Product Detail |
|:---:|:---:|
| ![Cart](https://github.com/pyae198022/ShopHub/blob/0ed423f5ad4ec7cc5aa686995bf2625782a69254/Screenshot%202569-03-14%20at%2012.23.31.png?raw=true) | ![Checkout](https://github.com/pyae198022/ShopHub/blob/0ed423f5ad4ec7cc5aa686995bf2625782a69254/Screenshot%202569-03-14%20at%2012.23.54.png?raw=true) |

| User Review & Rating | Order History |
|:---:|:---:|
| ![Profile](https://github.com/pyae198022/ShopHub/blob/0ed423f5ad4ec7cc5aa686995bf2625782a69254/Screenshot%202569-03-14%20at%2012.24.08.png?raw=true) | ![Orders](https://github.com/pyae198022/ShopHub/blob/0ed423f5ad4ec7cc5aa686995bf2625782a69254/Screenshot%202569-03-14%20at%2012.24.28.png?raw=true) |

| Profile Management | Admin Dashboard |
|:---:|:---:|
| ![Management](https://github.com/pyae198022/ShopHub/blob/0ed423f5ad4ec7cc5aa686995bf2625782a69254/Screenshot%202569-03-14%20at%2012.24.52.png?raw=true) | ![Filter](https://github.com/pyae198022/ShopHub/blob/0ed423f5ad4ec7cc5aa686995bf2625782a69254/Screenshot%202569-03-14%20at%2012.25.13.png?raw=true) |

| Order Management | Product Mangement |
|:---:|:---:|
| ![Responsive](https://github.com/pyae198022/ShopHub/blob/0ed423f5ad4ec7cc5aa686995bf2625782a69254/Screenshot%202569-03-14%20at%2012.25.22.png?raw=true) | ![Wishlist](https://github.com/pyae198022/ShopHub/blob/0ed423f5ad4ec7cc5aa686995bf2625782a69254/Screenshot%202569-03-14%20at%2012.25.29.png?raw=true) |

---

## 🚀 Key Features

### 🛒 Customer Experience
- **Dynamic Browsing**: Grid/list views with real-time category filtering and search.
- **Engagement Tools**: Persistent shopping cart (local/Supabase sync), wishlists, and real-time reviews.
- **Advanced Checkout**: Secure multi-step checkout supporting Credit/Debit cards and Cash on Delivery (COD).
- **User Dashboard**: Manage profiles, addresses, and track real-time order history.

### 📊 Admin Management
- **Sales Dashboard**: Visualize monthly/yearly performance using **Recharts**.
- **Inventory Control**: Full CRUD operations for products including bulk actions.
- **Order Management**: Oversee the entire fulfillment lifecycle and update tracking info.
- **Data Export**: Export sales and inventory reports to CSV for offline analysis.

### 🤖 AI-Powered Engine
- **Smart Recommendations**: Utilizes Supabase Edge Functions to analyze browsing history (`product_views`) and provide contextually relevant product suggestions to users.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend-as-a-Service**: Supabase (PostgreSQL, Auth, Edge Functions, Realtime)
- **State Management**: TanStack Query (React Query) & React Context API
- **Forms & Validation**: React Hook Form, Zod
- **Analytics**: Recharts

## 📁 Project Structure

```text
src/
├── components/
│   ├── admin/       # Dashboard & Charting components
│   ├── auth/        # Supabase Authentication forms
│   ├── ecommerce/   # Product, Cart, and Checkout logic
│   └── ui/          # Atomic shadcn/ui components
├── contexts/        # Global Auth & Cart state providers
├── hooks/           # Custom reusable React hooks
├── services/        # Supabase client & API logic
└── types/           # Global TypeScript interfaces

## 🚀 Getting Started



### Prerequisites

- Node.js 18+

- npm or yarn



### Installation



1. Clone the repository:

```bash

git clone <repository-url>

cd shophub

```



2. Install dependencies:

```bash

npm install

```



3. Set up environment variables:

Create a `.env` file in the root directory:

```env

VITE_SUPABASE_URL=your_supabase_url

VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

```



4. Start the development server:

```bash

npm run dev

```



The app will be available at `http://localhost:5173`



## 📝 Available Scripts



| Command | Description |

|---------|-------------|

| `npm run dev` | Start development server |

| `npm run build` | Build for production |

| `npm run build:dev` | Build for development |

| `npm run lint` | Run ESLint |

| `npm run preview` | Preview production build |



## 🔧 Configuration



### Supabase Setup

The project uses Supabase for:

- **Authentication**: Email/password with email verification

- **Database**: PostgreSQL for products, orders, reviews

- **Storage**: Product images (optional)

- **Edge Functions**: AI recommendations



### Database Schema

Key tables:

- `products` - Product catalog

- `orders` - Order records

- `order_items` - Order line items

- `profiles` - User profiles

- `wishlists` - User wishlists

- `product_reviews` - Product reviews
