# Celebrity Bulaye — Firebase Setup & Security Guide

This guide provides step-by-step instructions for configuring Firebase Authentication, Firestore Database, Security Rules, initial Administrator provisioning, and Data Migration for the **Celebrity Bulaye** platform.

---

## 1. Firebase Project Overview

- **Project ID**: `celebrity-bulaye`
- **Auth Domain**: `celebrity-bulaye.firebaseapp.com`
- **Storage Bucket**: `celebrity-bulaye.firebasestorage.app`
- **Web App ID**: `1:908105910476:web:8ae22a990a4655801ada69`

All web client credentials are configured in `.env.local` and initialized via `src/lib/firebase.ts`.

---

## 2. Enable Email/Password Authentication in Firebase Console

1. Open the [Firebase Console](https://console.firebase.google.com/) and select the project **celebrity-bulaye**.
2. In the left navigation menu, click **Build** → **Authentication**.
3. If Authentication is not yet activated, click **Get Started**.
4. Go to the **Sign-in method** tab.
5. Under **Native providers**, click on **Email/Password**.
6. Toggle **Enable** to **ON**.
7. Keep **Email link (passwordless sign-in)** set to **OFF**.
8. Click **Save**.

> [!IMPORTANT]
> **No Public Registration**: Public registration is strictly disabled in the application. There is no sign-up page or visitor registration form. Administrator accounts must be provisioned directly by the platform owner through the Firebase Console or via an authorized admin.

---

## 3. Provision Administrator Accounts

Public sign-up is disabled on the website. Administrator accounts are created directly in the Firebase Console:

1. In the Firebase Console, go to **Authentication** → **Users** tab.
2. Click the **Add user** button in the top right.
3. Enter the administrator's email (e.g. `admin@celebritybulaye.com`) and a secure password.
4. Click **Add user**.

Any account created here can immediately log in at `/admin/login` and manage the entire CMS. No extra database record or manual allowlist entry is needed.

---

## 4. Publish Firestore Security Rules

1. Open Firebase Console → **Firestore Database** → **Rules** tab.
2. Copy the entire contents of the `firestore.rules` file located in the root of this project:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function for authentication
    // Public user registration is disabled on the website.
    // Accounts are provisioned exclusively by platform owners in Firebase Console Authentication.
    function isAuthenticated() {
      return request.auth != null;
    }

    // Default deny-all security baseline
    match /{document=**} {
      allow read, write: if false;
    }

    // 1. Categories Collection
    // Public can read active categories for browsing.
    // Authenticated admin users can read all (including inactive) and create/update/delete.
    match /categories/{categoryId} {
      allow read: if isAuthenticated() || resource.data.status == 'active';
      allow write: if isAuthenticated();
    }

    // 2. Subcategories Collection (when stored as top-level collection)
    match /subcategories/{subcategoryId} {
      allow read: if isAuthenticated() || resource.data.status == 'active';
      allow write: if isAuthenticated();
    }

    // 3. Celebrities Collection
    // Public can read active/published celebrities.
    // Authenticated admin users have full read and write permissions (including drafts and inactive profiles).
    match /celebrities/{celebrityId} {
      allow read: if isAuthenticated() || resource.data.status == 'active';
      allow write: if isAuthenticated();
    }

    // 4. Private Celebrity Information (Hospitality riders, contract rates, private artist manager contacts)
    // Strictly restricted to authenticated admin users; completely inaccessible to public visitors.
    match /celebrityPrivate/{celebrityId} {
      allow read, write: if isAuthenticated();
    }

    // 5. Hero Banners Collection
    // Public can read active banners for the homepage hero carousel.
    // Authenticated admin users have full read and write permissions.
    match /banners/{bannerId} {
      allow read: if isAuthenticated() || resource.data.status == 'active';
      allow write: if isAuthenticated();
    }

    // 6. Site Settings Collection (Identity, branding, contact info, social links, footer, SEO)
    // Public can read configuration; only authenticated admin users can modify settings.
    match /siteSettings/{settingId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }

    // 7. Booking Inquiries & Contact Messages
    // Public visitors can ONLY create inquiries with required fields.
    // Public visitors can NEVER read, update, or delete existing inquiries.
    // Only authenticated admin users can read, update, and manage customer inquiries.
    match /inquiries/{inquiryId} {
      allow create: if request.resource.data.fullName is string
                    && request.resource.data.email is string
                    && request.resource.data.phone is string;
      allow read, update, delete: if isAuthenticated();
    }

    // 8. Admin Users Collection (optional profile metadata)
    match /adminUsers/{userId} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

3. Paste into the rules editor and click **Publish**.

---

## 5. Run Initial Data Migration to Firestore

The website includes an interactive **Data Migration Center** built directly into the authenticated Admin CMS:

1. Start the development server (`npm run dev`) or access the deployed site.
2. Navigate to: `http://localhost:3000/admin/login`
3. Sign in with your administrator email and password created in Step 3.
4. From the left sidebar, click **Data Migration** (or go to `http://localhost:3000/admin/migrate`).
5. Review the inventory of local categories, celebrities, hero banners, and site settings.
6. Click **Download JSON Backup** to save an offline backup to your computer.
7. Click **Run Dry-Run Preview** to verify all records can be parsed and prepared.
8. Click **Execute Migration to Firestore**.
9. The progress bar will indicate real-time import status.
10. Upon completion, the verification panel will confirm document counts directly from Firestore:
    - Categories: 8 docs
    - Celebrities: 12 docs
    - Hero Banners: 3 docs
    - Site Settings: 1 doc (`main`)

### CLI Migration (Alternative)
You can also run the migration from terminal:
```bash
node scripts/migrate-to-firestore.mjs --email=admin@celebritybulaye.com --password=YOUR_PASSWORD
```

---

## 6. Configure Authorized Domains & Email Templates

### Authorized Domains
1. In Firebase Console, go to **Authentication** → **Settings** tab → **Authorized domains**.
2. Add your production domain(s) (e.g. `celebritybulaye.com`, `www.celebritybulaye.com`, or Vercel preview domain).
3. `localhost` is already enabled by default.

### Password Reset Email Template
1. In Firebase Console, go to **Authentication** → **Templates** tab.
2. Select **Password reset**.
3. Customize the Sender name to `Celebrity Bulaye Admin Desk`.
4. Ensure the reply-to address matches your support or administrative inbox.

---

## 7. Testing Public Access, Admin Access & Denied Access

### Test 1: Public Visitor
1. Open an incognito browser window and navigate to `http://localhost:3000`.
2. Browse Categories, Subcategories, Celebrities, and Hero Banners.
3. Active records load cleanly from Firestore without errors.
4. Try accessing `http://localhost:3000/admin`. You are automatically redirected to `http://localhost:3000/admin/login`.
5. Submit a booking inquiry on any celebrity profile page. The inquiry writes to `inquiries/{id}` successfully.
6. Visitors cannot read any other customer's inquiries.

### Test 2: Admin Login & Management
1. Go to `http://localhost:3000/admin/login`.
2. Enter your admin credentials and sign in.
3. The dashboard displays live statistics and the top header displays "Firestore Backend Active".
4. Create, edit, toggle, or delete a Category, Celebrity, or Banner.
5. Changes are persisted directly in Firestore and reflected in real-time.
6. Click **Sign Out**; your session terminates and you are redirected to the login screen.

### Test 3: Unauthenticated Access & Invalid Credentials
1. Try accessing any protected admin route like `http://localhost:3000/admin` or `http://localhost:3000/admin/categories` without logging in. You are immediately redirected to `/admin/login`.
2. Attempt to sign in with an uncreated email or incorrect password. Firebase Authentication rejects the attempt with an error message, preventing entry.
3. Visitors cannot create accounts because public registration is disabled.

### Test 4: Forgot Password & Resend Cooldown
1. Go to `http://localhost:3000/admin/login` and click **Forgot password?**.
2. Enter your email and click **Send Password Reset Link**.
3. Confirm that the prominent Hindi guidance notice appears:
   > *“Reset email nahi mila? Apne Spam/Junk folder ko bhi check karein. Agar email wahan bhi nahi hai, toh 1 minute baad Resend Reset Link par click karein.”*
4. Confirm the 60-second cooldown activates (`Resend available in 60s`) and the button is disabled until the timer reaches 0.
