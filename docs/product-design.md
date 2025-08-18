# Preem Machine: Product Design

## 1. Overview

**Preem Machine** is a specialized software platform designed to modernize and streamline the process of cash prize contributions for community bike races. The system provides a centralized hub for race organizers to manage events and for the cycling community to contribute to prize pools, known as "preems."

The primary goal is to enhance engagement and financial support for local racing events by creating a transparent, real-time, and easy-to-use system for managing cash prizes.

## 2. Core Concepts

The platform is built around six core entities: Organizations, Series, Events, Races, Preems, and Users. These concepts represent the fundamental data models of the application.

### 2.1 Organization

An Organization represents a club, team, or entity that manages race events. It is the top-level container for organizers and their series.

- **Fields:**
  - `id`: A unique identifier for the organization.
  - `name`: The official name of the organization.
  - `members`: A list of `userRef`s for all organizers who are part of this organization.

### 2.2 Series

A Series is a collection of related race events, owned by a single organization.

- **Fields:**
  - `id`: A unique identifier for the series.
  - `organizationRef`: A reference to the Organization that owns the series.
  - `name`: The official name of the race series (e.g., "Summer Criterium Series").
  - `region`: The general geographic area where the series takes place (e.g., "Northern California").
  - `location`: The primary venue for the series, if one exists (e.g., "Golden Gate Park").
  - `website`: An optional URL to the organizer's official website for the series.
  - `startDate`: The date the first event in the series begins.
  - `endDate`: The date the last event in the series ends.

### 2.3 Event

A Event represents a single day or multi-day event of racing within a series. An event can contain multiple individual races.

- **Fields:**
  - `id`: A unique identifier for the event.
  - `seriesRef`: A reference to the parent Series.
  - `name`: The name of the event day (e.g., "Weekend Omnium", "Circuit Race Day").
  - `startDate`: The start date and time of the event.
  - `endDate`: The end date and time of the event.
  - `location`: The location for that day's events.
  - `website`: An optional URL for the specific race event day.

### 2.4 Race

A Race is a single competitive heat or competition that belongs to a Event.

- **Fields:**
  - `id`: A unique identifier for the race.
  - `eventRef`: A reference to the parent Event.
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
  - `startDate`: The specific start date and time of the race.
  - `endDate`: The specific end date and time of the race.

### 2.5 Preem (Prime)

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

### 2.6 User

A User is an individual who has an account on the platform. Their role determines their permissions.

- **Fields:**
  - `id`: A unique identifier for the user.
  - `role`: The user's role in the system ("Contributor", "Organizer", "Admin").
  - `organizationRefs`: A list of references to the Organizations the user belongs to (if their role is "Organizer").
  - `name`: The user's full name.
  - `email`: The user's email address.
  - `profilePhotoUrl`: URL for their profile photo.
  - `affiliation`: The user's club or team.
  - `raceLicenseId`: The user's official race license ID.
  - `address`: The user's physical address.

## 3. User Roles & Permissions

The platform supports three distinct user roles: **User (Contributor)**, **Race Organizer**, and **Administrator**.

- **Race Organizer:** An organizer's ability to create or modify events is tied to their membership in an `Organization`. Any organizer can manage any series/event/race belonging to an organization they are a member of.

## 4. UI & Feature Breakdown

This section details the user interface and functionality for each major component of the application, referencing the data model fields from Section 2.

### 4.1 Public & Core Pages

#### 4.1.1 Public Home Page

This is the landing page for all visitors, designed for discovery.

- **Section 1: Hero Section:** A large, welcoming message explaining what Preem Machine is. A primary call-to-action button `[Find a Race]`.
- **Section 2: Featured Events:** A horizontally scrolling list of cards, each representing a `Event`.
  - **Card Details:** `event.name`, `event.startDate`, `event.location`. Each card links to the **Event Detail Page**.
- **Section 3: Recently Active Preems:** A list of preems that have recently received contributions to generate excitement.
  - **List Item Details:** `preem.name`, `preem.prizePool`, and the `race.name` it belongs to.

