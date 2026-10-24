# SARAKO

Mobile-friendly city-services portal built with Next.js for Vercel. The SARAKO wordmark displays a heart in place of its second “A”. Features include public service links, MongoDB-backed announcements and reports, emergency contact links, image attachments, and a one-admin dashboard. New reports stay private until the admin approves them; only approved reports and their photos appear on the public report board.

## Deploy on Vercel

1. Import this project into Vercel.
2. Add the MongoDB Atlas integration from the Vercel Marketplace and connect it to the project. It provides `MONGODB_URI`.
3. Add `MONGODB_DB=sarako`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` (at least 14 characters), and a unique `AUTH_SECRET` (at least 32 characters). Set the public city name, tagline, and emergency contact values from `.env.example` as needed.
4. Deploy. The first database request creates indexes and inserts starter announcements. No SQL migration is needed.
5. Open `/admin` and sign in with the admin credentials from Vercel.

There is no registration page or registration API. Admin credentials are server-side environment variables. Sessions use a signed, HTTP-only, same-site cookie that expires after eight hours. Admin APIs verify the session server-side.

## Local development

Copy `.env.example` to `.env.local`, provide a MongoDB Atlas URI and admin credentials, then run `npm install` and `npm run dev`.

## Before public launch

- Replace sample service shortcuts and starter announcements with verified city information.
- Confirm hotline numbers with the city.
- Publish the city's privacy notice and report retention policy.
- Connect reports to the responsible city staff workflow and set a response process.

Report photos are restricted to JPEG, PNG, or WebP and 4 MB each. Photo data is stored with its report in MongoDB; unauthenticated users can fetch it only after the report is approved.
