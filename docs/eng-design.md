# Engineering Design Document: preem-machine

## 1. Overview

### 1.1. Introduction & Goals

This document outlines the technical design and architecture for **preem-machine**, a web application built within an **Nx monorepo**. The platform consists of a Next.js frontend application (with a BFF API layer) deployed on Google Cloud Run, and a core backend of **Google Cloud Functions**. The platform is designed to modernize and streamline the process of cash prize contributions for community bike races.

### 1.2. Business Requirements

- Provide a centralized hub for race organizers to manage organizations, race series, events, individual races, and prize pools ("preems").
- Allow the cycling community (users) to contribute to preem prize pools in real-time.
- Offer a transparent view of contributions and prize statuses for both organizers and the public.
- Provide a secure authentication system for different user roles (Contributor, Organizer, Admin), with organizer permissions tied to organization membership.
- Enable monetization through user subscriptions or service fees.

### 1.3. Technical Requirements

- **Monorepo:** Nx Workspace
- **Frontend Framework:** Next.js with TypeScript (App Router)
- **UI Library:** **Mantine** with **@mantine/form**
- **Data Access Layer:** **TanStack Query (React Query)**
- **Backend Logic:** **Google Cloud Functions (TypeScript)** & **Next.js API Routes**
- **Deployment:** Dockerized container on Google Cloud Run (for Next.js)
- **Database:** Cloud Firestore
- **Authentication:** Firebase Authentication
- **Payments:** Stripe API, **Stripe Connect**
- **CI/CD:** **GitHub Actions with Nx Cloud**

### 1.4. Non-Goals

- This version will not include a native mobile application.

---

## 2. System Architecture

### 2.1. High-Level Diagram

[A diagram illustrating the main components: User -> Cloud Run (Next.js + API Routes) -> Cloud Functions -> Stripe/Firestore]

- **User/Client:** A web browser running the Next.js frontend application.
- **Google Cloud Run:** Hosts the containerized Next.js application, which includes the UI and a "Backend-for-Frontend" (BFF) API layer via Next.js API Routes.
- **Google Cloud Functions:** A set of serverless functions that handle core, secure, and asynchronous backend logic.
- **Firebase Authentication:** Handles all user identity and session management.
- **Cloud Firestore:** A NoSQL document database for storing all application data.
- **Stripe:** An external service for processing payments and managing subscriptions. **Stripe Connect** will be used to onboard and pay out funds to race organizers.

### 2.2. Technology Choices Rationale

- **Nx Monorepo:** Facilitates code sharing and provides powerful tooling for optimizing CI/CD pipelines.
- **Next.js (App Router & API Routes):** Chosen for its excellent performance for building the frontend. API Routes provide a convenient, low-latency BFF for the client to interact with.
- **Mantine & @mantine/form:** A comprehensive React component library with a rich set of hooks and components that will accelerate UI development. The `@mantine/form` package will be used for managing form state and validation, integrating seamlessly with the Mantine component set and our Zod validation schemas.
- **TanStack Query:** A powerful asynchronous state management library. It will be used to handle all client-side data fetching, caching, and revalidation logic, providing a robust and declarative way to interact with our Firestore data access functions.
- **next-firebase-auth-edge:** A modern library for integrating Firebase Authentication with the Next.js App Router and Edge runtime. It provides a secure, cookie-based approach to managing user sessions on the server side, which is essential for protecting API routes and rendering server components based on auth state.
- **GitHub Actions & Nx Cloud:** GitHub Actions provides a robust, native CI/CD solution for projects hosted on GitHub. Integrating it with Nx Cloud enables distributed computation caching and task execution, which dramatically speeds up pipeline times by ensuring that only code affected by a change is tested and built.
- **Google Cloud Run:** A serverless platform that provides auto-scaling and simplifies deployment for the Next.js app.
- **Google Cloud Functions:** Chosen to handle core backend logic, decoupling it from the frontend and enhancing security.
- **Firebase Authentication & Firestore:** A tightly integrated and scalable solution for user management and real-time data.
- **Stripe & Stripe Connect:** A comprehensive platform for handling online payments. Stripe Connect is essential for a marketplace model, as it handles the complexity of onboarding organizers and routing payouts while maintaining compliance.

---

## 3. Data Model & Database Design

Fields that reference other documents will be stored as Firestore `DocumentReference` types for type safety and ease of querying.

