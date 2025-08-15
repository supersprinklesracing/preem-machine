# Engineering Design Document: preem-machine

**Author(s):** [Your Name/Team]
**Status:** Draft

---

## 1. Overview

### 1.1. Introduction & Goals

This document outlines the technical design and architecture for **preem-machine**, a web application built within an **Nx monorepo**. The platform consists of a Next.js frontend application (with a BFF API layer) deployed on Google Cloud Run, and a core backend of **Google Cloud Functions**. The platform is designed to modernize and streamline the process of cash prize contributions for community bike races.

### 1.2. Business Requirements

- Provide a centralized hub for race organizers to manage race series, individual races, and prize pools ("preems").
- Allow the cycling community (users) to contribute to preem prize pools in real-time.
- Offer a transparent view of contributions and prize statuses for both organizers and the public.
- Provide a secure authentication system for different user roles (Contributor, Organizer, Admin).
- Enable monetization through user subscriptions or service fees.

### 1.3. Technical Requirements

- **Monorepo:** Nx Workspace
- **Frontend Framework:** Next.js with TypeScript (App Router)
- **UI Library:** **Mantine**
- **Backend Logic:** **Google Cloud Functions (TypeScript)** & **Next.js API Routes**
- **Deployment:** Dockerized container on Google Cloud Run (for Next.js)
- **Database:** Cloud Firestore
- **Authentication:** Firebase Authentication
- **Payments:** Stripe API, **Stripe Connect**
- **CI/CD:** [e.g., GitHub Actions, Cloud Build]

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
- **Mantine:** A comprehensive React component library with a rich set of hooks and components that will accelerate UI development.
- **next-firebase-auth-edge:** A modern library for integrating Firebase Authentication with the Next.js App Router and Edge runtime. It provides a secure, cookie-based approach to managing user sessions on the server side, which is essential for protecting API routes and rendering server components based on auth state.
- **Google Cloud Run:** A serverless platform that provides auto-scaling and simplifies deployment for the Next.js app.
- **Google Cloud Functions:** Chosen to handle core backend logic, decoupling it from the frontend and enhancing security.
- **Firebase Authentication & Firestore:** A tightly integrated and scalable solution for user management and real-time data.
- **Stripe & Stripe Connect:** A comprehensive platform for handling online payments. Stripe Connect is essential for a marketplace model, as it handles the complexity of onboarding organizers and routing payouts while maintaining compliance.

---

## 3. Data Model & Database Design

Fields that reference other documents (e.g., `organizerId`) will be stored as Firestore `DocumentReference` types for type safety and ease of querying.

### 3.1. Firestore Collections

See Appendix A for the detailed Firestore schema.

### 3.2. Data Access Layer

Data access logic will be encapsulated within dedicated libraries in the `libs` folder. For example, `libs/datastore/src/lib/firestore.ts` and `libs/stripe/src/lib/stripe.ts`.

---

## 4. Architecture

### 4.1. Project Structure

The overall project is structured as an Nx workspace, containing the `main` frontend application and the `functions` backend application.

```

/
├── apps/
│ ├── main/ \# The Next.js application (frontend + BFF)
│ │ ├── src/
│ │ │ └── app/ \# UI and API Routes (App Router)
│ │ │ ├── api/ \# API Route Handlers
│ │ │ └── ...
│ │ └── project.json
│ └── functions/ \# The Cloud Functions application (backend)
│ ├── src/
│ │ ├── main.ts \# All function handlers are exported here
│ │ └── ...
│ └── project.json
├── libs/
│ ├── datastore/ \# For Firestore data access logic
│ ├── ui/ \# Custom components built with/for Mantine
│ ├── util/ \# Shared, framework-agnostic utilities
│ └── stripe/ \# Server-side Stripe logic (used by functions)
├── nx.json
└── package.json

```

### 4.2. Frontend Architecture

The frontend is a Next.js application located in `apps/main`. It is built using the App Router for UI pages and Route Handlers for the BFF API. The UI will be constructed using the Mantine component library.

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
  - `onUserCreate` (Auth): Creates a Stripe customer and a user document in Firestore.
- **Stripe Connect & Payouts:**
  - `createConnectAccount` (HTTPS): Creates a Stripe Connect account for a race organizer.
  - `createAccountLink` (HTTPS): Generates a one-time link for an organizer to complete the Stripe Connect onboarding process.
  - `payoutPreem` (HTTPS): Initiates a payout from the platform's Stripe balance to the organizer's connected account for a completed preem.

### 4.4. Stripe Connect Onboarding for Organizers

To receive payouts, race organizers must have a Stripe Connect account linked to their user profile. This is a two-step process managed by our backend and Stripe's secure UI.

**Step 1: Account Creation (Backend)**

- When a user is designated as an organizer, the `createConnectAccount` Cloud Function is triggered.
- This function calls the Stripe API to create a new Connect `account` of type 'Express'.
- The resulting account ID (e.g., `acct_...`) is saved to the organizer's document in the `/users` collection under the `stripeCustomer.connectAccountId` field.

