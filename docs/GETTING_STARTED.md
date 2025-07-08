# 🚀 Getting Started with POS Ecosystem

This guide will help you set up the development environment and start building the POS system.

## 📋 Prerequisites

Before starting, make sure you have:

- **Node.js 16+** and **npm 8+** installed
- **Git** for version control
- **SQLite** for database (or PostgreSQL for production)
- **Code editor** (VS Code recommended)

### For Mobile Development:

- **React Native CLI**
- **Android Studio** (for Android)
- **Xcode** (for iOS, macOS only)

### For Payment Integration:

- **Stripe** developer account
- **Square** developer account (optional)

## 🛠️ Initial Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit the .env file with your settings
nano .env
```

### 3. Database Setup

```bash
# Create database and run schema
cd db
sqlite3 pos.db < schema.sql
sqlite3 pos.db < seeds.sql
cd ..
```

## 🏃‍♂️ Running the Development Environment

### Start All Services

```bash
# Start everything at once
npm run dev
```

This will start:

- Backend API on http://localhost:3001
- Electron POS app on http://localhost:3000
- Admin Dashboard on http://localhost:3002

### Start Individual Services

```bash
# Backend only
npm run dev:backend

# Electron POS only
npm run dev:electron

# Admin Dashboard only
npm run dev:dashboard

# Mobile app only
npm run dev:mobile
```

## 📦 Project Structure Overview

```
pos-ecosystem/
├── 📱 frontend-electron/    # Desktop POS terminal
├── 📱 frontend-mobile/      # Mobile OCR scanner
├── 🌐 frontend-dashboard/   # Admin web dashboard
├── 🚀 backend-api/          # REST API server
├── 🗄️ db/                   # Database schema & seeds
├── 🖨️ printer-lib/          # Printer integrations
├── 💳 payment-integrations/ # Payment gateways
├── 🔧 shared/               # Common utilities
├── 📚 docs/                 # Documentation
└── 🔨 scripts/              # Build scripts
```

## 🎯 First Steps (Phase 1 - Week 1)

Based on your development plan, here's what to do first:

### ✅ Task 1: Database Setup (2hrs)

- [x] Database schema created ✅
- [x] Sample data added ✅
- [ ] Test database connection
- [ ] Create CRUD operations

### ✅ Task 2: Electron App Setup (2hrs)

- [ ] Initialize React app in `frontend-electron/`
- [ ] Configure Electron main process
- [ ] Set up hot reload
- [ ] Test basic window functionality

### ✅ Task 3: Backend API Setup (2hrs)

- [ ] Create Express server in `backend-api/`
- [ ] Set up database connection
- [ ] Create first API endpoint
- [ ] Test with Postman/curl

## 🔧 Development Tools

### Recommended VS Code Extensions

- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- SQLite Viewer
- Thunder Client (API testing)

### Useful Commands

```bash
# Linting
npm run lint

# Testing
npm run test

# Building for production
npm run build

# Database operations
sqlite3 pos.db
.tables
.schema products
```

## 🐛 Common Issues & Solutions

### Database Connection Issues

```bash
# Check if database exists
ls -la db/pos.db

# Recreate database
rm db/pos.db
sqlite3 db/pos.db < db/schema.sql
```

### Port Already in Use

```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill
lsof -ti:3001 | xargs kill
```

### Node Modules Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 📖 Next Steps

1. **Complete Phase 1 Database Setup** - Follow the detailed tasks in `plan.mdc`
2. **Set up Electron App** - Create the basic POS interface
3. **Build Backend API** - Create product and sales endpoints
4. **Add Barcode Scanner** - Integrate hardware scanning
5. **Implement Receipt Printing** - Set up ESC/POS printing

## 🆘 Getting Help

- 📖 Check the detailed plan in `plan.mdc`
- 🐛 Create an issue if you encounter problems
- 📧 Contact the development team

---

Happy coding! 🚀