### 3.1. Firestore Collections

See Appendix A for the detailed Firestore schema.

### 3.2. Data Access Layer

All Firestore-related data access logic will be encapsulated within the `datastore` library. This library will provide functions that query Firestore. These functions will then be consumed by **TanStack Query** hooks within the frontend application to manage the client-side state, caching, and revalidation of the data. This approach keeps components clean and centralizes data-fetching logic.

#### 3.2.1. TanStack Query and Firebase Integration

The integration between TanStack Query and Firebase will follow a clear pattern:

1.  **Datastore Functions**: The `libs/datastore` library will export functions that perform specific Firestore operations (e.g., `getRacesByEvent`, `addRace`). These functions are the only part of the application that directly interact with the Firebase SDK.
2.  **Custom Hooks**: For each data entity, we will create custom hooks (e.g., `useRaces`, `useContributions`) that wrap the datastore functions with TanStack Query's `useQuery` or `useMutation`. This decouples the UI from the data fetching implementation.
3.  **Component Usage**: UI components will use these custom hooks to access data, loading states, and error states, allowing TanStack Query to handle all the underlying state management.
4.  **Real-Time Updates**: For features requiring real-time data (like live contribution feeds), we will create custom hooks that use Firestore's `onSnapshot` listener. This hook will be responsible for subscribing to updates and pushing the new data into the TanStack Query cache using the `queryClient.setQueryData` method. This gives us the real-time capabilities of Firestore with the powerful caching and state management of TanStack Query.

---

## 4. Architecture

### 4.1. Project Structure

TODO

#### 4.1.1 Frontend Project Structure

The frontend lives in `apps/main`.

Project Structure conventions are mandatory.

##### 4.1.1.2 Datastore & Data Access

- `datastore/types` - Defines types of documents stored directly in firestore.
- `datastore/converters.ts` - Defines a genericConverter which allows client components to receive firestore data.
- `datastore/firestore` - Defines queries to fetch firestore data. The queries return `ClientCompat` types via the genericConverter

##### 4.1.1.1 Page Structure

Within `apps/` a "page" is typically structured in two parts:

###### 4.1.1.1.1 page.tsx

`page.tsx` - A server component responsible for fetching data to present on the page.

- Fetches data via `@/datastore/firestore.`

###### 4.1.1.1.2 Component.tsx

`Component.tsx` - The main client component of a page.

- Props & Data Passing: Client components only access firestore types when wrapped in `ClientCompat<T>`

  ```typescript
  export interface RacePageData {
    race: ClientCompat<RaceWithPreems>;
  }

  interface Props {
    data: RacePageData;
  }
  [...]
  ```

### 4.2. Frontend Architecture

The frontend is a Next.js application located in `apps/main`. It is built using the App Router for UI pages and Route Handlers for the BFF API. The UI will be constructed using the Mantine component library, and all forms will be managed using the `@mantine/form` package for state and validation.

#### 4.2.1. Stripe Integration

Client-side payment processing will be handled using the official Stripe.js library and `@stripe/react-stripe-js`.

- The application's root layout will be wrapped in the `<Elements>` provider from Stripe.
- The contribution flow modal will use pre-built Stripe components (e.g., `PaymentElement`) to securely collect payment information.
- When a user confirms a contribution, the client will first call the `POST /api/stripe/create-payment-intent` API route.
- The client will use the `clientSecret` returned from the function to confirm the payment with Stripe.js, without ever handling sensitive card details directly.

### 4.3. Backend Architecture

The backend is split into two logical components: Next.js API Routes for frontend-facing tasks and Google Cloud Functions for core backend services.

#### 4.3.1. Next.js API Routes (BFF)

These endpoints are part of the Next.js application and are used for actions initiated directly by the client.

- `POST /api/stripe/create-payment-intent`: Creates a Stripe Payment Intent to prepare for a contribution.

  ```typescript
  // Request Body
  interface CreatePaymentIntentRequest {
    amount: number; // The contribution amount in cents
    preemId: string; // The ID of the preem to contribute to
  }

  // Success Response (201 Created)
  interface CreatePaymentIntentResponse {
    clientSecret: string; // The client secret from the Stripe PaymentIntent
  }
  ```

#### 4.3.2. Google Cloud Functions (Core Backend)

These functions handle sensitive operations, asynchronous tasks, and direct integrations with third-party services.

