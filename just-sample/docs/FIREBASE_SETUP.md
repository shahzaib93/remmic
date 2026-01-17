# Firebase Configuration Guide for REMMIC

## ðŸ“‹ **Setup Complete**

Your Firebase configuration has been successfully set up for the REMMIC real estate platform.

## ðŸ—‚ï¸ **Files Created**

### 1. **Firebase Configuration** - `/lib/firebase.js`
- Main Firebase configuration file
- Initializes Firebase app, Auth, Firestore, Storage, and Analytics
- Exports all Firebase services for use throughout the app

### 2. **Firebase Context** - `/contexts/FirebaseContext.js`
- React Context Provider for Firebase
- Contains all Firebase functions for auth, properties, evaluations, bidding
- Provides real-time data synchronization

### 3. **Firebase Hooks** - `/hooks/useFirebase.js`
- Custom hooks for easy Firebase integration
- Includes hooks for properties, evaluations, bidding, file uploads, and auth
- Handles loading states and error management

### 4. **App Provider** - `/pages/_app.js`
- Updated to wrap the entire app with FirebaseProvider
- Enables Firebase context throughout the application

### 5. **Example Integration** - `/examples/firebase-login-example.js`
- Complete example of Firebase authentication integration
- Shows how to use the useAuth hook

## ðŸš€ **Installation**

Run the following command to install Firebase:

```bash
npm install firebase
```

## ðŸ”§ **Configuration Details**

Your Firebase project is configured with:
- **Project ID**: remmic-9686c
- **Auth Domain**: remmic-9686c.firebaseapp.com
- **Storage Bucket**: remmic-9686c.firebasestorage.app
- **Analytics**: Enabled with measurement ID

## ðŸ“Š **Database Structure**

### Collections:

#### **users**
```javascript
{
  uid: string,           // Firebase Auth UID
  email: string,         // User email
  fullName: string,      // User's full name
  phone: string,         // Phone number
  role: string,          // 'buyer', 'seller', 'agent', 'admin'
  createdAt: timestamp,  // Account creation date
  updatedAt: timestamp   // Last update
}
```

#### **properties**
```javascript
{
  userId: string,        // Owner's UID
  title: string,         // Property title
  type: string,          // 'rental', 'sale', 'bidding'
  price: number,         // Property price
  location: string,      // Property location
  area: string,          // Property area/size
  description: string,   // Property description
  images: array,         // Array of image URLs
  status: string,        // 'active', 'sold', 'rented'
  createdAt: timestamp,  // Listing date
  updatedAt: timestamp   // Last update
}
```

#### **evaluations**
```javascript
{
  userId: string,            // Submitter's UID
  propertyType: string,      // Type of property
  propertyAddress: string,   // Property address
  city: string,              // City location
  plotNumber: string,        // Plot/building number
  areaSize: string,          // Area/size
  floors: number,            // Number of floors
  propertyValue: string,     // Estimated value
  fullName: string,          // Owner's name
  cnic: string,              // CNIC number
  contact: string,           // Contact number
  email: string,             // Email address
  status: string,            // 'Under Evaluation', 'Completed'
  evaluationValue: string,   // Final evaluation
  submittedAt: timestamp,    // Submission date
  completedAt: timestamp     // Completion date
}
```

#### **bids**
```javascript
{
  userId: string,        // Bidder's UID
  propertyId: string,    // Property reference
  bidAmount: number,     // Bid amount
  bidderName: string,    // Bidder's name
  bidderEmail: string,   // Bidder's email
  bidTime: timestamp,    // Bid timestamp
  status: string,        // 'active', 'accepted', 'rejected'
  message: string        // Optional bid message
}
```

## ðŸ” **Authentication Usage**

```javascript
import { useAuth } from '../hooks/useFirebase';

function LoginComponent() {
  const { user, login, register, logout, loading, error } = useAuth();

  const handleLogin = async () => {
    const result = await login('user@example.com', 'password');
    if (result.success) {
      console.log('Login successful!');
    }
  };

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.email}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

## ðŸ  **Property Management Usage**

```javascript
import { useProperties } from '../hooks/useFirebase';
import { useFirebase } from '../contexts/FirebaseContext';

