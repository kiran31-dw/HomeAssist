# AI HomeAssist - Home Service Booking Platform

AI HomeAssist is a comprehensive web-based AI-powered home service booking platform that connects homeowners with verified service professionals. The platform features an intelligent chatbot, provider matching algorithm, and complete management systems for users, providers, and administrators.

## Features

### 🤖 AI-Powered Chatbot
- Natural language processing for service requests
- Intelligent service type detection
- Urgency level identification
- Automatic provider matching and suggestions
- Seamless booking through conversation

### 👥 User Module
- User registration and authentication
- Browse and search services by category
- View provider profiles with ratings and reviews
- Book services with date/time selection
- Manage appointments and bookings
- Submit reviews and ratings

### 🔧 Service Provider Module
- Provider registration with verification
- Manage availability status
- Set pricing and service details
- View and manage assigned jobs
- Track performance metrics and ratings
- Update job status (pending → confirmed → in_progress → completed)

### 👨‍💼 Admin Module
- Verify and manage service providers
- Monitor all bookings and transactions
- Handle complaints and disputes
- View analytics and reports
- Manage users and services
- Add/edit service categories

## Tech Stack

### Frontend
- **React.js** - UI framework
- **React Router** - Navigation
- **Axios** - API communication
- **CSS3** - Styling and responsive design

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Natural** - NLP for chatbot

## Project Structure

```
HomeAssist/
├── backend/
│   ├── config/
│   │   └── database.js          # MySQL connection pool
│   ├── database/
│   │   └── schema.sql            # Database schema
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── users.js              # User routes
│   │   ├── providers.js          # Provider routes
│   │   ├── bookings.js           # Booking routes
│   │   ├── admin.js              # Admin routes
│   │   ├── chatbot.js            # Chatbot routes
│   │   └── complaints.js         # Complaint routes
│   ├── utils/
│   │   └── aiChatbot.js          # AI chatbot logic
│   ├── server.js                 # Express server
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Chatbot.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── user/
│   │   │   ├── provider/
│   │   │   └── admin/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Step 1: Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (backend + frontend)
npm run install-all
```

### Step 2: Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE homeassist_db;
```

2. Update database credentials in `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=homeassist_db
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
```

3. Run the schema file:
```bash
mysql -u root -p homeassist_db < backend/database/schema.sql
```

Or import it through MySQL Workbench/phpMyAdmin.

### Step 3: Start the Application

```bash
# Start both backend and frontend concurrently
npm run dev

# Or start them separately:
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Admin Credentials

After running the schema, you can login as admin:
- **Email:** admin@homeassist.com
- **Password:** admin123

**Note:** Make sure to change the default admin password in production!

## API Endpoints

### Authentication
- `POST /api/auth/register/user` - User registration
- `POST /api/auth/register/provider` - Provider registration
- `POST /api/auth/login/user` - User login
- `POST /api/auth/login/provider` - Provider login
- `POST /api/auth/login/admin` - Admin login

### User Routes
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/services` - Browse services
- `GET /api/users/providers` - Get providers
- `GET /api/users/providers/:id` - Get provider details
- `GET /api/users/bookings` - Get user bookings

### Booking Routes
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/status` - Update booking status
- `POST /api/bookings/:id/review` - Submit review

### Provider Routes
- `GET /api/providers/profile` - Get provider profile
- `PUT /api/providers/profile` - Update provider profile
- `GET /api/providers/jobs` - Get assigned jobs
- `GET /api/providers/performance` - Get performance stats

### Admin Routes
- `GET /api/admin/analytics` - Get analytics
- `GET /api/admin/providers` - Get all providers
- `PUT /api/admin/providers/:id/verify` - Verify provider
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/complaints` - Get all complaints
- `PUT /api/admin/complaints/:id` - Update complaint
- `GET /api/admin/users` - Get all users
- `GET /api/admin/services` - Get all services
- `POST /api/admin/services` - Add service

### Chatbot Routes
- `POST /api/chatbot/message` - Send message to chatbot
- `POST /api/chatbot/book` - Create booking from chatbot

## Database Schema

### Tables
- **users** - User accounts
- **service_providers** - Service provider accounts
- **services** - Available services
- **bookings** - Service bookings
- **ratings_reviews** - User reviews and ratings
- **complaints** - User complaints
- **admin** - Admin accounts
- **provider_services** - Provider-service relationships

## AI Chatbot Features

The chatbot uses natural language processing to:
1. **Extract Service Type** - Identifies the service needed (electrical, plumbing, etc.)
2. **Detect Urgency** - Determines urgency level (low, medium, high, emergency)
3. **Parse Date/Time** - Extracts scheduling preferences from natural language
4. **Match Providers** - Suggests suitable providers based on:
   - Service category match
   - Verification status
   - Availability
   - Rating and reviews
   - Pricing

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (User, Provider, Admin)
- Protected routes and API endpoints
- Input validation and sanitization

## Future Enhancements

- ML models for demand prediction
- Cost estimation algorithms
- Real-time notifications
- Payment integration
- Mobile app (React Native)
- Advanced analytics dashboard
- Email/SMS notifications
- Calendar integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Security

The project has some known vulnerabilities in development dependencies (react-scripts). These do not affect production builds. See [SECURITY.md](SECURITY.md) for details.

## Support

For issues and questions, please open an issue on the repository.

---

Built with ❤️ using React, Node.js, and MySQL
