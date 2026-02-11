# ReRack - Premium Gym Tracker

A modern, beautiful gym tracking application with smooth animations, dark mode, comprehensive analytics, and cloud sync.

## 🎯 Features

- **Workout Logging**: Create and track workouts with exercises, sets, reps, and weights
- **Exercise Database**: 50+ pre-loaded exercises mapped to muscle groups
- **Muscle Analysis**: Visual body heat map showing which muscles are trained
- **Smart Recommendations**: AI-powered suggestions for undertrained muscle groups
- **Analytics Dashboard**: Comprehensive charts and statistics
- **Progress Tracking**: Monitor strength gains and volume over time
- **Exercise Library**: Browse all exercises by category and muscle group
- **Cloud Sync**: Optional Supabase integration for multi-device sync
- **Offline Support**: Works offline and syncs when back online
- **Authentication**: Secure email/password and Google OAuth login

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

Opens the app at [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
```

Builds the app for production to the `build` folder.

## ☁️ Supabase Setup (Optional)

ReRack can work in two modes:
1. **Local-only mode** (default) - All data stored in browser IndexedDB
2. **Cloud mode** - Data synced to Supabase with offline support

### Setting Up Supabase

1. **Create a Supabase Project**
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the database to be set up

2. **Get Your Credentials**
   - Go to Project Settings > API
   - Copy your `Project URL` and `anon/public` API key

3. **Configure Environment Variables**
   ```bash
   # Create a .env file in the root directory
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   ```
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Run Database Migrations**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run the migration

5. **Enable Google OAuth (Optional)**
   - Go to Authentication > Providers
   - Enable Google provider
   - Add your Google OAuth credentials
   - Add authorized redirect URLs

6. **Start the App**
   ```bash
   npm start
   ```

### Local-Only Mode

If you don't set up Supabase, the app works perfectly in local-only mode:
- All data stored in browser IndexedDB
- No authentication required
- Complete privacy (data never leaves your device)
- All features work except multi-device sync

## 🔄 Data Migration

When you sign up with an existing local account:
1. The app detects your local workout data
2. A migration modal appears offering to import your data
3. Click "Import" to sync your local data to the cloud
4. Your data is now accessible from any device

## 📡 Offline Support

The app works offline with intelligent syncing:
- Changes made offline are queued locally
- When back online, changes automatically sync to Supabase
- An "Offline" indicator appears when disconnected
- A "Syncing..." indicator shows during sync operations

## 🎨 Design Features

- **Modern UI**: Glassmorphism effects, smooth gradients, and elegant shadows
- **Dark Mode**: Beautiful dark theme optimized for gym environments
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Responsive**: Works perfectly on mobile and desktop
- **Premium Feel**: Electric blue, neon purple, and energetic green accents

## 📱 Pages

1. **Dashboard** - Overview with stats, muscle balance radar chart, and recommendations
2. **Log Workout** - Create and track workouts in real-time
3. **History** - Browse past workouts organized by month
4. **Muscle Analysis** - Interactive body heat map showing muscle group balance
5. **Analytics** - Charts showing volume trends, workout frequency, and progress
6. **Exercise Library** - Browse 50+ exercises with detailed information

## 🔧 Tech Stack

- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Supabase** for authentication and cloud database (optional)
- **LocalForage** for offline-first storage

## 🗄️ Database Schema

When using Supabase, the following tables are created:

- **profiles** - User profile information
- **workouts** - Workout sessions with exercises and sets
- **user_profiles** - Gamification data (XP, level, achievements, streaks)
- **personal_records** - Exercise-specific PRs

All tables have Row Level Security (RLS) enabled for data privacy.

## 🔐 Security

- Row Level Security (RLS) policies ensure users can only access their own data
- Supabase auth handles secure authentication
- API keys use the `anon` key which is safe for client-side use
- All sensitive operations are protected server-side by Supabase

## 📊 Data Storage Strategy

### Hybrid Approach
ReRack uses a hybrid storage strategy for optimal performance and reliability:

1. **Primary: Supabase** (when configured and online)
   - Cloud database for multi-device sync
   - Real-time updates
   - Secure authentication

2. **Fallback: LocalForage** (IndexedDB)
   - Offline-first architecture
   - Local cache for fast access
   - Automatic sync when back online

3. **Sync Queue**
   - Changes made offline are queued
   - Automatically synced when connectivity restored
   - Conflict-free operation

## 💪 Exercise Categories

- **Push**: Chest, shoulders, triceps exercises
- **Pull**: Back, biceps, forearm exercises
- **Legs**: Quads, hamstrings, glutes, calves
- **Core**: Abs and core stability exercises

## 📊 Muscle Groups Tracked

Upper Body: Chest, Back, Shoulders, Biceps, Triceps, Forearms, Traps, Lats
Lower Body: Quads, Hamstrings, Glutes, Calves
Core: Abs

## 🎯 Smart Features

- **Weakest Muscle Detection**: Analyzes volume, frequency, and recency to identify undertrained muscles
- **Strength Rankings**: Ranks all muscle groups from strongest to weakest
- **Workout Streaks**: Tracks consecutive workout days
- **Volume Tracking**: Monitors total weight lifted over time
- **Progress Charts**: Visualizes trends and improvements

## 📝 Data Storage

**Local-Only Mode**: All workout data is stored locally in your browser using IndexedDB via LocalForage. Your data persists across sessions and is completely private.

**Cloud Mode**: When Supabase is configured, data is synced to the cloud while maintaining a local cache for offline access. The app intelligently chooses between Supabase and local storage based on connectivity.

## 🚀 Future Enhancements

- Social features and workout sharing
- Progressive overload recommendations
- Rest timer between sets
- Workout templates
- Export/import data (CSV, JSON)
- Mobile apps (iOS/Android)
- Wearable integration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

---

Built with ❤️ for gym enthusiasts
