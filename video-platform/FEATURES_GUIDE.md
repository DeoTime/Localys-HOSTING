# New Features Guide

## 1. Business Hours & Business Type

### See Business Hours & Type on Profile
When viewing any business profile:
- Look for the **🏪 Business Name** tag
- Next to it, you'll see a **Business Type tag** (e.g., 📦 Pickup & Delivery)
- Click the **⏰ Show Hours** button to see full business hours
- Click **⏰ Hide Hours** to collapse

### Edit Business Hours & Type (Your Own Profile)
1. Go to your profile
2. Click **Edit Profile** button
3. Scroll down to find:
   - **Business Name** - Your business name
   - **Business Type** - Dropdown to select:
     - General
     - Pickup
     - Delivery
     - Dine-In
     - Services
     - Retail
     - Pickup & Delivery
   - **Business Hours** - Set hours for each day:
     - Check the box next to a day to open it
     - Set opening and closing times
     - Uncheck the box to mark as closed

4. Click **Save Changes** button

### Important Notes
- Business hours/type only show if you have a business created
- You must run the database migration first (instructions below)
- Changes are saved to your profile immediately

---

## 2. Edit & Delete Messages in Chats

### How to Edit a Message
1. Open a chat conversation
2. **Hover over your own message** (one you sent)
3. You'll see:
   - ✏️ Edit button
   - 🗑️ Delete button
4. Click **✏️** to edit
5. Update the text in the textarea
6. Click **Save** or **Cancel**
7. Messages show "(edited)" if changed

### How to Delete a Message
1. Open a chat conversation
2. **Hover over your own message**
3. Click **🗑️** to delete
4. Confirm deletion
5. Message will show as "[Message deleted]"

### Important Notes
- Only you can edit/delete your own messages
- Hover to see the buttons (they only appear on your messages)
- Deleted messages still appear as "[Message deleted]"
- Edited messages show "(edited)" timestamp

---

## 3. Database Migration Setup

To enable business hours and type features, you need to run the migration:

### Using Supabase CLI:
```bash
cd video-platform
npx supabase migration list
npx supabase migration up
```

### Manual SQL (In Supabase Dashboard):
1. Go to SQL Editor in your Supabase dashboard
2. Run this SQL:
```sql
-- Add business_type and business_hours columns to businesses table
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT NULL;

-- Create an index on business_type for faster queries
CREATE INDEX IF NOT EXISTS idx_businesses_business_type ON public.businesses(business_type);
```

---

## Troubleshooting

### Business hours/type fields don't show in edit form
- Make sure you have a business created
- Make sure the migration has been run
- Reload the page after running migration

### Can't see edit/delete message buttons
- You need to **hover over** your own messages
- Buttons only appear on messages you sent
- Make sure you're in an active chat

### Business type tag shows as "general" but doesn't match what I set
- Clear browser cache
- Make sure you clicked "Save Changes" after editing
- Check that the migration was applied to the database

---

## Available Business Types
- **General** - Default type
- **Pickup** - Customers pick up orders
- **Delivery** - You deliver to customers
- **Dine-In** - Customers eat at your location
- **Services** - Service-based business
- **Retail** - Retail store
- **Pickup & Delivery** - Both options available (shows as 📦)

