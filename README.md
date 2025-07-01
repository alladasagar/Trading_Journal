# 📈 Trading Journal

A modern and responsive web application to track and analyze trades. It helps traders log entries, analyze strategy performance, and improve decision-making over time.

---

## 🧠 What It Does

- Add, view, and edit individual trades  
- Associate trades with strategies, mistakes, and emotions  
- Auto-calculate metrics like P&L, ROI, and trade duration  
- View monthly trade performance in a color-coded calendar  
- Plan trades ahead using a dedicated premarket planner  

---

## 🚀 Performance Optimization Results

| Area     | Before Optimization | After Optimization |
|----------|---------------------|--------------------|
| Frontend | > 5 seconds         | < 1 second         |
| Backend  | > 3 seconds         | < 1 second         |

---

## ⚙️ Frontend Optimizations

- **React Lazy Loading**  
  Dynamic imports for large modules reduced initial bundle size and improved load time.

- **Code Splitting**  
  Components were separated into chunks to ensure only necessary code loads when needed.

- **React.memo & useMemo**  
  Used to avoid unnecessary re-renders and ensure only essential components render on load.

- **Image Optimization**  
  Images were compressed and delivered via Cloudinary CDN.  
  Canvas was used to reduce image size further and enhance performance.

---

## 🛠 Backend Optimizations

- **Caching Layer**  
  A 10-minute in-memory cache was implemented to reduce database calls and speed up responses.

- **MongoDB Query Optimization**  
  Field projections were used to fetch only required fields, improving efficiency and reducing payload size.

- **Database Indexing**  
  Indexes were added to critical fields used in filters and sorting to significantly improve query performance.

---

## 🧱 Tech Stack

| Layer     | Technology                |
|-----------|---------------------------|
| Frontend  | React, Tailwind CSS       |
| Backend   | Node.js, Express.js       |
| Database  | MongoDB (Mongoose)        |
| Auth      | JWT-based authentication  |
| Cloud     | Cloudinary (image hosting)|

---

## 📦 Features Overview

- 📋 Add/Edit/Delete trades with full details  
- 📊 Auto-generated analytics: Net P&L, ROI, Win percentage, and more  
- 📈 Monthly trade graph to visualize Net P&L trends  
- 📆 Color-coded calendar to track profitable and losing days  
- 🧠 Strategy builder with mistake and emotion tracking  
- 📷 Screenshot uploads for each trade  
- 📝 Premarket planner with custom notes and market expectations  

---

## 📂 Project Structure

### Frontend (`client/`)
```
src/
├── components/    # Reusable UI components 
├── pages/         # Route-based pages (Home, AddTrade, etc.)
├── apis/          # API service functions
├── utilities/     # Helper functions (e.g., cache)
└── ui/            # Custom UI elements and styling
```

### Backend (`server/`)
```
server/
├── controllers/   # Business logic for API routes
├── models/        # Mongoose schemas
├── routes/        # API route definitions
├── db.js          # MongoDB connection configuration
└── index.js       # Application entry point
```

---

## 🧪 Testing

- ✅ Manual Testing  
  The application was manually tested with over 50+ test cases including various trade and strategy operations to ensure accuracy and stability.

- ✅ API Testing  
  All backend APIs were tested using Postman, covering all CRUD operations and various edge cases for trades, strategies, and premarket planning.

---

## 👤 Developer

**Sagar Allada**  
Email: `sagar@example.com`  
GitHub: [@sagarallada](https://github.com/sagarallada)
