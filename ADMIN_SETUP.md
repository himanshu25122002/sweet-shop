# Admin User Setup Guide

This guide explains how to create and manage admin users in the Sweet Shop Management System.

## Default Admin Account

For development and testing, a demo admin account is available:

- **Email**: `admin@sweetshop.com`
- **Password**: `admin123`

**⚠️ Important**: This demo account should be deleted or disabled in production environments.

## Creating a New Admin User

### Method 1: Through Supabase Dashboard (Recommended)

1. **Register the user through the application**
   - Go to your application URL
   - Click "Register"
   - Create an account with your desired email and password
   - Complete the registration process

2. **Promote to Admin via Supabase Dashboard**
   - Log into your Supabase project dashboard at [https://supabase.com](https://supabase.com)
   - Navigate to **Authentication** → **Users**
   - Find the user you just created
   - Click on the user to view details
   - Copy the user's UUID (you'll need this in the next step)

3. **Update the user profile**
   - Go to **Table Editor** → **user_profiles**
   - Find the row with the user's ID (UUID from step 2)
   - Click to edit the row
   - Change the `role` field from `'user'` to `'admin'`
   - Save the changes

4. **Verify admin access**
   - Log out from the application
   - Log back in with the new admin credentials
   - You should now see the "Admin" badge in the header
   - Admin-only features (Add Sweet, Edit, Delete, Restock) should now be visible

### Method 2: Using SQL (Advanced)

If you have direct database access, you can promote a user using SQL:

```sql
-- Update existing user to admin
UPDATE user_profiles
SET role = 'admin'
WHERE id = 'USER_UUID_HERE';
```

Replace `'USER_UUID_HERE'` with the actual UUID of the user.

### Method 3: During Registration (Development Only)

For development purposes, you can temporarily modify the trigger that creates user profiles:

1. Go to **SQL Editor** in Supabase Dashboard
2. Modify the `handle_new_user()` function to create admin users:

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the first user or a specific email
  IF (SELECT COUNT(*) FROM public.user_profiles) = 0
     OR NEW.email = 'youradmin@example.com' THEN
    INSERT INTO public.user_profiles (id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_profiles (id, role)
    VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**⚠️ Important**: Remember to revert this change after creating your admin users to prevent all new users from becoming admins.

## Admin Privileges

Admin users have the following additional capabilities:

### Inventory Management
- ➕ **Add New Sweets**: Create new products in the inventory
- ✏️ **Edit Sweets**: Modify existing product details (name, category, price, quantity, description)
- 🗑️ **Delete Sweets**: Remove products from inventory
- 📦 **Restock Sweets**: Increase inventory quantities

### Visibility
- 🏷️ **Admin Badge**: Visible "Admin" badge in the application header
- 🔧 **Admin Controls**: Additional buttons and controls on sweet cards

### Security
- All admin actions are protected by Row Level Security (RLS) policies
- Admin checks happen both on the frontend (UI) and backend (database)
- Users cannot bypass admin restrictions by manipulating the frontend

## Removing Admin Access

To demote an admin user back to regular user:

1. Go to **Table Editor** → **user_profiles** in Supabase Dashboard
2. Find the admin user's row
3. Change the `role` field from `'admin'` to `'user'`
4. Save the changes
5. The user will lose admin privileges on their next page refresh

## Security Best Practices

### Production Environment

1. **Delete Demo Account**: Remove or disable the demo admin account
2. **Secure Credentials**: Use strong, unique passwords for admin accounts
3. **Limit Admin Access**: Only grant admin privileges to trusted users
4. **Audit Admin Actions**: Monitor admin activities through Supabase logs
5. **Regular Reviews**: Periodically review the list of admin users

### Password Requirements

Ensure admin users follow password best practices:
- Minimum 12 characters (application enforces 6, but use more for admins)
- Mix of uppercase, lowercase, numbers, and symbols
- No common words or patterns
- Unique password not used elsewhere

### Two-Factor Authentication (Future Enhancement)

While not currently implemented, consider adding 2FA for admin accounts:
- Supabase supports Auth MFA
- Particularly important for admin accounts
- Can be enforced through RLS policies

## Troubleshooting

### Issue: User promoted but still sees regular user interface

**Solution**:
- Ensure the user has fully logged out and logged back in
- Check browser cache - try a hard refresh (Ctrl+F5)
- Verify in Supabase that the role was actually changed

### Issue: Cannot find user in user_profiles table

**Cause**: User might not have completed registration properly

**Solution**:
1. Check **Authentication** → **Users** to see if the user exists in auth.users
2. If yes but not in user_profiles, the trigger might have failed
3. Manually insert the profile:
```sql
INSERT INTO user_profiles (id, role)
VALUES ('USER_UUID', 'admin');
```

### Issue: Admin user can't perform admin actions

**Cause**: RLS policies might not be working correctly

**Solution**:
1. Verify RLS is enabled on tables
2. Check policy definitions in **Database** → **Policies**
3. Test with SQL queries in SQL Editor to debug

## Monitoring Admin Activity

To track what admins are doing:

1. **Supabase Logs**: View in Dashboard → Logs
2. **Created_by Field**: Track which admin created/modified sweets
3. **Updated_at Timestamps**: See when changes were made
4. **Custom Logging**: Can add audit trail table for detailed tracking

## Multiple Admin Users

The system supports multiple admin users:
- Each admin has full administrative capabilities
- No hierarchy between admin users
- All admins can promote/demote users (through database access)
- Consider implementing role levels (super-admin, admin, moderator) for larger teams

## Demo Setup for Presentations

For demonstrations or testing:

```sql
-- Quick setup: Create multiple test users with different roles
-- Note: Still need to register users first through the application

-- Make user1 an admin
UPDATE user_profiles SET role = 'admin' WHERE id = 'uuid_of_user1';

-- Keep user2 as regular user (no change needed)

-- Create a test admin for demos
-- 1. Register: demo-admin@sweetshop.com / DemoPass123!
-- 2. Then run:
UPDATE user_profiles SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'demo-admin@sweetshop.com');
```

## Questions?

If you encounter any issues with admin setup:
1. Check this guide thoroughly
2. Review the main README.md
3. Check Supabase Dashboard logs for errors
4. Verify database policies are correctly configured

Remember: Admin access is powerful - grant it carefully and monitor its use regularly.
