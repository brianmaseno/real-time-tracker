# Real-Time Location Tracker

A comprehensive real-time location tracking system for multivendor delivery platforms like Rapido or Dunzo.

## 🚀 Features

### Vendor Dashboard
- View and manage orders
- Assign delivery partners to orders
- Real-time order status tracking
- Dashboard with order statistics

### Delivery Partner Dashboard
- View assigned orders
- Real-time location tracking
- Start/stop delivery tracking
- Update order status (picked up, in transit, delivered)

### Customer Tracking
- Real-time map view with delivery partner location
- Order status updates
- Estimated delivery time
- Auto-updates every 2-3 seconds

## 🛠 Tech Stack

### Frontend
- **Next.js** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Leaflet.js** - Interactive maps
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd real-time-tracker

# Install dependencies
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/real-time-tracker

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Socket.IO Configuration
SOCKET_CORS_ORIGIN=http://localhost:3000
```

### 3. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. The application will automatically create the database and collections

#### Option B: MongoDB Atlas (Cloud)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get the connection string
4. Update `MONGODB_URI` in your `.env` file

### 4. Start the Application

#### Development Mode (Recommended)
Run both frontend and backend simultaneously:

```bash
npm run dev:all
```

This will start:
- Backend server on http://localhost:5000
- Frontend on http://localhost:3000

#### Separate Mode
Start backend and frontend separately:

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 👥 Demo Accounts

For testing purposes, you can create accounts with these sample credentials:

### Vendor Account
- **Email**: vendor@demo.com
- **Password**: password123
- **Role**: Vendor

### Delivery Partner Account
- **Email**: delivery@demo.com
- **Password**: password123
- **Role**: Delivery Partner

## 🗺 Map Configuration

The application uses Leaflet.js with OpenStreetMap tiles (free). For production, consider:

- **Google Maps API** - Better accuracy and features
- **Mapbox** - Customizable styling and good performance
- **HERE Maps** - Enterprise-grade mapping

To switch map providers, update the map configuration in the frontend components.

## 📱 Usage Guide

### For Vendors
1. **Register/Login** as a vendor
2. **Create Orders** with pickup and delivery addresses
3. **Assign Delivery Partners** to orders
4. **Track Progress** in real-time
5. **View Dashboard** with order statistics

### For Delivery Partners
1. **Register/Login** as a delivery partner
2. **Go Online** to receive order assignments
3. **Accept Orders** and start tracking
4. **Update Status** as you progress (picked up → in transit → delivered)
5. **Share Location** in real-time

### For Customers
1. **Track Orders** using the tracking ID
2. **View Real-time Location** of delivery partner
3. **Get Status Updates** automatically

## 🏗 Project Structure

```
├── src/
│   ├── components/          # Reusable React components
│   ├── contexts/           # React contexts (Auth, etc.)
│   ├── pages/              # Next.js pages
│   ├── styles/             # CSS styles
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions and API client
├── server/
│   ├── middleware/         # Express middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   └── index.js           # Server entry point
├── public/                # Static assets
├── .env                   # Environment variables
└── package.json           # Dependencies and scripts
```

## 🔄 Real-time Features

### Location Updates
- Delivery partners share location every 2-3 seconds
- Customers see live updates on the map
- Vendors can track all active deliveries

### Order Status Updates
- Real-time notifications for status changes
- Socket.IO for instant updates
- No page refresh required

### Delivery Partner Status
- Online/offline status tracking
- Automatic assignment based on availability

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Build the frontend
npm run build

# Deploy to Vercel
vercel --prod
```

### Backend (Railway/Render)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Database (MongoDB Atlas)
1. Use MongoDB Atlas for production
2. Update connection string in environment variables
3. Configure network access and database users

## 🔒 Security Considerations

- **JWT Authentication** with secure secret keys
- **Password Hashing** using bcryptjs
- **CORS Configuration** for cross-origin requests
- **Input Validation** on all API endpoints
- **Rate Limiting** (recommended for production)

## 🧪 Testing

### Manual Testing
1. Start the application
2. Create vendor and delivery partner accounts
3. Create orders and assign delivery partners
4. Test real-time location tracking
5. Verify all user roles and permissions

### API Testing
Use tools like Postman or curl to test API endpoints:

```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vendor@demo.com","password":"password123"}'
```

## 📈 Performance Optimization

### Frontend
- Code splitting with Next.js
- Image optimization
- Lazy loading of map components
- Debounced location updates

### Backend
- Database indexing
- Connection pooling
- Response caching
- Rate limiting

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Check network connectivity for Atlas

2. **Socket.IO Connection Issues**
   - Verify CORS configuration
   - Check firewall settings
   - Ensure both frontend and backend are running

3. **Geolocation Not Working**
   - Enable location services in browser
   - Use HTTPS in production
   - Handle permission denied errors

4. **Map Not Loading**
   - Check internet connection
   - Verify map tile service is accessible
   - Check for JavaScript errors in console

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenStreetMap for free map tiles
- Leaflet.js for the mapping library
- Socket.IO for real-time communication
- MongoDB for the database solution

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Search existing GitHub issues
3. Create a new issue with detailed information
4. Contact the development team

---

**Built with ❤️ for efficient delivery tracking**
