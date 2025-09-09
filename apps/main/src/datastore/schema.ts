import { z } from 'zod';

// Base Schemas
export const docPathSchema = z.string().refine((val) => /^[a-zA-Z0-9-_/]+$/.test(val), {
    message: "Invalid document path format",
});
export type DocPath = z.infer<typeof docPathSchema>;

const serverTimestampSchema = z.object({
    seconds: z.number(),
    nanoseconds: z.number(),
  });
const clientTimestampSchema = z.string().datetime();

const serverDocRefSchema = z.object({
    id: z.string(),
    path: z.string(),
  });
const clientDocRefSchema = z.object({
    id: z.string(),
    path: docPathSchema,
});

// Base Doc
const baseDocSchema = z.object({
    id: z.string(),
    path: docPathSchema,
});

// Metadata
const ServerMetadataSchema = z.object({
    created: serverTimestampSchema.optional(),
    lastModified: serverTimestampSchema.optional(),
    createdBy: z.lazy(() => serverDocRefSchema).optional(),
    lastModifiedBy: z.lazy(() => serverDocRefSchema).optional(),
});

const ClientMetadataSchema = z.object({
    created: clientTimestampSchema.optional(),
    lastModified: clientTimestampSchema.optional(),
    createdBy: clientDocRefSchema.optional(),
    lastModifiedBy: clientDocRefSchema.optional(),
});


// UserBrief
export const ServerUserBriefSchema = z.object({
    id: z.string(),
    path: docPathSchema,
    name: z.string().optional(),
    avatarUrl: z.string().url().optional(),
});
export const ClientUserBriefSchema = ServerUserBriefSchema;
export type UserBrief = z.infer<typeof ClientUserBriefSchema>;


// OrganizationBrief
export const ServerOrganizationBriefSchema = z.object({
    id: z.string(),
    path: docPathSchema,
    name: z.string().optional(),
});
export const ClientOrganizationBriefSchema = ServerOrganizationBriefSchema;
export type OrganizationBrief = z.infer<typeof ClientOrganizationBriefSchema>;


// User
export const ServerUserSchema = baseDocSchema.extend({
    metadata: ServerMetadataSchema.optional(),
    termsAccepted: z.boolean().optional(),
    name: z.string().optional(),
    email: z.string().email().optional(),
    avatarUrl: z.string().url().optional(),
    affiliation: z.string().optional(),
    raceLicenseId: z.string().optional(),
    address: z.string().optional(),
    organizationRefs: z.array(z.lazy(() => serverDocRefSchema)).optional(),
});
export const ClientUserSchema = baseDocSchema.extend({
    metadata: ClientMetadataSchema.optional(),
    termsAccepted: z.boolean().optional(),
    name: z.string().optional(),
    email: z.string().email().optional(),
    avatarUrl: z.string().url().optional(),
    affiliation: z.string().optional(),
    raceLicenseId: z.string().optional(),
    address: z.string().optional(),
    organizationRefs: z.array(clientDocRefSchema).optional(),
});
export type User = z.infer<typeof ClientUserSchema>;


// Organization
export const ServerOrganizationSchema = baseDocSchema.extend({
    metadata: ServerMetadataSchema.optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    website: z.string().url().optional(),
    memberRefs: z.array(z.lazy(() => serverDocRefSchema)).optional(),
    stripe: z.object({
        connectAccountId: z.string().optional(),
        account: z.any().optional(),
    }).optional(),
});
export const ClientOrganizationSchema = baseDocSchema.extend({
    metadata: ClientMetadataSchema.optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    website: z.string().url().optional(),
    memberRefs: z.array(clientDocRefSchema).optional(),
    stripe: z.object({
        connectAccountId: z.string().optional(),
        account: z.any().optional(),
    }).optional(),
});
export type Organization = z.infer<typeof ClientOrganizationSchema>;


// SeriesBrief
export const ServerSeriesBriefSchema = z.object({
    id: z.string(),
    path: docPathSchema,
    name: z.string().optional(),
    startDate: serverTimestampSchema.optional(),
    endDate: serverTimestampSchema.optional(),
    organizationBrief: ServerOrganizationBriefSchema,
});
export const ClientSeriesBriefSchema = z.object({
    id: z.string(),
    path: docPathSchema,
    name: z.string().optional(),
    startDate: clientTimestampSchema.optional(),
    endDate: clientTimestampSchema.optional(),
    organizationBrief: ClientOrganizationBriefSchema,
});
export type SeriesBrief = z.infer<typeof ClientSeriesBriefSchema>;


// Series
export const ServerSeriesSchema = baseDocSchema.extend({
    metadata: ServerMetadataSchema.optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    website: z.string().url().optional(),
    location: z.string().optional(),
    startDate: serverTimestampSchema.optional(),
    endDate: serverTimestampSchema.optional(),
    organizationBrief: ServerOrganizationBriefSchema,
});
export const ClientSeriesSchema = baseDocSchema.extend({
    metadata: ClientMetadataSchema.optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    website: z.string().url().optional(),
    location: z.string().optional(),
    startDate: clientTimestampSchema.optional(),
    endDate: clientTimestampSchema.optional(),
    organizationBrief: ClientOrganizationBriefSchema,
});
export type Series = z.infer<typeof ClientSeriesSchema>;


