/**
 * FIXED BOT QUESTIONS — HARDCODED CONSTANTS
 *
 * These questions are NEVER stored in MongoDB.
 * They are served directly from this file at runtime.
 * To change a question, edit this file and redeploy.
 */

export const QUESTIONS = {
  GREETING: (officeName: string): string =>
    `Welcome to Maharashtra Citizen Governance Feedback System\n\nThis is not a complaint portal.\nYour feedback helps improve government services.\n\nIt takes less than 30 seconds.\n\nPlease select an option:\n\n1️⃣ Office Experience\n2️⃣ Policy Suggestion\n3️⃣ Process Reform Suggestion\n\nReply with 1, 2, or 3.`,

  // ── CATEGORY 1: OFFICE EXPERIENCE (10 STEPS) ──
  CAT1_Q1: `Help Desk available?\n\n1️⃣ Yes\n2️⃣ No\n\nReply with 1 or 2.`,
  CAT1_Q2: `Citizen Charter & Job Chart displayed?\n\n1️⃣ Yes\n2️⃣ No\n3️⃣ Partially\n\nReply with 1, 2, or 3.`,
  CAT1_Q3: `Entrance map of all desks available?\n\n1️⃣ Yes\n2️⃣ No\n\nReply with 1 or 2.`,
  CAT1_Q4: `Seating comfortable for visitors?\n\n1 ⭐ Very Poor\n2 ⭐ Poor\n3 ⭐ Average\n4 ⭐ Good\n5 ⭐ Excellent\n\nReply with 1-5.`,
  CAT1_Q5: `Drinking water hygienic & available?\n\n1️⃣ Yes\n2️⃣ No\n\nReply with 1 or 2.`,
  CAT1_Q6: `Toilets clean, functional, separate M/W?\n\n1 ⭐ Very Poor\n2 ⭐ Poor\n3 ⭐ Average\n4 ⭐ Good\n5 ⭐ Excellent\n\nReply with 1-5.`,
  CAT1_Q7: `Purpose of visit fulfilled?\n\n1️⃣ Fully\n2️⃣ Partially\n3️⃣ No\n\nReply with 1, 2, or 3.`,
  CAT1_Q8: `Which service/scheme did you visit for?\n\n1️⃣ Certificate\n2️⃣ License\n3️⃣ Scheme Approval\n4️⃣ Land Record\n5️⃣ Other\n\nReply with option number.`,
  CAT1_Q9: `Overall Experience Rating:\n\n1 ⭐ Very Poor\n2 ⭐ Poor\n3 ⭐ Average\n4 ⭐ Good\n5 ⭐ Excellent\n\nReply with 1-5.`,
  CAT1_Q10: `Any additional comments or suggestions?\n(Type your response)`,
  FINAL_OFFICE: `Thank you for your feedback.\nYour submission has been recorded and will help improve governance.`,


  // ── CATEGORY 2: POLICY SUGGESTION FEEDBACK FLOW ──
  CAT2_FLOW_SELECT: `What would you like to suggest?\n\n1️⃣ Improve Existing Scheme\n2️⃣ Amend Existing Policy / Act\n3️⃣ Suggest New Scheme\n\nReply with 1, 2, or 3.`,

  CAT2_2A_Q1_SCHEME: `Select Scheme:\n\n1️⃣ PM Kisan\n2️⃣ Scholarship\n3️⃣ Housing Scheme\n4️⃣ Social welfare Scheme\n5️⃣ Other (Type Name)\n\nReply with option number or type the name.`,
  CAT2_2A_Q2_IMPROVEMENT: `What improvement is needed?\n\n1️⃣ Reduce Documentation\n2️⃣ Faster Approval Timeline\n3️⃣ Increase Benefit Amount\n4️⃣ Eligibility Confusion\n5️⃣ Staff Support Inadequate\n6️⃣ Multiple Visits Required\n7️⃣ Low Benefit Amount\n\nReply with option number.`,

  CAT2_2B_Q1_AREA: `Select Area of Policy:\n\n1️⃣ Agriculture\n2️⃣ Education\n3️⃣ Health\n4️⃣ Employment\n5️⃣ Infrastructure\n6️⃣ Industry\n7️⃣ Environment\n8️⃣ Other\n\nReply with option number.`,

  CAT2_2C_Q1_BENEFICIARY: `Who should the new scheme benefit?\n\n1️⃣ Farmers\n2️⃣ Women\n3️⃣ Youth\n4️⃣ Senior Citizens\n5️⃣ Tribal communities\n6️⃣ Urban Poor\n7️⃣ Other\n\nReply with option number.`,

  CAT2_MANDATORY_TEXT: `Please type your detailed suggestion, problem description, or scheme idea here (Mandatory free-text):`,

  FINAL_POLICY: `Thank you. Your feedback has been submitted.`,

  // ── CATEGORY 3: PROCESS REFORM FEEDBACK FLOW ──
  CAT3_Q1_CHANGE: `What should be changed?\nSelect Your Suggestion:\n\n1️⃣ Reduce documentation\n2️⃣ Simplify procedure\n3️⃣ Remove redundant approvals\n4️⃣ Digitise service\n5️⃣ Restructure service workflow\n\nReply with option number.`,

  CAT3_Q2_SUGGESTION: `Describe Your Suggestion:\nBriefly explain your suggestion in 3-4 lines:\n\n[Type suggestion...]`,

  CAT3_Q3_DEPARTMENT: `Optional: Purpose of Visit Tagging\nYour suggestion is for:\n\n1️⃣ Agriculture\n2️⃣ Education\n3️⃣ Health\n4️⃣ Employment\n5️⃣ Industry\n6️⃣ Environment\n\nReply with option number, or type "Skip" to skip.`,

  FINAL_PROCESS: `Thank you. Your feedback has been submitted.`,

  INVALID_OPTION: "⚠️ Invalid option selected. Please reply with the correct number.",
  INVALID_RATING: "⚠️ Please reply with a number between 1 and 5.",
  OFFICE_NOT_FOUND: (officeId: string): string => `⚠️ Office with ID *${officeId}* was not found in the system.`,
  SESSION_COMPLETED: "✅ You have already submitted your feedback. Thank you!",
  ERROR: "⚠️ Something went wrong on our end. Please try again or scan the QR code to restart.",
} as const;

