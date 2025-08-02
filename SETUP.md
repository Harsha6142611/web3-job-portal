# 🚀 Web3 Job Portal - Setup Guide

Complete setup guide for the Web3 Job Portal with AI resume analysis and blockchain integration.

## 📋 Prerequisites

**Required Software:**
- **Node.js 18+** (required - check with `node --version`)
- **PostgreSQL 12+** 
- **Git**
- **MetaMask** browser extension

**Get Node.js 18+ if needed:**
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Verify version
node --version  # Should show v18.x.x
```

## 🏗️ Project Structure

```
jobPortal/
├── client/          # React frontend with animations
├── server/          # Node.js backend with AI integration
├── contracts/       # Smart contracts (Solidity)
└── docs/           # Documentation
```

## ⚡ Quick Start (5 minutes)

### 1. Clone and Install
```bash
git clone <repository-url>
cd jobPortal
npm install
```

### 2. Database Setup
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update && sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb web3_job_portal
```

### 3. Environment Configuration

**Backend Setup:**
```bash
# Copy environment template
cp server/env.example server/.env

# Edit with your settings
nano server/.env
```

**Required Environment Variables:**
```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/web3_job_portal

# JWT Security (12-hour sessions)
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=12h

# AI Resume Analysis - Groq (FREE)
# Get your free API key at: https://console.groq.com/
GROQ_API_KEY=your_groq_api_key_here

# Web3 (Optional - for blockchain features)
WEB3_PROVIDER_URL=https://polygon-rpc.com
CONTRACT_ADDRESS=your_contract_address
ADMIN_WALLET_ADDRESS=your_wallet_address
```

### 4. Start Development

**Option A: Both servers together**
```bash
# Terminal 1: Backend (Port 5000)
cd server && npm start

# Terminal 2: Frontend (Port 3000)  
cd client && npm start
```

**Option B: Root level start**
```bash
npm run dev  # Starts both frontend and backend
```

### 5. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: PostgreSQL on default port 5432

## 🧠 AI Resume Analysis Setup

### Get Free Groq API Key
1. Visit https://console.groq.com/
2. Sign up (no credit card required)
3. Create API key
4. Add to `server/.env` as `GROQ_API_KEY`

**Benefits:**
- ✅ **100% Free** - 14,400 requests/day
- ✅ **10x Faster** than other AI providers
- ✅ **High Quality** - Llama 3.1 models
- ✅ **Instant Setup** - no billing required

## 🔧 Configuration Details

### Database Tables (Auto-created)
- `users` - User profiles and authentication
- `jobs` - Job listings with payment status  
- `payments` - Blockchain payment records
- `resumes` - AI analysis results and files

### API Endpoints

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (12h sessions)
- `GET /api/auth/me` - Current user profile

**Jobs:**
- `GET /api/jobs` - List jobs with search/filters
- `POST /api/jobs` - Create job (requires payment)
- `GET /api/jobs/:id` - Job details

**Smart Resume:**
- `POST /api/resumes/upload` - Upload resume for AI analysis
- `GET /api/resumes/active` - Get current resume analysis
- `DELETE /api/resumes/:id` - Delete resume

**Payments:**
- `POST /api/payments/verify` - Verify blockchain payment
- `GET /api/payments/history` - Payment history

## 🎨 Frontend Features

### Modern Animated Landing Page
- Gradient backgrounds with floating animations
- Hover effects on feature cards
- Smooth fade-in transitions
- Interactive buttons with scale effects

### Smart Resume Analysis UI
- Drag & drop file upload
- Real-time processing indicators  
- Comprehensive analysis display
- Modern card-based layout

### Responsive Design
- Mobile-first approach
- Tailwind CSS for styling
- Custom animations in `/client/src/styles/animations.css`

## 🔍 Troubleshooting

### Common Issues

**1. Node.js Version Error**
```bash
# Error: SyntaxError: Unexpected token '('
nvm use 18  # Switch to Node.js 18+
node --version  # Verify version
```

**2. Database Connection**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart if needed
sudo systemctl restart postgresql
```

**3. Port Already in Use**
```bash
# Find and kill process using port
lsof -i :5000
kill -9 <PID>
```

**4. CSS Animation Issues**
```bash
# Ensure animations.css is imported first
# Check client/src/styles/index.css
```

**5. AI Analysis Not Working**
- Verify `GROQ_API_KEY` in `server/.env`
- Check console for error messages
- System falls back to pattern analysis if AI fails

## 🧪 Testing

```bash
# Test backend
cd server && npm test

# Test frontend  
cd client && npm test

# Test AI resume analysis
# Upload a PDF resume via the UI at /profile
```

## 🚀 Production Deployment

### Backend (Node.js)
```bash
cd server
npm run build
npm start
```

### Frontend (Static Files)
```bash
cd client  
npm run build
# Deploy dist/ folder to your hosting service
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure production database URL
- Add proper CORS origins

## 📚 Key Features to Test

1. **Authentication Flow**
   - Register/login with email
   - JWT session management (12h expiration)
   - Profile editing

2. **Smart Resume Analysis**  
   - Upload PDF/DOC resume
   - View AI analysis results
   - Check fallback to pattern analysis

3. **Job Management**
   - Browse jobs with filters
   - Post new jobs
   - View job details

4. **Modern UI**
   - Landing page animations
   - Hover effects on cards
   - Responsive design

5. **MetaMask Integration**
   - Connect wallet
   - Session management
   - Payment verification

## 🆘 Need Help?

1. Check this troubleshooting guide
2. Verify Node.js version is 18+
3. Ensure all environment variables are set
4. Check browser console for errors
5. Review server logs for API issues

---

**Ready to build the future of Web3 job hunting! 🚀**