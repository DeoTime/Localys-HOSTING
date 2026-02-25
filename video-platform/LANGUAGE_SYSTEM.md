# Multi-Language Support System

## Overview
This application now supports 11 languages:
- **English** (en) - Default
- **Spanish** (es) - Español
- **French** (fr) - Français
- **German** (de) - Deutsch
- **Italian** (it) - Italiano
- **Portuguese** (pt) - Português
- **Japanese** (ja) - 日本語
- **Mandarin Chinese** (zh) - 中文
- **Korean** (ko) - 한국어
- **Russian** (ru) - Русский
- **Arabic** (ar) - العربية

## Features
- ✅ Language preference saved to user profile
- ✅ Automatic language loading on login
- ✅ Easy language switching via dropdown in profile header
- ✅ Comprehensive translation database with 100+ keys
- ✅ Support for authenticated and non-authenticated users

## How to Use

### 1. Using Translations in Components

Import the `useTranslation` hook in any client component:

```tsx
'use client';

import { useTranslation } from '@/hooks/useTranslation';

export function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('profile.title')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### 2. Adding New Translation Keys

All translations are stored in `lib/translations.ts`. To add a new translation:

1. Open `lib/translations.ts`
2. Add your key to the English translations (`en` object)
3. Add the same key with translated text to all other language objects

Example:
```typescript
export const translations: Record<Language, Record<string, string>> = {
  en: {
    // ... existing keys ...
    'my.new.key': 'My new text',
  },
  es: {
    'my.new.key': 'Mi nuevo texto',
  },
  fr: {
    'my.new.key': 'Mon nouveau texte',
  },
  // ... other languages ...
};
```

### 3. Translation Key Naming Convention

Use dot notation to organize keys by section:
- `nav.*` - Navigation items
- `profile.*` - Profile-related text
- `menu.*` - Menu system text
- `video.*` - Video-related text
- `comments.*` - Comments system text
- `auth.*` - Authentication pages
- `common.*` - Common/shared text
- `business.*` - Business-related text
- `search.*` - Search functionality
- `validation.*` - Form validation messages

### 4. Language Preference Component

To display the language selector in your component:

```tsx
import { LanguageSettings } from '@/components/LanguageSettings';

export function MyComponent() {
  return (
    <div>
      <LanguageSettings />
    </div>
  );
}
```

The language settings dropdown is already included in the profile page header.

### 5. How Language Preference is Stored

**For Authenticated Users:**
- Language preference is saved to the `profiles.language_preference` column in Supabase
- Automatically loaded when user logs in
- Changes are saved immediately when user switches language

**For Non-Authenticated Users:**
- Language preference is stored in `localStorage` under key `preferredLanguage`
- Persists across sessions
- Automatically loaded on app startup

### 6. Database Migration

A migration has been created to add language preference support:
- File: `supabase/migrations/016_add_language_preference.sql`
- Adds `language_preference` column to `profiles` table
- Default value: `'en'` (English)
- Constraint ensures only valid language codes are stored

**To run the migration:**
1. Go to Supabase dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/016_add_language_preference.sql`
4. Run the SQL

### 7. Context Setup

The language system uses React Context and is already set up in the layout:

```tsx
// In app/layout.tsx
<AuthProvider>
  <LanguageProvider>
    {children}
  </LanguageProvider>
</AuthProvider>
```

No additional setup needed for new pages!

## Complete Translation Key Reference

### Navigation Keys (`nav.*`)
- `nav.profile` - Profile
- `nav.search` - Search
- `nav.upload` - Upload
- `nav.messages` - Messages
- `nav.buy_coins` - Buy Coins

### Profile Keys (`profile.*`)
- `profile.title` - My Profile
- `profile.edit_profile` - Edit Profile
- `profile.full_name` - Full Name
- `profile.username` - Username
- `profile.bio` - Bio
- `profile.videos` - Videos
- `profile.bookmarked` - Bookmarked
- `profile.menu` - Menu
- `profile.sign_out` - Sign Out
- `profile.change_picture` - Change Picture
- `profile.save_changes` - Save Changes

### Menu Keys (`menu.*`)
- `menu.title` - Menu
- `menu.create_menu` - Create Your Menu
- `menu.add_items` - Add Items to Menu
- `menu.name` - Menu Name
- `menu.description` - Description
- `menu.category` - Category
- `menu.items` - Menu Items
- `menu.item_name` - Item Name
- `menu.price` - Price
- `menu.general`, `menu.appetizers`, `menu.desserts`, etc. - Category options

### Common Keys (`common.*`)
- `common.loading` - Loading...
- `common.save` - Save
- `common.cancel` - Cancel
- `common.delete` - Delete
- `common.edit` - Edit
- `common.add` - Add
- `common.settings` - Settings
- `common.language` - Language

### Video Keys (`video.*`)
- `video.upload` - Upload Video
- `video.uploading` - Uploading...
- `video.delete` - Delete Video
- `video.confirm_delete` - Confirmation message

### Comments Keys (`comments.*`)
- `comments.add_comment` - Add a comment
- `comments.post` - Post
- `comments.delete` - Delete
- `comments.confirm_delete` - Delete confirmation

### Auth Keys (`auth.*`)
- `auth.login` - Login
- `auth.signup` - Sign Up
- `auth.email` - Email
- `auth.password` - Password
- etc.

## Example: Translating a Component

**Before:**
```tsx
function MyComponent() {
  return (
    <div>
      <h1>My Profile</h1>
      <button>Edit Profile</button>
      <button>Sign Out</button>
    </div>
  );
}
```

**After:**
```tsx
'use client';

import { useTranslation } from '@/hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('profile.title')}</h1>
      <button>{t('profile.edit_profile')}</button>
      <button>{t('profile.sign_out')}</button>
    </div>
  );
}
```

## Best Practices

1. **Always mark components with 'use client'** if using the translation hook
2. **Use key naming consistently** - follow the dot notation convention
3. **Test all languages** - Some languages like Arabic need special text direction handling
4. **Translate fallback texts** - The system falls back to English if a key is missing
5. **Group related translations** - Use prefixes to keep related translations organized

## Troubleshooting

### Language not changing?
- Make sure component is marked with `'use client'`
- Check that the LanguageProvider wraps the component in the layout
- Clear localStorage if testing locally

### Translation key not found?
- The system will display the key itself as fallback
- Check the key spelling in `lib/translations.ts`
- Ensure the key exists in the English translations at minimum

### Language preference not saving?
- For authenticated users: Check that the `profiles` table has `language_preference` column (run migration)
- For non-authenticated users: Check browser's localStorage (Settings → Application → localStorage)

## Future Enhancements

- [ ] RTL (Right-to-Left) support for Arabic
- [ ] Language auto-detection based on browser settings
- [ ] Translation management UI for admins
- [ ] Pluralization rules for languages that need them
- [ ] Date/time formatting per language
