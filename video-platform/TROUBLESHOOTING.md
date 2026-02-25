# Troubleshooting Guide - Debug the Features

## For Messages Edit/Delete - Testing Step by Step:

### 1. Open Browser Console (F12)
- Look for any red error messages
- Tell me what you see

### 2. Start a Chat
- Go to Home
- Click on a business or user
- Message them
- Go to your Chats

### 3. Send Test Messages
- Type "test message 1"
- Send it
- Verify it appears on the right side (your message)

### 4. Try Hovering
- **SLOWLY hover your mouse over your message**
- Look to the RIGHT of your message for buttons
- You should see small buttons (✏️ Edit and 🗑️ Delete) appear
- If buttons don't appear, check browser console for errors

### 5. Test Edit
- Click the ✏️ button
- A text area should appear
- Edit the text
- Click "Save" or "Cancel"

### 6. Test Delete  
- Click the 🗑️ button
- Confirm deletion
- Message should show "[Message deleted]"

---

## For Business Hours & Type - Testing:

### Check if You Have a Business:
1. Go to your profile
2. Look for "🏪 Business Name" with a blue badge
3. If you DON'T see a business name:
   - You don't have a business yet
   - The business type/hours won't show
   - Contact admin to create business for your account

### If You DO Have a Business:

#### On Your Profile:
1. Click "Edit Profile" button
2. Scroll DOWN past Bio field
3. You should see:
   - **Business Name** - input field
   - **Business Type** - dropdown menu
   - **Business Hours** - checkboxes with time inputs
4. Make changes and click "Save Changes"

#### Viewing Results:
1. After saving, go back to view profile
2. Look at the business name line
3. You should see a business type badge next to name
4. Click "⏰ Show Hours" button to see hours

### If Still Not Visible:

**Step 1: Check Your Business Exists**
```
Go to profile > Edit Profile > Scroll down
Do you see ANY business-related fields?
YES = Continue to Step 2
NO = You don't have a business, feature won't work
```

**Step 2: Run the Database Migration**
This is REQUIRED for business hours/type to work!

Option A - Using Supabase Dashboard:
1. Go to supabase.com → Your project
2. Click "SQL Editor"
3. Click "New Query"
4. Paste this:
```sql
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_businesses_business_type ON public.businesses(business_type);
```
5. Click "Run"
6. Refresh your app (Ctrl+R or F5)

Option B - Using Supabase CLI:
```bash
cd video-platform
npx supabase migration up
```

**Step 3: After Migration - Refresh Everything**
1. Refresh browser (Ctrl+R or F5)
2. Go to profile
3. Click "Edit Profile"
4. Scroll down - business type/hours should NOW appear

---

## Report Back With:

1. **For Messages:**
   - Can you see the ✏️ and 🗑️ buttons when hovering?
   - What errors show in browser console (F12)?
   - Does clicking the buttons do anything?

2. **For Business Hours/Type:**
   - Do you have a business? (Check your profile)
   - Have you run the migration? (Check Supabase)
   - Can you see the fields in Edit Profile after migration?

3. **Screenshot or Details:**
   - Tell me exactly what you're seeing vs what you expect

This will help me pinpoint what's wrong!
