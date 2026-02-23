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

  OFFICE_Q1:
    `How was your experience at this office today?\n\n1 ⭐ Very Poor\n2 ⭐ Poor\n3 ⭐ Average\n4 ⭐ Good\n5 ⭐ Excellent\n\nReply with 1–5.`,

  OFFICE_ISSUE:
    `What was the main issue?\n\n1️⃣ Long waiting time\n2️⃣ Staff behaviour\n3️⃣ Too many documents asked\n4️⃣ Lack of clarity in process\n5️⃣ Multiple visits required\n6️⃣ Other (type briefly)\n\nReply with option number.`,

  OFFICE_POSITIVE:
    `What went well? (Optional)\n\n1️⃣ Quick service\n2️⃣ Helpful staff\n3️⃣ Clear process\n4️⃣ Digital system worked well\n5️⃣ Other (type briefly)\n\nReply with option number or type your response.`,

  FINAL_OFFICE:
    `Thank you for your feedback.\nYour submission has been recorded.`,

  POLICY_Q1:
    `Which policy or scheme would you like to suggest improvement for?\n(Type name or describe briefly)`,

  POLICY_IMPROVEMENT:
    `What kind of improvement do you suggest?\n\n1️⃣ Change eligibility criteria\n2️⃣ Increase benefit amount\n3️⃣ Simplify conditions\n4️⃣ Add new beneficiary category\n5️⃣ Improve awareness\n6️⃣ Other (type)\n\nReply with option number.`,

  POLICY_BENEFICIARY:
    `Who will benefit from this change?\n\n1️⃣ Farmers\n2️⃣ Students\n3️⃣ Women\n4️⃣ Senior citizens\n5️⃣ Entrepreneurs\n6️⃣ General public\n7️⃣ Other\n\nReply with option number.`,

  FINAL_POLICY:
    `Thank you for your policy suggestion.\nIt will be reviewed for reform consideration.`,

  PROCESS_Q1:
    `Which service or process needs simplification?\n(Example: Certificate, License, Land record, Scheme approval)`,

  PROCESS_DIFFICULTY:
    `What is the main difficulty?\n\n1️⃣ Too many documents\n2️⃣ Too many approval levels\n3️⃣ Delay in processing\n4️⃣ Need to visit multiple offices\n5️⃣ Lack of online option\n6️⃣ Repetitive verification\n7️⃣ Other\n\nReply with option number.`,

  PROCESS_SUGGESTION:
    `What should be simplified? (One line suggestion)`,

  FINAL_PROCESS:
    `Thank you for your suggestion.\nIf similar inputs are received across offices, a process improvement review will be initiated.`,

  INVALID_OPTION: "⚠️ Invalid option selected. Please reply with the correct number.",
  INVALID_RATING: "⚠️ Please reply with a number between 1 and 5.",
  OFFICE_NOT_FOUND: (officeId: string): string => `⚠️ Office with ID *${officeId}* was not found in the system.`,
  SESSION_COMPLETED: "✅ You have already submitted your feedback. Thank you!",
  ERROR: "⚠️ Something went wrong on our end. Please try again or scan the QR code to restart.",
} as const;

export const OFFICE_ISSUES: Record<string, string> = {
  "1": "Long waiting time",
  "2": "Staff behaviour",
  "3": "Too many documents asked",
  "4": "Lack of clarity in process",
  "5": "Multiple visits required",
  "6": "Other",
};

export const OFFICE_POSITIVES: Record<string, string> = {
  "1": "Quick service",
  "2": "Helpful staff",
  "3": "Clear process",
  "4": "Digital system worked well",
  "5": "Other",
};

export const POLICY_IMPROVEMENTS: Record<string, string> = {
  "1": "Change eligibility criteria",
  "2": "Increase benefit amount",
  "3": "Simplify conditions",
  "4": "Add new beneficiary category",
  "5": "Improve awareness",
  "6": "Other",
};

export const POLICY_BENEFICIARIES: Record<string, string> = {
  "1": "Farmers",
  "2": "Students",
  "3": "Women",
  "4": "Senior citizens",
  "5": "Entrepreneurs",
  "6": "General public",
  "7": "Other",
};

export const PROCESS_DIFFICULTIES: Record<string, string> = {
  "1": "Too many documents",
  "2": "Too many approval levels",
  "3": "Delay in processing",
  "4": "Need to visit multiple offices",
  "5": "Lack of online option",
  "6": "Repetitive verification",
  "7": "Other",
};
