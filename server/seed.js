/**
 * Seed Script - Populates MongoDB with dummy users and products
 * Run with: node server/seed.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User    = require('./models/User');
const Product = require('./models/Product');

// ─── Dummy Users ────────────────────────────────────────────────────────────
const users = [
  { name: 'Alice Johnson',  email: 'alice@reusetech.com',  password: 'Test@123', role: 'admin' },
  { name: 'Bob Smith',      email: 'bob@reusetech.com',    password: 'Test@123', role: 'user'  },
  { name: 'Carol White',    email: 'carol@reusetech.com',  password: 'Test@123', role: 'user'  },
  { name: 'David Brown',    email: 'david@reusetech.com',  password: 'Test@123', role: 'user'  },
  { name: 'Eva Martinez',   email: 'eva@reusetech.com',    password: 'Test@123', role: 'user'  },
];

// ─── Dummy Products ─────────────────────────────────────────────────────────
const productTemplates = [
  {
    title: 'iPhone 13 Pro 256GB',
    description: 'Barely used iPhone 13 Pro in Sierra Blue. Comes with original box, charger, and two unused cables. Battery health at 97%. No scratches on screen, minor scuff on the back corner.',
    category: 'Smartphones',
    condition: 'Like New',
    price: 55000,
    imageUrl: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400&h=300&fit=crop',
    status: 'available'
  },
  {
    title: 'Samsung Galaxy S22 Ultra',
    description: 'Samsung Galaxy S22 Ultra 12GB RAM 256GB storage in Phantom Black. S-Pen included. Screen is perfect, battery holds well (92% health). Selling because I upgraded.',
    category: 'Smartphones',
    condition: 'Excellent',
    price: 42000,
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=300&fit=crop',
    status: 'available'
  },
  {
    title: 'Dell XPS 15 Laptop (2022)',
    description: 'Dell XPS 15 9520 with Intel Core i7-12700H, 16GB RAM, 512GB SSD, NVIDIA RTX 3050 Ti. Purchased 8 months ago. Excellent performance for coding and design work. Comes with original charger.',
    category: 'Laptops',
    condition: 'Excellent',
    price: 88000,
    imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=300&fit=crop',
    status: 'available'
  },
  {
    title: 'MacBook Air M1 (8GB/256GB)',
    description: 'MacBook Air M1 chip, 8GB unified memory, 256GB SSD, Space Gray. Used for light college work. Battery cycle count: 180. No dents or scratches. Charger included.',
    category: 'Laptops',
    condition: 'Good',
    price: 65000,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
    status: 'available'
  },
  {
    title: 'iPad Pro 11-inch 2021 (128GB)',
    description: 'Apple iPad Pro 11-inch M1 chip, Wi-Fi, 128GB in Silver. Used with a good case so the device is pristine. Apple Pencil 2nd Gen compatible. Selling without Apple Pencil.',
    category: 'Tablets',
    condition: 'Like New',
    price: 48000,
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop',
    status: 'available'
  },
  {
    title: 'Sony Alpha A7 III Mirrorless Camera',
    description: 'Sony A7 III full-frame mirrorless camera body only. Shutter count: ~8,200. Comes with original box, battery, charger, and body cap. No warranty remaining. Great condition.',
    category: 'Cameras',
    condition: 'Good',
    price: 120000,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop',
    status: 'available'
  },
  {
    title: 'Sony WH-1000XM5 Headphones',
    description: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones in Black. Purchased 4 months ago. Works flawlessly. Includes original carry case, USB-C cable, and 3.5mm adapter.',
    category: 'Audio',
    condition: 'Like New',
    price: 18000,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    status: 'available'
  },
  {
    title: 'JBL Charge 5 Bluetooth Speaker',
    description: 'JBL Charge 5 portable waterproof speaker in Blue. 20 hours battery life, IP67 rated. Sold with USB-C cable. Minor surface scratches but fully functional.',
    category: 'Audio',
    condition: 'Good',
    price: 7500,
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop',
    status: 'available'
  },
  {
    title: 'PlayStation 5 Disc Edition',
    description: 'PS5 Disc Edition in excellent condition. Includes 1 DualSense controller, HDMI cable, and power cord. Played mostly on weekends. No issues at all.',
    category: 'Gaming',
    condition: 'Excellent',
    price: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400&h=300&fit=crop',
    status: 'available'
  },
  {
    title: 'Nintendo Switch OLED Model',
    description: 'Nintendo Switch OLED White model. Includes dock, two Joy-Con controllers, HDMI cable, and charger. Screen is perfect — no dead pixels. Comes with a screen protector applied.',
    category: 'Gaming',
    condition: 'Excellent',
    price: 22000,
    imageUrl: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=300&fit=crop',
    status: 'available'
  },
  {
    title: 'Apple Watch Series 8 (45mm)',
    description: 'Apple Watch Series 8 GPS, 45mm in Midnight Aluminum. Comes with 2 bands. Battery health 91%. Used daily for 6 months. Minor light scratches on the casing, screen is perfect.',
    category: 'Wearables',
    condition: 'Good',
    price: 25000,
    imageUrl: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=400&h=300&fit=crop',
    status: 'available'
  },
  {
    title: 'Anker 65W USB-C Charger + Hub',
    description: 'Anker 543 USB-C Hub (6-in-1) with 65W Power Delivery, 4K HDMI, SD card reader, USB 3.0 ports. Used for 3 months. Works perfectly, selling as I switched to a docking station.',
    category: 'Accessories',
    condition: 'Like New',
    price: 2800,
    imageUrl: 'https://images.unsplash.com/photo-1625895197185-efcec01cffe0?w=400&h=300&fit=crop',
    status: 'available'
  },
  {
    title: 'OnePlus 10 Pro 5G (12GB/256GB)',
    description: 'OnePlus 10 Pro in Volcanic Black. 12GB RAM, 256GB storage, Hasselblad camera system. Comes with original box and 80W fast charger. No cracks or major scratches.',
    category: 'Smartphones',
    condition: 'Good',
    price: 32000,
    imageUrl: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&h=300&fit=crop',
    status: 'available'
  },
  {
    title: 'Logitech MX Master 3 Mouse',
    description: 'Logitech MX Master 3 wireless mouse in Graphite. Used for 5 months. All buttons and scroll wheels work perfectly. Comes with USB-C cable and Unifying receiver.',
    category: 'Accessories',
    condition: 'Excellent',
    price: 4500,
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop',
    status: 'available'
  },
  {
    title: 'GoPro Hero 11 Black',
    description: 'GoPro Hero 11 Black with 2 batteries, dual charger, mounting kit, and protective case. Shot mostly travel vlogs. 5.3K video, HyperSmooth 5.0 stabilization. Excellent condition.',
    category: 'Cameras',
    condition: 'Excellent',
    price: 28000,
    imageUrl: 'https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=400&h=300&fit=crop',
    status: 'sold'
  },
  {
    title: 'Samsung Galaxy Tab S8',
    description: 'Samsung Galaxy Tab S8 Wi-Fi, 128GB in Silver. S-Pen included. Barely used — bought it for a trip and barely touched it since. Screen is flawless.',
    category: 'Tablets',
    condition: 'Like New',
    price: 38000,
    imageUrl: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=300&fit=crop',
    status: 'available'
  }
];

// ─── Seed Function ────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing users and products');

    // Create users (passwords hashed via pre-save hook)
    const createdUsers = await User.create(users);
    console.log(`👤 Created ${createdUsers.length} dummy users`);
    createdUsers.forEach(u => console.log(`   • ${u.name} <${u.email}> [${u.role}]`));

    // Assign products round-robin across non-admin users
    const sellers = createdUsers.filter(u => u.role === 'user');
    const products = productTemplates.map((p, i) => ({
      ...p,
      seller:     sellers[i % sellers.length]._id,
      sellerName: sellers[i % sellers.length].name
    }));

    const createdProducts = await Product.insertMany(products);
    console.log(`📦 Created ${createdProducts.length} dummy products`);
    createdProducts.forEach(p => console.log(`   • [${p.category}] ${p.title} — ₹${p.price.toLocaleString()}`));

    console.log('\n✅ Seeding complete!');
    console.log('\n📋 Login credentials:');
    console.log('   Admin : alice@reusetech.com  / Test@123');
    console.log('   User  : bob@reusetech.com    / Test@123');
    console.log('   User  : carol@reusetech.com  / Test@123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();
