# Friends Space 🌿

> A clean, private, mobile-first social space to track and share your daily **Move**, **Read**, and **Screen Time** with friends.

---

## 📱 Concept & Product Principles

Friends Space is designed around simplicity, genuine connection, and intentional living:

1. **Move**: Track today's steps, distance (km), and walking/active duration.
2. **Read**: Track current book title, author, cover, pages, and reading progress.
3. **Screen**: Track today's total screen time summary and view an automatic comparison delta with yesterday.

### Product Principles
* **Private by Default**: No algorithmic feed, no unsolicited ads, no public profile broadcasts.
* **Strict Granular Privacy**: Each user decides independently whether their Move, Read, or Screen time is visible to accepted friends.
* **Summary Only**: Never exposes private app-by-app screen time; only total daily screen time summary is stored and shared.
* **Mutual Friendship**: Progress is only shared between users after a friend request has been explicitly accepted.

---

## 🛠️ Architecture & Tech Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) + React 19 + TypeScript | Lightning-fast mobile performance with Server Components, Server Actions, and PWA capabilities |
| **Styling** | Tailwind CSS v4 + Lucide Icons | Mobile-first ergonomics, 44px+ touch targets, dark/light adaptation, zero bloat |
| **Database & Auth** | Supabase (PostgreSQL + RLS + Auth) | True relational integrity, Row-Level Security (RLS) guaranteeing zero privacy leakage at SQL level |
| **Hosting** | Vercel | Global CDN, automated edge caching, preview branches, and instant deployment |

---

## 📊 Database Schema & Row-Level Security

All tables are located in `supabase/schema.sql`:
* `profiles`: Extends Supabase `auth.users` with unique username, full name, avatar, and bio.
* `privacy_settings`: User-level toggles (`share_move`, `share_read`, `share_screen`).
* `daily_habits`: Date-keyed entries (`user_id`, `log_date`) storing daily Move, Read, and Screen metrics.
* `friendships`: Bi-directional friendship relation (`requester_id`, `addressee_id`, `status: 'pending' | 'accepted' | 'declined'`).
* **PostgreSQL RLS Policies**: Ensure users can only modify their own rows, and friends can only read habits that pass the friend's privacy settings.

---

## 🔍 Technical Reality & Limitations (Web Sensors & Screen Time)

Friends Space does not fake integrations or pretend web browsers have magical access to phone operating system internals:

### 1. Step Count & Walking Data
* **Browser Constraint**: Web browsers (iOS Safari, Android Chrome) strictly sandbox hardware sensor access. There is no standard Web API allowing a website to retroactively read background steps from Apple HealthKit or Android Health Connect.
* **V1 Solution**: Ultra-fast, low-friction quick-entry modal (< 5 seconds) with +500 / +1000 quick-stepper buttons.
* **Extensibility**: The database column `step_source` supports `'manual'`, `'apple_health'`, and `'health_connect'`. Future mobile wrappers (e.g. Capacitor.js with `@capacitor-community/health-kit`) can plug directly into the schema.

### 2. Screen Time Data
* **Browser Constraint**: Apple and Google strictly prohibit web browsers from inspecting system-wide app usage.
* **V1 Solution**: Clean daily logger where users input total hours & minutes from their phone's native Screen Time widget or Digital Wellbeing dashboard.
* **Automated Delta**: The app automatically compares today's logged screen time with yesterday's entry (e.g. `-35m vs yesterday`).

---

## 🚀 Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your desktop or mobile device.

### 3. Dual-Mode Operation:
* **Interactive Demo / Offline Mode**: Enabled by default (`NEXT_PUBLIC_USE_DEMO_STORE=true` in `.env.local`). Comes preloaded with sample friends (`@sarah_m`, `@david_k`, `@elena_v`), incoming friend requests, and an interactive persona switcher in the Profile tab to test friend request lifecycles and privacy filters immediately.
* **Live Supabase Mode**:
  1. Create a project at [supabase.com](https://supabase.com).
  2. Open SQL Editor in Supabase and paste the contents of `supabase/schema.sql`.
  3. Copy your Project URL and Anon Public Key from **Project Settings -> API**.
  4. In `.env.local`, set:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
     NEXT_PUBLIC_USE_DEMO_STORE=false
     ```

---

## 🌐 Deploying to Vercel

1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial Friends Space release"
   git remote add origin https://github.com/your-username/friends-space.git
   git push -u origin main
   ```
2. Import the project into [Vercel](https://vercel.com).
3. Add your environment variables:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `NEXT_PUBLIC_USE_DEMO_STORE=false`
4. Click **Deploy**.
