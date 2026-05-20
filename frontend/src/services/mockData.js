export const MOCK_CHAT_RESPONSE = {
  answer: "Employees may extend leave only with prior manager approval.",
  riskLevel: "Medium",
  citations: [
    { id: "c1", title: "Leave Policy", section: "Section 4.2", page: "14", url: "#" }
  ],
  agents: [
    "Retrieval Agent completed",
    "Compliance Evaluation Agent completed",
    "Risk Analysis Agent completed",
    "Summary Generation Agent completed"
  ],
  retrievedChunks: [
    {
      id: "chunk_1",
      text: "Employees may take a maximum of 14 consecutive leave days.",
      source: "Leave Policy v2.1 - Section 4.1"
    },
    {
      id: "chunk_2",
      text: "Requests beyond 14 days require prior approval.",
      source: "Leave Policy v2.1 - Section 4.2"
    }
  ]
};
