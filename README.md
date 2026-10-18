# Bookmora

Next.js appointment booking SaaS with Clerk owner authentication and PostgreSQL business onboarding.

## Setup

1. Run `npm install`.
2. Copy `.env.example` to `.env`. Configure `DATABASE_URL` and the publishable/secret keys from your Clerk application. Never commit the secret key.
3. In Clerk, enable your preferred sign-up methods. The example environment configures `/sign-in`, `/sign-up`, and redirects to `/owner` after authentication.
4. Start PostgreSQL (the repository includes `compose.yaml` for local development).
5. Run `npm run db:generate` and `npm run db:migrate`. The migration creates the Business table and unique owner/slug indexes; it does not reset the database.
6. Run `npm run dev`, open `/sign-up`, create an account, and register your business at `/owner`.

## Owner API

All endpoints require a Clerk session and return JSON. Requests without authentication receive 401.

- `POST /api/owner/business`: create a business with `{ "name": "My Studio", "slug": "my-studio", "timezone": "Africa/Cairo" }`; returns 201.
- `GET /api/owner/business`: read the caller's business; returns 200 or 404.
- `PATCH /api/owner/business`: update one or more of `name`, `slug`, and `timezone`; returns 200 or 404.

Ownership always comes from the verified session. Client-supplied IDs, owner IDs, and unknown fields are rejected with 400. No endpoint accepts another business's ID. Names are limited to 120 characters. Slugs use lowercase ASCII letters, numbers, and single hyphens, up to 63 characters. Timezones must be valid IANA names (for example `Africa/Cairo` or `UTC`); numeric offsets are rejected. Validation errors return 400; duplicate slugs or a second business for the same owner return 409.

## Verification

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

API tests mock Clerk sessions and Prisma calls, and cover authentication, owner isolation, uniqueness conflicts, validation, and onboarding. A real Clerk sign-up/sign-in and database migration smoke test require configured credentials and a running PostgreSQL instance. Appointment booking and payments are outside this story.

## Services

After registering a business, visit `/owner/services` to create, edit, deactivate, or reactivate its services. The public page at `/book/[slug]` shows active services only and does not expose owner account details.

- `GET /api/owner/services`: list the signed-in owner's services, including inactive ones.
- `POST /api/owner/services`: create with `{ "name": "Consultation", "durationMinutes": 30 }`; active by default; returns 201.
- `PATCH /api/owner/services/[id]`: update `name`, `durationMinutes`, or `isActive`; returns 200.

Names must contain 1–120 characters after trimming. Duration must be a positive integer of minutes within PostgreSQL's integer range. Unknown fields and client-supplied ownership are rejected (400). Anonymous requests receive 401; missing or other owners' services receive 404. Owners must register their business before creating services.

Apply the additive Service migration with `npm run db:migrate`, then regenerate the client with `npm run db:generate`. The database enforces the business foreign key and positive duration. Deactivation only sets `isActive: false`; the row and ID remain intact. There is no delete endpoint. Public reads are not persistently cached, so deactivation appears on the next page request.

Historical-booking preservation remains a pending test until a Booking model exists. No booking model or booking API is introduced in this story. API tests mock Clerk and Prisma; UI tests cover creation, editing, deactivation, and server errors.

## Public business page

Customers can visit `/book/[slug]` without signing in to see the business name, timezone, active services, and durations. Old `/b/[slug]` links permanently redirect to the new route. Missing or malformed slugs use the booking not-found view; a business without active services has an explicit empty state. Slot selection is deferred to Sprint 2.

`GET /api/public/[slug]` is anonymous and returns only `name`, `timezone`, and `services` containing `id`, `name`, and `durationMinutes`. The shared query filters inactive services in PostgreSQL. The API returns 404 for missing/invalid slugs and a generic 500 on database failure. Public reads bypass persistent caching so service changes appear on the next request.

The UI uses shared neutral/teal styles, responsive owner navigation, labeled forms, keyboard focus indicators, loading feedback, and public-page previews. API and component tests run with `npm test`; historical-booking coverage remains pending until a Booking model exists.
