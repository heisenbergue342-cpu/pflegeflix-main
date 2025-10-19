# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/4502088b-1ccb-4c0a-9b1b-50557b40bf76

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4502088b-1ccb-4c0a-9b1b-50557b40bf76) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Performance Optimizations

This project implements comprehensive performance optimizations:

### Core Web Vitals Targets
- **LCP** (Largest Contentful Paint): < 2.5s
- **INP** (Interaction to Next Paint): < 200ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Features Implemented
- ✅ Route-based code splitting with React.lazy()
- ✅ Optimized image loading (lazy load, blur placeholders)
- ✅ Font preloading (Inter font family)
- ✅ Vendor chunk splitting for better caching
- ✅ Core Web Vitals monitoring with web-vitals library
- ✅ Performance utilities (debounce, throttle, idle callbacks)
- ✅ Layout shift prevention with aspect ratios
- ✅ Modern ES2020 bundle target
- ✅ Tree shaking and minification

### Key Components
- **OptimizedImage**: Lazy loading images with IntersectionObserver
- **WebVitals**: Real-time performance monitoring
- **Performance Utils**: Connection-aware loading, low-end device detection

See [PERFORMANCE.md](./PERFORMANCE.md) for detailed optimization guide.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/4502088b-1ccb-4c0a-9b1b-50557b40bf76) and click on Share -> Publish.

## Free Mode (temporary beta)

To run the platform 100% free (no subscription limits), set the following env variables and restart the dev server:

- VITE_FREE_MODE=true
- VITE_FREE_MODE_MAX_ACTIVE_JOBS=-1   # optional; -1 means unlimited

When Free Mode is enabled:
- Employers can post, edit, pause, duplicate, and view applicants without paywalls.
- "Upgrade" prompts and slot gating are bypassed.
- Turning VITE_FREE_MODE=false restores previous plan behavior.

## Launch Free Mode (soft launch)

To disable all subscription/paywall gates during the launch period, set:

- VITE_LAUNCH_FREE_MODE=true
- (optional) VITE_FREE_MODE_MAX_ACTIVE_JOBS=-1  # -1 = unlimited, display only

When Launch Free Mode is enabled:
- Employers can edit, pause/unpause, duplicate, and publish without any paywall.
- "Upgrade" modals/CTAs are hidden.
- Plan checks are only applied when VITE_LAUNCH_FREE_MODE=false (and will behave as before).

Turn it off by setting VITE_LAUNCH_FREE_MODE=false and restarting.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)