function PropertyComponent() {
  const { properties, loading, error } = useProperties();
  const { addProperty, updateProperty, deleteProperty } = useFirebase();

  const handleAddProperty = async () => {
    const propertyData = {
      title: 'Beautiful House',
      type: 'sale',
      price: 5000000,
      location: 'DHA Karachi',
      area: '10 Marla',
      description: 'Modern house with all amenities'
    };

    const result = await addProperty(propertyData);
    if (result.success) {
      console.log('Property added!');
    }
  };

  if (loading) return <div>Loading properties...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={handleAddProperty}>Add Property</button>
      {properties.map(property => (
        <div key={property.id}>
          <h3>{property.title}</h3>
          <p>Price: PKR{property.price}</p>
          <p>Location: {property.location}</p>
        </div>
      ))}
    </div>
  );
}
```

## ðŸ“‹ **Evaluation Usage**

```javascript
import { useEvaluations } from '../hooks/useFirebase';
import { useFirebase } from '../contexts/FirebaseContext';

function EvaluationComponent() {
  const { evaluations, loading } = useEvaluations();
  const { submitEvaluation } = useFirebase();

  const handleSubmitEvaluation = async () => {
    const evaluationData = {
      propertyType: 'House',
      propertyAddress: '123 Main Street',
      city: 'Karachi',
      plotNumber: '123',
      areaSize: '10 Marla',
      floors: 2,
      propertyValue: '5000000',
      fullName: 'John Doe',
      cnic: '42101-1234567-1',
      contact: '+92 300 1234567',
      email: 'john@example.com'
    };

    const result = await submitEvaluation(evaluationData);
    if (result.success) {
      console.log('Evaluation submitted!');
    }
  };

  return (
    <div>
      <button onClick={handleSubmitEvaluation}>Submit Evaluation</button>
      {evaluations.map(evaluation => (
        <div key={evaluation.id}>
          <h3>{evaluation.propertyType} in {evaluation.city}</h3>
          <p>Status: {evaluation.status}</p>
          <p>Value: {evaluation.evaluationValue}</p>
        </div>
      ))}
    </div>
  );
}
```

## ðŸ’° **Bidding Usage**

```javascript
import { useBids } from '../hooks/useFirebase';
import { useFirebase } from '../contexts/FirebaseContext';

function BiddingComponent({ propertyId }) {
  const { bids, loading, refreshBids } = useBids(propertyId);
  const { submitBid } = useFirebase();

  const handleSubmitBid = async () => {
    const bidData = {
      propertyId: propertyId,
      bidAmount: 4500000,
      bidderName: 'Jane Smith',
      bidderEmail: 'jane@example.com',
      message: 'Interested in this property'
    };

    const result = await submitBid(bidData);
    if (result.success) {
      console.log('Bid submitted!');
      refreshBids(); // Refresh the bids list
    }
  };

  return (
    <div>
      <button onClick={handleSubmitBid}>Submit Bid</button>
      {bids.map(bid => (
        <div key={bid.id}>
          <h4>Bid by {bid.bidderName}</h4>
          <p>Amount: PKR{bid.bidAmount}</p>
          <p>Time: {new Date(bid.bidTime).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
```

## ðŸ“ **File Upload Usage**

```javascript
import { useFileUpload } from '../hooks/useFirebase';

function FileUploadComponent() {
  const { upload, uploading, progress, error } = useFileUpload();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const result = await upload(file, 'property-images');
      if (result.success) {
        console.log('File uploaded!', result.url);
      }
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
      {uploading && (
        <div>
          <p>Uploading... {progress}%</p>
          <div style={{ width: '100%', background: '#f0f0f0' }}>
            <div 
              style={{ 
                width: `${progress}%`, 
                background: '#080808', 
                height: '10px' 
              }} 
            />
          </div>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}
```

## ðŸ”„ **Real-time Data**

The hooks automatically set up real-time listeners for:
- **Properties**: Live updates when properties are added/updated
- **Evaluations**: Live updates on evaluation status changes
- **Authentication**: Automatic user state management

## ðŸ›¡ï¸ **Security Rules**

Configure Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Properties can be read by anyone, written by authenticated users
    match /properties/{propertyId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Evaluations can be read/written by authenticated users
    match /evaluations/{evalId} {
      allow read, write: if request.auth != null;
    }
    
    // Bids can be read/written by authenticated users
    match /bids/{bidId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## ðŸš¨ **Important Notes**

1. **Install Firebase**: Run `npm install firebase` before using
2. **Environment Variables**: Consider moving sensitive config to environment variables
3. **Security Rules**: Configure proper Firestore security rules
4. **Analytics**: Analytics only works in browser environment
5. **Error Handling**: All functions return `{success: boolean, error?: string}` format

## ðŸ”„ **Migration from localStorage**

Your existing localStorage data can be migrated to Firebase:

1. **Export existing data** from localStorage
2. **Import into Firestore** using the Firebase Admin SDK
3. **Update components** to use Firebase hooks
4. **Test thoroughly** before removing localStorage fallbacks

The Firebase setup is now complete and ready for integration with your REMMIC real estate platform!
