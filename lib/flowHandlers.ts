import { ISession } from "@/models/Session";
import {
  QUESTIONS,
  OFFICE_ISSUES,
  OFFICE_POSITIVES,
  POLICY_IMPROVEMENTS,
  POLICY_BENEFICIARIES,
  PROCESS_DIFFICULTIES,
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
  switch (session.current_step) {
    case 2: {
      // Collect rating (1-5)
      const rating = parseInt(messageText, 10);
      if (isNaN(rating) || rating < 1 || rating > 5 || String(rating) !== messageText) {
        return {
          message: QUESTIONS.INVALID_RATING,
          nextStep: session.current_step,
          completed: false,
        };
      }

      session.answers.office_rating = rating;

      // Branch based on rating
      if (rating <= 3) {
        return {
          message: QUESTIONS.OFFICE_ISSUE,
          nextStep: 3,
          completed: false,
        };
      } else {
        return {
          message: QUESTIONS.OFFICE_POSITIVE,
          nextStep: 3,
          completed: false,
        };
      }
    }

    case 3: {
      // Collect issue or positive feedback
      const rating = session.answers.office_rating || 0;

      if (rating <= 3) {
        // Handle issue selection
        const issue = OFFICE_ISSUES[messageText as keyof typeof OFFICE_ISSUES];
        session.answers.office_issue = issue || messageText;
      } else {
        // Handle positive feedback
        const positive = OFFICE_POSITIVES[messageText as keyof typeof OFFICE_POSITIVES];
        session.answers.office_positive = positive || messageText;
      }

      return {
        message: QUESTIONS.FINAL_OFFICE,
        nextStep: 5,
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

// ── Policy Suggestion Flow ──────────────────────────────────────────────────

export async function handlePolicyFlow(
  session: ISession,
  messageText: string
): Promise<FlowResponse> {
  switch (session.current_step) {
    case 2: {
      // Collect policy name
      if (!messageText || messageText.length < 2) {
        return {
          message: QUESTIONS.INVALID_OPTION,
          nextStep: session.current_step,
          completed: false,
        };
      }

      session.answers.policy_name = messageText;
      return {
        message: QUESTIONS.POLICY_IMPROVEMENT,
        nextStep: 3,
        completed: false,
      };
    }

    case 3: {
      // Collect improvement type
      const improvement = POLICY_IMPROVEMENTS[messageText as keyof typeof POLICY_IMPROVEMENTS];
      session.answers.policy_improvement_type = improvement || messageText;

      return {
        message: QUESTIONS.POLICY_BENEFICIARY,
        nextStep: 4,
        completed: false,
      };
    }

    case 4: {
      // Collect beneficiary
      const beneficiary = POLICY_BENEFICIARIES[messageText as keyof typeof POLICY_BENEFICIARIES];
      session.answers.policy_beneficiary = beneficiary || messageText;

      return {
        message: QUESTIONS.FINAL_POLICY,
        nextStep: 5,
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
  switch (session.current_step) {
    case 2: {
      // Collect process name
      if (!messageText || messageText.length < 2) {
        return {
          message: QUESTIONS.INVALID_OPTION,
          nextStep: session.current_step,
          completed: false,
        };
      }

      session.answers.process_name = messageText;
      return {
        message: QUESTIONS.PROCESS_DIFFICULTY,
        nextStep: 3,
        completed: false,
      };
    }

    case 3: {
      // Collect difficulty
      const difficulty = PROCESS_DIFFICULTIES[messageText as keyof typeof PROCESS_DIFFICULTIES];
      session.answers.process_difficulty = difficulty || messageText;

      return {
        message: QUESTIONS.PROCESS_SUGGESTION,
        nextStep: 4,
        completed: false,
      };
    }

    case 4: {
      // Collect suggestion
      if (!messageText || messageText.length < 2) {
        return {
          message: QUESTIONS.INVALID_OPTION,
          nextStep: session.current_step,
          completed: false,
        };
      }

      session.answers.process_suggestion = messageText;

      return {
        message: QUESTIONS.FINAL_PROCESS,
        nextStep: 5,
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