// EventBrief
export const ServerEventBriefSchema = z.object({
    id: z.string(),
    path: docPathSchema,
    name: z.string().optional(),
    startDate: serverTimestampSchema.optional(),
    endDate: serverTimestampSchema.optional(),
    seriesBrief: ServerSeriesBriefSchema,
});
export const ClientEventBriefSchema = z.object({
    id: z.string(),
    path: docPathSchema,
    name: z.string().optional(),
    startDate: clientTimestampSchema.optional(),
    endDate: clientTimestampSchema.optional(),
    seriesBrief: ClientSeriesBriefSchema,
});
export type EventBrief = z.infer<typeof ClientEventBriefSchema>;


// Event
export const ServerEventSchema = baseDocSchema.extend({
    metadata: ServerMetadataSchema.optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    website: z.string().url().optional(),
    location: z.string().optional(),
    startDate: serverTimestampSchema.optional(),
    endDate: serverTimestampSchema.optional(),
    seriesBrief: ServerSeriesBriefSchema,
});
export const ClientEventSchema = baseDocSchema.extend({
    metadata: ClientMetadataSchema.optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    website: z.string().url().optional(),
    location: z.string().optional(),
    startDate: clientTimestampSchema.optional(),
    endDate: clientTimestampSchema.optional(),
    seriesBrief: ClientSeriesBriefSchema,
});
export type Event = z.infer<typeof ClientEventSchema>;


// RaceBrief
export const ServerRaceBriefSchema = z.object({
    id: z.string(),
    path: docPathSchema,
    name: z.string().optional(),
    startDate: serverTimestampSchema.optional(),
    endDate: serverTimestampSchema.optional(),
    eventBrief: ServerEventBriefSchema,
});
export const ClientRaceBriefSchema = z.object({
    id: z.string(),
    path: docPathSchema,
    name: z.string().optional(),
    startDate: clientTimestampSchema.optional(),
    endDate: clientTimestampSchema.optional(),
    eventBrief: ClientEventBriefSchema,
});
export type RaceBrief = z.infer<typeof ClientRaceBriefSchema>;


// Race
export const ServerRaceSchema = baseDocSchema.extend({
    metadata: ServerMetadataSchema.optional(),
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
    eventBrief: ServerEventBriefSchema,
});
export const ClientRaceSchema = baseDocSchema.extend({
    metadata: ClientMetadataSchema.optional(),
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
    startDate: clientTimestampSchema.optional(),
    endDate: clientTimestampSchema.optional(),
    eventBrief: ClientEventBriefSchema,
});
export type Race = z.infer<typeof ClientRaceSchema>;


// PreemBrief
export const ServerPreemBriefSchema = z.object({
    id: z.string(),
    path: docPathSchema,
    name: z.string().optional(),
    raceBrief: ServerRaceBriefSchema,
});
export const ClientPreemBriefSchema = z.object({
    id: z.string(),
    path: docPathSchema,
    name: z.string().optional(),
    raceBrief: ClientRaceBriefSchema,
});
export type PreemBrief = z.infer<typeof ClientPreemBriefSchema>;


// Preem
export const ServerPreemSchema = baseDocSchema.extend({
    metadata: ServerMetadataSchema.optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    type: z.enum(['Pooled', 'One-Shot']).optional(),
    status: z.enum(['Open', 'Minimum Met', 'Awarded']).optional(),
    prizePool: z.number().optional(),
    timeLimit: serverTimestampSchema.optional(),
    minimumThreshold: z.number().optional(),
    raceBrief: ServerRaceBriefSchema,
});
export const ClientPreemSchema = baseDocSchema.extend({
    metadata: ClientMetadataSchema.optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    type: z.enum(['Pooled', 'One-Shot']).optional(),
    status: z.enum(['Open', 'Minimum Met', 'Awarded']).optional(),
    prizePool: z.number().optional(),
    timeLimit: clientTimestampSchema.optional(),
    minimumThreshold: z.number().optional(),
    raceBrief: ClientRaceBriefSchema,
});
export type Preem = z.infer<typeof ClientPreemSchema>;


// ContributionBrief
export const ServerContributionBriefSchema = z.object({
    id: z.string(),
    path: docPathSchema,
    amount: z.number().optional(),
    date: serverTimestampSchema.optional(),
    message: z.string().optional(),
    preemBrief: ServerPreemBriefSchema,
});
export const ClientContributionBriefSchema = z.object({
    id: z.string(),
    path: docPathSchema,
    amount: z.number().optional(),
    date: clientTimestampSchema.optional(),
    message: z.string().optional(),
    preemBrief: ClientPreemBriefSchema,
});
export type ContributionBrief = z.infer<typeof ClientContributionBriefSchema>;


// Contribution
export const ServerContributionSchema = baseDocSchema.extend({
    metadata: ServerMetadataSchema.optional(),
    status: z.enum(['pending', 'confirmed', 'failed']).optional(),
    contributor: ServerUserBriefSchema.optional(),
    amount: z.number().optional(),
    date: serverTimestampSchema.optional(),
    message: z.string().optional(),
    isAnonymous: z.boolean().optional(),
    stripe: z.object({
        paymentIntent: z.any(),
    }).optional(),
    preemBrief: ServerPreemBriefSchema,
});
export const ClientContributionSchema = baseDocSchema.extend({
    metadata: ClientMetadataSchema.optional(),
    status: z.enum(['pending', 'confirmed', 'failed']).optional(),
    contributor: ClientUserBriefSchema.optional(),
    amount: z.number().optional(),
    date: clientTimestampSchema.optional(),
    message: z.string().optional(),
    isAnonymous: z.boolean().optional(),
    stripe: z.object({
        paymentIntent: z.any(),
    }).optional(),
    preemBrief: ClientPreemBriefSchema,
});
export type Contribution = z.infer<typeof ClientContributionSchema>;
