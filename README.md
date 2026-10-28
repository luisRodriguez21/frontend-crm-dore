# Joyería Doré CRM · Frontend

Web CRM for a gold and silver jewelry business that sells retail and wholesale through Facebook, WhatsApp, TikTok and Instagram. It centralizes sales, clients and inventory, and prices pieces from live gold and silver spot prices.

## Features

- **Dashboard** with sales metrics and charts (Recharts)
- **Sales:** create sales, track their source channel, priority and status (pending shipment → shipped → delivered / cancelled), with a detail view per sale
- **Clients:** profiles with multiple shipping addresses, birthday, wholesale membership and purchase history
- **Products** and **suppliers** catalog by metal type (gold, silver, mixed)
- **Metal prices:** gold and silver spot price per gram, price history and manual override
- **Wholesale pricing** by quantity ranges
- **Auth and roles:** JWT login, protected routes and an admin-only configuration area (`ADMIN` / `SELLER`)

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS · React Router 7 · Axios · Recharts · date-fns · lucide-react · react-hot-toast

## Project structure

```
src/
├── api/          # Axios client and service layer (auth, sales, clients, products, prices…)
├── components/   # layout (navbar, shell) and UI components
├── pages/        # Dashboard, Sales, NewSale, Clients, Products, Config, Login
├── store/        # auth context and session storage
├── types/        # shared domain types
└── utils/        # formatting helpers
```

## Getting started

```bash
git clone https://github.com/luisRodriguez21/frontend-crm-dore.git
cd frontend-crm-dore
npm install

# .env
# VITE_API_URL=http://localhost:3001/api/v1

npm run dev
```

Requires the CRM backend API running (default `http://localhost:3001/api/v1`).
