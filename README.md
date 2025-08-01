# 🚀 Web3 Job Portal

A modern job portal built with React, Node.js, and Web3 technologies featuring AI-powered job matching and blockchain payments.

## 🏗️ Architecture

```
web3-job-portal/
├── client/          # React frontend
├── server/          # Node.js/Express backend
├── contracts/       # Smart contracts
└── docs/           # Documentation
```

## 🧩 Features

### ✅ Module 1: Authentication & Profile
- JWT-based authentication
- MetaMask wallet integration
- Profile creation and editing
- AI-powered skill extraction

### ✅ Module 2: Job Feed
- Post and browse jobs
- Advanced filtering and search
- Real-time updates

### ✅ Module 3: Blockchain Payments
- MetaMask integration
- Smart contract payments
- Transaction verification

### ✅ Module 4: AI Enhancements
- Resume parsing
- Job matching algorithms
- Personalized recommendations

## 🛠️ Tech Stack

**Frontend:**
- React.js + Vite
- Tailwind CSS
- Ethers.js (Web3)
- Axios

**Backend:**
- Node.js + Express
- PostgreSQL
- JWT Authentication
- Multer (file uploads)

**Web3:**
- Ethereum/Polygon
- MetaMask
- Smart Contracts

**AI/ML:**
- Natural Language Processing
- Skill extraction
- Recommendation algorithms

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd web3-job-portal
   npm run install-all
   ```

2. **Environment Setup**
   ```bash
   # Copy environment files
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

3. **Database Setup**
   ```bash
   # Install PostgreSQL and create database
   createdb web3_job_portal
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

### Frontend (client/)
```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── services/      # API and Web3 services
├── utils/         # Utility functions
└── styles/        # CSS and Tailwind config
```

### Backend (server/)
```
src/
├── controllers/   # Route controllers
├── models/        # Database models
├── middleware/    # Custom middleware
├── routes/        # API routes
├── services/      # Business logic
└── utils/         # Utility functions
```

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/web3_job_portal
JWT_SECRET=your_jwt_secret
WEB3_PROVIDER_URL=https://polygon-rpc.com
CONTRACT_ADDRESS=your_smart_contract_address
ADMIN_WALLET_ADDRESS=your_admin_wallet
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000
VITE_CONTRACT_ADDRESS=your_smart_contract_address
VITE_NETWORK_ID=137
```

## 🧪 Testing

```bash
# Run backend tests
cd server && npm test

# Run frontend tests
cd client && npm test
```

## 📦 Deployment

### Backend Deployment
```bash
cd server
npm run build
npm start
```

### Frontend Deployment
```bash
cd client
npm run build
# Deploy dist/ folder to your hosting service
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details # web3-job-portal