#### 4.1.2 Sign-Up / Login Flow

The flow leverages third-party sign-in providers for a streamlined user experience.

- **Step 1: Choose Sign-In Provider:** The initial screen presents a choice of providers.
  - **UI:** A clean page with buttons like `[Sign in with Google]`, `[Sign in with Apple]`, etc.
- **Step 2: Confirm & Complete Profile:** After successful authentication, the user is redirected to a one-time profile completion form.
  - **Functionality:** The system fetches available data (name, email, profile photo) from the provider and pre-fills the form.
  - **Form Fields:**
    - **Name:** (Pre-filled, but editable)
    - **Profile Photo:** (Pre-filled, with an option to upload a different one)
    - **Affiliation:** (Required user input)
    - **Race License ID:** (Required user input)
    - **Address:** (Required user input)
- **Step 3 (For Organizers): Join or Create an Organization:** If a user wishes to be an organizer, they must be part of an organization.
  - **UI:** A new screen asking "Do you have an invitation code?"
  - **If Yes:** The user enters a code to join an existing organization.
  - **If No:** The user is prompted to create a new organization by providing an `organization.name`. Upon creation, their role is set to "Organizer" and they are added to the new organization's `members` list.
- **Step 4: Brief Tutorial:** After the profile is complete, the user sees a few slides explaining the concept of preems, how to contribute, and what to expect.

### 4.2 User & Organizer Public Profiles

#### 4.2.1 User Public Profile Page

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

#### 4.2.1 Organizer Public Profile Page

TODO

### 4.3 Race Organizer Hub and Navigation

The Race Organizer's experience is managed through a central hub or dashboard.

#### 4.3.1 Hub Structure

#### 4.3.2 Organizer Management & Editing Pages

These pages allow organizers to modify details after initial creation.

- **Manage Organization Page:**
  - **Access:** Via the `[Manage]` button on the `My Organizations` screen.
  - **UI:** A page showing the `organization.name`. It includes a list of current members (`organization.members`) and an `[Invite New Member]` button, which generates a unique invitation code.
- **Edit Series Page:**
  - **Access:** Via an `[Edit]` button on a Series management page.
  - **UI:** A form pre-populated with all fields from the `Series` concept. Includes a `[Save Changes]` button and a "Danger Zone" with a `[Delete Series]` button.
- **Edit Event Page:**
  - **Access:** Via the `[Edit]` button on an Event card in the `Event Management Screen`.
  - **UI:** A form pre-populated with all fields from the `Event` concept. Includes a `[Save Changes]` button and a "Danger Zone" with a `[Delete Event]` button. Also includes a list of all associated races, each with its own `[Edit]` button.
- **Edit Race Page:**
  - **Access:** Via the `[Edit]` button next to a race on the `Edit Event Page`.
  - **UI:** A form pre-populated with all fields from the `Race` concept. Includes a `[Save Changes]` button and a "Danger Zone" with a `[Delete Race]` button.

#### 4.3.3 Organizer's Creation Flow

The creation flow for organizers is a sequential, multi-step wizard.

- **Step 1: Create Series:** An organizer first creates a series. This form includes fields for `series.name`, `series.region`, `series.website`, `series.startDate`, `series.endDate`. They must also select which of their `Organizations` will own this series.
- **Step 2: Add Events:** After creating the series, the organizer is taken to the Series management page where they can click `[Add Event]` to open a form for `event` fields (with `seriesRef` pre-populated).
- **Step 3: Add Races to an Event:** From an Event management page, the organizer can `[Add Race]` to open a form for all fields under the `Race` concept.

### 4.4 Public Race & Series Pages

#### 4.4.1 Series Detail Page

This page provides an overview of an entire series.

- **Section 1: Series Header:** Displays `series.name`, `series.region`, and `series.startDate` - `series.endDate`.
- **Section 2: Event List:** A chronological list of all `Events` within the series.
  - **List Item Details:** `event.name`, `event.startDate`, `event.location`. Each item links to the **Event Detail Page**.

