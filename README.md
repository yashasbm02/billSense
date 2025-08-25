# BillSense

This project is "vibe-coded" for most of the boilerplates including db schema for v0.1.1. Each and every line will be reviewed for further versions.
A web application that simplifies bill splitting by using OCR to scan receipts, extract itemized data, and provide an intuitive interface for users to assign items to different people for accurate cost calculation.

## Features

- 📷 Receipt scanning with OCR
- 🧾 Automatic itemized data extraction
- 👥 Participant management
- 🎯 Interactive item assignment
- 💰 Smart split calculation with tax and tip distribution
- 📱 Modern, responsive UI

## Tech Stack

- **Frontend**: React.js with TypeScript, Tailwind CSS
- **Backend**: Node.js with Express and TypeScript
- **Database**: PostgreSQL
- **OCR**: Tesseract.js
- **Image Processing**: Sharp

## Project Structure

```
billsense/
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── shared/           # Shared TypeScript types
└── database/         # Database schema and migrations
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Set up the database:
   ```bash
   cd backend
   npm run db:setup
   ```

4. Start the development servers:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

5. Open http://localhost:3000 in your browser

## Development

- Frontend runs on http://localhost:3000
- Backend API runs on http://localhost:5000
- Database runs on localhost:5432

## API Documentation

See `/backend/README.md` for detailed API documentation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request
