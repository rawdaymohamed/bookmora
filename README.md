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
