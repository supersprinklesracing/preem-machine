# Engineering Design Document: preem-machine

## 1. Overview

### 1.1. Introduction & Goals

This document outlines the technical design and architecture for **preem-machine**, a web application built within an **Nx monorepo**. The platform consists of a Next.js application deployed on Google Cloud Run, which handles the frontend, backend logic via **Server Actions**, and webhook ingestion via **API Routes**. The platform is designed to modernize and streamline the process of cash prize contributions for community bike races.

### 1.2. Business Requirements

- Provide a centralized hub for race organizers to manage organizations, race series, events, individual races, and prize pools ("preems").

- Allow the cycling community (users) to contribute to preem prize pools in real-time.

- Offer a transparent view of contributions and prize statuses for both organizers and the public.

- Provide a secure authentication system for different user roles (Contributor, Organizer, Admin), with organizer permissions tied to organization membership.

- Enable monetization through user subscriptions or service fees.

### 1.3. Technical Requirements

- **Monorepo:** Nx Workspace

- **Frontend Framework:** Next.js with TypeScript (App Router)

- **UI Library:** Mantine with @mantine/form

- **Backend Logic:** Next.js Server Actions & API Routes (for webhooks)

- **Deployment:** Dockerized container on Google Cloud Run

- **Database:** Cloud Firestore

- **Authentication:** Firebase Authentication

- **Payments:** Stripe API, Stripe Connect

- **CI/CD:** GitHub Actions with Nx Cloud

### 1.4. Non-Goals

- This version will not include a native mobile application.

## 2. System Architecture

### 2.1. High-Level Diagram

$$
A diagram illustrating the main components: User -> Cloud Run (Next.js with Server Actions & API Routes) -> Stripe/Firestore
$$

- **User/Client:** A web browser running the Next.js frontend application.

- **Google Cloud Run:** Hosts the containerized Next.js application. This single deployment contains the UI (Server and Client Components), the backend logic for user-initiated actions (**Server Actions**), and the endpoint for receiving external webhooks (**API Routes**).

- **Firebase Authentication:** Handles all user identity and session management.

- **Cloud Firestore:** A NoSQL document database for storing all application data.

- **Stripe:** An external service for processing payments and managing subscriptions. **Stripe Connect** will be used to onboard and pay out funds to race organizers.

### 2.2. Technology Choices Rationale

- **Nx Monorepo:** Facilitates code sharing and provides powerful tooling for optimizing CI/CD pipelines.

- **Next.js (App Router & Server Actions):** Chosen for its excellent performance and integrated architecture. **Server Actions** provide a seamless and secure way to handle backend mutations directly from the frontend, simplifying the overall architecture by co-locating backend logic with the UI that uses it. **API Routes** are reserved for webhook ingestion.

- **Mantine & @mantine/form:** A comprehensive React component library with a rich set of hooks and components that will accelerate UI development. The @mantine/form package will be used for managing form state and validation, integrating seamlessly with the Mantine component set and our Zod validation schemas.

- **next-firebase-auth-edge:** A modern library for integrating Firebase Authentication with the Next.js App Router and Edge runtime. It provides a secure, cookie-based approach to managing user sessions on the server side, which is essential for protecting API routes and rendering server components based on auth state.

- **GitHub Actions & Nx Cloud:** GitHub Actions provides a robust, native CI/CD solution for projects hosted on GitHub. Integrating it with Nx Cloud enables distributed computation caching and task execution, which dramatically speeds up pipeline times by ensuring that only code affected by a change is tested and built.

- **Google Cloud Run:** A serverless platform that provides auto-scaling and simplifies deployment for the Next.js app.

- **Firebase Authentication & Firestore:** A tightly integrated and scalable solution for user management and real-time data.

- **Stripe & Stripe Connect:** A comprehensive platform for handling online payments. Stripe Connect is essential for a marketplace model, as it handles the complexity of onboarding organizers and routing payouts while maintaining compliance.

## 3. Data Model & Database Design

Fields that reference other documents will be stored as Firestore DocumentReference types for type safety and ease of querying.

### 3.1. Firestore Collections

See Appendix A for the detailed Firestore schema.

### 3.2. Data Access Layer

All Firestore-related data access logic is encapsulated within the `datastore` library. This creates a clean separation between data fetching/mutation logic and the UI.

- `datastore/types`: Defines the TypeScript types for documents stored in Firestore.

- `datastore/converters.ts`: Defines a generic `firestoreConverter` which ensures type safety and allows client components to receive strongly-typed data from server components. It also defines the `ClientCompat<T>` wrapper type to handle the serialization of Firestore-specific types (like Timestamp) for client components.

