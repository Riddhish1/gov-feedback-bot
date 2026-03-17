import { ISession } from "@/models/Session";
import {
  getQuestions,
  InteractiveMessage,
  MAP_YES_NO,
  MAP_YES_NO_PARTIAL,
  MAP_RATING,
  MAP_FULFILLED,
  MAP_SERVICES,
  MAP_POLICY_FLOWS,
  MAP_SCHEMES,
  MAP_IMPROVEMENTS,
  MAP_AREAS,
  MAP_BENEFICIARIES,
  MAP_CHANGES,
  MAP_DEPARTMENTS,
} from "./questions";

type FlowResponse = {
  message: InteractiveMessage;
  nextStep: number;
  completed: boolean;
};

// ── Office Experience Flow ──────────────────────────────────────────────────

export async function handleOfficeFlow(
  session: ISession,
  messageText: string
): Promise<FlowResponse> {
  const sanitize = (text: string) => text.trim();
  const QUESTIONS = getQuestions(session.language);

  switch (session.current_step) {
    case 3: // Q1: Help Desk
      session.answers.cat1_q1_helpdesk = MAP_YES_NO[messageText] || sanitize(messageText);
      return { message: QUESTIONS.CAT1_Q2, nextStep: 4, completed: false };

    case 4: // Q2: Citizen Charter
      session.answers.cat1_q2_charter = MAP_YES_NO_PARTIAL[messageText] || sanitize(messageText);
      return { message: QUESTIONS.CAT1_Q3, nextStep: 5, completed: false };

    case 5: // Q3: Entrance Map
      session.answers.cat1_q3_map = MAP_YES_NO[messageText] || sanitize(messageText);
      return { message: QUESTIONS.CAT1_Q4, nextStep: 6, completed: false };

    case 6: { // Q4: Seating (Star rating)
      const seatingRating = MAP_RATING[messageText.trim()];
      if (!seatingRating) return { message: QUESTIONS.INVALID_RATING, nextStep: 6, completed: false };
      session.answers.cat1_q4_seating = seatingRating;
      return { message: QUESTIONS.CAT1_Q5, nextStep: 7, completed: false };
    }

    case 7: // Q5: Drinking Water
      session.answers.cat1_q5_water = MAP_YES_NO[messageText] || sanitize(messageText);
      return { message: QUESTIONS.CAT1_Q6, nextStep: 8, completed: false };

    case 8: { // Q6: Toilets (Star rating)
      const toiletRating = MAP_RATING[messageText.trim()];
      if (!toiletRating) return { message: QUESTIONS.INVALID_RATING, nextStep: 8, completed: false };
      session.answers.cat1_q6_toilets = toiletRating;
      return { message: QUESTIONS.CAT1_Q7, nextStep: 9, completed: false };
    }

    case 9: // Q7: Fulfilled
      session.answers.cat1_q7_fulfilled = MAP_FULFILLED[messageText] || sanitize(messageText);
      return { message: QUESTIONS.CAT1_Q8, nextStep: 10, completed: false };

    case 10: // Q8: Service/Scheme
      session.answers.cat1_q8_service = MAP_SERVICES[messageText] || sanitize(messageText);
      return { message: QUESTIONS.CAT1_Q9, nextStep: 11, completed: false };

    case 11: { // Q9: Overall Rating (Star rating)
      const overallRating = MAP_RATING[messageText.trim()];
      if (!overallRating) return { message: QUESTIONS.INVALID_RATING, nextStep: 11, completed: false };
      session.answers.cat1_q9_overall = overallRating;
      session.answers.office_rating = overallRating;
      session.answers.rating = overallRating;
      return { message: QUESTIONS.CAT1_Q10, nextStep: 12, completed: false };
    }

    case 12: // Q10: Comments (Final)
      session.answers.cat1_q10_comments = (sanitize(messageText) === "वगळा" || sanitize(messageText).toUpperCase() === "SKIP") ? "Skipped" : sanitize(messageText);
      
      const curFeed = session.answers.feedback ? session.answers.feedback + "\n\n" : "";
      session.answers.feedback = curFeed + "[Office Experience]: " + session.answers.cat1_q10_comments;
      
      if (!session.answers.completed_flows.includes(1)) {
        session.answers.completed_flows.push(1);
      }
      return { message: QUESTIONS.CONTINUE_MENU(session.answers.completed_flows), nextStep: 22, completed: false };

    default:
      return { message: QUESTIONS.ERROR, nextStep: session.current_step, completed: false };
  }
}

