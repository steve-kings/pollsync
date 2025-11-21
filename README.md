# PollSync - Election Management System

A modern, secure election management platform built with Next.js and Express.

## Features

- 🗳️ Create and manage elections
- 👥 User authentication (Email/Password + Google OAuth)
- 🛡️ Role-based access control (User & SuperAdmin)
- 📊 Real-time vote counting
- 📱 Fully responsive design
- 🔐 Secure voting with ID verification

## Tech Stack

**Frontend:**
- Next.js 16
- React 19
- Tailwind CSS 4
- DaisyUI 5
- Recharts

**Backend:**
- Node.js
- Express
- MongoDB
- JWT Authentication
- Cloudinary (image uploads)

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account

### Installation

1. Clone the repository
2. Install dependencies:
```bash
cd server && npm install
cd ../client && npm install
```

3. Configure environment variables:

**server/.env:**
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
PORT=5000
GOOGLE_CLIENT_ID=your_google_client_id
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**client/.env.local:**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

4. Start the application:
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

5. Access the application:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## User Roles

### User
- Create elections
- Manage own elections
- Add candidates
- Upload voters
- View results

### SuperAdmin
- View all elections
- Manage all users
- Delete any election
- Activate/deactivate accounts

## Default Accounts

**SuperAdmin:**
- Email: kingscreationagency635@gmail.com
- Password: Admin@2025

## Project Structure

```
vote-system/
├── client/              # Next.js frontend
│   ├── app/
│   │   ├── superadmin/  # SuperAdmin panel
│   │   ├── login/       # Authentication
│   │   ├── register/    # User registration
│   │   ├── features/    # Public pages
│   │   └── ...
│   └── components/      # Reusable components
│
└── server/              # Express backend
    ├── models/          # MongoDB models
    ├── routes/          # API routes
    ├── middleware/      # Auth middleware
    └── server.js        # Main server file
```

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
