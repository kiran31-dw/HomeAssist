# How to Import Migration in phpMyAdmin

## Method 1: Using SQL Tab (Recommended)

### Step 1: Open phpMyAdmin
1. Open your web browser
2. Navigate to phpMyAdmin (usually `http://localhost/phpmyadmin` or your server URL)
3. Login with your MySQL credentials

### Step 2: Select Database
1. In the left sidebar, click on `homeassist_db` database
2. If the database doesn't exist, create it first:
   - Click "New" in the left sidebar
   - Enter database name: `homeassist_db`
   - Click "Create"

### Step 3: Open SQL Tab
1. Once inside the `homeassist_db` database, click on the **"SQL"** tab at the top
2. You'll see a text area where you can enter SQL commands

### Step 4: Copy and Paste Migration SQL
1. Open the file: `backend/database/migration_add_location.sql`
2. Copy all the contents
3. Paste it into the SQL text area in phpMyAdmin

### Step 5: Execute
1. Click the **"Go"** button at the bottom
2. You should see a success message: "2 rows affected" (one for users table, one for service_providers table)

---

## Method 2: Using Import Tab

### Step 1: Select Database
1. Click on `homeassist_db` in the left sidebar

### Step 2: Open Import Tab
1. Click on the **"Import"** tab at the top

### Step 3: Choose File
1. Click **"Choose File"** or **"Browse"** button
2. Navigate to: `C:\HomeAssist\backend\database\migration_add_location.sql`
3. Select the file

### Step 4: Import Settings
1. Make sure **"SQL"** format is selected
2. Leave other settings as default
3. Click **"Go"** button at the bottom

---

## Method 3: Manual SQL Execution

If you prefer to run the SQL commands manually, here's what the migration does:

```sql
USE homeassist_db;

-- Add latitude and longitude to users table
ALTER TABLE users 
ADD COLUMN latitude DECIMAL(10, 8) NULL AFTER zip_code,
ADD COLUMN longitude DECIMAL(11, 8) NULL AFTER latitude;

-- Add latitude and longitude to service_providers table
ALTER TABLE service_providers 
ADD COLUMN latitude DECIMAL(10, 8) NULL AFTER zip_code,
ADD COLUMN longitude DECIMAL(11, 8) NULL AFTER latitude;

-- Update existing records with Thiruvalla coordinates (example)
UPDATE users SET latitude = 9.3816, longitude = 76.5744 WHERE city = 'Thiruvalla' OR city IS NULL;
UPDATE service_providers SET latitude = 9.3816, longitude = 76.5744 WHERE city = 'Thiruvalla' OR city IS NULL;
```

### Steps:
1. Go to SQL tab in phpMyAdmin
2. Copy and paste the above SQL
3. Click "Go"

---

## Verify Migration Success

After running the migration, verify it worked:

### Check Users Table:
1. Click on `users` table in the left sidebar
2. Click on **"Structure"** tab
3. You should see `latitude` and `longitude` columns

### Check Service Providers Table:
1. Click on `service_providers` table
2. Click on **"Structure"** tab
3. You should see `latitude` and `longitude` columns

---

## Troubleshooting

### Error: "Table doesn't exist"
- Make sure you've run the main `schema.sql` first
- Go to SQL tab and run the main schema file

### Error: "Column already exists"
- The migration has already been run
- You can skip this step or drop the columns first:
  ```sql
  ALTER TABLE users DROP COLUMN latitude, DROP COLUMN longitude;
  ALTER TABLE service_providers DROP COLUMN latitude, DROP COLUMN longitude;
  ```
  Then run the migration again

### Error: "Access denied"
- Make sure you're logged in with a user that has ALTER permissions
- Contact your database administrator

---

## Quick Reference

**File Location:** `C:\HomeAssist\backend\database\migration_add_location.sql`

**What it does:**
- Adds `latitude` and `longitude` columns to `users` table
- Adds `latitude` and `longitude` columns to `service_providers` table
- Sets default coordinates for existing records (Thiruvalla)

**Time Required:** Less than 1 minute

**Database:** `homeassist_db`
