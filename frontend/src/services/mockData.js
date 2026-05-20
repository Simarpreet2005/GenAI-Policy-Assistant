export const MOCK_RESPONSES = {
  leave: {
    answer: "According to the ComplyAI Leave Policy, employees are allowed a maximum of 14 consecutive calendar days of standard paid leave. Any leave extension beyond this limit requires prior written manager approval and must be submitted through the HR Portal at least 5 business days in advance. Unauthorized extensions will be treated as unpaid leave and may subject the employee to formal review.",
    riskLevel: "Medium",
    confidence: 94,
    citations: [
      {
        id: "c1",
        title: "Leave Policy v2.1",
        section: "Section 4.2: Extensions",
        page: "14",
        url: "#",
        context: "Requests for leave extensions beyond 14 consecutive calendar days must be submitted to both the department head and HR. Prior written approval is mandatory before the extension begins.",
        policyNotes: "Required: Extensions without prior manager and HR approval will be categorized as unauthorized absence."
      },
      {
        id: "c2",
        title: "Leave Policy v2.1",
        section: "Section 4.1: General Accruals",
        page: "12",
        url: "#",
        context: "Employees are entitled to annual paid leave based on their tenure. Standard consecutive leave is capped at 14 calendar days to ensure business continuity.",
        policyNotes: "Recommendation: Plan consecutive leave at least a month in advance to avoid team scheduling issues."
      }
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
  },
  security: {
    answer: "Under the Data Security & AI Usage Guidelines, sharing proprietary code, customer records, or confidential company IP with public external AI models (including public versions of ChatGPT, Claude, etc.) is strictly prohibited. For coding assistance, employees must use the internal approved secure proxy or enterprise-licensed instances that guarantee data privacy and prevent training on input data.",
    riskLevel: "High",
    confidence: 98,
    citations: [
      {
        id: "s1",
        title: "Data Protection Policy",
        section: "Section 7.3: Third-party AI Tools",
        page: "29",
        url: "#",
        context: "No employee shall input confidential data, proprietary source code, or intellectual property into public AI models. All AI interactions must utilize company-sanctioned enterprise tools.",
        policyNotes: "Violations represent high-risk data leakage threats and will trigger automatic info-sec logging."
      },
      {
        id: "s2",
        title: "NDA & Confidentiality Agreement",
        section: "Section 2.1: Data Exposure",
        page: "8",
        url: "#",
        context: "Proprietary information includes all source code, database schemas, customer PII, and financial plans. Exposure to non-certified third parties violates employment terms.",
        policyNotes: "Public AI APIs do not guarantee confidentiality. Avoid pasting any proprietary data."
      }
    ],
    retrievedChunks: [
      {
        id: "chunk_s1",
        text: "No employee shall input confidential data, proprietary source code, or intellectual property into public AI models.",
        source: "Data Protection Policy - Section 7.3"
      },
      {
        id: "chunk_s2",
        text: "Exposure to non-certified third parties violates employment terms.",
        source: "NDA & Confidentiality Agreement - Section 2.1"
      }
    ]
  },
  travel: {
    answer: "Under the Travel & Expense Reimbursement Policy, the daily meal allowance (per diem) is capped at $75 USD. Lodging expenses must be booked via the internal corporate travel portal. Business class flights are only reimbursable for continuous international travel exceeding 8 hours, subject to pre-approval by the CFO.",
    riskLevel: "Low",
    confidence: 89,
    citations: [
      {
        id: "t1",
        title: "Expense Policy v3.0",
        section: "Section 5.2: Meals",
        page: "18",
        url: "#",
        context: "Meal expenses are capped at a daily limit of $75. Receipts must be uploaded for any item exceeding $25.",
        policyNotes: "Alcoholic beverages are not eligible for reimbursement."
      },
      {
        id: "t2",
        title: "Expense Policy v3.0",
        section: "Section 3.4: Flight Bookings",
        page: "11",
        url: "#",
        context: "Economy class is standard for all domestic travel. CFO pre-authorization is required for business class tickets on flights longer than 8 hours.",
        policyNotes: "Upgrade requests without pre-approval will not be compensated."
      }
    ],
    retrievedChunks: [
      {
        id: "chunk_t1",
        text: "Meal expenses are capped at a daily limit of $75. Receipts must be uploaded for any item exceeding $25.",
        source: "Expense Policy v3.0 - Section 5.2"
      },
      {
        id: "chunk_t2",
        text: "Economy class is standard for all domestic travel. CFO pre-authorization is required for business class tickets on flights longer than 8 hours.",
        source: "Expense Policy v3.0 - Section 3.4"
      }
    ]
  },
  remote: {
    answer: "Under the Remote Work & Workplace Policy, employees working from home are eligible for a one-time equipment allowance of up to $500 USD for ergonomic setups. Working remotely from another country is limited to a maximum of 30 calendar days per year due to tax and compliance implications, and requires prior HR and tax assessment clearance.",
    riskLevel: "Medium",
    confidence: 91,
    citations: [
      {
        id: "r1",
        title: "Remote Work Policy",
        section: "Section 2.2: Out-of-Country Work",
        page: "7",
        url: "#",
        context: "To prevent tax residency complications, employees may work outside their contracted country of employment for no more than 30 business days per rolling 12-month period.",
        policyNotes: "Tax clearance must be filed with HR prior to travel. Non-compliance could result in tax liabilities for the company."
      },
      {
        id: "r2",
        title: "Workplace Setup Guide",
        section: "Section 1.5: Stipends",
        page: "4",
        url: "#",
        context: "A home office setup stipend of $500 is available for purchase of chairs, monitors, and desks. Reimbursements require valid receipts within 60 days.",
        policyNotes: "Consumables like coffee or internet utilities are excluded."
      }
    ],
    retrievedChunks: [
      {
        id: "chunk_r1",
        text: "Employees may work outside their contracted country of employment for no more than 30 business days.",
        source: "Remote Work Policy - Section 2.2"
      },
      {
        id: "chunk_r2",
        text: "A home office setup stipend of $500 is available for purchase of chairs, monitors, and desks.",
        source: "Workplace Setup Guide - Section 1.5"
      }
    ]
  },
  default: {
    answer: "Based on the general policy guidelines, all corporate decisions must align with standard compliance workflows. Please ensure that client agreements, external partnerships, and vendor contracts are logged in the main legal register. For specific queries regarding code exposure or financial approvals, please consult the respective compliance officer.",
    riskLevel: "Low",
    confidence: 85,
    citations: [
      {
        id: "g1",
        title: "Code of Business Conduct",
        section: "Section 1.1: General Compliance",
        page: "3",
        url: "#",
        context: "Every employee is responsible for maintaining high ethical standards and adhering to all internal policies and legal obligations in their daily tasks.",
        policyNotes: "When in doubt, consult the compliance officer."
      }
    ],
    retrievedChunks: [
      {
        id: "chunk_g1",
        text: "Every employee is responsible for maintaining high ethical standards.",
        source: "Code of Business Conduct - Section 1.1"
      }
    ]
  }
};
