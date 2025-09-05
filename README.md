# 📅 Calendar & Todo App

A beautiful, full-featured calendar and todo list application built with React, Next.js, Node.js, and MongoDB. Features include event management, todo lists, PWA support, and Magic Mirror integration.

## ✨ Features

### 📱 Progressive Web App (PWA)
- **Installable** - Works like a native app on mobile and desktop
- **Offline Support** - View events and todos without internet
- **Push Notifications** - Get reminders for your events
- **App Shortcuts** - Quick actions from home screen

### 🗓️ Calendar Management
- **Monthly View** - Beautiful calendar grid with event display
- **Mobile Responsive** - Vertical day list on mobile devices
- **Event Creation** - Simple event creation with colors and descriptions
- **Date Selection** - Click any date to add events or view details

### 📋 Todo Lists
- **List Management** - Create and manage multiple todo lists
- **Date-based Lists** - Lists are tied to specific dates
- **Item Management** - Add, edit, delete, and toggle todo items
- **Real-time Updates** - Changes sync immediately across the app

### 🌐 Internationalization
- **Multi-language Support** - English and Mongolian
- **Language Switcher** - Easy language switching in the UI
- **Localized Content** - All UI elements translated

### 🔗 Magic Mirror Integration
- **API Endpoints** - Specialized endpoints for Magic Mirror
- **Future Data** - Get upcoming events and todos
- **User Filtering** - Filter data by username
- **Real-time Sync** - Automatic data updates

### 🎨 Modern UI/UX
- **Tailwind CSS** - Beautiful, responsive design
- **Dark/Light Theme** - Automatic theme detection
- **Mobile First** - Optimized for all screen sizes
- **Smooth Animations** - Polished user experience

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Andii-12/Calendar-App.git
   cd Calendar-App
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up Environment Variables**
   
   Create `.env` file in the `backend` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/calendar-app
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   ```

5. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   ```

6. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

7. **Open the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📱 PWA Installation

### Desktop (Chrome/Edge)
1. Open the app in Chrome or Edge
2. Look for the install button in the address bar
3. Click "Install" to add to your desktop

### Mobile (iOS)
1. Open the app in Safari
2. Tap the share button
3. Select "Add to Home Screen"

### Mobile (Android)
1. Open the app in Chrome
2. Look for the install prompt
3. Tap "Install" to add to home screen

## 🔗 Magic Mirror Integration

### API Endpoints

#### Get Future Events and Lists
```http
GET http://localhost:5000/api/magic-mirror/future-data
```

#### Get All Users Data (for filtering)
```http
GET http://localhost:5000/api/magic-mirror/all-users-today?date=2025-09-08
```

### Magic Mirror Module Example
```javascript
Module.register("calendar-api", {
  username: "your_username", // Set your calendar username
  
  start: function() {
    this.userData = null;
    this.sendSocketNotification("GET_ALL_USERS_DATA");
  },
  
  socketNotificationReceived: function(notification, payload) {
    if (notification === "ALL_USERS_DATA") {
      this.userData = this.filterUserData(payload);
      this.updateDom();
    }
  },
  
  filterUserData: function(allUsersData) {
    return allUsersData.users.find(u => u.username === this.username);
  }
});
```

## 🛠️ Technology Stack

### Frontend
- **React** - UI library
- **Next.js** - React framework
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons
- **date-fns** - Date utilities

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### PWA Features
- **Service Worker** - Offline functionality
- **Web App Manifest** - App installation
- **Push Notifications** - Event reminders
- **Background Sync** - Data synchronization

## 📁 Project Structure

```
Calendar-App/
├── backend/
│   ├── server.js          # Express server
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── components/        # React components
│   ├── contexts/         # React contexts
│   ├── pages/           # Next.js pages
│   ├── public/          # Static assets
│   │   ├── manifest.json # PWA manifest
│   │   ├── sw.js        # Service worker
│   │   └── icons/       # App icons
│   ├── styles/          # CSS files
│   └── utils/           # Utility functions
├── .gitignore           # Git ignore rules
└── README.md           # Project documentation
```

## 🔧 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Events
- `GET /api/events` - Get user events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Lists
- `GET /api/lists` - Get user lists
- `POST /api/lists` - Create list
- `PUT /api/lists/:id` - Update list
- `DELETE /api/lists/:id` - Delete list
- `POST /api/lists/:id/items` - Add list item
- `PATCH /api/lists/:listId/items/:itemId/toggle` - Toggle item completion
- `DELETE /api/lists/:listId/items/:itemId` - Delete list item

### Magic Mirror
- `GET /api/magic-mirror/future-data` - Get future events and lists
- `GET /api/magic-mirror/all-users-today` - Get all users' today's data

## 🌍 Internationalization

The app supports multiple languages:
- **English** (en) - Default language
- **Mongolian** (mn) - Full translation

Language switching is available in the top navigation menu.

## 📱 Mobile Responsiveness

- **Desktop** - Full calendar grid view
- **Tablet** - Optimized layout
- **Mobile** - Vertical day list for better touch interaction

## 🔒 Security Features

- **JWT Authentication** - Secure user sessions
- **Password Hashing** - bcryptjs encryption
- **CORS Protection** - Cross-origin request security
- **Input Validation** - Server-side validation

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `out`
4. Deploy!

### Backend (Heroku/Railway)
1. Set environment variables
2. Deploy with Node.js buildpack
3. Connect to MongoDB Atlas

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Andii** - [GitHub](https://github.com/Andii-12)

## 🙏 Acknowledgments

- React and Next.js communities
- Tailwind CSS for beautiful styling
- MongoDB for database support
- Magic Mirror community for inspiration

---

**Made with ❤️ for productivity and organization**