- `datastore/firestore.ts`: Defines all **read-only** queries to fetch data from Firestore (e.g., `getOrganizationById`, `getRacesByEvent`). These functions are used by server components (`page.tsx`) to fetch initial page data.

- `datastore/mutations.ts`: Defines all **write** operations (create, update, delete) that do not involve external services. These are simple mutations like updating an event's name.

## 4. Architecture

### 4.1. Library Structure

Within `apps/main/src/`, we store libraries that do not directly relate to a specific page within `apps/main/src/app/`. This includes:

- `firebase-client/`: Intended for use with Client Components, the code in this library is used to initialize the firebase app and firestore instances; along with basic utilities like date functions.

- `firebase-admin/`: Intended for use with Server Components, the code in this library is used to initialize the firebase app and firestore instances; along with basic utilities like date functions.

- `stripe/`: Client and server code (as necessary, split into different files) that interacts with Stripe.

- `stripe-datastore/`: Client and server code (as necessary, split into different files) that interacts with stripe and datastore; such as transactional operations between the two.

### 4.2. Page Structure

Within `apps/main/src/app/`, a "page" is typically structured in two parts:

- **`page.tsx`**: A server component responsible for fetching the initial data needed for the page via functions from `@/datastore/firestore`.

- **`Component.tsx`**: The main client component of the page. It receives its initial data as props from `page.tsx`, wrapped in the `ClientCompat<T>` type to ensure serializability.

### 4.3. Backend Architecture

The backend logic resides entirely within the Next.js application, using a combination of Server Actions for user-initiated events and a single API Route for the Stripe webhook.

#### 4.3.1. Server Actions

All user-initiated mutations (creating events, processing payments, etc.) will be implemented as **Server Actions**. This co-locates the backend logic with the components that trigger it, simplifying the architecture.

- **Stripe Payment Intent Creation:** A Server Action will create the Stripe Payment Intent, including the `transfer_data` for the destination charge.

- **Stripe Connect Onboarding:** Server Actions will be used to create Connect accounts and generate account links for organizers.

#### 4.3.2. API Routes (Webhook Only)

API Routes are reserved for incoming webhooks from external services.

- **`POST /api/stripe/webhook`**: This single API route will handle all incoming events from Stripe, such as `payment_intent.succeeded` and `account.updated`.

## 5. Deployment & DevOps

### 5.1. CI/CD Pipeline

The pipeline will be implemented using **GitHub Actions** and connected to **Nx Cloud** to enable distributed caching and task execution. It will leverage Nx's "affected" commands to deploy only the changed applications.

**On push to `main` branch:**

1. **Lint & Test:** Run `nx affected:lint` and `nx affected:test`. These commands will be accelerated by Nx Cloud's cache.

2. **Build & Deploy Web App:** If `apps/main` is affected, build the Docker image and deploy it to Cloud Run.

### 5.2. Environment Variables

- **Cloud Run (`apps/main`):** Will require public environment variables like `NEXT_PUBLIC_STRIPE_API_KEY` and secrets like `STRIPE_API_KEY` managed by Google Secret Manager.

## 6. Security

### 6.1. Authentication & Authorization

- Authentication will be handled by **Firebase Authentication** and managed within the Next.js application using the **`next-firebase-auth-edge`** library. This library will be configured to use secure, server-side cookies to maintain user sessions.

- A **Next.js Middleware** will be implemented to protect routes. It will use `next-firebase-auth-edge` to check for a valid auth cookie on incoming requests and redirect unauthenticated users from protected pages.

- **Server Actions** and the **API Route** will be protected. They will use helpers from `next-firebase-auth-edge` to securely extract the user's ID token and claims from the request. Authorization for admin-level actions will be based on the `role` field in the user's Firestore document.

- **Firestore Security Rules** will be the primary method of data authorization, restricting document access based on `request.auth.uid` and the user's role and organization membership.

- The **Stripe webhook API Route** is public but must verify the request signature.

### 6.2. Input Validation

All input to Server Actions and the API Route **will** be validated using **Zod**.

## 7. Monitoring & Logging

- **Logging & Monitoring:** Google Cloud's operations suite will be used to monitor the Cloud Run service.

- **Error Reporting:** A service like Sentry or LogRocket will be integrated.

## 8. Stripe Connect & Onboarding Plan

This plan outlines the implementation of Stripe Connect for organizer onboarding and payouts.

### Phase 1: Backend Foundation (Stripe SDK & Server Actions)

