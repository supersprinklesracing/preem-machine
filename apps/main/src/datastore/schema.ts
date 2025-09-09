import { DocumentReference, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

// Base Schemas
export const docPathSchema = z.string().refine((val) => /^[a-zA-Z0-9-_/]+$/.test(val), {
    message: "Invalid document path format",
});
export type DocPath = z.infer<typeof docPathSchema>;

const serverTimestampSchema = z.instanceof(Timestamp);
const clientTimestampSchema = z.string().datetime();

const serverDocRefSchema = <T extends z.ZodTypeAny>(schema: T) => z.instanceof(DocumentReference<z.infer<T>>);
const clientDocRefSchema = z.object({
    id: z.string(),
    path: docPathSchema,
});

// Base Doc
const baseDocSchema = z.object({
    id: z.string(),
    path: docPathSchema,
});

// Forward declaration of types
type User = z.infer<typeof UserSchema>;
type Organization = z.infer<typeof OrganizationSchema>;

// Metadata
const serverMetadataSchema = z.object({
    created: serverTimestampSchema.optional(),
    lastModified: serverTimestampSchema.optional(),
    createdBy: z.lazy(() => serverDocRefSchema(UserSchema)).optional(),
    lastModifiedBy: z.lazy(() => serverDocRefSchema(UserSchema)).optional(),
});

// UserBrief
export const UserBriefSchema = z.object({
    id: z.string(),
    path: docPathSchema,
    name: z.string().optional(),
    avatarUrl: z.string().url().optional(),
});
export type UserBrief = z.infer<typeof UserBriefSchema>;

// OrganizationBrief
export const OrganizationBriefSchema = z.object({
    id: z.string(),
    path: docPathSchema,
    name: z.string().optional(),
});
export type OrganizationBrief = z.infer<typeof OrganizationBriefSchema>;

// User
export const UserSchema = baseDocSchema.extend({
    metadata: serverMetadataSchema.optional(),
    termsAccepted: z.boolean().optional(),
    name: z.string().optional(),
    email: z.string().email().optional(),
    avatarUrl: z.string().url().optional(),
    affiliation: z.string().optional(),
    raceLicenseId: z.string().optional(),
    address: z.string().optional(),
    organizationRefs: z.array(z.lazy(() => serverDocRefSchema(OrganizationSchema))).optional(),
});

// Organization
export const OrganizationSchema = baseDocSchema.extend({
    metadata: serverMetadataSchema.optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    website: z.string().url().optional(),
    memberRefs: z.array(z.lazy(() => serverDocRefSchema(UserSchema))).optional(),
    stripe: z.object({
        connectAccountId: z.string().optional(),
        account: z.any().optional(),
    }).optional(),
});

// SeriesBrief
export const SeriesBriefSchema = z.object({
    id: z.string(),
    path: docPathSchema,
    name: z.string().optional(),
    startDate: serverTimestampSchema.optional(),
    endDate: serverTimestampSchema.optional(),
    organizationBrief: OrganizationBriefSchema,
});
export type SeriesBrief = z.infer<typeof SeriesBriefSchema>;

// Series
export const SeriesSchema = baseDocSchema.extend({
    metadata: serverMetadataSchema.optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    website: z.string().url().optional(),
    location: z.string().optional(),
    startDate: serverTimestampSchema.optional(),
    endDate: serverTimestampSchema.optional(),
    organizationBrief: OrganizationBriefSchema,
});
export type Series = z.infer<typeof SeriesSchema>;

// EventBrief
export const EventBriefSchema = z.object({
    id: z.string(),
    path: docPathSchema,
    name: z.string().optional(),
    startDate: serverTimestampSchema.optional(),
    endDate: serverTimestampSchema.optional(),
    seriesBrief: SeriesBriefSchema,
});
export type EventBrief = z.infer<typeof EventBriefSchema>;

// Event
export const EventSchema = baseDocSchema.extend({
    metadata: serverMetadataSchema.optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    website: z.string().url().optional(),
    location: z.string().optional(),
    startDate: serverTimestampSchema.optional(),
    endDate: serverTimestampSchema.optional(),
    seriesBrief: SeriesBriefSchema,
});
export type Event = z.infer<typeof EventSchema>;

// RaceBrief
export const RaceBriefSchema = z.object({
    id: z.string(),
    path: docPathSchema,
    name: z.string().optional(),
    startDate: serverTimestampSchema.optional(),
    endDate: serverTimestampSchema.optional(),
    eventBrief: EventBriefSchema,
});
export type RaceBrief = z.infer<typeof RaceBriefSchema>;

// Race
export const RaceSchema = baseDocSchema.extend({
    metadata: serverMetadataSchema.optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    website: z.string().url().optional(),
    location: z.string().optional(),
    category: z.string().optional(),
    gender: z.string().optional(),
    courseDetails: z.string().optional(),
    maxRacers: z.number().optional(),
    currentRacers: z.number().optional(),
    ageCategory: z.string().optional(),
    duration: z.string().optional(),
    laps: z.number().optional(),
    podiums: z.number().optional(),
    sponsors: z.array(z.string()).optional(),
    startDate: serverTimestampSchema.optional(),
    endDate: serverTimestampSchema.optional(),
    eventBrief: EventBriefSchema,
});
export type Race = z.infer<typeof RaceSchema>;

// PreemBrief
export const PreemBriefSchema = z.object({
    id: z.string(),
    path: docPathSchema,
    name: z.string().optional(),
    raceBrief: RaceBriefSchema,
});
export type PreemBrief = z.infer<typeof PreemBriefSchema>;

// Preem
export const PreemSchema = baseDocSchema.extend({
    metadata: serverMetadataSchema.optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    type: z.enum(['Pooled', 'One-Shot']).optional(),
    status: z.enum(['Open', 'Minimum Met', 'Awarded']).optional(),
    prizePool: z.number().optional(),
    timeLimit: serverTimestampSchema.optional(),
    minimumThreshold: z.number().optional(),
    raceBrief: RaceBriefSchema,
});
export type Preem = z.infer<typeof PreemSchema>;

// ContributionBrief
export const ContributionBriefSchema = z.object({
    id: z.string(),
    path: docPathSchema,
    amount: z.number().optional(),
    date: serverTimestampSchema.optional(),
    message: z.string().optional(),
    preemBrief: PreemBriefSchema,
});
export type ContributionBrief = z.infer<typeof ContributionBriefSchema>;

// Contribution
export const ContributionSchema = baseDocSchema.extend({
    metadata: serverMetadataSchema.optional(),
    status: z.enum(['pending', 'confirmed', 'failed']).optional(),
    contributor: UserBriefSchema.optional(),
    amount: z.number().optional(),
    date: serverTimestampSchema.optional(),
    message: z.string().optional(),
    isAnonymous: z.boolean().optional(),
    stripe: z.object({
        paymentIntent: z.any(),
    }).optional(),
    preemBrief: PreemBriefSchema,
});
export type Contribution = z.infer<typeof ContributionSchema>;
