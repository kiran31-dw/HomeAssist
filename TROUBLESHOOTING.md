# Troubleshooting Guide - Provider Not Showing

## Common Issues and Solutions

### Issue: Provider Not Showing Up

#### 1. Check Provider Verification Status
**Problem:** New providers are created with `verification_status = 'pending'` by default. They won't show until verified by admin.

**Solution:**
1. Login as **Admin**
2. Go to Admin Dashboard → Providers
3. Find your provider
4. Click **"Verify"** button

**Quick SQL Check:**
```sql
SELECT provider_id, first_name, last_name, city, verification_status 
FROM service_providers 
WHERE city = 'Kochi';
```

**Quick Fix (for testing only):**
```sql
UPDATE service_providers 
SET verification_status = 'verified' 
WHERE city = 'Kochi';
```

#### 2. Check City Match
**Problem:** User and provider must be in the same city.

**Check User City:**
```sql
SELECT user_id, first_name, last_name, city 
FROM users 
WHERE email = 'your_email@example.com';
```

**Check Provider City:**
```sql
SELECT provider_id, first_name, last_name, city 
FROM service_providers 
WHERE email = 'provider_email@example.com';
```

**Solution:** Make sure both have the same city (e.g., both "Kochi")

#### 3. Check User Authentication
**Problem:** User must be logged in for the system to get their city.

**Solution:**
1. Make sure you're logged in as a user
2. Check browser console for errors
3. Verify token is being sent in requests

#### 4. Use Debug Endpoints

**Check All Providers:**
```
GET http://localhost:5000/api/debug/providers-check?city=Kochi
```

**Check Users:**
```
GET http://localhost:5000/api/debug/users-check
```

This will show:
- Total providers
- Verified providers
- Providers by city
- Verification status

## Step-by-Step Debugging

### Step 1: Verify Provider in Database
```sql
-- Check if provider exists
SELECT * FROM service_providers WHERE city = 'Kochi';

-- Check verification status
SELECT provider_id, first_name, last_name, city, verification_status 
FROM service_providers 
WHERE city = 'Kochi';
```

### Step 2: Verify User in Database
```sql
-- Check user city
SELECT user_id, first_name, last_name, city 
FROM users 
WHERE email = 'your_email@example.com';
```

### Step 3: Test API Directly
```bash
# Test with city parameter
curl http://localhost:5000/api/users/providers?city=Kochi

# Test with authentication (replace TOKEN)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/users/providers
```

### Step 4: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab for API responses

## Quick Fixes

### Fix 1: Verify Provider via SQL
```sql
-- Verify all Kochi providers
UPDATE service_providers 
SET verification_status = 'verified' 
WHERE city = 'Kochi' AND verification_status = 'pending';
```

### Fix 2: Update User City
```sql
-- Update user city
UPDATE users 
SET city = 'Kochi' 
WHERE email = 'your_email@example.com';
```

### Fix 3: Check Provider Service Category
Make sure provider has a service category:
```sql
SELECT provider_id, service_category 
FROM service_providers 
WHERE city = 'Kochi';
```

## Expected Behavior

✅ **Working:**
- User from Kochi → Sees only Kochi providers
- Provider is verified → Shows in results
- Provider has service category → Can be filtered

❌ **Not Working:**
- Provider status = 'pending' → Won't show
- User city ≠ Provider city → Won't show
- User not logged in → May not show (depends on city parameter)

## Testing Checklist

- [ ] Provider is created with city "Kochi"
- [ ] Provider verification_status = 'verified' (not 'pending')
- [ ] User is created with city "Kochi"
- [ ] User is logged in
- [ ] Provider has service_category set
- [ ] API endpoint returns providers
- [ ] Frontend displays providers

## Still Not Working?

1. Check server logs for errors
2. Use debug endpoints: `/api/debug/providers-check?city=Kochi`
3. Verify database directly with SQL queries
4. Check browser console for frontend errors
5. Test API with Postman/curl