#### 4.4.2 Event Detail Page

This page provides an overview of a single day of racing.

- **Section 1: Event Header:** Displays `event.name`, `event.startDate`, and `event.location`. A sub-heading links back to the parent series: "Part of `series.name`".
- **Section 2: Race Schedule:** A chronological table of all `Races` scheduled for that event.
  - **Table Columns:** `race.startDate` (start time), `race.name`, `race.category`, `race.duration`. Each race name links to the **Race Detail Page**.

#### 4.4.3 Race Detail Page

This is the central page where users view race information and contribute to preems.

- **Section 1: Race Header:**
  - **Race Name:** `race.name` (Large Title)
  - A sub-heading linking back to the parent event: "Part of `event.name`".
  - **Status Badge:** A colored badge derived from `race.status`.
  - **Details List:** `race.startDate`, `event.location`, `race.category`.
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

#### 4.4.4 Preem Detail Page

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

##### 4.4.4.1 Contribution Flow

- **Trigger:** Clicking the `[Contribute]` button opens a modal overlay.
- **Modal UI:**
  - **Title:** "Contribute to `preem.name`"
  - **Amount Input:** A field to specify the contribution amount.
  - **Options:** Checkboxes for anonymous and recurring contributions.
  - **Action:** A `[Confirm Contribution]` button.

### 4.5 Contribution Pages

#### 4.5.1 Quick Contribute Page

A standalone, mobile-first page designed for rapid, on-site contributions via a QR code. This page contributes to the first available "Pooled Preem" for a given race.

- **Layout:** A single-column, simplified view.
- **Header:** "Contribute to `race.name`".
- **Contribution Form:**
  - A set of large buttons with suggested contribution amounts (e.g., `$5`, `$10`, `$20`).
  - An "Other Amount" button that reveals a simple number input field.
- **Payment:**
  - If the user is logged in, it will show their default payment method.
  - If the user is not logged in, it will default to fast payment options like Apple Pay or Google Pay.
- **Submit Button:** A large, prominent `[Contribute Now]` button.

### 4.6 Real-Time Interfaces

#### 4.6.1 Organizer's Live Race Dashboard

The mission control for an organizer during a race.

- **Panel 1: Race Control & Status:** Displays `race.name` and a live clock. Includes a `[Get Quick Contribute Link/QR]` button that opens a modal displaying a QR code linking to the **Quick Contribute Page** for that race.
- **Panel 2: Preem Management:** A condensed table of preems for the live race.
  - **Table Columns:** `preem.name`, `preem.prizePool`, `preem.status`.
  - **Action Column:** A `[Mark as Awarded]` button, which updates `preem.status`.
- **Panel 3: Live Contribution Feed:** A real-time feed of incoming contributions.

#### 4.6.2 Big Screen UI

The public-facing display for live events.

- **Left Column: Live Contributions:** A scrolling list of contribution "cards".
  - **Card Details:** Contributor Name, `contribution.amount`, `contribution.message`.
- **Right Column: Current Preem Focus:** A static display focused on the _next_ preem to be awarded.
  - **UI Elements:**
    - **Title:** "UP NEXT: `preem.name`"
    - **Prize Pool:** `preem.prizePool`
    - **Sponsored By:** Derived from `preem.sponsorUserRef`.

### 4.7 Administrator UI

The admin interface provides complete oversight and control.

- **Main Feature: Impersonation:** A search bar to find and impersonate a user, displaying their `user.name`.
- **Direct Management Tables:** Separate pages with tables for managing all Users, Organizations, Races, and Preems.
  - **User Management:** In the table of all users, an admin can change a user's `role` via a dropdown in the user's row with the options "Contributor", "Organizer", and "Admin".

----

#### 4.1.3 Organizer's Creation Flow

The creation flow for organizers is a sequential, multi-step wizard.

