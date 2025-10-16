# AI Rules and Tech Stack Guidelines

This document outlines the core technologies used in this project and provides clear guidelines on which libraries and tools to use for specific functionalities. Adhering to these rules ensures consistency, maintainability, and optimal performance across the application.

## Tech Stack Overview

*   **Frontend Framework:** React
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **UI Component Library:** shadcn/ui (built on Radix UI)
*   **Routing:** React Router (`react-router-dom`)
*   **Backend-as-a-Service:** Supabase (for database, authentication, and serverless functions)
*   **Icons:** Lucide React (`lucide-react`)
*   **Data Fetching & Caching:** React Query (`@tanstack/react-query`)
*   **Toast Notifications:** Sonner (`sonner`)

## Library Usage Rules

To maintain a consistent and efficient codebase, please follow these guidelines when developing:

1.  **React (Frontend Framework):** All UI development must be done using React.
2.  **TypeScript (Language):** All new code should be written in TypeScript, leveraging its type-safety features.
3.  **Vite (Build Tool):** Use Vite for development and building the application. Do not introduce other build tools.
4.  **Tailwind CSS (Styling):** All styling should be implemented using Tailwind CSS utility classes. Avoid custom CSS files or other styling solutions unless absolutely necessary and explicitly approved.
5.  **shadcn/ui (UI Components):** Prioritize using components from the `shadcn/ui` library. These components are pre-configured with Tailwind CSS and accessibility best practices.
    *   **Do NOT modify `shadcn/ui` component files directly.** If a `shadcn/ui` component needs customization beyond what its props allow, create a new component in `src/components/` that wraps or extends the `shadcn/ui` component, applying custom styling or logic.
    *   For new UI elements not covered by `shadcn/ui`, create new, small, and focused components in `src/components/` using Tailwind CSS.
6.  **React Router (`react-router-dom`) (Routing):** Manage all client-side routing using React Router. Keep the main route definitions in `src/App.tsx`.
7.  **Supabase (`@supabase/supabase-js`) (Backend):** Interact with the backend (database, authentication, storage, Edge Functions) exclusively through the Supabase client.
8.  **Lucide React (`lucide-react`) (Icons):** Use icons from the `lucide-react` library.
9.  **React Query (`@tanstack/react-query`) (Data Fetching):** For managing server state, data fetching, caching, and synchronization, use `@tanstack/react-query`. For local component state, use React's `useState` or `useReducer`.
10. **Sonner (`sonner`) (Toast Notifications):** Use `sonner` for all toast notifications to provide user feedback.
11. **`date-fns` (Date Handling):** Use `date-fns` for all date manipulation and formatting tasks.
12. **`react-hook-form` with `zod` (Form Handling):** For robust form management and validation, use `react-hook-form` in conjunction with `zod` for schema validation.
13. **File Structure:**
    *   Source code must reside in the `src` folder.
    *   Pages should be placed in `src/pages/`.
    *   Reusable components should be placed in `src/components/`.
    *   Hooks should be placed in `src/hooks/`.
    *   Utilities should be placed in `src/utils/`.
    *   Integrations (like Supabase client) should be in `src/integrations/`.
    *   Contexts should be in `src/contexts/`.
    *   Directory names must be all lower-case. File names may use mixed-case (e.g., `MyComponent.tsx`).
14. **Accessibility (A11y):** All components and features must be developed with WCAG 2.2 AA compliance in mind, including keyboard navigation, proper ARIA attributes, and sufficient color contrast.
15. **Responsiveness:** All designs must be responsive and adapt gracefully to various screen sizes (mobile, tablet, desktop).