# PropSpace X — Enterprise Real Estate Platform

A modern, enterprise-grade real estate platform connecting buyers and agents with verified, transparent listings. Built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui**.

## Tech Stack

| Layer         | Technology                                         |
| ------------- | -------------------------------------------------- |
| Framework     | [Next.js 14](https://nextjs.org) (App Router)      |
| Language      | TypeScript 5                                       |
| Styling       | Tailwind CSS 3 + CSS variables (light / dark)      |
| UI Components | [shadcn/ui](https://ui.shadcn.com)                 |
| Animations    | [Framer Motion](https://www.framer.com/motion/)    |
| Charts        | [Recharts](https://recharts.org)                   |
| State / Data  | [TanStack React Query](https://tanstack.com/query) |
| Forms         | React Hook Form + Zod validation                   |
| Theming       | next-themes (system / light / dark)                |

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** ≥ 9

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/fredrickray/propspacex-web.git
cd propspacex-web

# 2. Create your local environment file
cp .env.example .env.local
# Then edit .env.local with your values

# 3. Install dependencies
npm install

# 4. Start the dev server
npm run dev
```

The app will be running at [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Command         | Description                       |
| --------------- | --------------------------------- |
| `npm run dev`   | Start development server          |
| `npm run build` | Create optimised production build |
| `npm run start` | Serve production build locally    |
| `npm run lint`  | Run ESLint                        |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (font, providers, metadata)
│   ├── page.tsx            # Landing page
│   ├── auth/               # Authentication routes
│   ├── admin/              # Admin dashboard routes
│   └── buyer/              # Buyer portal routes
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── shared/             # Shared composite components
│   ├── icons/              # SVG icon components
│   ├── Header.tsx          # Site header & navigation
│   ├── Footer.tsx          # Site footer
│   └── ...                 # Landing page sections
├── features/
│   ├── admin/              # Admin feature (layouts, pages, components)
│   ├── auth/               # Auth feature (layouts, pages, components)
│   └── buyer/              # Buyer feature (layouts, pages, components)
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities (cn, queryClient, etc.)
└── middleware.ts           # Auth route protection
```

## Key Features

- **Role-based dashboards** — Admin moderation panel & buyer portal
- **Route protection** — Middleware-based auth guarding `/admin` and `/buyer`
- **Responsive design** — Mobile-first with Tailwind breakpoints
- **Dark mode** — System-aware theme switching via next-themes
- **Optimised images** — `next/image` with remote pattern allowlisting
- **Security headers** — X-Frame-Options, CSP, Referrer-Policy via `next.config.js`
- **SEO metadata** — Per-page titles & descriptions with template inheritance
- **Loading & error states** — Skeleton loaders and error boundaries per route segment

## Environment Variables

See [`.env.example`](.env.example) for all available configuration options.

## License

Private — all rights reserved.
