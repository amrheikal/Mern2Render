# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

MERN e-commerce app (Udemy MERN Stack course project) with two independent, separately-run packages:

- `backend/` — Express + TypeScript + Mongoose API, run via `ts-node`/`nodemon` (no build step in dev).
- `frontend2/` — React 19 + TypeScript + Vite + MUI SPA.

There is no root package.json or workspace config — each package is installed and run independently, and this is not a git repository (no `.git` directory).

## Commands

### Backend (`backend/`)
- `npm run dev` — starts the API with nodemon + ts-node (watches `src`, entry point `src/index.ts`). There is no build/start/test/lint script defined.
- Server listens on port `3001` (hardcoded in `src/index.ts`).
- Requires `backend/.env` (see `.env.example`): `JWT_SECRET`, `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`. Note: `DATABASE_URL` is defined in `.env.example` but **not actually used** — the Mongo connection string is hardcoded in `src/index.ts` as `mongodb://127.0.0.1:27017/ecomm`. A local MongoDB instance must be running on the default port.
- On every server start, `seedInitialProducts()` and `seedAdminUser()` run automatically (idempotent — they check for existing data first). `seedAdminUser` promotes/creates the admin user from `ADMIN_EMAIL`/`ADMIN_PASSWORD`.

### Frontend (`frontend2/`)
- `npm run dev` — Vite dev server.
- `npm run build` — `tsc -b && vite build` (type-checks via project references, then builds).
- `npm run lint` — ESLint (flat config in `eslint.config.js`).
- `npm run preview` — preview the production build.
- No test runner/framework is configured in either package.
- `src/constants/baseUrl.ts` hardcodes `BASE_URL = "http://localhost:3001"` — the frontend always targets the local backend directly (no proxy, no env var).

## Backend architecture

Layered per-domain structure: `routes/` (HTTP wiring, request/response only) → `services/` (business logic, return `{ data, statusCode }` tuples consumed directly by routes) → `models/` (Mongoose schemas). Route handlers never touch Mongoose directly; they call a service function and forward its `statusCode`/`data`.

Domains: `user` (auth, orders), `product` (catalog + admin CRUD), `cart` (active cart + checkout), `admin` (dashboard stats). Route files mount at `/user`, `/product`, `/cart`, `/admin` in `src/index.ts`.

Auth/authorization middleware chain, applied in order on protected routes:
1. `validateJWT` — reads `Authorization: Bearer <token>`, verifies with `JWT_SECRET`, loads the full user document from Mongo by the email in the token payload, and attaches it as `req.user` (typed via `ExtendRequest` in `src/types/extendedRequest.ts`). Note it does not itself reject a missing/deleted user — `req.user` can be `undefined` after this middleware.
2. `validateAdmin` — must run after `validateJWT`; checks `req.user.isAdmin`.

JWTs are unsigned with an expiry (`jwt.sign(data, secret)`, no `expiresIn`) and encode `{ email, firstName, lastName, isAdmin }`. The frontend decodes the payload client-side (base64) purely to toggle admin UI — the API re-validates `isAdmin` from the DB on every admin request, so the JWT claim is only a UI hint, not a trust boundary.

Product image uploads go through `multer` (`middlewares/uploadImage.ts`), disk storage into `backend/uploads/` (kept outside `src/` so nodemon doesn't restart on upload), served statically at `/uploads`. `productService.buildImagePath`/`removeUploadedImage` centralize the `/uploads/<file>` path convention and cleanup-on-failure/replace logic — follow this pattern when touching product image handling rather than manipulating paths inline in routes.

Cart model stores a denormalized `unitPrice` per line item (snapshot at add-time) separate from the live `Product.price`; checkout (`cartService.checkout`) turns the active cart into an `Order` using those snapshotted values, then presumably marks/clears the cart — check `cartService.ts` before changing checkout/pricing behavior.

## Frontend architecture

Two React Contexts provide global state, each with a `Context`/`Provider` split (e.g. `context/Auth/AuthContext.ts` + `AuthProvider.tsx`), both wrapping the app in `App.tsx` (`AuthProvider` outside `CartProvider`, since cart fetches depend on the auth token):
- **Auth** (`context/Auth/`) — holds `token`/`username` in `localStorage`, derives `isAuthenticated`/`isAdmin` (the latter decoded client-side from the JWT), exposes `login`/`logout`/`getMyOrders`.
- **Cart** (`context/Cart/`) — fetches/mutates the active cart against `/cart*` endpoints whenever `token` changes; every mutation (`addItemToCart`, `updateItemInCart`, `removeItemInCart`, `clearCart`) re-fetches and re-sets the full cart from the response rather than patching local state optimistically.

Routing (`App.tsx`, React Router v7) gates routes with layout-less guard components rendering `<Outlet />`: `ProtectedRoute` (requires `isAuthenticated`, redirects to `/login`) and `AdminRoute` (requires `isAuthenticated` + `isAdmin`, redirects to `/`). Add new authed/admin pages as nested `<Route>`s under the matching guard rather than checking auth state inside the page component.

All API calls are plain `fetch` calls built inline against `BASE_URL` (no shared API client/axios wrapper) — follow the existing inline-fetch-with-manual-headers style used in the contexts and pages rather than introducing a new HTTP abstraction.
