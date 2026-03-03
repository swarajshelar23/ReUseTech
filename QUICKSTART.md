# ReUseTech - Quick Start Guide

## 🚀 Quick Setup (3 Steps)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Setup Environment

```bash
# Copy example environment file
copy .env.example .env

# Edit .env and update if needed (default values work for local development)
```

### Step 3: Start the Application

```bash
# Make sure MongoDB is running first!

# Then start the server
npm start

# Or use development mode with auto-reload
npm run dev
```

Visit: **http://localhost:5000**

## 📱 Testing the Application

### 1. Register a New User

- Go to http://localhost:5000/register
- Fill in the form with:
  - Name: Your Name
  - Email: your@email.com
  - Password: password123
  - Role: user or admin
- Click "Register"

### 2. Add a Product

- After login, click "Add Product"
- Fill in all fields:
  - Title: "iPhone 12 Pro 128GB"
  - Description: "Excellent condition, barely used"
  - Category: Smartphones
  - Condition: Excellent
  - Price: 500
  - Image URL: (optional)
- Click "Add Product"

### 3. Test Search & Filter

- Go to home page
- Use search bar to find products
- Use filters to narrow results
- Click on any product to view details

### 4. Manage Your Products (Dashboard)

- Click "Dashboard" in navigation
- View all your products
- Edit or delete products

### 5. Admin Panel (admin users only)

- Register with role "admin"
- Access http://localhost:5000/admin
- View all products across platform
- Delete any product

## 🐛 Troubleshooting

**Problem:** MongoDB connection error
**Solution:** Start MongoDB service

```bash
# Windows
net start MongoDB

# Mac/Linux
mongod
```

**Problem:** Port 5000 already in use
**Solution:** Change port in .env file

```env
PORT=3000
```

**Problem:** Cannot login after registration
**Solution:** Check browser console and MongoDB if user was created

## 📚 API Testing with Thunder Client / Postman

### Register User

```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

### Login

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Product (requires token)

```http
POST http://localhost:5000/api/products
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "title": "iPhone 12",
  "description": "Great condition",
  "category": "Smartphones",
  "condition": "Excellent",
  "price": 500,
  "imageUrl": "https://via.placeholder.com/400"
}
```

### Get All Products

```http
GET http://localhost:5000/api/products
```

### Search Products

```http
GET http://localhost:5000/api/products?search=iphone&category=Smartphones&minPrice=100&maxPrice=1000
```

## 🎯 Next Steps

1. ✅ Run the application locally
2. ✅ Create a few test products
3. ✅ Test all features manually
4. ✅ Deploy to production (optional)

## 📞 Need Help?

- Check [README.md](README.md) for complete documentation
- Review code comments in source files
- Check browser console for JavaScript errors
- Verify MongoDB connection and data

---

**Happy Testing! 🎉**
