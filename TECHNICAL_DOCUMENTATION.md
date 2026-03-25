# AI HomeAssist - Comprehensive Technical Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Database Design](#database-design)
5. [API Documentation](#api-documentation)
6. [Algorithms & Data Structures](#algorithms--data-structures)
7. [Security Implementation](#security-implementation)
8. [Frontend Architecture](#frontend-architecture)
9. [Backend Architecture](#backend-architecture)
10. [AI Chatbot Implementation](#ai-chatbot-implementation)
11. [Location-Based Services](#location-based-services)
12. [File Structure & Code Organization](#file-structure--code-organization)

---

## System Overview

**AI HomeAssist** is a full-stack web application that connects homeowners with verified service providers through an AI-powered booking platform. The system implements a three-tier architecture with role-based access control for Users, Service Providers, and Administrators.

### Core Functionality
- **User Management**: Registration, authentication, profile management
- **Service Provider Management**: Registration, verification workflow, availability management
- **Booking System**: Service booking with date/time scheduling, status tracking
- **AI Chatbot**: Natural language processing for service discovery and booking
- **Location-Based Matching**: Haversine formula for distance calculation and provider matching
- **Review & Rating System**: Post-service feedback mechanism
- **Complaint Management**: Dispute resolution workflow
- **Admin Dashboard**: Analytics, provider verification, complaint handling

---

## Architecture

### System Architecture Pattern: **3-Tier Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│  React.js Frontend (Port 3000)                          │
│  - React Router for Navigation                          │
│  - Context API for State Management                     │
│  - Axios for HTTP Communication                        │
└─────────────────────────────────────────────────────────┘
                          ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                     │
│  Node.js + Express.js Backend (Port 5000)               │
│  - RESTful API Endpoints                                 │
│  - JWT Authentication Middleware                         │
│  - Business Logic & Validation                           │
│  - AI Chatbot Processing                                 │
└─────────────────────────────────────────────────────────┘
                          ↕ SQL Queries
┌─────────────────────────────────────────────────────────┐
│                      DATA LAYER                          │
│  MySQL Database (homeassist_db)                         │
│  - Relational Database                                   │
│  - Connection Pooling                                    │
│  - Foreign Key Constraints                              │
└─────────────────────────────────────────────────────────┘
```

### Communication Flow
1. **Client-Server**: RESTful API over HTTP/HTTPS
2. **Authentication**: JWT tokens in Authorization headers
3. **Data Format**: JSON for request/response payloads
4. **Database**: MySQL with connection pooling for concurrent requests

---

## Technology Stack

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **React.js** | 18.2.0 | UI framework, component-based architecture |
| **React Router DOM** | 6.20.0 | Client-side routing and navigation |
| **Axios** | 1.6.2 | HTTP client for API communication |
| **React Context API** | Built-in | Global state management (authentication) |
| **CSS3** | - | Styling and responsive design |

### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | - | JavaScript runtime environment |
| **Express.js** | 4.18.2 | Web application framework, REST API |
| **MySQL2** | 3.6.5 | MySQL database driver with Promise support |
| **JWT (jsonwebtoken)** | 9.0.2 | Token-based authentication |
| **bcryptjs** | 2.4.3 | Password hashing (bcrypt algorithm) |
| **express-validator** | 7.0.1 | Input validation and sanitization |
| **Natural** | 6.10.3 | Natural Language Processing library |
| **CORS** | 2.8.5 | Cross-Origin Resource Sharing |
| **dotenv** | 16.3.1 | Environment variable management |

### Database
- **MySQL** 5.7+ (Relational Database Management System)
- **Connection Pooling**: 10 concurrent connections
- **ACID Compliance**: Transaction support for data integrity

---

## Database Design

### Entity-Relationship Model

#### Core Entities:
1. **users** - Homeowner accounts
2. **service_providers** - Service professional accounts
3. **admin** - Administrative accounts
4. **services** - Available service types
5. **bookings** - Service appointment records
6. **ratings_reviews** - User feedback
7. **complaints** - Dispute records
8. **provider_services** - Many-to-many relationship table
9. **payments** - Financial transactions for bookings
10. **admin_revenue** - Platform commission tracking

### Database Schema Details

#### 1. Users Table
```sql
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- bcrypt hashed
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    latitude DECIMAL(10, 8),  -- For location-based matching
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
**Indexes**: `email` (UNIQUE), `city` (for location queries)

#### 2. Service Providers Table
```sql
CREATE TABLE service_providers (
    provider_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    business_name VARCHAR(255),
    license_number VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    service_category VARCHAR(100) NOT NULL,
    experience_years INT,
    hourly_rate DECIMAL(10, 2),
    availability_status ENUM('available', 'busy', 'offline') DEFAULT 'available',
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
**Business Logic**: 
- Providers must be verified before accepting bookings
- Availability status automatically managed based on job status
- Rating calculated from reviews

#### 3. Bookings Table
```sql
CREATE TABLE bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    provider_id INT NOT NULL,
    service_id INT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    service_address TEXT NOT NULL,
    service_description TEXT,
    urgency_level ENUM('low', 'medium', 'high', 'emergency') DEFAULT 'medium',
    status ENUM('pending', 'pending_payment', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid') DEFAULT 'unpaid',
    payment_id INT NULL,
    total_cost DECIMAL(10, 2),
    estimated_duration INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES service_providers(provider_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE
);
```
**Constraints**:
- Prevents double booking (same provider, date, time)
- Cascading deletes maintain referential integrity

#### 4. Ratings & Reviews Table
```sql
CREATE TABLE ratings_reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    provider_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES service_providers(provider_id) ON DELETE CASCADE
);
```

#### 5. Complaints Table
```sql
CREATE TABLE complaints (
    complaint_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    provider_id INT,
    booking_id INT,
    complaint_type ENUM('service_quality', 'behavior', 'pricing', 'other') NOT NULL,
    complaint_text TEXT NOT NULL,
    status ENUM('pending', 'under_review', 'resolved', 'dismissed') DEFAULT 'pending',
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (provider_id) REFERENCES service_providers(provider_id) ON DELETE SET NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL
);
```

#### 6. Payments Table
```sql
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    provider_id INT NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    platform_commission DECIMAL(10,2) NOT NULL,
    provider_earning DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    card_last4 VARCHAR(4),
    card_type VARCHAR(20),
    transaction_id VARCHAR(100) UNIQUE,
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (provider_id) REFERENCES service_providers(provider_id)
);
```

#### 7. Admin Revenue Table
```sql
CREATE TABLE admin_revenue (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_id INT NOT NULL,
    booking_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    source VARCHAR(100) DEFAULT 'booking_commission',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);
```

### Relationships
- **One-to-Many**: User → Bookings, Provider → Bookings, User → Payments
- **One-to-Many**: Booking → Reviews, Booking → Complaints, Booking → Payments
- **One-to-One**: Payment → Admin Revenue
- **Many-to-Many**: Providers ↔ Services (via provider_services table)

---

## API Documentation

### API Architecture: **RESTful API**

**Base URL**: `http://localhost:5000/api`

### Authentication Endpoints

#### 1. User Registration
```
POST /api/auth/register/user
```
**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "address": "123 Main St",
  "city": "Thiruvananthapuram",
  "state": "Kerala",
  "zip_code": "695001"
}
```
**Response**: `201 Created`
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```
**Algorithm**: 
- Validates email format, password length (min 6 chars)
- Checks email uniqueness
- Hashes password using bcrypt (10 salt rounds)
- Geocodes city to latitude/longitude
- Generates JWT token (7-day expiry)

#### 2. Provider Registration
```
POST /api/auth/register/provider
```
**Additional Fields**: `business_name`, `license_number`, `service_category`, `experience_years`, `hourly_rate`

#### 3. Login (User/Provider/Admin)
```
POST /api/auth/login/{role}
```
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**: `200 OK`
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```
**Security**: 
- Password verification using bcrypt.compare()
- JWT token generation with user ID, role, email
- Token stored in localStorage (frontend)

### User Endpoints

#### 1. Get User Profile
```
GET /api/users/profile
Headers: Authorization: Bearer {token}
```
**Middleware**: `authenticate` (JWT verification)

#### 2. Update User Profile
```
PUT /api/users/profile
Headers: Authorization: Bearer {token}
Body: { first_name, last_name, phone, address, city, state, zip_code }
```
**Algorithm**: Updates coordinates if city changes

#### 3. Browse Services
```
GET /api/users/services?category={category}&search={search}
```
**Query Parameters**:
- `category`: Filter by service category
- `search`: Full-text search in service name/description

#### 4. Get Providers (Location-Based)
```
GET /api/users/providers?category={category}&min_rating={rating}
Headers: Authorization: Bearer {token} (optional)
```
**Algorithm**:
1. If authenticated, retrieves user location from database
2. Calculates distance to all providers using Haversine formula
3. Filters providers within 50km radius
4. Sorts by: availability → distance → rating → reviews
5. Returns providers with distance in response

**SQL Query** (Location-Based):
```sql
SELECT p.*, 
       (6371 * acos(
           cos(radians(?)) * 
           cos(radians(p.latitude)) * 
           cos(radians(p.longitude) - radians(?)) + 
           sin(radians(?)) * 
           sin(radians(p.latitude))
       )) AS distance
FROM service_providers p
WHERE p.verification_status = 'verified' 
  AND p.availability_status = 'available'
HAVING distance <= 50
ORDER BY distance ASC, rating DESC
```

#### 5. Get Provider Details
```
GET /api/users/providers/:id
```
**Response Includes**: Provider info, services, reviews

#### 6. Get User Bookings
```
GET /api/users/bookings
Headers: Authorization: Bearer {token}
```

### Booking Endpoints

#### 1. Create Booking
```
POST /api/bookings
Headers: Authorization: Bearer {token}
Body: {
  "provider_id": 1,
  "service_id": 1,
  "booking_date": "2026-03-15",
  "booking_time": "14:30",
  "service_address": "123 Main St",
  "service_description": "Fix leaking tap",
  "urgency_level": "medium",
  "total_cost": 500.00
}
```
**Validation**:
- Provider exists and is verified
- Provider is available (not busy)
- No overlapping bookings (same date/time)
- No active jobs for provider
- Time format: HH:MM (24-hour)

**Business Logic**:
- Creates booking with status 'pending'
- Provider must accept to change to 'confirmed'

#### 2. Update Booking Status
```
PUT /api/bookings/:id/status
Headers: Authorization: Bearer {token}
Body: { "status": "confirmed" }
```
**Status Flow**: `pending → payment_processed → confirmed → in_progress → completed / cancelled`
**Automatic Actions**:
- Payment processing securely finalizes the booking record in the database upon successful transaction.
- Status 'in_progress': Sets provider availability to 'busy'
- Status 'completed'/'cancelled': Checks for other active jobs, sets provider to 'available' if none. Provider cancellations are explicitly tracked and finalized as 'cancelled' to prevent stale pending jobs.

#### 3. Submit Review
```
POST /api/bookings/:id/review
Headers: Authorization: Bearer {token}
Body: {
  "rating": 5,
  "review_text": "Excellent service!"
}
```
**Algorithm**:
- Updates provider rating (average calculation)
- Increments total_reviews count
- Links review to booking, user, and provider

### Provider Endpoints

#### 1. Get Assigned Jobs
```
GET /api/providers/jobs?status={status}
Headers: Authorization: Bearer {token}
```
**Sorting Algorithm**:
1. Priority by status: pending (1) → confirmed (2) → in_progress (3) → others (4)
2. Within same status: newest first (created_at DESC)

#### 2. Get Provider Performance
```
GET /api/providers/performance
Headers: Authorization: Bearer {token}
```
**Returns**: Total bookings, completed count, cancelled count, average rating, recent reviews

### Admin Endpoints

#### 1. Get Analytics
```
GET /api/admin/analytics
Headers: Authorization: Bearer {token}
```
**Returns**: 
- Total users, providers, bookings
- Bookings by status
- Bookings by category
- Total revenue

#### 2. Verify Provider
```
PUT /api/admin/providers/:id/verify
Headers: Authorization: Bearer {token}
Body: { "status": "verified" }
```

#### 3. Get All Complaints
```
GET /api/admin/complaints?status={status}
Headers: Authorization: Bearer {token}
```
**Query Includes**: User details, provider details, booking information, service details

#### 4. Update Complaint
```
PUT /api/admin/complaints/:id
Headers: Authorization: Bearer {token}
Body: {
  "status": "resolved",
  "admin_response": "Issue has been resolved"
}
```

### Chatbot Endpoints

#### 1. Process Chatbot Message
```
POST /api/chatbot/message
Headers: Authorization: Bearer {token} (optional)
Body: { "message": "I need an electrician" }
```
**Response**:
```json
{
  "message": "I found Electrical services for you...",
  "serviceType": "Electrical",
  "urgency": "medium",
  "suggestedProviders": [...],
  "service": {...},
  "suggestedDateTime": { "date": "2026-03-15", "time": "14:30" }
}
```

#### 2. Create Booking from Chatbot
```
POST /api/chatbot/book
Headers: Authorization: Bearer {token}
Body: {
  "provider_id": 1,
  "service_id": 1,
  "booking_date": "2026-03-15",
  "booking_time": "14:30",
  "service_address": "123 Main St",
  "urgency_level": "medium"
}
```

---

## Algorithms & Data Structures

### 1. Haversine Formula (Distance Calculation)

**Purpose**: Calculate great-circle distance between two geographic coordinates

**Algorithm**:
```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}
```
**Time Complexity**: O(1) - Constant time
**Space Complexity**: O(1) - Constant space
**Accuracy**: ±0.5% for distances up to 1000km

### 2. Provider Matching Algorithm

**Multi-Criteria Sorting Algorithm**:

```javascript
function sortProvidersByRelevance(providers) {
    return providers.sort((a, b) => {
        // Priority 1: Availability (available > busy > offline)
        if (a.availability_status === 'available' && b.availability_status !== 'available') return -1;
        if (a.availability_status !== 'available' && b.availability_status === 'available') return 1;
        
        // Priority 2: Distance (closer is better, threshold: 5km)
        const distanceA = a.distance || 999;
        const distanceB = b.distance || 999;
        if (Math.abs(distanceA - distanceB) > 5) {
            return distanceA - distanceB;
        }
        
        // Priority 3: Rating (higher is better, threshold: 0.5)
        const ratingA = parseFloat(a.rating) || 0;
        const ratingB = parseFloat(b.rating) || 0;
        if (Math.abs(ratingA - ratingB) > 0.5) {
            return ratingB - ratingA;
        }
        
        // Priority 4: Number of reviews (more reviews = more trusted)
        return (b.total_reviews || 0) - (a.total_reviews || 0);
    });
}
```
**Time Complexity**: O(n log n) - Sorting algorithm
**Space Complexity**: O(1) - In-place sorting

### 3. Natural Language Processing (NLP) Algorithm

#### Service Type Extraction
**Algorithm**: Context-aware semantic matching, hard-lock explicit guards, and keyword fuzzy matching

**Data Structure**: 
- **serviceKeywords**: Priority-ordered object mapping service categories to keyword arrays
- **misspellingsMap**: Typo correction dictionary to resolve common misspellings (e.g., professions, appliances)

**Process**:
1. **Normalization**: Replace common misspellings using word boundaries and the `misspellingsMap`.
2. **Context-Aware Semantic Matching**: Identify full sentence intents using explicit regex checks (e.g., `hasPaintingContext`, `hasApplianceContext`, `hasACNotWorking`) rather than isolated words.
3. **Hard-Lock Explicit Guards**: Enforce strict routing for specific named entities (e.g., exact professions like "plumber" or named appliances with problems) to completely prevent category misclassification (e.g., stopping HVAC from stealing Refrigerator jobs).
4. **Tokenization & Stemming**: Apply `WordTokenizer` and `PorterStemmer`.
5. **Fuzzy Matching**: Calculate Jaro-Winkler similarity and use first-letter matching to handle severe typos if semantic context isn't triggered.
6. Return the service category with the highest confidence score, heavily prioritizing semantic context matches over plain keywords.

**Jaro-Winkler Distance**:
```javascript
function calculateSimilarity(str1, str2) {
    return natural.JaroWinklerDistance(str1, str2);
}
```
**Threshold**: 0.7 (70% similarity for match)

**Time Complexity**: O(n*m) where n = message length, m = keyword count
**Space Complexity**: O(n) for tokenized words

#### Urgency Detection
**Algorithm**: Keyword matching against urgency dictionary
- **emergency**: ['emergency', 'urgent', 'immediate', 'asap', 'now', 'critical']
- **high**: ['soon', 'quickly', 'today', 'important']
- **medium**: ['normal', 'regular', 'standard'] (default)
- **low**: ['whenever', 'flexible', 'no rush']

#### Date/Time Extraction
**Pattern Matching**:
- "today" → Current date + current time
- "tomorrow" → Next day + current time
- Time patterns: `/\b(\d{1,2}):?(\d{2})?\s*(am|pm)?\b/i`
- Converts 12-hour to 24-hour format

### 4. Password Hashing Algorithm

**Algorithm**: bcrypt (Blowfish-based)
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
```
- **Salt Rounds**: 10 (2^10 = 1024 iterations)
- **Output**: 60-character hash string
- **Security**: Resistant to rainbow table attacks, timing attacks

**Verification**:
```javascript
const isMatch = await bcrypt.compare(password, hashedPassword);
```

### 5. JWT Token Generation

**Algorithm**: HMAC SHA-256
```javascript
const token = jwt.sign(
    { id: userId, role: 'user', email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
);
```
**Payload Structure**:
```json
{
  "id": 1,
  "role": "user",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1235172690
}
```

### 6. Connection Pooling

**Algorithm**: MySQL2 Connection Pool
```javascript
const pool = mysql.createPool({
    connectionLimit: 10,
    queueLimit: 0,
    waitForConnections: true
});
```
**Benefits**:
- Reuses connections (reduces overhead)
- Handles concurrent requests
- Automatic connection management

---

## Security Implementation

### 1. Authentication & Authorization

**JWT-Based Authentication**:
- Token stored in localStorage (frontend)
- Token sent in `Authorization: Bearer {token}` header
- Middleware validates token on protected routes

**Role-Based Access Control (RBAC)**:
- **User Role**: Can create bookings, submit reviews
- **Provider Role**: Can manage jobs, update availability
- **Admin Role**: Can verify providers, handle complaints

**Middleware Chain**:
```
Request → authenticate (JWT verification) → isAdmin/isProvider (role check) → Route Handler
```

### 2. Password Security

**Hashing**: bcrypt with 10 salt rounds
**Storage**: Never store plaintext passwords
**Validation**: Minimum 6 characters (enforced by express-validator)

### 3. Input Validation

**Library**: express-validator
**Validations**:
- Email format validation
- Password length validation
- SQL injection prevention (parameterized queries)
- XSS prevention (input sanitization)

### 4. SQL Injection Prevention

**Method**: Parameterized Queries
```javascript
await pool.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
);
```
All user inputs are parameterized, preventing SQL injection.

### 5. CORS Configuration

```javascript
app.use(cors());
```
Allows cross-origin requests (development). In production, configure specific origins.

---

## Frontend Architecture

### Component Hierarchy

```
App
├── AuthProvider (Context)
├── Router
│   ├── Navbar
│   ├── Home
│   │   └── Chatbot
│   ├── Login
│   ├── Register
│   ├── UserDashboard
│   │   └── Chatbot
│   ├── BrowseServices
│   ├── ProviderProfile
│   ├── MyBookings
│   ├── ProviderDashboard
│   └── AdminDashboard
└── ProtectedRoute (Route Guard)
```

### State Management

**React Context API**:
- **AuthContext**: Global authentication state
- Stores: user data, token, login/logout functions
- Persists: localStorage for token persistence

**Local State**:
- Component-level state using `useState` hook
- Form data, loading states, error messages

### Routing

**React Router DOM v6**:
- Client-side routing (SPA)
- Protected routes using `ProtectedRoute` component
- Dynamic routes: `/user/providers/:id`

### HTTP Communication

**Axios**:
- Base configuration in `AuthContext`
- Automatic token injection in headers
- Error handling with try-catch blocks

### Key Components

#### 1. Chatbot Component
**Features**:
- Real-time message display
- Auto-scroll to latest message
- Provider suggestion cards
- Direct booking from chatbot

**State Management**:
- `messages`: Array of message objects
- `suggestions`: Provider suggestions from AI
- `loading`: Loading state for API calls

#### 2. ProtectedRoute Component
**Function**: Route guard for authentication
```javascript
if (!user) return <Navigate to="/login" />;
if (role && user.role !== role) return <Navigate to="/" />;
```

#### 3. Searchable City Dropdown
**Implementation**:
- Custom dropdown with search input
- Real-time filtering (case-insensitive)
- Click-outside handler (useEffect + useRef)
- Auto-select on exact match

---

## Backend Architecture

### MVC Pattern (Modified)

**Model**: Database tables (MySQL)
**View**: JSON responses (REST API)
**Controller**: Route handlers (Express.js)

### Middleware Stack

```
Request
  ↓
CORS Middleware
  ↓
JSON Parser
  ↓
URL Encoded Parser
  ↓
Route Handler
  ↓
Authentication Middleware (if protected)
  ↓
Role Check Middleware (if role-specific)
  ↓
Validation Middleware (express-validator)
  ↓
Business Logic
  ↓
Database Query
  ↓
Response
```

### Route Organization

**Modular Routing**:
- `/api/auth` → Authentication routes
- `/api/users` → User-specific routes
- `/api/providers` → Provider-specific routes
- `/api/bookings` → Booking management
- `/api/admin` → Admin operations
- `/api/chatbot` → AI chatbot endpoints
- `/api/complaints` → Complaint handling

### Error Handling

**Global Error Middleware**:
```javascript
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!', 
        error: err.message 
    });
});
```

**Route-Level Error Handling**:
- Try-catch blocks in async route handlers
- Specific error messages for different scenarios
- HTTP status codes: 200, 201, 400, 401, 403, 404, 500

---

## AI Chatbot Implementation

### NLP Pipeline

```
User Message
  ↓
Tokenization (WordTokenizer)
  ↓
Stemming (Porter Stemmer)
  ↓
Misspelling Correction
  ↓
Keyword Matching
  ↓
Service Type Extraction
  ↓
Urgency Detection
  ↓
Date/Time Extraction
  ↓
Provider Matching (Location-Based)
  ↓
Response Generation
```

### Service Type Extraction Algorithm

**Step 1: Preprocessing**
- Convert to lowercase
- Tokenize into words
- Apply Porter Stemmer

**Step 2: Keyword Matching**
- Check against `serviceKeywords` dictionary
- Calculate match scores for each category
- Handle misspellings via `misspellingsMap`

**Step 3: Fuzzy Matching**
- Use Jaro-Winkler distance for typos
- Threshold: 0.7 (70% similarity)

**Step 4: Priority Selection**
- More specific keywords checked first
- Returns category with highest confidence

### Provider Matching in Chatbot

**Algorithm**:
1. Extract service type from message
2. Get user location (from database or city lookup)
3. Query providers with:
   - Service category match
   - Verification status = 'verified'
   - Availability status = 'available'
   - Distance calculation (Haversine)
4. Filter by max distance (50km)
5. Sort by relevance algorithm
6. Return top 5 providers

### Response Generation

**Template-Based**:
```javascript
function generateResponseMessage(serviceType, providerCount, urgency, userCity) {
    let message = `I found ${serviceType} services for you. `;
    if (providerCount > 0) {
        message += `I have ${providerCount} verified ${serviceType.toLowerCase()} provider${providerCount > 1 ? 's' : ''} available near ${userCity}. `;
    }
    // ... urgency-based messaging
    message += 'Would you like me to show you the available providers and help you book?';
    return message;
}
```

---

## Location-Based Services

### City Coordinate System

**Data Structure**: JavaScript Object
- 64 cities in Kerala, India
- Pre-configured latitude/longitude coordinates
- Case-insensitive lookup

**Lookup Algorithm**:
```javascript
function getCityCoordinates(cityName) {
    // 1. Exact match
    if (cityCoordinates[cityName]) return cityCoordinates[cityName];
    
    // 2. Case-insensitive match
    const cityLower = cityName.toLowerCase();
    for (const [key, value] of Object.entries(cityCoordinates)) {
        if (key.toLowerCase() === cityLower) return value;
    }
    
    return null;
}
```

### Distance-Based Filtering

**SQL Implementation** (Haversine in SQL):
```sql
(6371 * acos(
    cos(radians(?)) * 
    cos(radians(latitude)) * 
    cos(radians(longitude) - radians(?)) + 
    sin(radians(?)) * 
    sin(radians(latitude))
)) AS distance
```

**Filtering**:
- `HAVING distance <= 50` (50km radius)
- Configurable via `maxDistance` parameter

### Automatic Geocoding

**Registration Flow**:
1. User selects city from dropdown
2. Backend looks up city coordinates
3. Stores latitude/longitude in database
4. Used for distance calculations

---

## File Structure & Code Organization

### Backend Structure
```
backend/
├── config/
│   └── database.js          # MySQL connection pool
├── database/
│   ├── schema.sql           # Database schema
│   ├── migration_add_location.sql
│   └── migration_update_provider_coordinates.sql
├── middleware/
│   ├── auth.js              # JWT authentication
│   └── optionalAuth.js     # Optional authentication
├── routes/
│   ├── auth.js             # Authentication endpoints
│   ├── users.js            # User endpoints
│   ├── providers.js        # Provider endpoints
│   ├── bookings.js         # Booking endpoints
│   ├── admin.js            # Admin endpoints
│   ├── chatbot.js          # Chatbot endpoints
│   ├── complaints.js       # Complaint endpoints
│   └── debug.js            # Debug endpoints
├── utils/
│   ├── aiChatbot.js        # NLP and chatbot logic
│   └── location.js         # Distance calculation
├── scripts/
│   └── setup-admin.js      # Admin setup script
└── server.js               # Express server entry point
```

### Frontend Structure
```
frontend/src/
├── components/
│   ├── Navbar.js           # Navigation component
│   ├── Navbar.css
│   ├── Chatbot.js          # AI chatbot component
│   ├── Chatbot.css
│   └── ProtectedRoute.js  # Route guard
├── context/
│   └── AuthContext.js     # Authentication context
├── pages/
│   ├── Home.js            # Landing page
│   ├── Home.css
│   ├── Login.js           # Login page
│   ├── Register.js        # Registration page
│   ├── Auth.css           # Auth page styles
│   ├── Dashboard.css      # Dashboard styles
│   ├── user/
│   │   ├── UserDashboard.js
│   │   ├── BrowseServices.js
│   │   ├── ProviderProfile.js
│   │   └── MyBookings.js
│   ├── provider/
│   │   └── ProviderDashboard.js
│   └── admin/
│       └── AdminDashboard.js
├── utils/
│   ├── currency.js        # Currency formatting
│   └── time.js            # Time formatting
├── App.js                 # Main app component
├── App.css
├── index.js               # React entry point
└── index.css              # Global styles
```

---

## Performance Optimizations

### 1. Database Connection Pooling
- Reuses connections
- Handles 10 concurrent connections
- Reduces connection overhead

### 2. React Optimization
- `useCallback` for memoized functions
- `useEffect` dependency arrays optimized
- Component re-render prevention

### 3. API Optimization
- Indexed database queries (email, city)
- Efficient SQL joins
- Pagination-ready (can be added)

### 4. Frontend Optimization
- Lazy loading (can be implemented)
- Code splitting (React Router)
- CSS optimization

---

## Testing Considerations

### Unit Testing (Recommended)
- Service type extraction algorithm
- Distance calculation function
- Password hashing/verification
- JWT token generation/verification

### Integration Testing (Recommended)
- API endpoint testing
- Database query testing
- Authentication flow testing

### Manual Testing Scenarios
1. User registration and login
2. Provider registration and verification
3. Service booking flow
4. Chatbot interaction
5. Location-based provider matching
6. Review submission
7. Complaint handling

---

## Deployment Considerations

### Environment Variables
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=homeassist_db
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

### Production Checklist
- [ ] Change default admin password
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Configure CORS for specific origins
- [ ] Set up database backups
- [ ] Implement rate limiting
- [ ] Add logging system
- [ ] Set up monitoring

---

## Future Enhancements

### Technical Improvements
1. **Redis Caching**: Cache frequently accessed data
2. **Elasticsearch**: Full-text search for services
3. **WebSocket**: Real-time notifications
4. **GraphQL**: Alternative to REST API
5. **Microservices**: Split into smaller services
6. **Docker**: Containerization
7. **CI/CD Pipeline**: Automated deployment

### Feature Enhancements
1. **Payment Integration**: Stripe/Razorpay
2. **Email/SMS Notifications**: Nodemailer, Twilio
3. **Calendar Integration**: Google Calendar API
4. **Mobile App**: React Native
5. **Advanced Analytics**: Chart.js, D3.js
6. **Machine Learning**: Demand prediction, price estimation

---

## Conclusion

AI HomeAssist is a comprehensive full-stack application implementing modern web development practices, AI-powered features, and location-based services. The system demonstrates proficiency in:

- **Full-Stack Development**: React.js frontend, Node.js backend
- **Database Design**: Normalized relational database
- **API Design**: RESTful architecture
- **Security**: JWT authentication, password hashing, input validation
- **AI/NLP**: Natural language processing for chatbot
- **Algorithms**: Haversine formula, multi-criteria sorting
- **Software Engineering**: Modular code organization, separation of concerns

The project showcases technical skills in web development, database management, API design, and AI integration.
