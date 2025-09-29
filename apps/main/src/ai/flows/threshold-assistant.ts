'use server';
/**
 * @fileOverview An AI-powered tool to assist race organizers in determining the optimal minimum threshold for preems.
 *
 * - suggestThreshold - A function that suggests a minimum threshold for preems based on race data.
 * - SuggestThresholdInput - The input type for the suggestThreshold function.
 * - SuggestThresholdOutput - The return type for the suggestThreshold function.
 */

import { z } from 'genkit';

import { ai } from '@/ai/genkit';

const SuggestThresholdInputSchema = z.object({
  raceId: z
    .string()
    .describe('The ID of the race for which to suggest a threshold.'),
  averageContributionAmount: z
    .number()
    .describe('The average contribution amount for previous races.'),
  numberOfContributors: z
    .number()
    .describe('The number of contributors for previous races.'),
  preemFrequency: z.string().describe(
    'The desired frequency of preem awards (e.g., frequently, occasionally, rarely).',
    /*
     *  Options:
     *  - "frequently": Award preems often to keep racers and contributors engaged.
     *  - "occasionally": Award preems at moderate intervals to balance excitement and prize pool size.
     *  - "rarely": Award preems infrequently to build up a larger prize pool for significant achievements.
     */
  ),
  historicalWeatherData: z
    .string()
    .describe(
      'The historical weather data for the race location to consider any impact of weather.',
    ),
});
export type SuggestThresholdInput = z.infer<typeof SuggestThresholdInputSchema>;

const SuggestThresholdOutputSchema = z.object({
  suggestedThreshold: z
    .number()
    .describe(
      'The suggested minimum threshold amount for the preem, based on the input data.',
    ),
  reasoning: z
    .string()
    .describe('The reasoning behind the suggested threshold amount.'),
});
export type SuggestThresholdOutput = z.infer<
  typeof SuggestThresholdOutputSchema
>;

export async function suggestThreshold(
  input: SuggestThresholdInput,
): Promise<SuggestThresholdOutput> {
  return suggestThresholdFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestThresholdPrompt',
  input: { schema: SuggestThresholdInputSchema },
  output: { schema: SuggestThresholdOutputSchema },
  prompt: `You are an AI assistant helping race organizers determine the optimal minimum threshold for preems (cash prizes during a race).  Consider the following factors to suggest a threshold that maximizes the chance of being met while still allowing prizes to be awarded frequently.

Race ID: {{raceId}}
Average Contribution Amount: {{averageContributionAmount}}
Number of Contributors: {{numberOfContributors}}
Desired Preem Frequency: {{preemFrequency}}
Historical Weather Data: {{historicalWeatherData}}

Based on these factors, suggest a minimum threshold amount and explain your reasoning.

Here is the output format:
{
  "suggestedThreshold": "The suggested minimum threshold amount",
  "reasoning": "Explanation of why this threshold amount was selected"
}
`,
});

const suggestThresholdFlow = ai.defineFlow(
  {
    name: 'suggestThresholdFlow',
    inputSchema: SuggestThresholdInputSchema,
    outputSchema: SuggestThresholdOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI model did not return a response.');
    }
    return output;
  },
);