export const CAT1_YES_NO: Record<string, string> = {
  "1": "Yes",
  "2": "No",
};

export const CAT1_YES_NO_PARTIAL: Record<string, string> = {
  "1": "Yes",
  "2": "No",
  "3": "Partially",
};

export const CAT1_FULFILLED: Record<string, string> = {
  "1": "Fully",
  "2": "Partially",
  "3": "No",
};

export const CAT1_SERVICES: Record<string, string> = {
  "1": "Certificate",
  "2": "License",
  "3": "Scheme Approval",
  "4": "Land Record",
  "5": "Other",
};

export const CAT2_FLOWS: Record<string, string> = {
  "1": "Improve Existing Scheme",
  "2": "Amend Existing Policy / Act",
  "3": "Suggest New Scheme",
};

export const CAT2_SCHEMES: Record<string, string> = {
  "1": "PM Kisan",
  "2": "Scholarship",
  "3": "Housing Scheme",
  "4": "Social welfare Scheme",
  "5": "Other",
};

export const CAT2_IMPROVEMENTS: Record<string, string> = {
  "1": "Reduce Documentation",
  "2": "Faster Approval Timeline",
  "3": "Increase Benefit Amount",
  "4": "Eligibility Confusion",
  "5": "Staff Support Inadequate",
  "6": "Multiple Visits Required",
  "7": "Low Benefit Amount",
};

export const CAT2_AREAS: Record<string, string> = {
  "1": "Agriculture",
  "2": "Education",
  "3": "Health",
  "4": "Employment",
  "5": "Infrastructure",
  "6": "Industry",
  "7": "Environment",
  "8": "Other",
};

export const CAT2_BENEFICIARIES: Record<string, string> = {
  "1": "Farmers",
  "2": "Women",
  "3": "Youth",
  "4": "Senior Citizens",
  "5": "Tribal communities",
  "6": "Urban Poor",
  "7": "Other",
};

export const CAT3_CHANGES: Record<string, string> = {
  "1": "Reduce documentation",
  "2": "Simplify procedure",
  "3": "Remove redundant approvals",
  "4": "Digitise service",
  "5": "Restructure service workflow",
};

export const CAT3_DEPARTMENTS: Record<string, string> = {
  "1": "Agriculture",
  "2": "Education",
  "3": "Health",
  "4": "Employment",
  "5": "Industry",
  "6": "Environment",
};