- **Step 1: Create Series:** An organizer first creates a series. This form includes fields for `series.name`, `series.region`, `series.website`, `series.startDate`, `series.endDate`. They must also select which of their `Organizations` will own this series.
- **Step 2: Create Event:** An organizer creates an event. This form includes fields for `event.name`, `event.region`, `event.website`, `event.startDate`, `event.endDate`.
- **Step 3: Add Events:** After creating the event, the organizer is taken to the event management page where they can click `[Add Event]` to open a form for `event` fields (with `eventRef` pre-populated).

### 6.1 Public Race & Series Pages

#### 6.1.1 Series Detail Page

This page provides an overview of an entire series.

- **Section 1: Series Header:** Displays `series.name`, `series.region`, and `series.startDate` - `series.endDate`.
- **Section 2: Event List:** A chronological list of all `Events` within the series.
  - **List Item Details:** `event.name`, `event.startDate`, `event.location`. Each item links to the **Event Detail Page**.

#### 6.1.2 Event Detail Page

This page provides an overview of a single day of racing.

- **Section 1: Event Header:** Displays `event.name`, `event.startDate`, and `event.location`. A sub-heading links back to the parent series: "Part of `series.name`".
- **Section 2: Race Schedule:** A chronological table of all `Races` scheduled for that event.
  - **Table Columns:** `race.startDate` (start time), `race.name`, `race.category`, `race.duration`. Each race name links to the **Race Detail Page**.

#### 6.1.3 Race Detail Page

This is the central page where users view race information and contribute to preems.

- **Section 1: Race Header:**
  - **Race Name:** `race.name` (Large Title)
  - A sub-heading linking back to the parent event: "Part of `event.name`".
  - **Status Badge:** A colored badge derived from `race.status`.
  - **Details List:** `race.startDate`, `event.location`, `race.category`.
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

#### 6.1.4 Preem Detail Page

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

#### 6.1.5 Quick Contribute Page

A standalone, mobile-first page designed for rapid, on-site contributions via a QR code. This page contributes to the first available "Pooled Preem" for a given race.

- **Layout:** A single-column, simplified view.
- **Header:** "Contribute to `race.name`".
- **Contribution Form:**
  - A set of large buttons with suggested contribution amounts (e.g., `$5`, `$10`, `$20`).
  - An "Other Amount" button that reveals a simple number input field.
- **Payment:**
  - If the user is logged in, it will show their default payment method.
  - If the user is not logged in, it will default to fast payment options like Apple Pay or Google Pay.
- **Submit Button:** A large, prominent `[Contribute Now]` button.

### 4.3 Contribution Flow

- **Trigger:** Clicking the `[Contribute]` button opens a modal overlay.
- **Modal UI:**
  - **Title:** "Contribute to `preem.name`"
  - **Amount Input:** A field to specify the contribution amount.
  - **Options:** Checkboxes for anonymous and recurring contributions.
  - **Action:** A `[Confirm Contribution]` button.

### 4.4 Real-Time Interfaces

#### 4.4.1 Organizer's Live Race Dashboard

The mission control for an organizer during an Event.

- **Panel 1: Race Control & Status:** Displays the current `race.name` and a live clock. Includes a `[Get Quick Contribute Link/QR]` button that opens a modal displaying a QR code linking to the **Quick Contribute Page** for that race.
- **Panel 1.1: Preem Management:** A condensed table of preems for the live race.
  - **Table Columns:** `preem.name`, `preem.prizePool`, `preem.status`.
  - **Action Column:** A `[Mark as Awarded]` button, which updates `preem.status`.
- **Panel 2: Live Contribution Feed:** A real-time feed of incoming contributions for the event
- **Panel 3: All Races Panel:** Displays relevant information about other races at the event and actions that can take place.

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
- **Direct Management Tables:** Separate pages with tables for managing all Users, Organizations, Races, and Preems.
  - **User Management:** In the table of all users, an admin can change a user's `role` via a dropdown in the user's row with the options "Contributor", "Organizer", and "Admin".
