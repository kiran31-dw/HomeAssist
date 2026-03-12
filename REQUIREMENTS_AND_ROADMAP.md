# AI HomeAssist - Requirements & Project Roadmap

## Table of Contents
1. [Project Requirements](#project-requirements)
2. [Functional Requirements](#functional-requirements)
3. [Non-Functional Requirements](#non-functional-requirements)
4. [Use Cases](#use-cases)
5. [Project Roadmap](#project-roadmap)
6. [Gantt Chart Data](#gantt-chart-data)

---

## Project Requirements

### 1. Project Overview

**Project Name**: AI HomeAssist - Intelligent Home Service Booking Platform

**Objective**: Develop a web-based platform that connects homeowners with verified service providers through an AI-powered chatbot interface, enabling seamless service booking and management.

**Target Users**:
- **Homeowners**: Need home services (electrical, plumbing, painting, etc.)
- **Service Providers**: Electricians, plumbers, painters, carpenters, etc.
- **Administrators**: Manage platform, verify providers, handle complaints

**Problem Statement**: 
- Difficulty finding reliable service providers
- Lack of transparency in pricing and availability
- Time-consuming booking process
- No centralized platform for home services

**Solution**: 
- AI-powered chatbot for quick service discovery
- Verified provider database with ratings
- Location-based provider matching
- Streamlined booking system
- Admin oversight for quality control

---

## Functional Requirements

### FR1: User Management

#### FR1.1: User Registration
- **Description**: Allow homeowners to create accounts
- **Input**: First name, last name, email, password, phone, address, city, state, zip code
- **Process**: 
  - Validate email format and uniqueness
  - Hash password using bcrypt
  - Geocode city to latitude/longitude
  - Store in database
- **Output**: User account created, JWT token generated
- **Priority**: High

#### FR1.2: User Login
- **Description**: Authenticate users with email and password
- **Input**: Email, password
- **Process**: 
  - Verify email exists
  - Compare password hash
  - Generate JWT token
- **Output**: Authentication token, user data
- **Priority**: High

#### FR1.3: User Profile Management
- **Description**: Users can view and update their profile
- **Input**: Updated profile fields
- **Process**: Validate and update database
- **Output**: Updated profile
- **Priority**: Medium

### FR2: Service Provider Management

#### FR2.1: Provider Registration
- **Description**: Allow service providers to register
- **Input**: Personal info, business details, service category, license number, hourly rate
- **Process**: 
  - Validate all fields
  - Hash password
  - Set verification status to 'pending'
  - Geocode location
- **Output**: Provider account created (pending verification)
- **Priority**: High

#### FR2.2: Provider Verification
- **Description**: Admin verifies provider credentials
- **Input**: Provider ID, verification status
- **Process**: Update verification_status in database
- **Output**: Provider verified/rejected
- **Priority**: High

#### FR2.3: Provider Availability Management
- **Description**: Providers can set availability status
- **Input**: Availability status (available/busy/offline)
- **Process**: 
  - Update availability_status
  - Auto-update based on job status
- **Output**: Updated availability
- **Priority**: Medium

### FR3: Service Booking System

#### FR3.1: Browse Services
- **Description**: Users can browse available services
- **Input**: Category filter, search query (optional)
- **Process**: Query services table, filter by category/search
- **Output**: List of services
- **Priority**: High

#### FR3.2: View Providers
- **Description**: Display available providers for a service
- **Input**: Service category, user location (optional)
- **Process**: 
  - Query verified providers
  - Calculate distances (if user logged in)
  - Sort by relevance
- **Output**: List of providers with distance, rating, availability
- **Priority**: High

#### FR3.3: Create Booking
- **Description**: Users can book a service
- **Input**: Provider ID, service ID, date, time, address, description
- **Process**: 
  - Validate provider availability
  - Check for overlapping bookings
  - Create booking record (status: pending)
- **Output**: Booking created
- **Priority**: High

#### FR3.4: Manage Booking Status
- **Description**: Providers can accept/decline/update booking status
- **Input**: Booking ID, new status
- **Process**: 
  - Update booking status
  - Auto-manage provider availability
- **Output**: Updated booking status
- **Priority**: High

### FR4: AI Chatbot

#### FR4.1: Natural Language Processing
- **Description**: Process user messages to extract service requirements
- **Input**: User message (text)
- **Process**: 
  - Tokenize and stem words
  - Match keywords to service categories
  - Detect urgency level
  - Extract date/time preferences
- **Output**: Service type, urgency, suggested date/time
- **Priority**: High

#### FR4.2: Provider Suggestions
- **Description**: Suggest relevant providers based on user query
- **Input**: Service type, user location
- **Process**: 
  - Query providers by category
  - Calculate distances
  - Sort by relevance
- **Output**: List of suggested providers
- **Priority**: High

#### FR4.3: Chatbot Booking
- **Description**: Complete booking through chatbot
- **Input**: Provider ID, service ID, date, time, address
- **Process**: Create booking via chatbot endpoint
- **Output**: Booking confirmation
- **Priority**: High

### FR5: Review & Rating System

#### FR5.1: Submit Review
- **Description**: Users can rate and review completed services
- **Input**: Booking ID, rating (1-5), review text
- **Process**: 
  - Create review record
  - Update provider rating (average)
  - Increment total_reviews
- **Output**: Review submitted
- **Priority**: Medium

#### FR5.2: View Reviews
- **Description**: Display reviews for providers
- **Input**: Provider ID
- **Process**: Query ratings_reviews table
- **Output**: List of reviews with ratings
- **Priority**: Medium

### FR6: Complaint Management

#### FR6.1: Submit Complaint
- **Description**: Users can file complaints
- **Input**: Complaint type, text, booking ID (optional)
- **Process**: Create complaint record (status: pending)
- **Output**: Complaint submitted
- **Priority**: Medium

#### FR6.2: Admin Complaint Handling
- **Description**: Admin can review and resolve complaints
- **Input**: Complaint ID, status, admin response
- **Process**: Update complaint status and response
- **Output**: Complaint resolved
- **Priority**: Medium

### FR7: Admin Dashboard

#### FR7.1: Analytics Dashboard
- **Description**: Display platform statistics
- **Input**: None
- **Process**: Aggregate data from all tables
- **Output**: Total users, providers, bookings, revenue
- **Priority**: Medium

#### FR7.2: Provider Management
- **Description**: Admin can view and verify providers
- **Input**: Provider ID, verification status
- **Process**: Update provider verification
- **Output**: Provider verified/rejected
- **Priority**: High

#### FR7.3: Complaint Management
- **Description**: Admin can view and handle complaints
- **Input**: Complaint ID, status, response
- **Process**: Update complaint
- **Output**: Complaint updated
- **Priority**: Medium

---

## Non-Functional Requirements

### NFR1: Performance

#### NFR1.1: Response Time
- **Requirement**: API response time < 500ms for 95% of requests
- **Measurement**: Server-side logging
- **Priority**: High

#### NFR1.2: Database Performance
- **Requirement**: Database queries execute in < 200ms
- **Measurement**: Query execution time logging
- **Priority**: High

#### NFR1.3: Frontend Load Time
- **Requirement**: Initial page load < 3 seconds
- **Measurement**: Browser DevTools
- **Priority**: Medium

### NFR2: Security

#### NFR2.1: Authentication
- **Requirement**: JWT-based authentication with 7-day expiry
- **Implementation**: jsonwebtoken library
- **Priority**: Critical

#### NFR2.2: Password Security
- **Requirement**: Passwords hashed with bcrypt (10 salt rounds)
- **Implementation**: bcryptjs library
- **Priority**: Critical

#### NFR2.3: Input Validation
- **Requirement**: All user inputs validated and sanitized
- **Implementation**: express-validator
- **Priority**: High

#### NFR2.4: SQL Injection Prevention
- **Requirement**: All queries use parameterized statements
- **Implementation**: MySQL2 prepared statements
- **Priority**: Critical

### NFR3: Scalability

#### NFR3.1: Database Connection Pooling
- **Requirement**: Support 10 concurrent database connections
- **Implementation**: MySQL2 connection pool
- **Priority**: Medium

#### NFR3.2: Horizontal Scaling Ready
- **Requirement**: Stateless API design (JWT tokens)
- **Implementation**: JWT stored client-side
- **Priority**: Medium

### NFR4: Usability

#### NFR4.1: Responsive Design
- **Requirement**: Works on desktop, tablet, mobile
- **Implementation**: CSS media queries
- **Priority**: High

#### NFR4.2: User-Friendly Interface
- **Requirement**: Intuitive navigation, clear error messages
- **Implementation**: React components, form validation
- **Priority**: High

### NFR5: Reliability

#### NFR5.1: Error Handling
- **Requirement**: Graceful error handling, user-friendly error messages
- **Implementation**: Try-catch blocks, error middleware
- **Priority**: High

#### NFR5.2: Data Integrity
- **Requirement**: Foreign key constraints, cascading deletes
- **Implementation**: MySQL foreign keys
- **Priority**: High

### NFR6: Maintainability

#### NFR6.1: Code Organization
- **Requirement**: Modular structure, separation of concerns
- **Implementation**: Separate routes, utils, middleware
- **Priority**: Medium

#### NFR6.2: Documentation
- **Requirement**: Code comments, API documentation
- **Implementation**: Inline comments, README files
- **Priority**: Medium

---

## Use Cases

### UC1: User Registration and Login

**Actor**: Homeowner

**Preconditions**: User has valid email address

**Main Flow**:
1. User navigates to registration page
2. User fills registration form (name, email, password, location)
3. System validates input
4. System checks email uniqueness
5. System hashes password
6. System geocodes city location
7. System creates user account
8. System generates JWT token
9. System redirects to user dashboard

**Alternative Flow**:
- 3a. Validation fails → Display error message
- 4a. Email exists → Display "User already exists" error

**Postconditions**: User account created, user logged in

---

### UC2: Service Provider Registration

**Actor**: Service Provider

**Preconditions**: Provider has business license and service category

**Main Flow**:
1. Provider navigates to registration page
2. Provider selects "Service Provider" role
3. Provider fills registration form (personal info, business details, service category, hourly rate)
4. System validates input
5. System checks email uniqueness
6. System hashes password
7. System geocodes location
8. System creates provider account (status: pending)
9. System generates JWT token
10. System redirects to provider dashboard

**Postconditions**: Provider account created (pending verification)

---

### UC3: Browse and Book Service (Manual)

**Actor**: Homeowner

**Preconditions**: User is logged in

**Main Flow**:
1. User navigates to "Browse Services"
2. User selects service category
3. System displays available providers (sorted by distance, rating)
4. User clicks "View Profile" on a provider
5. System displays provider details and services
6. User selects service
7. User fills booking form (date, time, address, description)
8. System validates booking
9. System checks provider availability
10. System checks for overlapping bookings
11. System creates booking (status: pending)
12. System displays confirmation

**Alternative Flow**:
- 8a. Validation fails → Display error
- 9a. Provider unavailable → Display error message
- 10a. Time slot taken → Display error message

**Postconditions**: Booking created, provider notified

---

### UC4: Book Service via Chatbot

**Actor**: Homeowner

**Preconditions**: User is logged in, chatbot is available

**Main Flow**:
1. User opens chatbot on home page
2. User types: "I need an electrician"
3. System processes message (NLP)
4. System extracts service type: "Electrical"
5. System detects urgency: "medium"
6. System queries providers (Electrical, verified, available)
7. System calculates distances
8. System sorts by relevance
9. System displays provider suggestions
10. User selects a provider
11. System prompts for address
12. User enters address
13. System creates booking
14. System displays confirmation

**Alternative Flow**:
- 3a. Service type unclear → System asks for clarification
- 7a. No providers found → System suggests alternative

**Postconditions**: Booking created via chatbot

---

### UC5: Provider Accepts/Declines Booking

**Actor**: Service Provider

**Preconditions**: Provider has pending booking

**Main Flow**:
1. Provider views dashboard
2. System displays pending bookings (newest first)
3. Provider clicks "Accept" on a booking
4. System updates booking status to "confirmed"
5. System displays updated status

**Alternative Flow**:
- 3a. Provider clicks "Decline" → Status set to "cancelled"

**Postconditions**: Booking status updated

---

### UC6: Provider Updates Job Status

**Actor**: Service Provider

**Preconditions**: Provider has confirmed booking

**Main Flow**:
1. Provider views assigned jobs
2. Provider clicks "Start Job" on confirmed booking
3. System updates status to "in_progress"
4. System sets provider availability to "busy"
5. Provider completes job
6. Provider clicks "Complete Job"
7. System updates status to "completed"
8. System checks for other active jobs
9. System sets provider availability to "available" (if no other jobs)

**Postconditions**: Job completed, provider available

---

### UC7: User Submits Review

**Actor**: Homeowner

**Preconditions**: User has completed booking

**Main Flow**:
1. User views "My Bookings"
2. User finds completed booking
3. User clicks "Submit Review"
4. User enters rating (1-5 stars) and review text
5. System validates input
6. System creates review record
7. System updates provider rating (average)
8. System increments provider total_reviews
9. System displays confirmation

**Postconditions**: Review submitted, provider rating updated

---

### UC8: Admin Verifies Provider

**Actor**: Administrator

**Preconditions**: Admin is logged in, provider has pending verification

**Main Flow**:
1. Admin navigates to admin dashboard
2. Admin views pending providers
3. Admin reviews provider details (license, business info)
4. Admin clicks "Verify" or "Reject"
5. System updates provider verification_status
6. System displays updated status

**Postconditions**: Provider verified or rejected

---

### UC9: Admin Handles Complaint

**Actor**: Administrator

**Preconditions**: Complaint exists with status "pending"

**Main Flow**:
1. Admin navigates to complaints section
2. Admin views complaint details (user, provider, booking info)
3. Admin reviews complaint text
4. Admin updates status (under_review/resolved/dismissed)
5. Admin adds admin response
6. System updates complaint
7. System displays updated status

**Postconditions**: Complaint handled

---

## Project Roadmap

### Phase 1: Foundation & Setup (Weeks 1-2)

**Goal**: Set up development environment and core infrastructure

**Tasks**:
1. Project initialization
   - Create React app
   - Set up Express.js server
   - Configure package.json files
   - Set up Git repository

2. Database design and setup
   - Design ER diagram
   - Create database schema
   - Set up MySQL database
   - Create migration scripts

3. Basic authentication
   - Implement JWT authentication
   - Create auth middleware
   - Set up password hashing
   - Create login/register endpoints

4. Frontend setup
   - Set up React Router
   - Create AuthContext
   - Create basic components (Navbar, ProtectedRoute)
   - Set up Axios configuration

**Deliverables**:
- Working authentication system
- Database schema implemented
- Basic frontend structure

---

### Phase 2: User & Provider Management (Weeks 3-4)

**Goal**: Implement user and provider registration, profiles

**Tasks**:
1. User registration and profile
   - User registration form
   - User login
   - User profile page
   - Profile update functionality

2. Provider registration and profile
   - Provider registration form
   - Provider login
   - Provider profile page
   - Provider verification workflow

3. Location services
   - City coordinate database
   - Geocoding on registration
   - Location storage in database

**Deliverables**:
- Complete user management
- Complete provider management
- Location-based features

---

### Phase 3: Service Booking System (Weeks 5-6)

**Goal**: Implement core booking functionality

**Tasks**:
1. Service browsing
   - Service listing page
   - Category filtering
   - Search functionality

2. Provider listing
   - Provider display with ratings
   - Distance calculation
   - Provider sorting algorithm

3. Booking creation
   - Booking form
   - Date/time selection
   - Provider availability check
   - Overlapping booking prevention

4. Booking management
   - Provider dashboard (view jobs)
   - Accept/decline functionality
   - Status update workflow
   - Automatic availability management

**Deliverables**:
- Complete booking system
- Provider job management
- Booking status workflow

---

### Phase 4: AI Chatbot (Weeks 7-8)

**Goal**: Implement AI-powered chatbot

**Tasks**:
1. NLP implementation
   - Natural language processing library integration
   - Service type extraction algorithm
   - Urgency detection
   - Date/time extraction

2. Chatbot UI
   - Chatbot component
   - Message display
   - Provider suggestion cards
   - Booking flow integration

3. Provider matching in chatbot
   - Location-based matching
   - Relevance sorting
   - Provider suggestions

4. Chatbot booking
   - Direct booking from chatbot
   - Address collection
   - Booking confirmation

**Deliverables**:
- Functional AI chatbot
- NLP service extraction
- Chatbot booking flow

---

### Phase 5: Review & Rating System (Week 9)

**Goal**: Implement feedback mechanism

**Tasks**:
1. Review submission
   - Review form
   - Rating input (1-5 stars)
   - Review text input
   - Validation

2. Rating calculation
   - Average rating algorithm
   - Total reviews count
   - Provider rating update

3. Review display
   - Show reviews on provider profile
   - Review list component
   - Review sorting

**Deliverables**:
- Review submission system
- Rating calculation
- Review display

---

### Phase 6: Admin Dashboard (Week 10)

**Goal**: Implement admin functionality

**Tasks**:
1. Admin authentication
   - Admin login
   - Admin routes protection

2. Analytics dashboard
   - Total users, providers, bookings
   - Bookings by status
   - Bookings by category
   - Revenue statistics

3. Provider verification
   - View pending providers
   - Verify/reject providers
   - Provider management

4. Complaint management
   - View all complaints
   - Complaint details
   - Update complaint status
   - Admin response

**Deliverables**:
- Complete admin dashboard
- Provider verification system
- Complaint management

---

### Phase 7: Testing & Refinement (Weeks 11-12)

**Goal**: Test, fix bugs, optimize

**Tasks**:
1. Testing
   - Manual testing of all features
   - Edge case testing
   - Error handling testing

2. Bug fixes
   - Fix identified bugs
   - Improve error messages
   - Enhance user experience

3. Performance optimization
   - Database query optimization
   - Frontend optimization
   - Code refactoring

4. Documentation
   - Code comments
   - API documentation
   - User guide
   - Technical documentation

**Deliverables**:
- Bug-free application
- Optimized performance
- Complete documentation

---

## Gantt Chart Data

### Gantt Chart Format (CSV for Excel/Project Management Tools)

```csv
Task,Start Date,End Date,Duration (Days),Dependencies,Status
Phase 1: Foundation & Setup,2024-01-01,2024-01-14,14,,
  Project Initialization,2024-01-01,2024-01-03,3,,
  Database Design,2024-01-02,2024-01-05,4,,
  Basic Authentication,2024-01-06,2024-01-10,5,Database Design,
  Frontend Setup,2024-01-08,2024-01-14,7,,
Phase 2: User & Provider Management,2024-01-15,2024-01-28,14,Phase 1,
  User Registration,2024-01-15,2024-01-18,4,,
  Provider Registration,2024-01-19,2024-01-22,4,,
  Location Services,2024-01-23,2024-01-28,6,,
Phase 3: Service Booking System,2024-01-29,2024-02-11,14,Phase 2,
  Service Browsing,2024-01-29,2024-02-01,4,,
  Provider Listing,2024-02-02,2024-02-05,4,,
  Booking Creation,2024-02-06,2024-02-08,3,,
  Booking Management,2024-02-09,2024-02-11,3,,
Phase 4: AI Chatbot,2024-02-12,2024-02-25,14,Phase 3,
  NLP Implementation,2024-02-12,2024-02-18,7,,
  Chatbot UI,2024-02-15,2024-02-20,6,,
  Provider Matching,2024-02-19,2024-02-22,4,NLP Implementation,
  Chatbot Booking,2024-02-23,2024-02-25,3,Chatbot UI,
Phase 5: Review & Rating System,2024-02-26,2024-03-04,7,Phase 4,
  Review Submission,2024-02-26,2024-02-28,3,,
  Rating Calculation,2024-03-01,2024-03-02,2,,
  Review Display,2024-03-03,2024-03-04,2,,
Phase 6: Admin Dashboard,2024-03-05,2024-03-11,7,Phase 5,
  Admin Authentication,2024-03-05,2024-03-06,2,,
  Analytics Dashboard,2024-03-07,2024-03-08,2,,
  Provider Verification,2024-03-09,2024-03-10,2,,
  Complaint Management,2024-03-11,2024-03-11,1,,
Phase 7: Testing & Refinement,2024-03-12,2024-03-25,14,Phase 6,
  Testing,2024-03-12,2024-03-18,7,,
  Bug Fixes,2024-03-19,2024-03-21,3,Testing,
  Performance Optimization,2024-03-22,2024-03-23,2,,
  Documentation,2024-03-24,2024-03-25,2,,
```

### Visual Gantt Chart (Text Representation)

```
Timeline: Jan 2024 - Mar 2024 (12 weeks)

Week 1-2:  [████████████████] Phase 1: Foundation
Week 3-4:  [████████████████] Phase 2: User & Provider Management
Week 5-6:  [████████████████] Phase 3: Service Booking
Week 7-8:  [████████████████] Phase 4: AI Chatbot
Week 9:    [████████]         Phase 5: Review & Rating
Week 10:   [████████]         Phase 6: Admin Dashboard
Week 11-12:[████████████████] Phase 7: Testing & Refinement
```

### Milestones

| Milestone | Date | Deliverable |
|-----------|------|-------------|
| M1: Foundation Complete | 2024-01-14 | Authentication system, database schema |
| M2: User Management Complete | 2024-01-28 | User and provider registration |
| M3: Booking System Complete | 2024-02-11 | Core booking functionality |
| M4: Chatbot Complete | 2024-02-25 | AI chatbot with NLP |
| M5: Review System Complete | 2024-03-04 | Review and rating system |
| M6: Admin Dashboard Complete | 2024-03-11 | Admin functionality |
| M7: Project Complete | 2024-03-25 | Fully tested and documented system |

---

## Resource Requirements

### Human Resources
- **1 Full-Stack Developer**: React.js, Node.js, MySQL
- **Time**: 12 weeks (part-time) or 6 weeks (full-time)

### Technical Resources
- **Development Environment**: 
  - Node.js (v14+)
  - MySQL (v5.7+)
  - Code Editor (VS Code)
- **Libraries & Frameworks**: 
  - React.js, Express.js
  - MySQL2, JWT, bcryptjs
  - Natural (NLP library)
- **Hosting** (for deployment):
  - Frontend: Vercel/Netlify
  - Backend: Heroku/AWS
  - Database: AWS RDS/MySQL hosting

### Budget Estimate
- **Development**: $0 (open-source tools)
- **Hosting**: $10-50/month (depending on traffic)
- **Domain**: $10-15/year (optional)

---

## Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Database performance issues | Medium | High | Optimize queries, add indexes |
| NLP accuracy issues | Medium | Medium | Expand keyword dictionary, improve algorithms |
| Security vulnerabilities | Low | Critical | Regular security audits, input validation |
| Scalability challenges | Low | Medium | Design for horizontal scaling |

### Project Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Scope creep | Medium | Medium | Clear requirements, change management |
| Time overrun | Medium | High | Buffer time in schedule, prioritize features |
| Technical complexity | Low | Medium | Phased development, modular design |

---

## Success Criteria

### Functional Success
- ✅ All functional requirements implemented
- ✅ All use cases working correctly
- ✅ No critical bugs
- ✅ User-friendly interface

### Technical Success
- ✅ API response time < 500ms
- ✅ Database queries optimized
- ✅ Security best practices followed
- ✅ Code well-documented

### Business Success
- ✅ Platform ready for deployment
- ✅ Scalable architecture
- ✅ Maintainable codebase
- ✅ Complete documentation

---

## Conclusion

This requirements document outlines the complete functional and non-functional requirements for AI HomeAssist, along with a detailed project roadmap and Gantt chart data. The project is structured in 7 phases over 12 weeks, with clear milestones and deliverables.

The system addresses the core problem of connecting homeowners with service providers through an AI-powered platform, with features for booking, reviews, and administrative oversight.
