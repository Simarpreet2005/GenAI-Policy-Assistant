import { MOCK_RESPONSES } from './mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockChatRequest = async (message, onStepUpdate) => {
  const normalizedMsg = message.toLowerCase();
  let responseData = MOCK_RESPONSES.default;
  
  if (normalizedMsg.includes('leave') || normalizedMsg.includes('vacation') || normalizedMsg.includes('holiday') || normalizedMsg.includes('time off')) {
    responseData = MOCK_RESPONSES.leave;
  } else if (normalizedMsg.includes('security') || normalizedMsg.includes('data') || normalizedMsg.includes('share') || normalizedMsg.includes('chatgpt') || normalizedMsg.includes('ai') || normalizedMsg.includes('code')) {
    responseData = MOCK_RESPONSES.security;
  } else if (normalizedMsg.includes('travel') || normalizedMsg.includes('expense') || normalizedMsg.includes('reimburse') || normalizedMsg.includes('flight') || normalizedMsg.includes('food') || normalizedMsg.includes('hotel')) {
    responseData = MOCK_RESPONSES.travel;
  } else if (normalizedMsg.includes('remote') || normalizedMsg.includes('home') || normalizedMsg.includes('wfh') || normalizedMsg.includes('allowance') || normalizedMsg.includes('country')) {
    responseData = MOCK_RESPONSES.remote;
  }

  // Step 0: Retrieval Agent (Total 1000ms)
  if (onStepUpdate) onStepUpdate(0, 'active', 'Connecting to policy vector index...');
  await delay(500);
  if (onStepUpdate) onStepUpdate(0, 'processing', `Searching text database and retrieving relevant documents...`);
  await delay(500);
  if (onStepUpdate) onStepUpdate(0, 'completed', `Retrieved ${responseData.citations.length} policy documents.`);

  // Step 1: Compliance Evaluation Agent (Total 1200ms)
  if (onStepUpdate) onStepUpdate(1, 'active', 'Parsing retrieved policy clauses...');
  await delay(600);
  if (onStepUpdate) onStepUpdate(1, 'processing', `Evaluating user query constraints against policy requirements...`);
  await delay(600);
  if (onStepUpdate) onStepUpdate(1, 'completed', 'Compliance rules mapped successfully.');

  // Step 2: Risk Analysis Agent (Total 1000ms)
  if (onStepUpdate) onStepUpdate(2, 'active', 'Analyzing compliance variance and risk factors...');
  await delay(500);
  if (onStepUpdate) onStepUpdate(2, 'processing', `Calculating severity levels and exception markers...`);
  await delay(500);
  if (onStepUpdate) onStepUpdate(2, 'completed', `Risk classified as ${responseData.riskLevel.toUpperCase()} with high confidence.`);

  // Step 3: Summary Generation Agent (Total 800ms)
  if (onStepUpdate) onStepUpdate(3, 'active', 'Drafting compliance response summary...');
  await delay(400);
  if (onStepUpdate) onStepUpdate(3, 'processing', 'Structuring response layout and compiling citations...');
  await delay(400);
  if (onStepUpdate) onStepUpdate(3, 'completed', 'Summary and citations formatted.');

  return responseData;
};
