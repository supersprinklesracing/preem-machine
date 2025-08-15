# Preem Machine: Product Design

## 1. Overview

**Preem Machine** is a specialized software platform designed to modernize and streamline the process of cash prize contributions for community bike races. The system provides a centralized hub for race organizers to manage events and for the cycling community to contribute to prize pools, known as "preems."

The primary goal is to enhance engagement and financial support for local racing events by creating a transparent, real-time, and easy-to-use system for managing cash prizes.

## 2. Core Concepts

The platform is built around four core entities: Race Series, Race Events, Races, and Preems. These concepts represent the fundamental data models of the application.

### 2.1 Race Series

A Race Series is a collection of related race events, often managed by a single organizer or organization.

- **Fields:**
  - `id`: A unique identifier for the series.
  - `organizerRef`: A reference to the Race Organizer who owns the series.
  - `name`: The official name of the race series (e.g., "Summer Criterium Series").
  - `region`: The general geographic area where the series takes place (e.g., "Northern California").
  - `website`: An optional URL to the organizer's official website for the series.
  - `startDate`: The date the first event in the series begins.
  - `endDate`: The date the last event in the series ends.

### 2.2 Race Event

A Race Event represents a single day of racing within a series. An event can contain multiple individual races.

- **Fields:**
  - `id`: A unique identifier for the event.
  - `seriesRef`: A reference to the parent Race Series.
  - `name`: The name of the event day (e.g., "Day 1: Criterium", "Circuit Race Day").
  - `date`: The specific date of the event.
  - `location`: The location for that day's events.

### 2.3 Race

A Race is a single competitive heat or competition that belongs to a Race Event.

- **Fields:**
  - `id`: A unique identifier for the race.
  - `eventRef`: A reference to the parent Race Event.
  - `status`: The current state of the race: "Upcoming", "Live", or "Finished".
  - `name`: The specific name of the race (e.g., "Women's Cat 3/4").
  - `category`: The skill or license category for the race (e.g., "Cat 3/4").
  - `gender`: The gender category for the race (e.g., "Women", "Men", "Open").
  - `courseDetails`: A description of the race course.
  - `maxRacers`: The maximum number of racers allowed to register.
  - `currentRacers`: The current number of registered racers.
  - `ageCategory`: The age bracket for the racers (e.g., "Masters 40+").
  - `duration`: The expected length of the race in time (e.g., "60 minutes").
  - `laps`: The expected number of laps.
  - `podiums`: The number of winners to be recognized (e.g., 3 for 1st, 2nd, 3rd).
  - `sponsors`: A list of official sponsors for the race itself.
  - `dateTime`: The specific start date and time of the race.

### 2.4 Preem (Prime)

A "preem" is a specific cash prize awarded during a race for a particular achievement. It is the primary target for user contributions.

- **Fields:**
  - `id`: A unique identifier for the preem.
  - `raceRef`: A reference to the Race this preem is associated with.
  - `name`: The descriptive name of the prize (e.g., "First Lap Leader", "Mid-Race Sprint").
  - `type`: The structure of the preem: "Pooled" or "One-Shot".
  - `status`: The current state of the preem: "Open", "Minimum Met", "Awarded".
  - `prizePool`: The current total cash value, updated in real-time as users contribute.
  - `sponsorUserRef`:
    - For a "One-Shot" preem, this holds a reference to the single contributing user.
    - For a "Pooled" preem, this is null as it's funded by the community.
  - `timeLimit`: For "Pooled" preems, the timestamp when contributions will be closed.
  - `minimumThreshold`: An optional dollar amount set by the organizer that must be met for the preem to be active.
  - `contributionHistory`: A list of all individual contributions, where each entry contains:
    - `contributorRef`: A reference to the contributing user (or null if anonymous).
    - `amount`: The dollar amount contributed.
    - `date`: The timestamp of the contribution.
    - `message`: The optional message from the contributor.

## 3. User Roles & Permissions

The platform supports three distinct user roles: **User (Contributor)**, **Race Organizer**, and **Administrator**. Their permissions are defined by their access to the features detailed below.

## 4. UI & Feature Breakdown

This section details the user interface and functionality for each major component of the application, referencing the data model fields from Section 2.

