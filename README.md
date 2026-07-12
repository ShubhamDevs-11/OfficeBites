# OfficeBites

A role-based food delivery management system for office canteens, built with Node.js, Express, and MongoDB.

OfficeBites connects three types of users — canteen **owners**, office **clients**, and **delivery agents** — under a single backend, so a canteen can manage its menu, offices, deliveries, and billing in one place.

---

## Features

**Owner**
- Profile management & password change
- Menu management (add / edit / remove items, image upload, toggle availability)
- Office management (add / edit / remove, active/inactive status)
- Delivery agent management (add / remove)
- Client account creation (tied to a specific office)
- Billing (create bills, mark as paid, view pending/paid)

**Client**
- View profile & change password
- View the canteen's available menu
- View orders delivered to their office
- View their office's bills

**Delivery Agent**
- Add orders and their offices

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (HTTP-only cookies) |
| Password Hashing | bcryptjs |
| File Uploads | Multer |
| Logging | Winston |
| Views | EJS |

---

## Project Structure

```
OfficeBites/
├── config/           # Database connection
├── controllers/       # Route logic (auth, owner, client)
├── middlewares/        # Auth guard, role guard, file upload
├── models/              # Mongoose schemas
├── routes/              # Express routers
├── views/                # EJS templates
│   ├── auth/
│   ├── owner/
│   ├── client/
│   └── partials/         # Shared head & nav
├── uploads/              # Uploaded menu images
├── logs/                 # Winston log output
└── index.js              # App entry point
```

---

## Getting Started

**1. Clone & install**
```bash
git clone https://github.com/ShubhamDevs-11/OfficeBites.git
cd OfficeBites
npm install
```

**2. Set up environment variables**

Create a `.env` file in the root:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/officebites
JWT_SECRET=your_secret_key
BCRYPT_SALT_ROUNDS=10
NODE_ENV=development
```

**3. Run the server**
```bash
npm start
```

Visit `http://localhost:5000/api/auth/register` to create the first owner account.

---

## How It Works

- Only **owners** can self-register from the public register page.
- Owners then create **delivery agents** and **clients** from their dashboard.
- Clients are linked to a specific **office** (created by the owner) rather than choosing one themselves.
- Auth uses JWT stored in an HTTP-only cookie; role-based route guards (`verifyToken` + `authorizeRoles`) protect every private route.

---

## Status

Actively in development as a college project. Delivery agent functionality and final UI polish are next.
