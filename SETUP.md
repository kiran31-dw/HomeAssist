# Setup Instructions

## Quick Start Guide

### 1. Install Dependencies

```bash
npm run install-all
```

### 2. Database Setup

1. **Create MySQL Database:**
   ```sql
   CREATE DATABASE homeassist_db;
   ```

2. **Configure Environment:**
   - Copy `backend/.env.example` to `backend/.env`
   - Update database credentials:
     ```env
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=homeassist_db
     JWT_SECRET=your_random_secret_key_here
     ```

3. **Run Database Schema:**
   ```bash
   mysql -u root -p homeassist_db < backend/database/schema.sql
   ```

4. **Setup Admin Password (Important!):**
   ```bash
   cd backend
   npm run setup-admin
   ```
   
   This will properly hash the admin password. Default credentials:
   - Email: `admin@homeassist.com`
   - Password: `admin123`

### 3. Start the Application

```bash
# From root directory
npm run dev
```

This starts both backend (port 5000) and frontend (port 3000).

### 4. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

## Testing the Application

### 1. Register as a User
- Go to http://localhost:3000/register
- Select "User (Homeowner)"
- Fill in the registration form
- You'll be redirected to the user dashboard

### 2. Register as a Provider
- Go to http://localhost:3000/register
- Select "Service Provider"
- Fill in provider details including service category
- Note: Provider accounts need admin verification before they can receive bookings

### 3. Login as Admin
- Go to http://localhost:3000/login
- Select "Admin"
- Use credentials: `admin@homeassist.com` / `admin123`
- Verify providers, view analytics, manage services

### 4. Test the Chatbot
- Login as a user
- Go to the home page
- Use the chatbot to request a service (e.g., "I need an electrician for tomorrow")
- The chatbot will suggest providers and help you book

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Check credentials in `backend/.env`
- Verify database exists: `SHOW DATABASES;`

### Port Already in Use
- Backend: Change `PORT` in `backend/.env`
- Frontend: Set `PORT=3001` in `frontend/.env` (create if needed)

### Module Not Found Errors
- Run `npm install` in both `backend/` and `frontend/` directories
- Delete `node_modules` and reinstall if issues persist

### Admin Login Not Working
- Run `npm run setup-admin` in the backend directory
- Or manually update the admin password hash in the database

## Production Deployment

1. **Environment Variables:**
   - Set strong `JWT_SECRET`
   - Use production database credentials
   - Enable HTTPS

2. **Build Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

3. **Security:**
   - Change default admin password
   - Use environment variables for all secrets
   - Enable CORS only for your domain
   - Use rate limiting
   - Enable SQL injection protection (already implemented with parameterized queries)

4. **Database:**
   - Use connection pooling (already configured)
   - Set up regular backups
   - Use read replicas for scaling

## Next Steps

- Add payment integration
- Implement email notifications
- Add real-time chat
- Deploy to cloud (AWS, Heroku, etc.)
- Set up CI/CD pipeline
