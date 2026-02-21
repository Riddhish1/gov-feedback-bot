/**
 * FIXED BOT QUESTIONS — HARDCODED CONSTANTS
 *
 * These questions are NEVER stored in MongoDB.
 * They are served directly from this file at runtime.
 * To change a question, edit this file and redeploy.
 */

export const QUESTIONS = {
  /**
   * Q1: Displayed after a citizen starts the session with START_OFFICE_<id>
   * Asks for a numeric rating 1–5.
   */
  Q1: (officeName: string): string =>
    `Thank you for visiting ${officeName}. 🙏\n\nPlease rate your visit experience:\n\n1️⃣ Poor\n2️⃣ Fair\n3️⃣ OK\n4️⃣ Good\n5️⃣ Excellent\n\nReply with a number from 1 to 5.`,

  /**
   * Q2: Asks for general feedback about the visit.
   */
  Q2: "Any feedback about your visit today? 📝\n\nYou can mention:\n• Staff behaviour\n• Waiting time / delays\n• Facilities\n• Overall experience\n\nPlease type your response:",

  /**
   * Q3: Asks for suggestions about government schemes.
   */
  Q3: "Any suggestions about government schemes? 💡\n\nYou may suggest:\n• Improvements to existing schemes\n• New schemes that would help citizens\n\nPlease type your suggestion (or reply *skip* to skip):",

  /**
   * Q4: Asks for policy improvement suggestions.
   */
  Q4: "Any suggestions to improve government policies or services? 🏛️\n\nYour input helps shape better governance.\n\nPlease type your suggestion (or reply *skip* to skip):",

  /**
   * FINAL: Sent after all questions are answered (step 5).
   */
  FINAL:
    "✅ Thank you! Your feedback has been recorded.\n\nYour responses help the government improve public services for all citizens.\n\nHave a great day! 🇮🇳",

  /**
   * INVALID_RATING: Sent when a citizen provides an invalid rating at step 1.
   */
  INVALID_RATING:
    "⚠️ Please reply with a number between *1* and *5* to rate your experience.\n\n1️⃣ Poor  |  2️⃣ Fair  |  3️⃣ OK  |  4️⃣ Good  |  5️⃣ Excellent",

  /**
   * OFFICE_NOT_FOUND: Sent when the office_id is not found in the database.
   */
  OFFICE_NOT_FOUND: (officeId: string): string =>
    `⚠️ Office with ID *${officeId}* was not found in the system.\n\nPlease scan the correct QR code or contact the office staff.`,

  /**
   * SESSION_COMPLETED: Sent when a citizen tries to interact after completing feedback.
   */
  SESSION_COMPLETED:
    "✅ You have already submitted your feedback. Thank you!\n\nIf you wish to submit feedback for another office, please scan a new QR code.",

  /**
   * ERROR: Generic error message.
   */
  ERROR:
    "⚠️ Something went wrong on our end. Please try again or scan the QR code to restart.",
} as const;