- **Stripe & User Management:**
  - `createPortalLink` (HTTPS): Creates a link to the Stripe Customer Portal.
  - `stripeWebhook` (HTTPS): Handles incoming webhooks from Stripe to update Firestore.
  - `onUserCreate` (Auth): Creates a Stripe customer and a user document in Firestore. **This function will also check if the new user is the first user in the system; if so, it will automatically assign them the 'admin' role.**
- **Stripe Connect & Payouts:**
  - `createConnectAccount` (HTTPS): Creates a Stripe Connect account for a race organizer's organization.
  - `createAccountLink` (HTTPS): Generates a one-time link for an organizer to complete the Stripe Connect onboarding process.
  - `payoutPreem` (HTTPS): Initiates a payout from the platform's Stripe balance to the organizer's connected account for a completed preem.
- **Admin:**
  - `updateUserRole` (HTTPS, Admin-only): A secure endpoint for an admin to change a user's role.

### 4.4. Stripe Connect Onboarding for Organizers

To receive payouts, an organization must have a Stripe Connect account. This is a multi-step process managed by our backend and Stripe's secure UI.

**Step 1: Account Creation (Backend)**

- When an organizer creates a new `Organization`, the `createConnectAccount` Cloud Function is triggered.
- This function calls the Stripe API to create a new Connect `account` of type 'Express'.
- The resulting account ID (e.g., `acct_...`) is saved to the `Organization` document in the `/organizations` collection.

**Step 2: Onboarding Flow (Frontend)**

- In the "Manage Organization" page, if the `stripeConnectAccountId` exists but the account is not yet enabled for payouts, a "Complete Payout Setup" button will be displayed.
- Clicking this button calls the `createAccountLink` Cloud Function.
- This function generates a unique, single-use URL for a Stripe-hosted onboarding page.
- The frontend redirects the organizer to this URL, where they securely provide their identity and banking information directly to Stripe on behalf of their organization.
- Upon completion, Stripe redirects the organizer back to our application. A Stripe webhook (`account.updated`) will notify our backend when the account is fully verified and ready for payouts.

This flow ensures that we never handle sensitive personal or financial information, and it allows Stripe to manage the compliance and verification process. Once an organization's account is active, the `payoutPreem` function can use the stored `stripeConnectAccountId` to programmatically transfer funds.

---

## 5. Deployment & DevOps

### 5.1. CI/CD Pipeline

The pipeline will be implemented using **GitHub Actions** and connected to **Nx Cloud** to enable distributed caching and task execution. It will leverage Nx's "affected" commands to deploy only the changed applications.

1.  **On push to `main` branch:**
2.  **Lint & Test:** Run `nx affected:lint` and `nx affected:test`. These commands will be accelerated by Nx Cloud's cache.
3.  **Deploy Cloud Functions:** If `apps/functions` is affected, deploy the exported function handlers.
4.  **Build & Deploy Web App:** If `apps/main` is affected, build the Docker image and deploy it to Cloud Run.

### 5.2. Environment Variables

