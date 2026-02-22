/**
 * MAHARASHTRA CITIZEN GOVERNANCE FEEDBACK SYSTEM
 * 
 * Flow Structure:
 * 1. Welcome → Flow Selection (Office/Policy/Process)
 * 2. Office Flow: Rating → Issue/Positive → Complete
 * 3. Policy Flow: Policy Name → Improvement Type → Beneficiary → Complete
 * 4. Process Flow: Process Name → Difficulty → Suggestion → Complete
 * 
 * All questions are hardcoded constants served at runtime.
 * To modify, edit this file and redeploy.
 */

export const QUESTIONS = {
  // ── Welcome & Flow Selection ────────────────────────────────────────────────
  WELCOME: (officeName: string): string =>
    `Welcome to Maharashtra Citizen Governance Feedback System\n\n` +
    `📍 Office: ${officeName}\n\n` +
    `⚠️ This is not a complaint portal.\n` +
    `Your feedback helps improve government services.\n` +
    `⏱️ It takes less than 30 seconds.\n\n` +
    `Please select an option:\n` +
    `1️⃣ Office Experience\n` +
    `2️⃣ Policy Suggestion\n` +
    `3️⃣ Process Reform Suggestion\n\n` +
    `Reply with 1, 2, or 3.`,

  // ── Office Experience Flow ──────────────────────────────────────────────────
  OFFICE_RATING:
    `How was your experience at this office today?\n\n` +
    `1 ⭐ Very Poor\n` +
    `2 ⭐ Poor\n` +
    `3 ⭐ Average\n` +
    `4 ⭐ Good\n` +
    `5 ⭐ Excellent\n\n` +
    `Reply with 1–5.`,

  OFFICE_ISSUE:
    `What was the main issue?\n\n` +
    `1️⃣ Long waiting time\n` +
    `2️⃣ Staff behaviour\n` +
    `3️⃣ Too many documents asked\n` +
    `4️⃣ Lack of clarity in process\n` +
    `5️⃣ Multiple visits required\n` +
    `6️⃣ Other (type briefly)\n\n` +
    `Reply with option number.`,

  OFFICE_POSITIVE:
    `What went well? (Optional)\n\n` +
    `1️⃣ Quick service\n` +
    `2️⃣ Helpful staff\n` +
    `3️⃣ Clear process\n` +
    `4️⃣ Digital system worked well\n` +
    `5️⃣ Other (type briefly)\n\n` +
    `Reply with option number or type your response.`,

  // ── Policy Suggestion Flow ──────────────────────────────────────────────────
  POLICY_NAME:
    `Which policy or scheme would you like to suggest improvement for?\n\n` +
    `(Type name or describe briefly)`,

  POLICY_IMPROVEMENT:
    `What kind of improvement do you suggest?\n\n` +
    `1️⃣ Change eligibility criteria\n` +
    `2️⃣ Increase benefit amount\n` +
    `3️⃣ Simplify conditions\n` +
    `4️⃣ Add new beneficiary category\n` +
    `5️⃣ Improve awareness\n` +
    `6️⃣ Other (type)\n\n` +
    `Reply with option number.`,

  POLICY_BENEFICIARY:
    `Who will benefit from this change?\n\n` +
    `1️⃣ Farmers\n` +
    `2️⃣ Students\n` +
    `3️⃣ Women\n` +
    `4️⃣ Senior citizens\n` +
    `5️⃣ Entrepreneurs\n` +
    `6️⃣ General public\n` +
    `7️⃣ Other\n\n` +
    `Reply with option number.`,

  // ── Process Reform Flow ─────────────────────────────────────────────────────
  PROCESS_NAME:
    `Which service or process needs simplification?\n\n` +
    `(Example: Certificate, License, Land record, Scheme approval)`,

  PROCESS_DIFFICULTY:
    `What is the main difficulty?\n\n` +
    `1️⃣ Too many documents\n` +
    `2️⃣ Too many approval levels\n` +
    `3️⃣ Delay in processing\n` +
    `4️⃣ Need to visit multiple offices\n` +
    `5️⃣ Lack of online option\n` +
    `6️⃣ Repetitive verification\n` +
    `7️⃣ Other\n\n` +
    `Reply with option number.`,

  PROCESS_SUGGESTION:
    `What should be simplified? (One line suggestion)`,

  // ── Final Messages ──────────────────────────────────────────────────────────
  FINAL_OFFICE:
    `✅ Thank you for your feedback.\n\n` +
    `Your submission has been recorded.`,

  FINAL_POLICY:
    `✅ Thank you for your policy suggestion.\n\n` +
    `It will be reviewed for reform consideration.`,

  FINAL_PROCESS:
    `✅ Thank you for your suggestion.\n\n` +
    `If similar inputs are received across offices, a process improvement review will be initiated.`,

  // ── Error Messages ──────────────────────────────────────────────────────────
  INVALID_FLOW_SELECTION:
    `⚠️ Please reply with *1*, *2*, or *3* to select:\n\n` +
    `1️⃣ Office Experience\n` +
    `2️⃣ Policy Suggestion\n` +
    `3️⃣ Process Reform Suggestion`,

  INVALID_RATING:
    `⚠️ Please reply with a number between *1* and *5*.\n\n` +
    `1 ⭐ Very Poor  |  2 ⭐ Poor  |  3 ⭐ Average  |  4 ⭐ Good  |  5 ⭐ Excellent`,

  INVALID_OPTION:
    `⚠️ Please reply with a valid option number or type your response.`,

  OFFICE_NOT_FOUND: (officeId: string): string =>
    `⚠️ Office with ID *${officeId}* was not found in the system.\n\n` +
    `Please scan the correct QR code or contact the office staff.`,

  SESSION_COMPLETED:
    `✅ You have already submitted your feedback. Thank you!\n\n` +
    `If you wish to submit feedback for another office, please scan a new QR code.`,

  ERROR:
    `⚠️ Something went wrong on our end. Please try again or scan the QR code to restart.`,
} as const;

// ── Option Mappings ─────────────────────────────────────────────────────────

export const OFFICE_ISSUES = {
  "1": "Long waiting time",
  "2": "Staff behaviour",
  "3": "Too many documents asked",
  "4": "Lack of clarity in process",
  "5": "Multiple visits required",
} as const;

export const OFFICE_POSITIVES = {
  "1": "Quick service",
  "2": "Helpful staff",
  "3": "Clear process",
  "4": "Digital system worked well",
} as const;

export const POLICY_IMPROVEMENTS = {
  "1": "Change eligibility criteria",
  "2": "Increase benefit amount",
  "3": "Simplify conditions",
  "4": "Add new beneficiary category",
  "5": "Improve awareness",
} as const;

export const POLICY_BENEFICIARIES = {
  "1": "Farmers",
  "2": "Students",
  "3": "Women",
  "4": "Senior citizens",
  "5": "Entrepreneurs",
  "6": "General public",
  "7": "Other",
} as const;

export const PROCESS_DIFFICULTIES = {
  "1": "Too many documents",
  "2": "Too many approval levels",
  "3": "Delay in processing",
  "4": "Need to visit multiple offices",
  "5": "Lack of online option",
  "6": "Repetitive verification",
  "7": "Other",
} as const;
