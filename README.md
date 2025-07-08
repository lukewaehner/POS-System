# 🧾 POS Ecosystem

A comprehensive Point of Sale system designed for convenience stores, liquor shops, and smoke shops.

## 🏗️ Project Structure

```
pos-ecosystem/
├── frontend-electron/         # 🖥️ Desktop POS Terminal (Electron + React)
├── frontend-mobile/           # 📱 Mobile OCR Scanner (React Native)
├── frontend-dashboard/        # 🌐 Admin Web Dashboard (Next.js)
├── backend-api/               # 🚀 REST API Server (Node.js + Express)
├── db/                        # 🗄️ Database Schema & Seeds
├── printer-lib/               # 🖨️ Universal Printer Support
├── payment-integrations/      # 💳 Stripe/Square Integration
├── shared/                    # 🔧 Common Types & Utilities
├── docs/                      # 📚 Documentation
└── scripts/                   # 🔨 Build & Deploy Scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm 8+
- For mobile: React Native CLI, Android Studio/Xcode
- For payments: Stripe/Square developer accounts

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/pos-ecosystem.git
cd pos-ecosystem

# Install all dependencies
npm run install:all

# Start development environment
npm run dev
```

### Individual Component Setup

```bash
# Backend API
cd backend-api && npm run dev

# Electron POS Terminal
cd frontend-electron && npm run electron:dev

# Admin Dashboard
cd frontend-dashboard && npm run dev

# Mobile OCR App
cd frontend-mobile && npm run start
```

## 🎯 Features

### Phase 1 - MVP ✅

- [x] Barcode inventory management
- [x] Shopping cart & checkout
- [x] Receipt printing (ESC/POS)
- [x] Basic sales reporting
- [x] SQLite database

### Phase 2 - Payments 🚧

- [ ] Stripe Terminal integration
- [ ] Square SDK integration
- [ ] Card reader support

### Phase 3 - OCR System 📋

- [ ] Mobile invoice scanning
- [ ] Google Vision OCR
- [ ] Product matching & reorder suggestions

### Phase 4 - Admin Dashboard 📊

- [ ] Web-based inventory management
- [ ] Sales analytics & reporting
- [ ] CSV export functionality

### Phase 5 - Advanced Printing 🏷️

- [ ] Label printing system
- [ ] Multi-printer support
- [ ] Custom receipt templates

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev                    # Start all services
npm run dev:backend           # Backend API only
npm run dev:electron          # Electron POS only
npm run dev:dashboard         # Dashboard only
npm run dev:mobile            # Mobile app only

# Building
npm run build                 # Build all
npm run build:backend         # Build backend
npm run build:electron        # Build Electron app
npm run build:dashboard       # Build dashboard

# Testing & Linting
npm run test                  # Run all tests
npm run lint                  # Lint all code
```

## 📋 Development Roadmap

See [plan.mdc](./plan.mdc) for detailed development phases and task breakdowns.

## 📊 Development Tracking

See [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) for real-time progress tracking, time logs, and session notes.

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL=sqlite:./pos.db

# API
PORT=3001
JWT_SECRET=your-secret-key

# Payments
STRIPE_SECRET_KEY=sk_test_...
SQUARE_APPLICATION_ID=your-app-id
SQUARE_ACCESS_TOKEN=your-access-token

# OCR
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
```

## 🏪 Store Type Configurations

| Store Type  | Key Features                     |
| ----------- | -------------------------------- |
| Convenience | Quick checkout, inventory alerts |
| Liquor      | Age verification, tax handling   |
| Smoke Shop  | SKU tracking, compliance         |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and questions:

- 📧 Email: support@yourcompany.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/pos-ecosystem/issues)
- 📖 Docs: [Documentation](./docs/)
