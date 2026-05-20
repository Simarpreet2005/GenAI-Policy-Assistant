import { MOCK_CHAT_RESPONSE } from './mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockChatRequest = async (message, onStepComplete) => {
  // Step 0: Retrieval Agent (800ms)
  await delay(800);
  if (onStepComplete) onStepComplete(0);

  // Step 1: Compliance Evaluation Agent (1200ms)
  await delay(1200);
  if (onStepComplete) onStepComplete(1);

  // Step 2: Risk Analysis Agent (900ms)
  await delay(900);
  if (onStepComplete) onStepComplete(2);

  // Step 3: Summary Generation Agent (700ms)
  await delay(700);
  if (onStepComplete) onStepComplete(3);

  // Return the final mock response
  return {
    ...MOCK_CHAT_RESPONSE,
    // Add dynamic elements if needed, though for now we just return the static mock
  };
};
