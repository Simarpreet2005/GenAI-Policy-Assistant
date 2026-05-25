const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Sends a query to the live FastAPI backend deployed on Google Cloud Run.
 * Simulates sequential agent execution steps to represent the backend's LangGraph pipeline.
 *
 * @param {string} message - The student's query.
 * @param {function} onStepUpdate - Callback to notify the UI of current agent step status.
 * @param {AbortSignal} signal - Optional signal to abort the fetch request.
 */
export const mockChatRequest = async (message, onStepUpdate, signal) => {
  // Step 0: Retrieval Agent
  if (onStepUpdate) onStepUpdate(0, 'active', 'Scanning LPU placement policy database...');
  await delay(400);
  if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');

  if (onStepUpdate) onStepUpdate(0, 'processing', 'Searching semantic vector database index...');
  await delay(500);
  if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');
  if (onStepUpdate) onStepUpdate(0, 'completed', 'Relevant LPU placement policy clauses retrieved.');

  // Step 1: Risk Analysis Agent
  if (onStepUpdate) onStepUpdate(1, 'active', 'Assessing placement risk factors...');
  await delay(400);
  if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');

  if (onStepUpdate) onStepUpdate(1, 'processing', 'Evaluating potential policy exceptions or backlog restrictions...');
  await delay(500);
  if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');
  if (onStepUpdate) onStepUpdate(1, 'completed', 'Placement policy risk analysis completed.');

  // Step 2: Summary Agent
  if (onStepUpdate) onStepUpdate(2, 'active', 'Drafting student response...');
  await delay(400);
  if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');

  if (onStepUpdate) onStepUpdate(2, 'processing', 'Formatting citations and policy details...');
  await delay(450);
  if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');
  if (onStepUpdate) onStepUpdate(2, 'completed', 'Response package generated successfully.');

  // Live Cloud Run FastAPI backend execution
  const response = await fetch(
    "https://genai-policy-backend-424955378865.asia-south1.run.app/chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
      }),
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(`API returned status ${response.status}`);
  }

  const data = await response.json();

  return {
    answer: data.final_response,
    isCompliant: data.is_compliant,
    reasoning: data.reasoning
  };
};