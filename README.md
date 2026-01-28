# ShiftSync - Premium Event Staffing Platform

A production-ready, two-sided marketplace for the luxury event staffing industry.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS with custom luxury design tokens
- **Backend/DB:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Magic Links + Social Login)
- **AI:** OpenAI for Smart-Parse feature
- **Payments:** Stripe Connect (Simulated for MVP)

## Getting Started

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create a \`.env.local\` file:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key (optional)
\`\`\`

### 3. Run Database Migrations

In your Supabase SQL Editor, run:
1. \`supabase/schema.sql\` - Creates all tables, RLS policies, and functions
2. \`supabase/seed.sql\` - Populates demo data (20 workers, 5 businesses, 10 shifts)

### 4. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
shift-sync/
├── src/
│   ├── app/
│   │   ├── business/          # Business user dashboard
│   │   ├── talent/            # Talent user dashboard
│   │   ├── (auth)/            # Authentication pages
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/                # Base UI components
│   │   └── navigation/        # Shell components
│   ├── lib/
│   │   ├── supabase/          # Supabase clients
│   │   └── utils.ts           # Utility functions
│   └── types/                 # TypeScript definitions
├── supabase/
│   ├── schema.sql             # Database schema
│   └── seed.sql               # Demo data
└── tailwind.config.ts
\`\`\`

## Features

### Business Users
- Post shifts with AI-powered "Smart Parse"
- Auto-fill matching to invite qualified workers
- Real-time dashboard with live status updates
- Team management for favorite workers

### Talent Users  
- Browse and accept available gigs
- Manage availability calendar
- Clock in/out with time tracking
- Earnings dashboard with payout requests

## Demo Accounts

After running the seed script, you can use these test accounts:
- **Business:** contact@sterling-events.com
- **Talent:** marcus.beaumont@email.com

## License

MIT
