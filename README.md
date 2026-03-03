# ReUseTech - Used Electronics Resale Platform

A full-stack web application for buying and selling used electronics, built with Node.js, Express, MongoDB, and Vanilla JavaScript.

## 🚀 Features

- **User Authentication**
  - Register with name, email, and password
  - Login with JWT-based authentication
  - Role-based access control (user/admin)
  - Secure password hashing with bcrypt

- **Product Management**
  - Create, read, update, and delete products
  - Upload product details (title, description, category, condition, price, image)
  - View all products with search and filter capabilities
  - User dashboard to manage own products

- **Search & Filter**
  - Search products by title or description
  - Filter by category
  - Filter by price range

- **Admin Panel**
  - View all products
  - Delete any product
  - View statistics

## 📁 Project Structure

```
AT PROJECT/
├── client/                      # Frontend files
│   ├── css/
│   │   └── style.css           # Main stylesheet
│   ├── js/
│   │   ├── app.js              # Common utilities
│   │   ├── auth.js             # Login/Register functionality
│   │   ├── home.js             # Homepage functionality
│   │   ├── dashboard.js        # User dashboard
│   │   ├── product.js          # Add product
│   │   ├── product-details.js  # Product details page
│   │   └── admin.js            # Admin panel
│   ├── index.html              # Home page
│   ├── login.html              # Login page
│   ├── register.html           # Registration page
│   ├── dashboard.html          # User dashboard
│   ├── add-product.html        # Add product page
│   ├── product-details.html    # Product details page
│   └── admin.html              # Admin panel
├── server/                      # Backend files
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic
│   │   └── productController.js # Product CRUD logic
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication middleware
│   │   └── errorHandler.js     # Error handling middleware
│   ├── models/
│   │   ├── User.js             # User model
│   │   └── Product.js          # Product model
│   ├── routes/
│   │   ├── authRoutes.js       # Auth API routes
│   │   └── productRoutes.js    # Product API routes
│   └── server.js               # Main server file
├── .env.example                # Example environment variables
├── .gitignore                  # Git ignore file
├── package.json                # Dependencies
└── README.md                   # This file
```

## 🛠️ Tech Stack

**Backend:**

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

**Frontend:**

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- No heavy frameworks

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (v4 or higher)
- npm (comes with Node.js)

## 🔧 Installation & Setup

### 1. Clone or Download the Repository

```bash
cd "AT PROJECT"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/reusetech
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5000
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows (if MongoDB is installed as a service)
net start MongoDB

# Mac/Linux
mongod
```

### 5. Run the Application

**Development mode (with auto-restart):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The application will be available at: `http://localhost:5000`

## 🎯 API Endpoints

### Authentication Routes

| Method | Endpoint             | Description       | Auth Required |
| ------ | -------------------- | ----------------- | ------------- |
| POST   | `/api/auth/register` | Register new user | No            |
| POST   | `/api/auth/login`    | Login user        | No            |
| GET    | `/api/auth/me`       | Get current user  | Yes           |

### Product Routes

| Method | Endpoint                     | Description                     | Auth Required     |
| ------ | ---------------------------- | ------------------------------- | ----------------- |
| GET    | `/api/products`              | Get all products (with filters) | No                |
| GET    | `/api/products/:id`          | Get single product              | No                |
| GET    | `/api/products/user/:userId` | Get products by user            | No                |
| POST   | `/api/products`              | Create new product              | Yes               |
| PUT    | `/api/products/:id`          | Update product                  | Yes (owner/admin) |
| DELETE | `/api/products/:id`          | Delete product                  | Yes (owner/admin) |

### Query Parameters for GET `/api/products`

- `search` - Search in title/description
- `category` - Filter by category
- `minPrice` - Minimum price
- `maxPrice` - Maximum price

**Example:**

```
GET /api/products?search=iphone&category=Smartphones&minPrice=100&maxPrice=500
```

## 👤 Default User Roles

When registering, you can choose between:

- **user** - Can create, edit, and delete their own products
- **admin** - Can delete any product, access admin panel

## 🗄️ Database Schema

### User Schema

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  createdAt: Date
}
```

### Product Schema

```javascript
{
  title: String,
  description: String,
  category: String (enum),
  condition: String (enum),
  price: Number,
  imageUrl: String,
  seller: ObjectId (ref: User),
  sellerName: String,
  status: String (enum: ['available', 'sold', 'reserved']),
  createdAt: Date
}
```

## 📦 Available Categories

- Smartphones
- Laptops
- Tablets
- Cameras
- Audio
- Gaming
- Wearables
- Accessories
- Other

## 🔐 Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens for authentication
- Protected routes with middleware
- Role-based authorization
- Input validation
- XSS protection via escaping

## 🎨 Styling

The application uses a modern, responsive design with:

- CSS Grid and Flexbox
- Mobile-first approach
- Clean color scheme
- Professional UI components
- Smooth transitions and hover effects

## 🐛 Troubleshooting

**MongoDB Connection Error:**

- Ensure MongoDB is running
- Check the `MONGODB_URI` in `.env`

**Port Already in Use:**

- Change the `PORT` in `.env`
- Or kill the process using port 5000

**JWT Token Issues:**

- Make sure `JWT_SECRET` is set in `.env`
- Clear localStorage in browser if tokens persist

## 📝 Development Tips

1. **Adding New Features:**
   - Backend: Add controller → Add route → Test with Postman
   - Frontend: Add HTML → Add CSS → Add JavaScript

2. **Testing:**
   - Test API endpoints with Postman/Thunder Client
   - Use browser DevTools console for frontend debugging
   - Check MongoDB data with MongoDB Compass

3. **Code Style:**
   - All code is well-commented
   - Follow existing patterns
   - Use consistent naming conventions

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/reusetech
JWT_SECRET=very_secure_random_string_here
```

### Deployment Platforms

- **Backend:** Heroku, Railway, Render, DigitalOcean
- **Database:** MongoDB Atlas (free tier available)

## 📞 Support

For issues or questions:

1. Check this README
2. Review code comments
3. Check browser console for errors
4. Verify MongoDB connection

## 📄 License

MIT License - Feel free to use this project for learning and development.

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Introduction](https://jwt.io/introduction)

---

**Happy Coding! 🚀**

Built with ❤️ for learning full-stack development.
