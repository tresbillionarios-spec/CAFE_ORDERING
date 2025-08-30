# QR Ordering System

A full-stack QR code-based ordering system for multiple cafes located in the same place. Customers can scan QR codes to view menus and place orders, while cafe owners can manage their menus and track orders.

## 🏗️ Architecture

- **Frontend**: React + Vite + TailwindCSS + React Router DOM + Axios
- **Backend**: Node.js + Express + JWT Authentication + Sequelize ORM
- **Database**: PostgreSQL (Neon/Supabase)
- **Deployment**: Vercel (Frontend) + Render/Railway (Backend)

## 🚀 Features

- **Cafe Management**: Register and manage cafe profiles
- **Menu Management**: Add/edit/delete menu items with categories and availability
- **QR Code Generation**: Unique QR codes for each cafe
- **Ordering System**: Customer-friendly mobile interface
- **Order Management**: Real-time order tracking and status updates
- **User Authentication**: JWT-based role management (Cafe Owner, Customer)
- **Responsive Design**: Mobile-first approach for QR scanning

## 📁 Project Structure

```
qr-ordering-system/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # Global styles
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Utility functions
│   ├── migrations/         # Database migrations
│   └── package.json
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database (Neon/Supabase free tier)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```env
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASS=your-db-password
DB_NAME=your-db-name
DB_PORT=5432
JWT_SECRET=your-jwt-secret
PORT=5000
```

5. Run database migrations:
```bash
npm run migrate
```

6. Start development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with backend API URL:
```env
VITE_API_URL=http://localhost:5000/api
```

5. Start development server:
```bash
npm run dev
```

## 🗄️ Database Models

- **Users**: Authentication and user management
- **Cafes**: Cafe profiles and settings
- **Menus**: Menu items with categories and pricing
- **Orders**: Order tracking and status management
- **OrderItems**: Individual items within orders

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new cafe owner
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Cafes
- `GET /api/cafes` - Get all cafes
- `GET /api/cafes/:id` - Get specific cafe
- `PUT /api/cafes/:id` - Update cafe profile
- `POST /api/cafes/:id/qr` - Generate QR code

### Menus
- `GET /api/cafes/:id/menu` - Get cafe menu
- `POST /api/menu` - Add menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get orders (filtered by cafe)
- `PUT /api/orders/:id/status` - Update order status

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables

### Backend (Render/Railway)
1. Connect your GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables
5. Connect PostgreSQL database

## 📱 Usage

1. **Cafe Owner**: Register and create menu items
2. **QR Generation**: System generates unique QR code for each cafe
3. **Customer**: Scan QR code to view menu and place orders
4. **Order Management**: Cafe owners track and update order status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