- **Stripe SDK Initialization:**
  - **Action:** Ensure `apps/main/src/stripe/server.ts` initializes a server-side instance of the Stripe Node.js SDK.

- **Create Server Action for Account Creation:**
  - **Action:** Create `apps/main/src/app/(main)/manage/organization/[orgId]/edit/actions.ts`.

  - **Logic:**
    - The `createStripeConnectAccount` action will accept the `organizationId`.

    - **Authorization:** It will get the `authUser` via `getAuthUserFromCookies()` and verify their membership in the organization.

    - If authorized, it will create the Stripe account and update the `organization.stripe.connectAccountId` field in Firestore.

    - It will then call `revalidatePath`.

- **Create Server Action for Onboarding Link:**
  - **Action:** Create a `createStripeAccountLink` Server Action.

  - **Logic:**
    - This action will accept `accountId` and `organizationId`.

    - **Authorization:** It will verify the user is a member of the organization.

    - If authorized, it will generate and return the Stripe `accountLink` URL.

### Phase 2: Data Layer & UI Integration

- **Update Organization Data Type:**
  - **Action:** Modify the `Organization` interface in `apps/main/src/datastore/types.ts` to include a nested `stripe` object with `connectAccountId?: string;` and `account?: Stripe.Account;`.

- **Split Data Fetching Logic:**
  - **Action:** In `apps/main/src/datastore/firestore.ts`, create a new function `getManagedOrganizationById`.

  - **Logic:** This function will fetch the core `Organization` data from Firestore and then enrich it with the full Stripe `Account` object via the API, populating the `organization.stripe.account` field.

- **Integrate into the Frontend:**
  - **Action (Data Fetching):** The page at `.../manage/organization/[orgId]/edit/page.tsx` will call `getManagedOrganizationById`.

  - **Action (New Component):** Create a `StripeConnectCard.tsx` component to handle all UI and client-side logic for the onboarding flow.

### Phase 3: Stripe Webhook Integration

- **Update the Webhook Handler:**
  - **Action:** In `apps/main/src/app/api/stripe/webhook/route.ts`, add a `case` for the `account.updated` event.

  - **Logic:**
    - When this event is received, the handler will check if `payouts_enabled` has changed and update the corresponding `Organization` document in Firestore.

## 9. Stripe Payments & Contribution Plan

This plan outlines the definitive process for handling user contributions. It uses **Server Actions** for user-initiated logic, implements an **optimistic UI** for a fast user experience, and relies on a **transactional webhook** for data integrity.

### Contribution UI:

The UI lives in `apps/main/src/components/contribution-modal.tsx`.

### Contribution Transactions Overview

### Phase 1: Payment Intent Creation (Server Action)

The process begins when the user is ready to pay. We will use a Server Action to securely create the Payment Intent.

- **Define the Server Action:**
  - **Location:** `apps/main/src/stripe/actions.ts`

  - **Action:** Create a `createPaymentIntent` Server Action that accepts `amount` and `preemId`.

- **Action Logic:**
  - **Authorization:** The action will get the authenticated user.

  - **Data Fetching:** It will get the `preem` document to find the parent `organizationId` from its path and then fetch the `Organization` to get its `stripe.connectAccountId`.

  - **Stripe API Call:** It will call `stripe.paymentIntents.create` and include the `transfer_data` object to create a **Destination Charge**, directing the funds to the organizer's Connect account.

  - **Return Value:** The action will return the `clientSecret` to the client.

### Phase 2: The Optimistic UI Flow (Client-Side with Custom Hook)

To ensure the client-side logic is clean, reusable, and efficient, the entire contribution flow is encapsulated within a custom React hook: `useContribution`.

- **Location:** `apps/main/src/stripe-datastore/use-contribution.ts`

- **Core Logic:** This hook abstracts the entire payment and data submission process. It exposes:
  - A single function: `handleContribute(contributionDetails)`.
  - A loading state: `isProcessing`.

- **Workflow:**
  1.  **Initiation:** The UI component (e.g., `ContributionModal`) calls `handleContribute` with the amount, message, preem details, etc., when the user clicks the final confirmation button.
  2.  **Create Payment Intent:** The hook is responsible for calling the `createPaymentIntent` Server Action to get the `clientSecret` from Stripe.
  3.  **Confirm Payment:** It then uses the `clientSecret` to call `stripe.confirmPayment()`.
  4.  **Perform Optimistic Write:** Upon successful payment confirmation, the hook calls the `createPendingContribution` server action to write a 'pending' contribution document to Firestore.