### 4.0 Public & Core Pages

#### 4.0.1 Public Home Page

This is the landing page for all visitors, designed for discovery.

- **Section 1: Hero Section:** A large, welcoming message explaining what Preem Machine is. A primary call-to-action button `[Find a Race]`.
- **Section 2: Featured Race Events:** A horizontally scrolling list of cards, each representing a `Race Event`.
  - **Card Details:** `event.name`, `event.date`, `event.location`. Each card links to the **Race Event Detail Page**.
- **Section 3: Recently Active Preems:** A list of preems that have recently received contributions to generate excitement.
  - **List Item Details:** `preem.name`, `preem.prizePool`, and the `race.name` it belongs to.

#### 4.0.2 Sign-Up / Login Flow

The flow leverages third-party sign-in providers for a streamlined user experience.

- **Step 1: Choose Sign-In Provider:** The initial screen presents a choice of providers.
  - **UI:** A clean page with buttons like `[Sign in with Google]`, `[Sign in with Apple]`, etc.
- **Step 2: Confirm & Complete Profile:** After successful authentication with the provider, the user is redirected to a one-time profile completion form.
  - **Functionality:** The system fetches available data (name, email, profile photo) from the provider and pre-fills the form.
  - **Form Fields:**
    - **Name:** (Pre-filled, but editable)
    - **Profile Photo:** (Pre-filled, with an option to upload a different one)
    - **Affiliation:** (Required user input)
    - **Race License ID:** (Required user input)
    - **Address:** (Required user input)
- **Step 3: Brief Tutorial:** After the profile is complete, the user sees a few slides explaining the concept of preems, how to contribute, and what to expect.

### 4.1 User & Organizer Profiles

#### 4.1.1 User Profile Page

This page provides a comprehensive overview of a contributor's activity and information.

- **Layout:** Two-column responsive layout.
- **Left Column (Profile Card):** Displays the user's profile information.
- **Right Column (Contribution History):** A searchable, sortable table of all past and recurring contributions.
  - **Table Columns:**
    - **Date:** `contribution.date`
    - **Race Name:** `race.name`
    - **Preem:** `preem.name`
    - **Amount:** `contribution.amount`
    - **Type:** One-time or Recurring.
    - **Status:** Confirmed, Recurring Active, Canceled.

#### 4.1.2 Race Organizer Hub & Navigation

The Race Organizer's experience is managed through a central hub or dashboard.

- **Main Organizer Dashboard (Landing Page):**
  - **Header:** "Welcome, [Organizer Name]!"
  - **Main Navigation Menu:** `Dashboard`, `Event Management`, `Payouts & Earnings`, `Profile & Settings`.
- **Event Management Screen:**
  - **Section 1: Upcoming Events:** A list of cards for each upcoming Race Event.
    - **Card Details:** `event.name`, `event.date`, `event.location`.
  - **Section 2: Past Events:** A table view of completed events.
    - **Table Columns:** Event Name, Date, Total Preems Collected, Number of Contributors.
- **Payouts & Earnings Screen:**
  - A table breaking down earnings by event.
    - **Table Columns:** `event.name`, `event.date`, Total Earnings.
- **Profile & Settings Screen:** Contains editable fields for the organizer's profile.

#### 4.1.3 Organizer's Creation & Editing Flow

A multi-step wizard for creating new events.

- **Step 1: Create Race Series:** A form with fields for `series.name`, `series.region`, `series.website`, `series.startDate`, `series.endDate`.
- **Step 2: Add Race Events:** Within a series, a form to add one or more events. Fields for `event.name`, `event.date`, `event.location`.
- **Step 3: Add Races to an Event:** Within an event, a form to add individual races. Fields for all properties under the `Race` concept, such as `race.name`, `race.category`, `race.gender`, `race.dateTime`, etc.

### 4.2 Public Race & Series Pages

#### 4.2.1 Race Series Detail Page

This page provides an overview of an entire series.

- **Section 1: Series Header:** Displays `series.name`, `series.region`, and `series.startDate` - `series.endDate`.
- **Section 2: Event List:** A chronological list of all `Race Events` within the series.
  - **List Item Details:** `event.name`, `event.date`, `event.location`. Each item links to the **Race Event Detail Page**.

