# 🚀 Web3 Job Portal

A modern job platform combining AI-powered resume analysis, blockchain payments, and stunning animations.

## ⚡ Quick Demo

- **Live Demo**: [Coming Soon]
- **Features**: AI resume analysis, animated UI, MetaMask integration
- **Tech Stack**: React + Node.js + PostgreSQL + Groq AI + Blockchain

## 🌟 Key Features

### 🧠 AI-Powered Smart Resume
- **Upload & Analyze** - PDF, DOC, DOCX support
- **Groq AI Integration** - Free tier with 14,400 daily requests
- **Comprehensive Insights** - Skills, strengths, improvements, ATS optimization
- **Career Guidance** - Personalized recommendations and action items

### 🎨 Modern Animated UI
- **Landing Page** - Gradient backgrounds, hover effects, smooth transitions
- **Interactive Cards** - Scale transforms, progressive loading
- **Responsive Design** - Mobile-first with Tailwind CSS
- **Micro-interactions** - Button animations, icon rotations

### 🔐 Secure Authentication  
- **JWT Sessions** - 12-hour expiration for security
- **MetaMask Integration** - Web3 wallet connection
- **Profile Management** - Real-time validation and updates
- **Session Management** - Automatic cleanup and warnings

### 💼 Job Management
- **Smart Job Feed** - Advanced search and filtering
- **Real-time Updates** - Live job status and applications
- **Payment Integration** - Blockchain-verified job postings
- **Employer Tools** - Complete job management dashboard

### 💰 Blockchain Integration
- **Smart Contracts** - Polygon network for low fees
- **MetaMask Payments** - Secure transaction verification
- **Payment History** - Complete transaction tracking
- **Web3 Features** - Decentralized job verification

## 🛠️ Tech Stack

**Frontend:**
- React 18 + Vite (fast development)
- Tailwind CSS + Custom animations
- Zustand (state management)
- Ethers.js (Web3 integration)

**Backend:**
- Node.js 18+ + Express
- PostgreSQL + Sequelize ORM
- JWT authentication
- Groq AI (resume analysis)

**Blockchain:**
- Solidity smart contracts
- Polygon network
- MetaMask integration
- Payment verification

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- MetaMask browser extension

### Installation
```bash
# 1. Clone repository
git clone <repository-url>
cd jobPortal

# 2. Install dependencies
npm install

# 3. Setup database
createdb web3_job_portal

# 4. Configure environment
cp server/env.example server/.env
# Add your database URL and Groq API key

# 5. Start development
cd server && npm start    # Backend (port 5000)
cd client && npm start    # Frontend (port 3000)
```

### Environment Setup
```env
# server/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/web3_job_portal
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_free_groq_api_key  # Get at console.groq.com
```

## 📱 Live Features

### Smart Resume Analysis
1. **Upload Resume** - Drag & drop PDF/DOC files
2. **AI Processing** - Groq AI analyzes content (or pattern fallback)
3. **Comprehensive Results** - Skills, improvements, ATS score, career guidance
4. **Modern UI** - Animated progress, gradient cards, hover effects

### Job Management
1. **Browse Jobs** - Animated job cards with search/filters
2. **Post Jobs** - MetaMask payment verification
3. **Job Details** - Rich job descriptions with application tracking
4. **Real-time Updates** - Live status and notifications

### User Experience
1. **Landing Page** - Animated hero, floating backgrounds, interactive CTAs
2. **Authentication** - Smooth login/register with 12h sessions
3. **Profile** - Comprehensive profile editing with image upload
4. **Responsive** - Perfect on desktop, tablet, and mobile

## 🎯 Project Structure

```
jobPortal/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API and Web3 services
│   │   ├── stores/      # Zustand state management
│   │   └── styles/      # Tailwind + custom animations
├── server/              # Node.js backend
│   ├── src/
│   │   ├── controllers/ # Route handlers
│   │   ├── models/      # Database models
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic (AI, payments)
│   │   └── middleware/  # Auth, validation, errors
└── contracts/           # Smart contracts
```

## 🧪 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login (12h JWT)
- `GET /api/auth/me` - Current user

### Smart Resume
- `POST /api/resumes/upload` - Upload resume for AI analysis
- `GET /api/resumes/active` - Get analysis results
- `DELETE /api/resumes/:id` - Delete resume

### Jobs  
- `GET /api/jobs` - List jobs (with search/filters)
- `POST /api/jobs` - Create job (requires payment)
- `GET /api/jobs/:id` - Job details

### Payments
- `POST /api/payments/verify` - Verify blockchain payment
- `GET /api/payments/history` - Payment history

## 🔧 Development

### Run Tests
```bash
# Backend tests
cd server && npm test

# Frontend tests  
cd client && npm test
```

### Debug Mode
```bash
# Backend with debugging
cd server && DEBUG=* npm run dev

# Check logs for AI processing
tail -f server/logs/app.log
```

## 🌐 Deployment

### Production Build
```bash
# Frontend
cd client && npm run build

# Backend
cd server && npm start
```

### Environment Variables (Production)
```env
NODE_ENV=production
DATABASE_URL=your_production_db_url
JWT_SECRET=strong_production_secret
GROQ_API_KEY=your_groq_api_key
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check [SETUP.md](SETUP.md) for detailed setup
- **Issues**: Report bugs via GitHub Issues
- **Questions**: Join our Discord community

---

**Built with ❤️ for the future of Web3 work**

[![Demo](https://img.shields.io/badge/Demo-Live-green)](https://your-demo-url.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-18+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org)