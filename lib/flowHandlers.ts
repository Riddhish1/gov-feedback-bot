import { ISession } from "@/models/Session";
import {
  QUESTIONS,
  CAT1_YES_NO,
  CAT1_YES_NO_PARTIAL,
  CAT1_FULFILLED,
  CAT1_SERVICES,
  CAT2_FLOWS,
  CAT2_SCHEMES,
  CAT2_IMPROVEMENTS,
  CAT2_AREAS,
  CAT2_BENEFICIARIES,
  CAT3_CHANGES,
  CAT3_DEPARTMENTS,
} from "./questions";

type FlowResponse = {
  message: string;
  nextStep: number;
  completed: boolean;
};

// ── Office Experience Flow ──────────────────────────────────────────────────

export async function handleOfficeFlow(
  session: ISession,
  messageText: string
): Promise<FlowResponse> {
  const sanitize = (text: string) => text.trim();

  switch (session.current_step) {
    case 2: // Q1: Help Desk
      session.answers.cat1_q1_helpdesk = CAT1_YES_NO[messageText] || sanitize(messageText);
      return { message: QUESTIONS.CAT1_Q2, nextStep: 3, completed: false };

    case 3: // Q2: Citizen Charter
      session.answers.cat1_q2_charter = CAT1_YES_NO_PARTIAL[messageText] || sanitize(messageText);
      return { message: QUESTIONS.CAT1_Q3, nextStep: 4, completed: false };

    case 4: // Q3: Entrance Map
      session.answers.cat1_q3_map = CAT1_YES_NO[messageText] || sanitize(messageText);
      return { message: QUESTIONS.CAT1_Q4, nextStep: 5, completed: false };

    case 5: { // Q4: Seating (Star rating)
      const seatingRating = parseInt(messageText, 10);
      if (isNaN(seatingRating) || seatingRating < 1 || seatingRating > 5) return { message: QUESTIONS.INVALID_RATING, nextStep: 5, completed: false };
      session.answers.cat1_q4_seating = seatingRating;
      return { message: QUESTIONS.CAT1_Q5, nextStep: 6, completed: false };
    }

    case 6: // Q5: Drinking Water
      session.answers.cat1_q5_water = CAT1_YES_NO[messageText] || sanitize(messageText);
      return { message: QUESTIONS.CAT1_Q6, nextStep: 7, completed: false };

    case 7: { // Q6: Toilets (Star rating)
      const toiletRating = parseInt(messageText, 10);
      if (isNaN(toiletRating) || toiletRating < 1 || toiletRating > 5) return { message: QUESTIONS.INVALID_RATING, nextStep: 7, completed: false };
      session.answers.cat1_q6_toilets = toiletRating;
      return { message: QUESTIONS.CAT1_Q7, nextStep: 8, completed: false };
    }

    case 8: // Q7: Fulfilled
      session.answers.cat1_q7_fulfilled = CAT1_FULFILLED[messageText] || sanitize(messageText);
      return { message: QUESTIONS.CAT1_Q8, nextStep: 9, completed: false };

    case 9: // Q8: Service/Scheme
      session.answers.cat1_q8_service = CAT1_SERVICES[messageText] || sanitize(messageText);
      return { message: QUESTIONS.CAT1_Q9, nextStep: 10, completed: false };

    case 10: { // Q9: Overall Rating (Star rating)
      const overallRating = parseInt(messageText, 10);
      if (isNaN(overallRating) || overallRating < 1 || overallRating > 5) return { message: QUESTIONS.INVALID_RATING, nextStep: 10, completed: false };
      session.answers.cat1_q9_overall = overallRating;
      // also saving directly to office_rating so existing calculations don't break
      session.answers.office_rating = overallRating;
      // also copy to feedback rating
      session.answers.rating = overallRating;
      return { message: QUESTIONS.CAT1_Q10, nextStep: 11, completed: false };
    }

    case 11: // Q10: Comments (Final)
      session.answers.cat1_q10_comments = sanitize(messageText);
      // also save to main feedback
      session.answers.feedback = sanitize(messageText);
      return { message: QUESTIONS.FINAL_OFFICE, nextStep: 12, completed: true };

    default:
      return { message: QUESTIONS.ERROR, nextStep: session.current_step, completed: false };
  }
}

