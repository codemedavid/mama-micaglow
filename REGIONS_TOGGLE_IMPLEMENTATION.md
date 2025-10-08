# Regions Toggle Feature - Implementation Summary

## Overview
Added an admin settings page with the ability to turn regional sub-groups on or off. When regions are disabled, the sub-group buy feature is completely hidden from the website.

## Changes Made

### 1. Database Migration
**File:** `migrations/0006_site_settings.sql`

Created a new `site_settings` table to store global feature toggles:
- `regions_enabled` - Controls visibility of regional sub-groups
- `group_buy_enabled` - Controls visibility of group buy feature (ready for future use)
- `individual_purchase_enabled` - Controls visibility of individual purchases (ready for future use)

The migration will run automatically on next server restart.

### 2. Admin Settings Page
**File:** `src/app/[locale]/(auth)/admin/settings/page.tsx`

Created a new admin settings page accessible at `/admin/settings` with:
- Toggle switches for each feature (Regions, Group Buy, Individual Purchase)
- Visual status indicators (Enabled/Disabled badges)
- Real-time save functionality
- Beautiful UI with feature descriptions and icons

### 3. RegionsSection Component Update
**File:** `src/components/RegionsSection.tsx`

Updated to check if regions are enabled before rendering:
- Fetches `regions_enabled` setting from database
- Returns `null` (hides section) if regions are disabled
- Only fetches region data if feature is enabled

### 4. Sub-Groups Page Update
**File:** `src/app/[locale]/(marketing)/products/sub-groups/page.tsx`

Updated to respect the regions toggle:
- Shows "Feature Disabled" message if regions are turned off
- Provides link to browse products instead
- Prevents access to region-specific functionality

### 5. Realtime Hook Update
**File:** `src/hooks/useRealtimeSubGroupBatch.ts`

Enhanced `useRealtimeRegions` hook to:
- Check if regions feature is enabled
- Return `regionsEnabled` state
- Skip data fetching if feature is disabled

## How It Works

1. **Admin Control:**
   - Admin goes to `/admin/settings`
   - Toggles "Regional Sub-Groups" switch
   - Clicks "Save Changes"
   - Setting is saved to database

2. **Frontend Response:**
   - All components check the `regions_enabled` setting
   - If disabled:
     - RegionsSection returns `null` (hidden from homepage)
     - Sub-groups page shows "Feature Disabled" message
     - No region data is fetched from database

3. **Data Preservation:**
   - Existing region and batch data is preserved
   - Only the visibility is affected
   - Can be re-enabled anytime without data loss

## Pages Affected

- **Homepage** (`/`) - RegionsSection will be hidden
- **Sub-Groups Page** (`/products/sub-groups`) - Shows disabled message
- **Admin Settings** (`/admin/settings`) - New settings page

## Testing Instructions

1. **Enable/Disable Regions:**
   ```
   1. Login as admin
   2. Navigate to /admin/settings
   3. Toggle "Regional Sub-Groups" switch
   4. Click "Save Changes"
   5. Visit homepage - region section should appear/disappear
   6. Visit /products/sub-groups - should show content or disabled message
   ```

2. **Verify Database:**
   ```sql
   SELECT * FROM site_settings WHERE key = 'regions_enabled';
   ```

## Future Enhancements

The settings page is ready to control additional features:
- Group Buy toggle (already in place, needs implementation)
- Individual Purchase toggle (already in place, needs implementation)
- Can easily add more feature toggles as needed

## Files Created/Modified

### Created:
- `migrations/0006_site_settings.sql`
- `src/app/[locale]/(auth)/admin/settings/page.tsx`

### Modified:
- `src/components/RegionsSection.tsx`
- `src/app/[locale]/(marketing)/products/sub-groups/page.tsx`
- `src/hooks/useRealtimeSubGroupBatch.ts`

## Admin Navigation
The Settings option is already available in the admin sidebar navigation at `/admin/settings`.