**Step 2: Onboarding Flow (Frontend)**

- In the organizer's dashboard, if the `connectAccountId` exists but their account is not yet enabled for payouts, a "Connect Bank Account" button will be displayed.
- Clicking this button calls the `createAccountLink` Cloud Function.
- This function generates a unique, single-use URL for a Stripe-hosted onboarding page.
- The frontend redirects the organizer to this URL, where they securely provide their identity and banking information directly to Stripe.
- Upon completion, Stripe redirects the organizer back to our application. A Stripe webhook (`account.updated`) will notify our backend when the account is fully verified and ready for payouts.

This flow ensures that we never handle sensitive personal or financial information, and it allows Stripe to manage the compliance and verification process. Once an organizer's account is active, the `payoutPreem` function can use the stored `connectAccountId` to programmatically transfer funds.

---

## 5. Deployment & DevOps

### 5.1. CI/CD Pipeline

The pipeline will leverage Nx's "affected" commands to deploy only the changed applications.

1. **On push to `main` branch:**
2. **Lint & Test:** Run `nx affected:lint` and `nx affected:test`.
3. **Deploy Cloud Functions:** If `apps/functions` is affected, deploy the exported function handlers.
4. **Build & Deploy Web App:** If `apps/main` is affected, build the Docker image and deploy it to Cloud Run.

### 5.2. Environment Variables

- **Cloud Functions (`apps/functions`):** Secrets like `STRIPE_API_KEY` will be managed by Google Secret Manager.
- **Cloud Run (`apps/main`):** Will require public environment variables like `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and the function URLs.

---

## 6. Security

### 6.1. Authentication & Authorization

- Authentication will be handled by **Firebase Authentication** and managed within the Next.js application using the **`next-firebase-auth-edge`** library. This library will be configured to use secure, server-side cookies to maintain user sessions.
- A **Next.js Middleware** will be implemented to protect routes. It will use `next-firebase-auth-edge` to check for a valid auth cookie on incoming requests and redirect unauthenticated users from protected pages.
- **Next.js API Routes** and **HTTPS-triggered Cloud Functions** will be protected. They will use helpers from `next-firebase-auth-edge` to securely extract the user's ID token and claims (like their `role`) from the request cookies or headers to perform authorization checks before executing logic.
- **Firestore Security Rules** will be the primary method of data authorization, restricting document access based on `request.auth.uid` and `request.auth.token.role`.
- The **Stripe webhook function** is public but must verify the request signature.

### 6.2. Input Validation

All input to the Cloud Functions and Next.js API Routes **will** be validated using **Zod**.

---

## 7. Monitoring & Logging

- **Logging & Monitoring:** Google Cloud's operations suite will be used to monitor both the Cloud Run service and the execution of all Cloud Functions.
- **Error Reporting:** A service like Sentry or LogRocket will be integrated.

---

## Appendix A: Firestore Schema

This appendix details the structure of the Firestore database. This hierarchical model leverages **`CollectionGroup`** queries for cross-cutting concerns (e.g., finding all races in a region, regardless of their parent series).

### **Users**

- **Collection Path:** `/users`
- **Document Structure:**
  - `id`: string
  - `email`: string
  - `displayName`: string
  - `role`: string (`'contributor'`, `'organizer'`, `'admin'`)
  - `stripeCustomer`: map
    - `customerId`: string
    - `connectAccountId`: string (for organizers)

### **Race Series**

- **Collection Path:** `/raceSeries`
- **Document Structure:**
  - `id`: string
  - `organizerId`: DocumentReference (`/users/{userId}`)
  - `name`: string
  - `region`: string
  - `website`: string (optional)
  - `startDate`: timestamp
  - `endDate`: timestamp

### **Races**

- **Collection Path:** `/raceSeries/{seriesId}/races`
- **Document Structure:**
  - `id`: string
  - `status`: string (`'Upcoming'`, `'Live'`, `'Finished'`)
  - `name`: string
  - `category`: string
  - `gender`: string
  - `location`: string
  - `dateTime`: timestamp
  - (other fields from PDD as needed)

### **Preems (Primes)**

- **Collection Path:** `/raceSeries/{seriesId}/races/{raceId}/preems`
- **Document Structure:**
  - `id`: string
  - `name`: string
  - `type`: string (`'Pooled'`, `'One-Shot'`)
  - `status`: string (`'Open'`, `'Minimum Met'`, `'Awarded'`)
  - `prizePool`: number
  - `sponsorInfo`: map (for `One-Shot`) or null (for `Pooled`)
  - `timeLimit`: timestamp
  - `minimumThreshold`: number (optional)

### **Contributions**

- **Collection Path:** `/raceSeries/{seriesId}/races/{raceId}/preems/{preemId}/contributions`
- **Document Structure:**
  - `id`: string
  - `contributorId`: DocumentReference (`/users/{userId}`, or null for anonymous)
  - `amount`: number
  - `date`: timestamp
  - `message`: string (optional)
