# Firebase Firestore Security Rules Setup

## Current Issue
The error "Missing or insufficient permissions" occurs because Firestore has default security rules that deny all reads/writes. You need to configure proper security rules in the Firebase Console.

## Required Steps

### 1. Go to Firebase Console
1. Visit https://console.firebase.google.com
2. Select your project: `remmic-9686c`
3. Go to "Firestore Database" in the left sidebar
4. Click on the "Rules" tab

### 2. Replace the Default Rules
Replace the current rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Admins can read all user documents
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Properties collection
    match /properties/{propertyId} {
      // Anyone can read approved properties
      allow read: if resource.data.status == 'approved';
      // Authenticated users can create properties
      allow create: if request.auth != null;
      // Users can read their own properties
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      // Admins can read and update all properties
      allow read, update: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Investments collection
    match /investments/{investmentId} {
      // Users can create and read their own investments
      allow create, read: if request.auth != null && request.auth.uid == resource.data.userId;
      // Admins can read and update all investments
      allow read, update: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Contact messages collection
    match /contactMessages/{messageId} {
      // Anyone can create contact messages
      allow create: if true;
      // Admins can read and update all messages
      allow read, update: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 3. For Development/Testing (Temporary)
If you want to test quickly, you can temporarily use these permissive rules (NOT for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Warning**: The permissive rules above allow anyone to read/write all data. Only use for testing!

### 4. Create Admin User
To create an admin user, you have a few options:

#### Option A: Register with admin email
1. Go to `/signup`
2. Register with an email containing "admin" (e.g., `admin@remmic.com`)
3. The system will automatically assign admin role

#### Option B: Manually promote user
1. Go to Firebase Console → Authentication
2. Find your user
3. Copy the UID
4. Go to Firestore Database
5. Create/edit the user document in `users/{uid}` collection
6. Set `role: "admin"`

### 5. Test the Setup
1. Visit `/test-firebase` to verify Firestore connection
2. Try logging in as admin at `/admin`
3. Check the browser console for any remaining permission errors

## Admin Login Credentials
The system now supports these admin login methods:
- Any email containing "admin" (automatically promoted)
- Emails: `admin@remmic.com`, `admin@example.com`, `test@admin.com`
- Any user with `role: "admin"` in Firestore

## Current Features
✅ Firebase Authentication working
✅ Firestore database configured  
✅ User profiles saved to both Firestore and localStorage
✅ Properties saved to both Firestore and localStorage
✅ Graceful fallback to localStorage if Firestore fails
✅ Admin role detection and promotion
✅ Permission-aware error handling

## Next Steps After Rules Setup
1. Test all functionality works
2. Create proper admin users
3. Set up proper security rules for production
4. Configure Firebase Storage for images (optional)