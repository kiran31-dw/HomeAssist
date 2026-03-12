# AI HomeAssist - System Diagrams

## Table of Contents
1. [Entity-Relationship (ER) Diagram](#entity-relationship-er-diagram)
2. [Use Case Diagram](#use-case-diagram)
3. [System Architecture Diagram](#system-architecture-diagram)
4. [Database Schema Diagram](#database-schema-diagram)
5. [API Flow Diagram](#api-flow-diagram)
6. [Chatbot Flow Diagram](#chatbot-flow-diagram)

---

## Entity-Relationship (ER) Diagram

### Text Representation

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ user_id (PK)    │
│ first_name      │
│ last_name       │
│ email (UNIQUE)  │
│ password        │
│ phone           │
│ address         │
│ city            │
│ state           │
│ zip_code        │
│ latitude        │
│ longitude       │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1
         │
         │ N
┌────────▼────────┐
│    BOOKINGS     │
├─────────────────┤
│ booking_id (PK) │
│ user_id (FK)    │──┐
│ provider_id(FK) │──┤
│ service_id (FK) │──┤
│ booking_date    │  │
│ booking_time    │  │
│ service_address │  │
│ service_desc    │  │
│ urgency_level   │  │
│ status          │  │
│ total_cost      │  │
│ created_at      │  │
└─────────────────┘  │
         │            │
         │ 1          │
         │            │
         │ N          │
┌────────▼────────┐  │
│ RATINGS_REVIEWS │  │
├─────────────────┤  │
│ review_id (PK)  │  │
│ booking_id (FK) │──┘
│ user_id (FK)    │──┐
│ provider_id(FK) │──┤
│ rating          │  │
│ review_text     │  │
│ created_at      │  │
└─────────────────┘  │
                     │
┌─────────────────┐  │
│ SERVICE_PROVIDERS│ │
├─────────────────┤  │
│ provider_id(PK) │──┘
│ first_name      │
│ last_name       │
│ email (UNIQUE)  │
│ password        │
│ phone           │
│ business_name   │
│ license_number  │
│ address         │
│ city            │
│ state           │
│ latitude        │
│ longitude       │
│ service_category│
│ experience_years│
│ hourly_rate     │
│ availability    │
│ verification    │
│ rating          │
│ total_reviews   │
└────────┬────────┘
         │
         │ N
         │
         │ M
┌────────▼────────┐
│ PROVIDER_SERVICES│
├─────────────────┤
│ provider_service_id (PK)
│ provider_id (FK)│
│ service_id (FK) │
│ price           │
└────────┬────────┘
         │
         │ M
         │
         │ 1
┌────────▼────────┐
│    SERVICES     │
├─────────────────┤
│ service_id (PK) │
│ service_name    │
│ service_category│
│ description     │
│ base_price      │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│   COMPLAINTS    │
├─────────────────┤
│ complaint_id(PK)│
│ user_id (FK)    │──┐
│ provider_id(FK) │──┤
│ booking_id (FK) │──┤
│ complaint_type  │  │
│ complaint_text  │  │
│ status          │  │
│ admin_response  │  │
│ created_at      │  │
└─────────────────┘  │
                     │
┌─────────────────┐  │
│     ADMIN       │  │
├─────────────────┤  │
│ admin_id (PK)   │  │
│ username        │  │
│ email (UNIQUE)  │  │
│ password        │  │
│ created_at      │  │
└─────────────────┘  │
```

### Relationships Summary

1. **Users → Bookings**: One-to-Many (1:N)
   - One user can have many bookings
   - Foreign Key: `bookings.user_id` → `users.user_id`

2. **Service Providers → Bookings**: One-to-Many (1:N)
   - One provider can have many bookings
   - Foreign Key: `bookings.provider_id` → `service_providers.provider_id`

3. **Services → Bookings**: One-to-Many (1:N)
   - One service can be booked many times
   - Foreign Key: `bookings.service_id` → `services.service_id`

4. **Bookings → Reviews**: One-to-One (1:1)
   - One booking can have one review
   - Foreign Key: `ratings_reviews.booking_id` → `bookings.booking_id`

5. **Users → Reviews**: One-to-Many (1:N)
   - One user can write many reviews
   - Foreign Key: `ratings_reviews.user_id` → `users.user_id`

6. **Providers → Reviews**: One-to-Many (1:N)
   - One provider can receive many reviews
   - Foreign Key: `ratings_reviews.provider_id` → `service_providers.provider_id`

7. **Providers ↔ Services**: Many-to-Many (M:N)
   - One provider can offer many services
   - One service can be offered by many providers
   - Junction Table: `provider_services`

8. **Users → Complaints**: One-to-Many (1:N)
   - One user can file many complaints
   - Foreign Key: `complaints.user_id` → `users.user_id` (ON DELETE SET NULL)

9. **Providers → Complaints**: One-to-Many (1:N)
   - One provider can receive many complaints
   - Foreign Key: `complaints.provider_id` → `service_providers.provider_id` (ON DELETE SET NULL)

10. **Bookings → Complaints**: One-to-Many (1:N)
    - One booking can have many complaints
    - Foreign Key: `complaints.booking_id` → `bookings.booking_id` (ON DELETE SET NULL)

---

## Use Case Diagram

### Text Representation

```
                    ┌─────────────────────┐
                    │   AI HomeAssist     │
                    │     System          │
                    └─────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   Homeowner    │  │   Provider    │  │   Admin      │
└───────────────┘  └───────────────┘  └───────────────┘
        │                   │                   │
        │                   │                   │
   ┌────┴────┐         ┌────┴────┐         ┌────┴────┐
   │         │         │         │         │         │
   ▼         ▼         ▼         ▼         ▼         ▼
┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐
│Reg. │  │Login│  │Reg. │  │Login│  │Login│  │View │
└─────┘  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘
   │         │         │         │         │         │
   │         │         │         │         │         │
   ▼         ▼         ▼         ▼         ▼         ▼
┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐
│View │  │Browse│ │View │  │View │  │Verify│ │Handle│
│Prof.│  │Serv. │ │Prof.│  │Jobs │  │Prov.│ │Compl.│
└─────┘  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘
   │         │         │         │         │         │
   │         │         │         │         │         │
   ▼         ▼         ▼         ▼         ▼         ▼
┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐
│Upd. │  │Book │  │Upd. │  │Upd. │  │View │  │View │
│Prof.│  │Serv.│  │Prof.│  │Status│ │Anal.│ │Users │
└─────┘  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘
   │         │         │         │
   │         │         │         │
   ▼         ▼         ▼         ▼
┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐
│Chat │  │View │  │Set  │  │View │
│Bot  │  │Book.│  │Avail│  │Perf.│
└─────┘  └─────┘  └─────┘  └─────┘
   │         │
   │         │
   ▼         ▼
┌─────┐  ┌─────┐
│Sub. │  │File │
│Rev. │  │Comp.│
└─────┘  └─────┘
```

### Use Cases by Actor

#### Homeowner Use Cases:
1. Register Account
2. Login
3. View Profile
4. Update Profile
5. Browse Services
6. Book Service (Manual)
7. Book Service via Chatbot
8. View Bookings
9. Submit Review
10. File Complaint

#### Service Provider Use Cases:
1. Register Account
2. Login
3. View Profile
4. Update Profile
5. View Assigned Jobs
6. Accept/Decline Booking
7. Update Job Status
8. Set Availability
9. View Performance Stats

#### Admin Use Cases:
1. Login
2. View Analytics
3. Verify Provider
4. Handle Complaint
5. View All Users
6. View All Providers
7. View All Bookings

---

## System Architecture Diagram

### 3-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION TIER                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         React.js Frontend (Port 3000)              │    │
│  │                                                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │    │
│  │  │  Pages   │  │Components│  │  Context │         │    │
│  │  │          │  │          │  │          │         │    │
│  │  │ - Home   │  │ - Navbar │  │ - Auth   │         │    │
│  │  │ - Login  │  │ - Chatbot│  │          │         │    │
│  │  │ - Reg.   │  │ - Route  │  │          │         │    │
│  │  │ - Dash.  │  │  Guard   │  │          │         │    │
│  │  └──────────┘  └──────────┘  └──────────┘         │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │         React Router (SPA Navigation)         │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │         Axios (HTTP Client)                  │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
                            ↕ JSON Data
                            ↕ JWT Tokens
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION TIER                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │      Node.js + Express.js Backend (Port 5000)       │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │            Middleware Layer                  │  │    │
│  │  │  - CORS                                      │  │    │
│  │  │  - JSON Parser                              │  │    │
│  │  │  - JWT Authentication                        │  │    │
│  │  │  - Role-Based Access Control                 │  │    │
│  │  │  - Input Validation                          │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │            Route Handlers                    │  │    │
│  │  │  - /api/auth     (Authentication)            │  │    │
│  │  │  - /api/users    (User operations)           │  │    │
│  │  │  - /api/providers (Provider operations)      │  │    │
│  │  │  - /api/bookings (Booking management)       │  │    │
│  │  │  - /api/admin    (Admin operations)          │  │    │
│  │  │  - /api/chatbot  (AI chatbot)               │  │    │
│  │  │  - /api/complaints (Complaint handling)     │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │            Business Logic Layer              │  │    │
│  │  │  - Password Hashing (bcrypt)                 │  │    │
│  │  │  - JWT Token Generation                      │  │    │
│  │  │  - Distance Calculation (Haversine)         │  │    │
│  │  │  - Provider Matching Algorithm              │  │    │
│  │  │  - NLP Processing (Natural.js)               │  │    │
│  │  │  - Rating Calculation                       │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │            Utility Functions                  │  │    │
│  │  │  - aiChatbot.js (NLP logic)                  │  │    │
│  │  │  - location.js (Distance calculation)       │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↕ SQL Queries
                            ↕ Connection Pool
┌─────────────────────────────────────────────────────────────┐
│                      DATA TIER                               │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         MySQL Database (homeassist_db)            │    │
│  │                                                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │    │
│  │  │  users  │  │providers │  │ services │          │    │
│  │  └──────────┘  └──────────┘  └──────────┘          │    │
│  │                                                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │    │
│  │  │bookings │  │ reviews  │  │complaints│          │    │
│  │  └──────────┘  └──────────┘  └──────────┘          │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │    Connection Pool (10 concurrent)           │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
User Action
    │
    ▼
React Component
    │
    ▼
Axios HTTP Request
    │
    ▼
Express.js Route Handler
    │
    ▼
Authentication Middleware (JWT)
    │
    ▼
Validation Middleware
    │
    ▼
Business Logic
    │
    ▼
Database Query (MySQL)
    │
    ▼
Response (JSON)
    │
    ▼
React Component Update
```

---

## Database Schema Diagram

### Visual Representation

```
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE: homeassist_db                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│      users          │
├─────────────────────┤
│ PK user_id          │
│    first_name       │
│    last_name        │
│ UK email            │
│    password (hash)  │
│    phone            │
│    address          │
│    city             │
│    state            │
│    zip_code         │
│    latitude         │
│    longitude        │
│    created_at       │
│    updated_at       │
└─────────────────────┘

┌─────────────────────┐
│ service_providers   │
├─────────────────────┤
│ PK provider_id      │
│    first_name       │
│    last_name        │
│ UK email            │
│    password (hash)  │
│    phone            │
│    business_name    │
│    license_number   │
│    address          │
│    city             │
│    state            │
│    latitude         │
│    longitude        │
│    service_category │
│    experience_years │
│    hourly_rate      │
│    availability_status │
│    verification_status │
│    rating           │
│    total_reviews   │
│    created_at       │
│    updated_at       │
└─────────────────────┘

┌─────────────────────┐
│     services        │
├─────────────────────┤
│ PK service_id      │
│    service_name    │
│    service_category│
│    description     │
│    base_price      │
│    created_at      │
└─────────────────────┘

┌─────────────────────┐
│    bookings         │
├─────────────────────┤
│ PK booking_id      │
│ FK user_id          │──┐
│ FK provider_id      │──┤
│ FK service_id       │──┤
│    booking_date     │  │
│    booking_time     │  │
│    service_address  │  │
│    service_desc     │  │
│    urgency_level    │  │
│    status           │  │
│    total_cost       │  │
│    estimated_duration│ │
│    created_at       │  │
│    updated_at       │  │
└─────────────────────┘  │
                         │
┌─────────────────────┐  │
│  ratings_reviews    │  │
├─────────────────────┤  │
│ PK review_id        │  │
│ FK booking_id       │──┘
│ FK user_id          │──┐
│ FK provider_id      │──┤
│    rating (1-5)     │  │
│    review_text      │  │
│    created_at       │  │
└─────────────────────┘  │
                         │
┌─────────────────────┐  │
│   complaints        │  │
├─────────────────────┤  │
│ PK complaint_id     │  │
│ FK user_id (NULL)    │──┘
│ FK provider_id(NULL)│──┘
│ FK booking_id (NULL)│──┘
│    complaint_type   │
│    complaint_text   │
│    status           │
│    admin_response   │
│    created_at       │
│    updated_at       │
└─────────────────────┘

┌─────────────────────┐
│ provider_services   │
├─────────────────────┤
│ PK provider_service_id
│ FK provider_id      │
│ FK service_id       │
│    price            │
│ UK (provider_id, service_id)
└─────────────────────┘

┌─────────────────────┐
│      admin          │
├─────────────────────┤
│ PK admin_id         │
│ UK username         │
│ UK email            │
│    password (hash)  │
│    created_at       │
└─────────────────────┘
```

---

## API Flow Diagram

### Booking Creation Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. POST /api/bookings
     │    { provider_id, service_id, date, time, address }
     ▼
┌─────────────────┐
│  Express Route  │
│  /api/bookings  │
└────┬────────────┘
     │
     │ 2. authenticate middleware
     ▼
┌─────────────────┐
│  JWT Verify     │
└────┬────────────┘
     │
     │ 3. validation middleware
     ▼
┌─────────────────┐
│  Validate Input │
└────┬────────────┘
     │
     │ 4. Check provider exists
     ▼
┌─────────────────┐
│  Query Provider │
│  (MySQL)         │
└────┬────────────┘
     │
     │ 5. Check availability
     ▼
┌─────────────────┐
│  Check Overlap  │
│  (MySQL)         │
└────┬────────────┘
     │
     │ 6. Create booking
     ▼
┌─────────────────┐
│  INSERT Booking │
│  (MySQL)         │
└────┬────────────┘
     │
     │ 7. Return response
     ▼
┌─────────┐
│  User   │
│ (JSON)  │
└─────────┘
```

---

## Chatbot Flow Diagram

### NLP Processing Flow

```
┌─────────┐
│  User   │
│ Message │
└────┬────┘
     │
     │ "I need an electrician"
     ▼
┌─────────────────┐
│  POST /api/     │
│  chatbot/message│
└────┬────────────┘
     │
     │ 1. Tokenize
     ▼
┌─────────────────┐
│  WordTokenizer  │
│  ["I","need",   │
│   "electrician"]│
└────┬────────────┘
     │
     │ 2. Stem words
     ▼
┌─────────────────┐
│  Porter Stemmer │
│  ["i","need",   │
│   "electric"]   │
└────┬────────────┘
     │
     │ 3. Check misspellings
     ▼
┌─────────────────┐
│  Misspelling    │
│  Correction     │
└────┬────────────┘
     │
     │ 4. Keyword matching
     ▼
┌─────────────────┐
│  Service Type   │
│  Extraction     │
│  → "Electrical" │
└────┬────────────┘
     │
     │ 5. Urgency detection
     ▼
┌─────────────────┐
│  Urgency Level  │
│  → "medium"     │
└────┬────────────┘
     │
     │ 6. Date/time extraction
     ▼
┌─────────────────┐
│  DateTime Parse │
│  → today, 14:30 │
└────┬────────────┘
     │
     │ 7. Query providers
     ▼
┌─────────────────┐
│  Provider Match │
│  (Location-based)│
└────┬────────────┘
     │
     │ 8. Sort by relevance
     ▼
┌─────────────────┐
│  Sort Algorithm │
│  (Distance,      │
│   Rating, etc.) │
└────┬────────────┘
     │
     │ 9. Generate response
     ▼
┌─────────────────┐
│  Response JSON  │
│  { message,     │
│    providers,   │
│    service,     │
│    urgency }    │
└────┬────────────┘
     │
     │ 10. Display to user
     ▼
┌─────────┐
│  User   │
│ (UI)    │
└─────────┘
```

---

## Data Flow Diagram

### User Registration Flow

```
┌─────────┐
│  User   │
│  Form   │
└────┬────┘
     │
     │ Submit
     ▼
┌─────────────────┐
│  React Component│
│  (Register.js)  │
└────┬────────────┘
     │
     │ POST /api/auth/register/user
     ▼
┌─────────────────┐
│  Express Route  │
│  /api/auth      │
└────┬────────────┘
     │
     │ Validate
     ▼
┌─────────────────┐
│  express-validator│
└────┬────────────┘
     │
     │ Hash password
     ▼
┌─────────────────┐
│  bcrypt.hash()  │
└────┬────────────┘
     │
     │ Geocode city
     ▼
┌─────────────────┐
│  getCityCoords()│
└────┬────────────┘
     │
     │ Insert user
     ▼
┌─────────────────┐
│  MySQL INSERT   │
│  INTO users     │
└────┬────────────┘
     │
     │ Generate token
     ▼
┌─────────────────┐
│  jwt.sign()     │
└────┬────────────┘
     │
     │ Return response
     ▼
┌─────────────────┐
│  JSON Response  │
│  { token, user }│
└────┬────────────┘
     │
     │ Store in localStorage
     ▼
┌─────────┐
│  User   │
│  Logged │
│  In     │
└─────────┘
```

---

## Notes for Diagram Creation

### Tools Recommended:
1. **ER Diagrams**: 
   - MySQL Workbench
   - dbdiagram.io
   - Draw.io
   - Lucidchart

2. **Use Case Diagrams**:
   - Draw.io
   - Lucidchart
   - PlantUML

3. **Architecture Diagrams**:
   - Draw.io
   - Lucidchart
   - Microsoft Visio

4. **Flow Diagrams**:
   - Draw.io
   - Mermaid (Markdown)
   - PlantUML

### Converting Text to Visual:
- Copy text representations into diagramming tools
- Use the relationships and flows described
- Apply consistent styling and colors
- Add legends and labels for clarity

---

## Summary

This document provides comprehensive text-based representations of:
- **ER Diagram**: Database relationships and structure
- **Use Case Diagram**: System functionality by actor
- **Architecture Diagram**: 3-tier system architecture
- **Database Schema**: Visual table structure
- **API Flow**: Request/response flow
- **Chatbot Flow**: NLP processing pipeline
- **Data Flow**: User registration example

These diagrams can be converted to visual formats using the recommended tools for presentation in your project review.