export async function handlePolicyFlow(
  session: ISession,
  messageText: string
): Promise<FlowResponse> {
  const sanitize = (text: string) => text.trim();
  const QUESTIONS = getQuestions(session.language);

  switch (session.current_step) {
    case 3: {
      // Step 3: What would you like to suggest? (Flow Choice)
      const flowMatch = MAP_POLICY_FLOWS[messageText];
      if (!flowMatch) return { message: QUESTIONS.INVALID_OPTION, nextStep: 3, completed: false };

      session.answers.cat2_flow_type = flowMatch;

      if (flowMatch === "Improve Existing Scheme") return { message: QUESTIONS.CAT2_2A_Q1_SCHEME, nextStep: 4, completed: false }; // Flow A
      if (flowMatch === "Amend Existing Policy / Act") return { message: QUESTIONS.CAT2_2B_Q1_AREA, nextStep: 6, completed: false }; // Flow B
      if (flowMatch === "Suggest New Scheme") return { message: QUESTIONS.CAT2_2C_Q1_BENEFICIARY, nextStep: 8, completed: false }; // Flow C

      return { message: QUESTIONS.ERROR, nextStep: 3, completed: false };
    }

    // --- FLOW 2A: Improve Existing Scheme ---
    case 4: {
      session.answers.cat2_scheme_name = MAP_SCHEMES[messageText] || sanitize(messageText);
      return { message: QUESTIONS.CAT2_2A_Q2_IMPROVEMENT, nextStep: 5, completed: false };
    }
    case 5: {
      session.answers.cat2_improvement_needed = MAP_IMPROVEMENTS[messageText] || sanitize(messageText);
      return { message: QUESTIONS.CAT2_MANDATORY_TEXT, nextStep: 10, completed: false };
    }

    // --- FLOW 2B: Amend Existing Policy / Act ---
    case 6: {
      session.answers.cat2_policy_area = MAP_AREAS[messageText] || sanitize(messageText);
      return { message: QUESTIONS.CAT2_MANDATORY_TEXT, nextStep: 10, completed: false };
    }

    // --- FLOW 2C: Suggest New Scheme ---
    case 8: {
      session.answers.cat2_beneficiary = MAP_BENEFICIARIES[messageText] || sanitize(messageText);
      return { message: QUESTIONS.CAT2_MANDATORY_TEXT, nextStep: 10, completed: false };
    }

    // --- CONVERGED FINAL STEP ---
    case 10: {
      // Free text feedback mandatory
      if (!messageText || messageText.length < 3) return { message: QUESTIONS.ERROR /* simple fallback */, nextStep: 10, completed: false };
      session.answers.cat2_mandatory_feedback = sanitize(messageText);
      
      const curFeedPol = session.answers.feedback ? session.answers.feedback + "\n\n" : "";
      session.answers.feedback = curFeedPol + "[Policy Suggestion]: " + sanitize(messageText);
      session.answers.policy_suggestion = sanitize(messageText);

      if (!session.answers.completed_flows.includes(2)) {
        session.answers.completed_flows.push(2);
      }

      return {
        message: QUESTIONS.CONTINUE_MENU(session.answers.completed_flows),
        nextStep: 22,
        completed: false,
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
  const QUESTIONS = getQuestions(session.language);

  switch (session.current_step) {
    case 3: {
      // Step 3: What should be changed?
      session.answers.cat3_change_type = MAP_CHANGES[messageText] || sanitize(messageText);
      return {
        message: QUESTIONS.CAT3_Q2_SUGGESTION,
        nextStep: 4,
        completed: false,
      };
    }

    case 4: {
      // Step 4: Describe Your Suggestion
      if (!messageText || messageText.length < 3) {
        return {
          message: QUESTIONS.ERROR,
          nextStep: 4,
          completed: false,
        };
      }
      session.answers.cat3_suggestion = sanitize(messageText);
      // Ensure backward compatibility, concatenated
      const curFeedProc = session.answers.feedback ? session.answers.feedback + "\n\n" : "";
      session.answers.feedback = curFeedProc + "[Process Reform]: " + sanitize(messageText);

      return {
        message: QUESTIONS.CAT3_Q3_DEPARTMENT,
        nextStep: 5,
        completed: false,
      };
    }

    case 5: {
      // Step 5: Optional Department Tagging
      if (messageText !== "वगळा" && messageText.toUpperCase() !== "SKIP" && messageText.toUpperCase() !== "7") {
        session.answers.cat3_department = MAP_DEPARTMENTS[messageText] || sanitize(messageText);
      }
      
      if (!session.answers.completed_flows.includes(3)) {
        session.answers.completed_flows.push(3);
      }

      return {
        message: QUESTIONS.CONTINUE_MENU(session.answers.completed_flows),
        nextStep: 22,
        completed: false,
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