export async function handlePolicyFlow(
  session: ISession,
  messageText: string
): Promise<FlowResponse> {
  const sanitize = (text: string) => text.trim();

  switch (session.current_step) {
    case 2: {
      // Step 2: What would you like to suggest? (Flow Choice)
      const flowMatch = CAT2_FLOWS[messageText];
      if (!flowMatch) return { message: QUESTIONS.INVALID_OPTION, nextStep: 2, completed: false };

      session.answers.cat2_flow_type = flowMatch;

      if (messageText === "1") return { message: QUESTIONS.CAT2_2A_Q1_SCHEME, nextStep: 3, completed: false }; // Flow A
      if (messageText === "2") return { message: QUESTIONS.CAT2_2B_Q1_AREA, nextStep: 5, completed: false }; // Flow B
      if (messageText === "3") return { message: QUESTIONS.CAT2_2C_Q1_BENEFICIARY, nextStep: 7, completed: false }; // Flow C

      return { message: QUESTIONS.ERROR, nextStep: 2, completed: false };
    }

    // --- FLOW 2A: Improve Existing Scheme ---
    case 3: {
      session.answers.cat2_scheme_name = CAT2_SCHEMES[messageText] || sanitize(messageText);
      return { message: QUESTIONS.CAT2_2A_Q2_IMPROVEMENT, nextStep: 4, completed: false };
    }
    case 4: {
      session.answers.cat2_improvement_needed = CAT2_IMPROVEMENTS[messageText] || sanitize(messageText);
      return { message: QUESTIONS.CAT2_MANDATORY_TEXT, nextStep: 9, completed: false };
    }

    // --- FLOW 2B: Amend Existing Policy / Act ---
    case 5: {
      session.answers.cat2_policy_area = CAT2_AREAS[messageText] || sanitize(messageText);
      return { message: QUESTIONS.CAT2_MANDATORY_TEXT, nextStep: 9, completed: false };
    }

    // --- FLOW 2C: Suggest New Scheme ---
    case 7: {
      session.answers.cat2_beneficiary = CAT2_BENEFICIARIES[messageText] || sanitize(messageText);
      return { message: QUESTIONS.CAT2_MANDATORY_TEXT, nextStep: 9, completed: false };
    }

    // --- CONVERGED FINAL STEP ---
    case 9: {
      // Free text feedback mandatory
      if (!messageText || messageText.length < 3) return { message: "Please enter a valid suggestion.", nextStep: 9, completed: false };
      session.answers.cat2_mandatory_feedback = sanitize(messageText);
      // Save backward compatibility to main feedback
      session.answers.feedback = sanitize(messageText);
      session.answers.policy_suggestion = sanitize(messageText);

      return {
        message: QUESTIONS.FINAL_POLICY,
        nextStep: 12, // Mark as completed
        completed: true,
      };
    }

    default:
      return {
        message: QUESTIONS.ERROR,
        nextStep: session.current_step,
        completed: false,
      };
  }
}

// ── Process Reform Flow ─────────────────────────────────────────────────────

export async function handleProcessFlow(
  session: ISession,
  messageText: string
): Promise<FlowResponse> {
  const sanitize = (text: string) => text.trim();

  switch (session.current_step) {
    case 2: {
      // Step 2: What should be changed?
      session.answers.cat3_change_type = CAT3_CHANGES[messageText] || sanitize(messageText);
      return {
        message: QUESTIONS.CAT3_Q2_SUGGESTION,
        nextStep: 3,
        completed: false,
      };
    }

    case 3: {
      // Step 3: Describe Your Suggestion
      if (!messageText || messageText.length < 3) {
        return {
          message: "Please enter a valid suggestion description.",
          nextStep: 3,
          completed: false,
        };
      }
      session.answers.cat3_suggestion = sanitize(messageText);
      // Ensure backward compatibility
      session.answers.feedback = sanitize(messageText);

      return {
        message: QUESTIONS.CAT3_Q3_DEPARTMENT,
        nextStep: 4,
        completed: false,
      };
    }

    case 4: {
      // Step 4: Optional Department Tagging
      if (messageText.toUpperCase() !== "SKIP" && messageText.toUpperCase() !== "7") {
        session.answers.cat3_department = CAT3_DEPARTMENTS[messageText] || sanitize(messageText);
      }

      return {
        message: QUESTIONS.FINAL_PROCESS,
        nextStep: 17, // Marks as completed
        completed: true,
      };
    }

    default:
      return {
        message: QUESTIONS.ERROR,
        nextStep: session.current_step,
        completed: false,
      };
  }
}
