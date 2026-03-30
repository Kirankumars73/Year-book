# Digital Yearbook 🎓

A modern, interactive digital yearbook application designed to connect classmates. Students can securely join their class using a secret code, view their peers, interact in real-time, share memories, and maintain their unique profiles.

## ✨ Features

- **Secure Classroom Access**: Users must validate a unique class code before joining and accessing class-specific content.
- **Authentication**: Seamless login and signup flow integrated with Firebase Authentication.
- **Interactive Yearbook**: Browse through classmate profiles in an intuitive layout.
- **Student Profiles**: Individual pages displaying student details and photos. Users can easily update their personal information and profile pictures via the Edit Profile page.
- **Real-Time Chat**: Engage in live conversations with classmates using the built-in chat feature.
- **Class Gallery**: A shared photo space to upload and view memorable pictures from the school year.
- **Class Wall**: A dedicated message board to leave notes, announcements, or messages.
- **Protected Routes**: Secure navigation ensuring only authenticated class members can view sensitive content.

## 🛠️ Technology Stack

- **Frontend**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Backend / BaaS**: [Firebase](https://firebase.google.com/) (Authentication, Firestore, Storage)
- **Styling**: Custom CSS / Vanilla CSS
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Hosting**: [Vercel](https://vercel.com/)

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- A Firebase project with Auth, Firestore, and Storage enabled. Ensure Storage has correct CORS rules set for image uploads.

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd Yearbook
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root of your project and add your Firebase configuration details:
   ```env
   VITE_FIREBASE_API_KEY="your_api_key"
   VITE_FIREBASE_AUTH_DOMAIN="your_auth_domain"
   VITE_FIREBASE_PROJECT_ID="your_project_id"
   VITE_FIREBASE_STORAGE_BUCKET="your_storage_bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your_messaging_sender_id"
   VITE_FIREBASE_APP_ID="your_app_id"
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 📁 Project Structure

```text
src/
├── components/       # Reusable UI components (Navbar, ProtectedRoute)
├── contexts/         # React Context files (AuthContext for user state)
├── pages/            # Application pages (Landing, Yearbook, Admin, Profile, etc.)
├── App.jsx           # Main routing component
├── firebase.js       # Firebase initialization and exports
└── main.jsx          # React app entry point
```

## 🌍 Deployment

This project is configured for deployment on [Vercel](https://vercel.com/).

1. Push your code to a GitHub repository.
2. Import the project into your Vercel dashboard.
3. Choose **Vite** as the framework preset.
4. Add all environment variables from your `.env` file to the Vercel project settings.
5. Deploy!

> **Note:** The included `vercel.json` file handles Single Page Application (SPA) catch-all routing to prevent 404 errors on page reloads.
