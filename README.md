# 🎬 Zeyera Studio

> A modern, AI-powered movie and TV series streaming platform with intelligent recommendations and admin management capabilities.

![Tech Stack](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![Vite](https://img.shields.io/badge/Vite-5.1-purple)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3.4-cyan)

---

## 📋 Overview

Zeyera Studio is a full-stack streaming platform that combines modern web technologies with AI-powered content recommendations. Built with React and TypeScript, it provides a Netflix-like experience with administrative controls for content and user management.

---

## ✨ Key Features

### 🎥 **Content Discovery**
- Browse curated movies and TV series collections
- Separate dedicated pages for Movies and TV Shows
- Beautiful grid layouts with hover effects and smooth animations
- Responsive design that works on all devices

### 🤖 **AI-Powered Recommendations**
- Integrated **Google Gemini AI** for intelligent content suggestions
- Search with natural language (e.g., "action movies with strong female leads")
- Real-time AI analysis to match user preferences
- Dynamic content recommendations based on user queries

### 🔐 **User Authentication & Authorization**
- Secure email-based authentication via Supabase Auth
- Role-based access control (User vs Admin)
- Protected routes and authenticated sessions
- Automatic profile creation on signup

### 👨‍💼 **Admin Dashboard**
- Comprehensive admin panel for platform management
- **User Management:**
  - View all registered users
  - Promote/demote users to admin roles
  - Create reserved admin accounts
  - Real-time user data updates
- **System Overview:**
  - Dashboard with key metrics and statistics
  - Monitor platform activity
  - Content library status
- **Access Control:**
  - Admin-only route protection
  - Row-level security policies via Supabase

### 🎨 **Modern UI/UX**
- Dark theme with neon green accents (Cyberpunk aesthetic)
- Smooth animations and transitions
- Custom scrollbar styling
- Mobile-responsive navigation
- Interactive hover states

---

## 🛠️ Tech Stack

### **Frontend**
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2 | UI library for building component-based interfaces |
| **TypeScript** | 5.2 | Type-safe JavaScript for better developer experience |
| **Vite** | 5.1 | Lightning-fast build tool and dev server |
| **Tailwind CSS** | 3.4 | Utility-first CSS framework for rapid styling |
| **Lucide React** | 0.344 | Modern icon library with 1000+ icons |

### **Backend & Services**
| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend-as-a-Service (BaaS) for auth, database, and APIs |
| **PostgreSQL** | Relational database (powered by Supabase) |
| **Google Gemini AI** | AI model for content recommendations |

### **DevOps & Deployment**
| Tool | Purpose |
|------|---------|
| **Vercel** | Serverless deployment platform with automatic CI/CD |
| **Git/GitHub** | Version control and collaboration |

---

## 🔥 Why Supabase?

We chose **Supabase** as our backend solution for several strategic reasons:

### 1. **🚀 Rapid Development**
- Pre-built authentication system saves weeks of development
- Instant REST and GraphQL APIs generated from database schema
- Real-time subscriptions out of the box
- No need to build and maintain separate backend servers

### 2. **🔒 Built-in Security**
- **Row Level Security (RLS):** Database-level security policies ensure users only access their own data
- **JWT-based authentication:** Industry-standard secure token system
- **Automatic API key rotation:** Enhanced security practices
- **SQL injection protection:** Built into PostgreSQL

### 3. **💰 Cost-Effective**
- Free tier includes:
  - 500MB database space
  - 2GB file storage
  - 50,000 monthly active users
  - Unlimited API requests
- Pay-as-you-grow pricing model
- No server maintenance costs

### 4. **🗄️ PostgreSQL Power**
- Full PostgreSQL database (not a limited version)
- Complex queries and joins supported
- ACID compliance for data integrity
- Advanced features like triggers, functions, and views

### 5. **⚡ Real-time Capabilities**
- WebSocket connections for live updates
- Perfect for collaborative features and live notifications
- Pub/sub system for real-time data synchronization

### 6. **🔧 Developer Experience**
- Intuitive dashboard for database management
- Auto-generated TypeScript types
- Comprehensive documentation
- Active community and support
- Easy local development setup

### 7. **📈 Scalability**
- Handles millions of requests
- Automatic connection pooling
- Edge functions for serverless compute
- CDN integration for global performance

---

## 📁 Project Structure

```
zeyera-studio-main/
├── components/              # React UI components
│   ├── Navbar.tsx          # Main navigation bar
│   ├── Hero.tsx            # Landing page hero section
│   ├── MoviesPage.tsx      # Movies browsing page
│   ├── TVSeriesPage.tsx    # TV series browsing page
│   ├── AdminDashboard.tsx  # Admin control panel
│   ├── AuthModal.tsx       # Login/signup modal
│   ├── ContactSection.tsx  # Contact form section
│   ├── Footer.tsx          # Site footer
│   └── SplitShowcase.tsx   # Content showcase component
│
├── contexts/               # React Context providers
│   └── AuthContext.tsx     # Authentication state management
│
├── lib/                    # External libraries setup
│   └── supabaseClient.ts   # Supabase client configuration
│
├── services/               # External API services
│   └── geminiService.ts    # Google Gemini AI integration
│
├── src/
│   └── index.css          # Global styles + Tailwind imports
│
├── App.tsx                 # Main application component
├── index.tsx               # Application entry point
├── types.ts                # TypeScript type definitions
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── vercel.json             # Vercel deployment config
└── package.json            # Dependencies and scripts
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous/public API key |
| `GEMINI_API_KEY` | ❌ Optional | Google Gemini AI API key for recommendations |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Supabase account
- Google AI account (optional, for AI features)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd zeyera-studio-main

# Install dependencies
npm install

# Create environment file
cp env.example.txt .env.local

# Add your credentials to .env.local
# Then start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview  # Preview production build locally
```

---

## 🗃️ Database Schema

### **profiles** table
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | User ID (references auth.users) |
| `email` | TEXT | User email address |
| `username` | TEXT | Display name |
| `role` | TEXT | User role: 'user' or 'admin' |
| `created_at` | TIMESTAMP | Account creation date |

**Security Policies:**
- Users can view/update their own profile
- Admins can view/update all profiles
- Auto-profile creation on user signup (via trigger)

---

## 🎯 Key Functionalities Explained

### 1. **Authentication Flow**
```
User Signs Up → Supabase Auth creates user → Trigger creates profile → User logged in
```

### 2. **AI Recommendations**
```
User searches → Query sent to Gemini AI → AI analyzes request → 
Returns 6 relevant movies/series → Displayed in grid
```

### 3. **Admin Management**
```
Admin logs in → Access admin dashboard → 
View users list → Promote/demote roles → Changes saved to database
```

### 4. **Role-Based Access**
```
User attempts admin access → AuthContext checks role → 
If not admin → Show "Access Denied" → Else → Show dashboard
```

---

## 🎨 Design Philosophy

- **Minimalist Dark Theme:** Reduces eye strain for movie browsing
- **Neon Accents:** Creates a modern, cyberpunk aesthetic
- **Card-Based Layout:** Familiar Netflix/streaming platform UX
- **Smooth Transitions:** Professional feel with subtle animations
- **Mobile-First:** Responsive design that scales beautifully

---

## 🔐 Security Features

✅ Row-level security (RLS) on all database tables  
✅ JWT-based authentication tokens  
✅ Environment variables for sensitive keys  
✅ HTTPS-only in production  
✅ XSS protection via React  
✅ CSRF protection via Supabase  
✅ Rate limiting on API endpoints  

---

## 📊 Performance Optimizations

- **Vite** for fast builds and Hot Module Replacement (HMR)
- **Code splitting** with React lazy loading
- **Optimized images** with placeholder URLs
- **Edge caching** via Vercel CDN
- **Lazy loading** for off-screen content
- **Memoization** for expensive computations

---

## 🚧 Future Enhancements

- [ ] Video player integration
- [ ] Content upload system for admins
- [ ] User watchlists and favorites
- [ ] Comments and ratings system
- [ ] Social sharing features
- [ ] Advanced search filters
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Email notifications

---

## 📝 License

This project is private and proprietary.

---

## 👥 Support

For issues or questions:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review [Vite Documentation](https://vitejs.dev/)
- Consult [React Documentation](https://react.dev/)

---

**Built with ❤️ using modern web technologies**