- **Cloud Functions (`apps/functions`):** Secrets like `STRIPE_API_KEY` will be managed by Google Secret Manager.
- **Cloud Run (`apps/main`):** Will require public environment variables like `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and the function URLs.

---

## 6. Security

### 6.1. Authentication & Authorization

- Authentication will be handled by **Firebase Authentication** and managed within the Next.js application using the **`next-firebase-auth-edge`** library. This library will be configured to use secure, server-side cookies to maintain user sessions.
- A **Next.js Middleware** will be implemented to protect routes. It will use `next-firebase-auth-edge` to check for a valid auth cookie on incoming requests and redirect unauthenticated users from protected pages.
- **Next.js API Routes** and **HTTPS-triggered Cloud Functions** will be protected. They will use helpers from `next-firebase-auth-edge` to securely extract the user's ID token and claims from the request. **Authorization for admin-level actions will be based on the `role` field in the user's Firestore document.**
- **Firestore Security Rules** will be the primary method of data authorization, restricting document access based on `request.auth.uid` and the user's role and organization membership.
- The **Stripe webhook function** is public but must verify the request signature.

### 6.2. Input Validation

All input to the Cloud Functions and Next.js API Routes **will** be validated using **Zod**.

---

## 7. Monitoring & Logging

- **Logging & Monitoring:** Google Cloud's operations suite will be used to monitor both the Cloud Run service and the execution of all Cloud Functions.
- **Error Reporting:** A service like Sentry or LogRocket will be integrated.

---

## 8. Stripe Connect & Webhooks Integration Plan

This plan outlines the implementation of Stripe Connect for organizer onboarding and payouts. It uses a combination of API Routes and Server Actions for a secure and robust architecture, separates data-fetching logic for performance, and includes a webhook system for real-time data synchronization.

---

#### **Phase 1: Backend Foundation (Stripe SDK & API Routes)**

1.  **Stripe SDK Initialization:**
    *   **Action:** Create `apps/main/src/stripe/server.ts` to initialize a server-side instance of the Stripe Node.js SDK.

2.  **Create Centralized User Retrieval for API Routes:**
    *   **Action:** Add a new function, `getUserFromRequest(request: NextRequest)`, to `apps/main/src/auth/user.ts`.
    *   **Logic:** This function will encapsulate the logic for getting user tokens from a `NextRequest` object by using `getTokens(request.cookies, authConfig)`. It will be the standard way to get the authenticated user within API Routes.

3.  **Create API Route for Onboarding Link:**
    *   **Action:** Create `apps/main/src/app/api/stripe/account-link/route.ts`.
    *   **Logic:**
        *   This `POST` route will accept `accountId` and `organizationId`.
        *   **Authorization:** It will call `getUserFromRequest(request)` to get the `authUser`. It will then use the `isUserAuthorized(authUser, 'organizations/' + organizationId)` function to verify the user is a member of the organization.
        *   If authorized, it will generate and return the Stripe `accountLink` URL.

4.  **Create API Route for Dashboard Link:**
    *   **Action:** Create `apps/main/src/app/api/stripe/dashboard-link/route.ts`.
    *   **Logic:**
        *   This `POST` route will accept `accountId` and `organizationId`.
        *   **Authorization:** It will follow the exact same authorization flow as the account link route.
        *   If authorized, it will generate and return the Stripe `loginLink` URL.

---

#### **Phase 2: Server Actions**

1.  **Create Server Action for Account Creation:**
    *   **Action:** Create `apps/main/src/app/(main)/manage/organization/[orgId]/edit/actions.ts`.
    *   **Logic:**
        *   The `createStripeConnectAccount` action will accept the `organizationId`.
        *   **Authorization:** It will get the `authUser` via `getAuthUserFromCookies()` and then call `isUserAuthorized(authUser, 'organizations/' + organizationId)`.
        *   If authorized, it will create the Stripe account and update the `organization.stripe.connectAccountId` field in Firestore.
        *   It will then call `revalidatePath`.

---

#### **Phase 3: Data Layer & UI Integration**

1.  **Update `Organization` Data Type:**
    *   **Action:** Modify the `Organization` interface in `apps/main/src/datastore/types.ts` to include a nested `stripe` object with `connectAccountId?: string;` and `account?: Stripe.Account;`.

2.  **Split Data Fetching Logic:**
    *   **Action:** In `apps/main/src/datastore/firestore.ts`, refactor the data fetching functions.
    *   **`getOrganizationById` (Public):** Will fetch only basic data from Firestore.
    *   **`getManagedOrganizationById` (Private/Admin):** A new function that calls the public function and then enriches the data by retrieving the full Stripe Account object via the API, populating the `organization.stripe.account` field.

3.  **Integrate into the Frontend:**
    *   **Action (Data Fetching):** The page at `apps/main/src/app/(main)/manage/organization/[orgId]/edit/page.tsx` will be updated to call the new `getManagedOrganizationById` function.
    *   **Action (New Component):** Create a dedicated component file at `apps/main/src/app/(main)/manage/organization/[orgId]/edit/StripeConnectCard.tsx`.
    *   **Action (Integration):** Import and render the `StripeConnectCard` within `EditOrganization.tsx`. The card will handle all UI and client-side logic for interacting with the Stripe API routes and server actions.

---

#### **Phase 4: Stripe Webhook Integration**

1.  **Create the Webhook Handler API Route:**
    *   **Action:** Create `apps/main/src/app/api/stripe/webhook/route.ts`.
    *   **Logic:**
        *   The `POST` handler will proceed **only if the `STRIPE_WEBHOOK_SECRET` environment variable is set**.
        *   **Security:** It will verify the authenticity of every request using `stripe.webhooks.constructEvent()` and the webhook secret.
        *   It will use a `switch` statement on `event.type`. For `account.updated` events, it will check if `payouts_enabled` has changed and update the corresponding `Organization` document in Firestore.
        *   It will return a `200 OK` status to acknowledge receipt of the event.

2.  **Add New Environment Variable:**
    *   **Action:** Add `STRIPE_WEBHOOK_SECRET` to the environment variables.

3.  **Configure the Webhook Endpoint in Stripe:**
    *   **Action (Manual):** In the Stripe Developer Dashboard, configure a new webhook endpoint pointing to `https://<your-production-url>/api/stripe/webhook` and listening for the `account.updated` event.

