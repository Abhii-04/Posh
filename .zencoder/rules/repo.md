---
description: Repository Information Overview
alwaysApply: true
---

# Elegance Perfumery Web Application

## Repository Summary
This repository contains a web application for "Elegance Perfumery" - an e-commerce platform for perfume products. The application is built with a Node.js Express backend and HTML/CSS/JavaScript frontend, using Supabase for authentication and database services.

## Repository Structure
- **frontend/**: Contains HTML templates, CSS styles, and JavaScript files
  - **templates/**: HTML pages for the website (login, register, product, etc.)
  - **static/**: CSS styles and JavaScript files
- **backend/**: Node.js Express application
  - **routes/**: API routes and endpoints
  - **models/**: Database models
  - **config/**: Configuration files for database and authentication
  - **middleware/**: Express middleware
- **admin/**: Admin panel HTML templates

## Projects

### Backend (Node.js Express)
**Configuration File**: backend/package.json

#### Language & Runtime
**Language**: JavaScript (ES Modules)
**Version**: Node.js
**Build System**: npm
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- @supabase/supabase-js: ^2.76.1
- express: ^5.1.0
- mongoose: ^8.19.1
- bcrypt: ^6.0.0
- passport: ^0.7.0
- dotenv: ^17.2.3
- ejs: ^3.1.10

**Development Dependencies**:
- nodemon: ^3.1.10

#### Build & Installation
```bash
cd backend
npm install
npm start
```

#### Database
**Type**: MongoDB and Supabase
**Configuration**: 
- MongoDB connection in config/db.js
- Supabase configuration in routes/supabase.js

#### Main Files
**Entry Point**: app.js
**Routes**: routes/routes.js
**Authentication**: routes/auth.js, config/passport.js
**Models**: models/User.js, models/perfume.js, models/order.js

### Frontend (HTML/CSS/JavaScript)
**Type**: Static HTML with JavaScript

#### Structure
**Templates**: frontend/templates/*.html
**Styles**: frontend/static/Styles/
**Scripts**: frontend/static/Scripts/

#### Dependencies
**External Libraries**:
- Supabase JS Client (CDN): @supabase/supabase-js@2
- Font Awesome: 6.0.0

#### Integration Points
- Connects to backend API endpoints
- Uses Supabase for authentication
- Implements Google OAuth login

### Admin Panel
**Type**: HTML templates for administration

#### Structure
**Templates**: admin/*.html
**Functionality**: 
- Dashboard
- Product management
- FAQ management
- Portfolio management
- Quiz management