#### 4.2.2 Race Event Detail Page

This page provides an overview of a single day of racing.

- **Section 1: Event Header:** Displays `event.name`, `event.date`, and `event.location`.
- **Section 2: Race Schedule:** A chronological table of all `Races` scheduled for that event.
  - **Table Columns:** `race.dateTime` (start time), `race.name`, `race.category`, `race.duration`. Each race name links to the **Race Detail Page**.

#### 4.2.3 Race Detail Page

This is the central page where users view race information and contribute to preems.

- **Section 1: Race Header:**
  - **Race Name:** `race.name` (Large Title)
  - A sub-heading linking back to the parent event: "Part of `event.name`".
  - **Status Badge:** A colored badge derived from `race.status`.
  - **Details List:** `race.dateTime`, `event.location`, `race.category`.
- **Section 2: Preems List:** A real-time table of all preems. The `preem.name` in each row links to the **Preem Detail Page**.
  - **Table Columns:**
    - **Preem:** `preem.name`
    - **Type:** Icon derived from `preem.type`.
    - **Prize Pool:** `preem.prizePool`
    - **Sponsored By:** Derived from `preem.sponsorUserRef`.
    - **Status:** Derived from `preem.status`.
    - **Action:** A `[Contribute]` button.
- **Section 3: Recent Contributions:** A live-scrolling list of contributions for this race.
  - **List Item Details:** Contributor Name (or "Anonymous"), `contribution.amount`, `preem.name`, `contribution.message`.

#### 4.2.4 Preem Detail Page

This page provides a focused view on a single preem.

- **Section 1: Preem Header:**
  - **Preem Name:** `preem.name` (Large Title).
  - A sub-heading linking back to the parent race: "Part of `race.name`".
- **Section 2: Prize Pool & Sponsor:**
  - A large, animated number displaying the `preem.prizePool`.
  - A "Sponsored by" section derived from `preem.sponsorUserRef`.
- **Section 3: Call to Action:** A prominent `[Contribute to this Preem]` button.
- **Section 4: Contribution History:** A detailed, real-time table of every contribution from `preem.contributionHistory`.
  - **Table Columns:**
    - **Contributor:** Profile photo and username (or "Anonymous") from `contribution.contributorRef`.
    - **Amount:** `contribution.amount`.
    - **Date:** `contribution.date`.
    - **Message:** `contribution.message`.

### 4.3 Contribution Flow

- **Trigger:** Clicking the `[Contribute]` button opens a modal overlay.
- **Modal UI:**
  - **Title:** "Contribute to `preem.name`"
  - **Amount Input:** A field to specify the contribution amount.
  - **Options:** Checkboxes for anonymous and recurring contributions.
  - **Action:** A `[Confirm Contribution]` button.

### 4.4 Real-Time Interfaces

#### 4.4.1 Organizer's Live Race Dashboard

The mission control for an organizer during a race.

- **Panel 1: Race Control & Status:** Displays `race.name` and a live clock.
- **Panel 2: Preem Management:** A condensed table of preems for the live race.
  - **Table Columns:** `preem.name`, `preem.prizePool`, `preem.status`.
  - **Action Column:** A `[Mark as Awarded]` button, which updates `preem.status`.
- **Panel 3: Live Contribution Feed:** A real-time feed of incoming contributions.

#### 4.4.2 Big Screen UI

The public-facing display for live events.

- **Left Column: Live Contributions:** A scrolling list of contribution "cards".
  - **Card Details:** Contributor Name, `contribution.amount`, `contribution.message`.
- **Right Column: Current Preem Focus:** A static display focused on the _next_ preem to be awarded.
  - **UI Elements:**
    - **Title:** "UP NEXT: `preem.name`"
    - **Prize Pool:** `preem.prizePool`
    - **Sponsored By:** Derived from `preem.sponsorUserRef`.

### 4.5 Administrator UI

The admin interface provides complete oversight and control.

- **Main Feature: Impersonation:** A search bar to find and impersonate a user, displaying their `user.name`.
- **Direct Management Tables:** Separate pages with tables for managing all Users, Organizers, Races, and Preems.
