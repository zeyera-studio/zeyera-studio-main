# 🚀 Deployment Guide - Zeyera Studio

## Quick Deployment Checklist

- [ ] Supabase project created
- [ ] Database tables created with RLS policies
- [ ] Supabase API keys obtained
- [ ] Gemini API key obtained (optional)
- [ ] Code pushed to GitHub
- [ ] Vercel project connected
- [ ] Environment variables configured in Vercel
- [ ] First admin user created

---

## 1. Supabase Setup (5 minutes)

### Create Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Name: `zeyera-studio`
3. Choose region closest to your users
4. Save database password securely

### Create Database Table
Go to SQL Editor and run:

```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add RLS policies (see full SQL in main README)
```

### Get API Keys
Settings → API → Copy:
- Project URL
- `anon` public key

---

## 2. Get Gemini API Key (2 minutes - Optional)

1. Visit [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key

---

## 3. Deploy to Vercel (3 minutes)

### Push to GitHub
```bash
cd zeyera-studio-main
git add .
git commit -m "Ready for deployment"
git push
```

### Connect Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Root Directory: `zeyera-studio-main` (if needed)
4. Framework: Vite
5. Build Command: `npm run build`
6. Output Directory: `dist`

### Add Environment Variables
In Vercel project settings → Environment Variables:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
GEMINI_API_KEY=AIza... (optional)
```

**Important:** Select all environments (Production, Preview, Development)

### Deploy
Click "Deploy" → Wait 1-2 minutes → Done! 🎉

---

## 4. Post-Deployment Configuration

### Update Supabase Auth URLs
Supabase Dashboard → Authentication → URL Configuration:

```
Site URL: https://your-app.vercel.app
Redirect URLs:
  - https://your-app.vercel.app
  - https://your-app.vercel.app/**
  - http://localhost:3000
```

### Create First Admin
1. Sign up on your deployed site
2. Supabase → Table Editor → profiles
3. Find your user → Change `role` to `admin`
4. Refresh your app → Access admin panel

---

## Troubleshooting

### Build fails with package error
✅ **Fixed:** Updated to `@google/generative-ai@^0.21.0`

### App shows blank page
- Check browser console for errors
- Verify environment variables are set correctly
- Ensure Supabase URL and keys are correct

### Authentication not working
- Check Supabase redirect URLs are configured
- Verify `VITE_SUPABASE_ANON_KEY` is set
- Check browser cookies are enabled

### AI recommendations not working
- Ensure `GEMINI_API_KEY` is set (optional feature)
- Check API quota at [aistudio.google.com](https://aistudio.google.com)
- View browser console for API errors

---

## Environment Variables Reference

| Variable | Where to Get It |
|----------|----------------|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → Project API keys → `anon` `public` |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |

---

## Redeployment

After making code changes:

```bash
git add .
git commit -m "Your changes"
git push
```

Vercel will automatically redeploy. Or manually redeploy from Vercel dashboard.

---

## Local Development

```bash
# Install dependencies
npm install

# Create .env.local
cp env.example.txt .env.local

# Add your actual keys to .env.local

# Run dev server
npm run dev
```

Visit http://localhost:5173

---

**Need help?** Check the main README.md for detailed documentation.