- **Component-Side Implementation:**
  - The `ContributionModal` component is wrapped in the Stripe `Elements` provider.
  - It uses the `useContribution` hook to get the `handleContribute` function and the `isProcessing` state.
  - The form's submit handler simply calls `handleContribute`. This keeps the component clean and focused on UI presentation.

### Phase 3: The Centralized `processContribution` Function

We will create one primary function that handles the entire logic of recording a contribution.

- **Location**: `apps/main/src/stripe-datastore/contributions.ts`

- **Function Signature**: `async function processContribution(paymentIntent: Stripe.PaymentIntent)`

- **Logic**: This function will contain the **Firestore transaction** responsible for:
  1. Reading the `Preem` document and the corresponding `Contribution` document.

  2. Checking if a "pending" contribution already exists.

  3. Creating or updating the `Contribution` document with `status: 'confirmed'` and storing the full `paymentIntent` object in the `stripe` map field.

  4. Atomically incrementing the `prizePool` on the `Preem` document.

#### How It's Reused

Both the Server Action and the Webhook will import and call this single function, making the core logic DRY (Don't Repeat Yourself) and easy to maintain.

- **Server Action (`apps/main/src/stripe/actions.ts`)**:
  - After the client-side `stripe.confirmPayment()` succeeds, the frontend will call a new Server Action, let's call it `confirmContributionOptimistically`.

  - This Server Action will retrieve the `PaymentIntent` from Stripe using its ID.

  - It will then call `await processContribution(paymentIntent)`.

- **Stripe Webhook (`apps/main/src/app/api/stripe/webhook/route.ts`)**:
  - When the webhook handler receives a `payment_intent.succeeded` event, it will extract the `PaymentIntent` object from the event payload.

  - It will then call `await processContribution(paymentIntent)`.

This structure ensures that the exact same transactional logic runs whether it's triggered optimistically by the user's action or authoritatively by the Stripe webhook, preventing any race conditions or data duplication.

### Phase 4: The Authoritative Update (Webhook)

This is the final, guaranteed step that ensures data integrity and handles any client-side failures.

- **Receive the Webhook:**
  - The `POST /api/stripe/webhook` API Route listens for the `payment_intent.succeeded` event.

- **Execute the centralized `processContribution` Function**

## Appendix A: Firestore Schema

This appendix details the structure of the Firestore database. This hierarchical model leverages **CollectionGroup** queries for cross-cutting concerns (e.g., finding all races in a region, regardless of their parent series).

### Users

- **Collection Path:** `/users`

- **Document Structure:**
  - `id`: string

  - `metadata`: Metadata (object)

  - `termsAccepted`: boolean

  - `name`: string

  - `email`: string

  - `avatarUrl`: string

  - `role`: string ('contributor', 'organizer', 'admin')

  - `affiliation`: string

  - `raceLicenseId`: string

  - `address`: string

  - `organizationRefs`: array of DocumentReferences (`/organizations/{orgId}`)

### Organizations

- **Collection Path:** `/organizations`

- **Document Structure:**
  - `id`: string

  - `metadata`: Metadata (object)

  - `name`: string

  - `website`: string

  - `memberRefs`: array of DocumentReferences (`/users/{userId}`)

  - `stripe`: object
    - `connectAccountId`: string

### Race Series

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

### Race Events

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

### Races

- **Collection Path:** `/organizations/{orgId}/series/{seriesId}/events/{eventId}/races`

- **Document Structure:**
  - `id`: string

  - `metadata`: Metadata (object)

  - `name`: string

  - `category`: string

  - `gender`: string ('Women', 'Men', 'Open')

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

### Preems (Primes)

- **Collection Path:** `/organizations/{orgId}/series/{seriesId}/events/{eventId}/races/{raceId}/preems`

- **Document Structure:**
  - `id`: string

  - `metadata`: Metadata (object)

  - `name`: string

  - `type`: string ('Pooled', 'One-Shot')

  - `status`: string ('Open', 'Minimum Met', 'Awarded')

  - `prizePool`: number

  - `timeLimit`: timestamp

  - `minimumThreshold`: number (optional)

  - `raceBrief`: RaceBrief (object)

### Contributions

- **Collection Path:** `/organizations/{orgId}/series/{seriesId}/events/{eventId}/races/{raceId}/preems/{preemId}/contributions`

- **Document Structure:**
  - `id`: string

  - `metadata`: Metadata (object)

  - `contributor`: User (object)

  - `amount`: number

  - `date`: timestamp

  - `message`: string (optional)

  - `preemBrief`: PreemBrief (object)
