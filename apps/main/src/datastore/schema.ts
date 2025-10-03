/**
 * This schema must remain React-serializable: https://react.dev/reference/rsc/use-server#serializable-parameters-and-return-values
 */
import { z } from 'zod';

// Base Schemas
export const docPathSchema = z
  .string()
  .refine((val) => /^[a-zA-Z0-9-_/]+$/.test(val), {
    message: 'Invalid document path format',
  });
export type DocPath = z.infer<typeof docPathSchema>;

const docRefSchema = z.object({
  id: z.string(),
  path: docPathSchema,
});

// Metadata
const MetadataSchema = z.object({
  created: z.date().optional(),
  lastModified: z.date().optional(),
  createdBy: docRefSchema.optional(),
  lastModifiedBy: docRefSchema.optional(),
});
export type Metadata = z.infer<typeof MetadataSchema>;

// Base Doc
const baseDocSchema = z.object({
  id: z.string(),
  path: docPathSchema,
  metadata: MetadataSchema.optional(),
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
  termsAccepted: z.boolean().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().optional(),
  affiliation: z.string().optional(),
  raceLicenseId: z.string().optional(),
  address: z.string().optional(),
  organizationRefs: z.array(docRefSchema).optional(),
});
export type User = z.infer<typeof UserSchema>;

// Invite
export const InviteSchema = baseDocSchema
  .extend({
    email: z.string().email().optional(),
    uid: z.string().optional(),
    organizationRefs: z.array(docRefSchema),
    status: z.enum(['pending', 'accepted']).default('pending'),
  })
  .refine((data) => data.email || data.uid, {
    message: 'Either email or uid must be provided',
  });
export type Invite = z.infer<typeof InviteSchema>;

// Organization
export const OrganizationSchema = baseDocSchema.extend({
  name: z.string().min(1, 'Organization name is required'),
  description: z.string().optional(),
  website: z.string().url().optional(),
  memberRefs: z.array(docRefSchema).optional(),
  stripe: z
    .object({
      connectAccountId: z.string().optional(),
      account: z.any().optional(),
    })
    .optional(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

// SeriesBrief
export const SeriesBriefSchema = z.object({
  id: z.string(),
  path: docPathSchema,
  name: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  timezone: z.string().optional(),
  organizationBrief: OrganizationBriefSchema,
});
export type SeriesBrief = z.infer<typeof SeriesBriefSchema>;

// Series
export const SeriesSchema = baseDocSchema.extend({
  name: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url().optional(),
  location: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  timezone: z.string().optional(),
  organizationBrief: OrganizationBriefSchema,
});
export type Series = z.infer<typeof SeriesSchema>;

// EventBrief
export const EventBriefSchema = z.object({
  id: z.string(),
  path: docPathSchema,
  name: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  timezone: z.string().optional(),
  seriesBrief: SeriesBriefSchema,
});
export type EventBrief = z.infer<typeof EventBriefSchema>;

// Event
export const EventSchema = baseDocSchema.extend({
  name: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url().optional(),
  location: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  timezone: z.string().optional(),
  seriesBrief: SeriesBriefSchema,
});
export type Event = z.infer<typeof EventSchema>;

// RaceBrief
export const RaceBriefSchema = z.object({
  id: z.string(),
  path: docPathSchema,
  name: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  timezone: z.string().optional(),
  eventBrief: EventBriefSchema,
});
export type RaceBrief = z.infer<typeof RaceBriefSchema>;

// Race
export const RaceSchema = baseDocSchema.extend({
  name: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
  gender: z.string().optional(),
  courseDetails: z.string().optional(),
  courseLink: z.string().url().optional(),
  maxRacers: z.number().optional(),
  currentRacers: z.number().optional(),
  duration: z.string().optional(),
  laps: z.number().optional(),
  podiums: z.number().optional(),
  sponsors: z.array(z.string()).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  timezone: z.string().optional(),
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
  name: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(['Pooled', 'One-Shot']).optional(),
  status: z.enum(['Open', 'Minimum Met', 'Awarded']).or(z.string()).optional(),
  prizePool: z.number().optional(),
  timeLimit: z.date().optional(),
  minimumThreshold: z.number().optional(),
  raceBrief: RaceBriefSchema,
});
export type Preem = z.infer<typeof PreemSchema>;

// ContributionBrief
export const ContributionBriefSchema = z.object({
  id: z.string(),
  path: docPathSchema,
  amount: z.number().optional(),
  date: z.any().optional(),
  message: z.string().optional(),
  preemBrief: PreemBriefSchema,
});
export type ContributionBrief = z.infer<typeof ContributionBriefSchema>;

// Contribution
export const ContributionSchema = baseDocSchema.extend({
  status: z.enum(['pending', 'confirmed', 'failed']).or(z.string()).optional(),
  contributor: UserBriefSchema.optional(),
  amount: z.number().optional(),
  date: z.any().optional(),
  message: z.string().optional(),
  isAnonymous: z.boolean().optional(),
  stripe: z
    .object({
      paymentIntent: z.any(),
    })
    .optional(),
  preemBrief: PreemBriefSchema,
});
export type Contribution = z.infer<typeof ContributionSchema>;