4.  **Enable Local Testing with the Stripe CLI:**
    *   **Action (Development):** Use the Stripe CLI command `stripe listen --forward-to http://localhost:3000/api/stripe/webhook` to test the webhook flow locally.

---

## Appendix A: Firestore Schema

This appendix details the structure of the Firestore database. This hierarchical model leverages **`CollectionGroup`** queries for cross-cutting concerns (e.g., finding all races in a region, regardless of their parent series).

### **Users**

- **Collection Path:** `/users`
- **Document Structure:**
  - `id`: string
  - `metadata`: Metadata (object)
  - `termsAccepted`: boolean
  - `name`: string
  - `email`: string
  - `avatarUrl`: string
  - `role`: string (`'contributor'`, `'organizer'`, `'admin'`)
  - `affiliation`: string
  - `raceLicenseId`: string
  - `address`: string
  - `organizationRefs`: array of DocumentReferences (`/organizations/{orgId}`)

### **Organizations**

- **Collection Path:** `/organizations`
- **Document Structure:**
  - `id`: string
  - `metadata`: Metadata (object)
  - `name`: string
  - `website`: string
  - `memberRefs`: array of DocumentReferences (`/users/{userId}`)
  - `stripe`: object
    - `connectAccountId`: string

### **Race Series**

- **Collection Path:** `/organizations/{orgId}/series`
- **Document Structure:**
  - `id`: string
  - `metadata`: Metadata (object)
  - `name`: string
  - `location`: string
  - `website`: string (optional)
  - `startDate`: timestamp
  - `endDate`: timestamp
  - `organizationBrief`: OrganizationBrief (object)

### **Race Events**

- **Collection Path:** `/organizations/{orgId}/series/{seriesId}/events`
- **Document Structure:**
  - `id`: string
  - `metadata`: Metadata (object)
  - `name`: string
  - `website`: string (optional)
  - `location`: string
  - `startDate`: timestamp
  - `endDate`: timestamp
  - `seriesBrief`: SeriesBrief (object)

### **Races**

- **Collection Path:** `/organizations/{orgId}/series/{seriesId}/events/{eventId}/races`
- **Document Structure:**
  - `id`: string
  - `metadata`: Metadata (object)
  - `name`: string
  - `category`: string
  - `gender`: string (`'Women'`, `'Men'`, `'Open'`)
  - `location`: string
  - `courseDetails`: string
  - `maxRacers`: number
  - `currentRacers`: number
  - `ageCategory`: string
  - `duration`: string
  - `laps`: number
  - `podiums`: number
  - `sponsors`: array of strings
  - `startDate`: timestamp
  - `endDate`: timestamp
  - `eventBrief`: EventBrief (object)

### **Preems (Primes)**

- **Collection Path:** `/organizations/{orgId}/series/{seriesId}/events/{eventId}/races/{raceId}/preems`
- **Document Structure:**
  - `id`: string
  - `metadata`: Metadata (object)
  - `name`: string
  - `type`: string (`'Pooled'`, `'One-Shot'`)
  - `status`: string (`'Open'`, `'Minimum Met'`, `'Awarded'`)
  - `prizePool`: number
  - `timeLimit`: timestamp
  - `minimumThreshold`: number (optional)
  - `raceBrief`: RaceBrief (object)

### **Contributions**

- **Collection Path:** `/organizations/{orgId}/series/{seriesId}/events/{eventId}/races/{raceId}/preems/{preemId}/contributions`
- **Document Structure:**
  - `id`: string
  - `metadata`: Metadata (object)
  - `contributor`: User (object)
  - `amount`: number
  - `date`: timestamp
  - `message`: string (optional)
  - `preemBrief`: PreemBrief (object)
