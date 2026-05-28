'use server';

import {
  suggestThreshold,
  type SuggestThresholdInput,
  type SuggestThresholdOutput,
} from '@/ai/flows/threshold-assistant';

export async function getThresholdSuggestion(
  input: SuggestThresholdInput,
): Promise<SuggestThresholdOutput | { error: string }> {
  try {
    const result = await suggestThreshold(input);
    return result;
  } catch (error) {
    console.error('Error getting threshold suggestion:', error);
    return { error: 'Failed to get suggestion from the AI assistant.' };
  }
}
