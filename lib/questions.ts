/**
 * FIXED BOT QUESTIONS — INTERACTIVE WhatsApp UI
 *
 * Defines Native WhatsApp Buttons (<= 3 options) and Lists (> 3 options).
 * Fully bilingual (Marathi and English).
 */

export type InteractiveMessage = {
  text: string;
  type: "text" | "button" | "list";
  options?: string[]; // Allowed exact text values for buttons/lists
};

export const LANGUAGE_SELECT: InteractiveMessage = {
  text: "Namaskar / Hello\nकृपया भाषा निवडा / Please choose language",
  type: "button",
  options: ["मराठी", "English"],
};

export const QUESTIONS_MR = {
  // ── GREETING ──
  GREETING: (officeName: string): InteractiveMessage => ({
    text: `महाराष्ट्र नागरिक शासकीय अभिप्राय प्रणालीमध्ये आपले स्वागत आहे\n\nही तक्रार नोंदविण्याची प्रणाली नाही.\nआपला अभिप्राय शासकीय सेवा सुधारण्यासाठी उपयोगी ठरेल.\n\nहे पूर्ण करायला 30 सेकंदांपेक्षा कमी वेळ लागेल.\n\nकृपया पर्याय निवडा:`,
    type: "button",
    options: ["कार्यालय अनुभव", "धोरण सूचना", "प्रक्रिया सुधारणा"],
  }),

  CAT1_Q1: { text: "माहिती कक्ष (Help Desk) उपलब्ध होता का?", type: "button", options: ["हो", "नाही"] } as InteractiveMessage,
  CAT1_Q2: { text: "नागरिक सनद व कामाचे चार्ट लावलेले होते का?", type: "button", options: ["हो", "नाही", "अंशतः"] } as InteractiveMessage,
  CAT1_Q3: { text: "कार्यालयातील सर्व टेबल/काउंटरचा नकाशा लावलेला होता का?", type: "button", options: ["हो", "नाही"] } as InteractiveMessage,
  CAT1_Q4: { text: "बसण्याची व्यवस्था समाधानकारक होती का?", type: "list", options: ["5 स्टार (उत्कृष्ट)", "4 स्टार (चांगले)", "3 स्टार (सामान्य)", "2 स्टार (खराब)", "1 स्टार (खूप खराब)"] } as InteractiveMessage,
  CAT1_Q5: { text: "पिण्याचे पाणी स्वच्छ व उपलब्ध होते का?", type: "button", options: ["हो", "नाही"] } as InteractiveMessage,
  CAT1_Q6: { text: "स्वच्छतागृह स्वच्छ व कार्यरत होते का? पुरुष/स्त्री वेगळे होते का?", type: "list", options: ["5 स्टार (उत्कृष्ट)", "4 स्टार (चांगले)", "3 स्टार (सामान्य)", "2 स्टार (खराब)", "1 स्टार (खूप खराब)"] } as InteractiveMessage,
  CAT1_Q7: { text: "आपले काम पूर्ण झाले का?", type: "button", options: ["पूर्ण झाले", "अंशतः झाले", "झाले नाही"] } as InteractiveMessage,
  CAT1_Q8: { text: "आपण कोणत्या सेवेसाठी आला होता?", type: "list", options: ["प्रमाणपत्र", "परवाना", "योजना मंजुरी", "जमीन नोंद", "इतर"] } as InteractiveMessage,
  CAT1_Q9: { text: "एकूण अनुभव कसा होता?", type: "list", options: ["5 स्टार (उत्कृष्ट)", "4 स्टार (चांगले)", "3 स्टार (सामान्य)", "2 स्टार (खराब)", "1 स्टार (खूप खराब)"] } as InteractiveMessage,
  CAT1_Q10: { text: "अतिरिक्त सूचना / अभिप्राय असल्यास लिहा किंवा आवाज संदेश पाठवा", type: "button", options: ["वगळा"] } as InteractiveMessage,
  FINAL_OFFICE: { text: "आपल्या अभिप्रायाबद्दल धन्यवाद.\nआपली नोंद करण्यात आली आहे.\nयामुळे शासकीय सेवा सुधारण्यास मदत होईल.", type: "text" } as InteractiveMessage,

  CAT2_FLOW_SELECT: { text: "आपण काय सुचवू इच्छिता?", type: "button", options: ["योजनेत सुधारणा", "धोरण / कायदे बदल", "नवीन योजना सुचवा"] } as InteractiveMessage,
  CAT2_2A_Q1_SCHEME: { text: "योजना निवडा:", type: "list", options: ["PM Kisan", "शिष्यवृत्ती", "गृह योजना", "सामाजिक कल्याण योजना", "इतर"] } as InteractiveMessage,
  CAT2_2A_Q2_IMPROVEMENT: { text: "सुधारणा कोणती हवी?", type: "list", options: ["कागदपत्रे कमी करावीत", "मंजुरी लवकर मिळावी", "अनुदान वाढवावे", "पात्रता नियम अस्पष्ट", "कर्मचारी मदत कमी", "अनेक फेऱ्या माराव्या", "अनुदान कमी आहे"] } as InteractiveMessage,
  CAT2_2B_Q1_AREA: { text: "धोरण क्षेत्र निवडा:", type: "list", options: ["कृषी", "शिक्षण", "आरोग्य", "रोजगार", "पायाभूत सुविधा", "उद्योग", "पर्यावरण", "इतर"] } as InteractiveMessage,
  CAT2_2C_Q1_BENEFICIARY: { text: "नवीन योजना कोणासाठी असावी?", type: "list", options: ["शेतकरी", "महिला", "युवक", "ज्येष्ठ नागरिक", "आदिवासी", "शहरी गरीब", "इतर"] } as InteractiveMessage,
  CAT2_MANDATORY_TEXT: { text: "आपली सूचना / समस्या / योजना तपशील लिहा\nकिंवा आवाज संदेश पाठवा", type: "text" } as InteractiveMessage,
  FINAL_POLICY: { text: "धन्यवाद.\nआपला अभिप्राय नोंदविण्यात आला आहे.", type: "text" } as InteractiveMessage,

  CAT3_Q1_CHANGE: { text: "काय बदल करणे आवश्यक आहे?", type: "list", options: ["कागदपत्रे कमी करावीत", "प्रक्रिया सोपी करावी", "अनावश्यक मंजुरी रद्द", "सेवा ऑनलाईन करावी", "कार्यपद्धती सुधारावी"] } as InteractiveMessage,
  CAT3_Q2_SUGGESTION: { text: "आपली सूचना लिहा\nकिंवा आवाज संदेश पाठवा", type: "text" } as InteractiveMessage,
  CAT3_Q3_DEPARTMENT: { text: "आपली सूचना कोणत्या विभागासाठी आहे?", type: "list", options: ["कृषी", "शिक्षण", "आरोग्य", "रोजगार", "उद्योग", "पर्यावरण", "वगळा"] } as InteractiveMessage,
  FINAL_PROCESS: { text: "धन्यवाद.\nआपला अभिप्राय नोंदविण्यात आला आहे.", type: "text" } as InteractiveMessage,

  CONTINUE_MENU: (completedFlows: number[]): InteractiveMessage => {
    const flow1Text = completedFlows.includes(1) ? "कार्यालय अनुभव ✅" : "कार्यालय अनुभव";
    const flow2Text = completedFlows.includes(2) ? "धोरण सूचना ✅" : "धोरण सूचना";
    const flow3Text = completedFlows.includes(3) ? "प्रक्रिया सुधारणा ✅" : "प्रक्रिया सुधारणा";
    return {
      text: "आपण आणखी अभिप्राय द्यायचा आहे का?",
      type: "list",
      options: [flow1Text, flow2Text, flow3Text, "पूर्ण करा"],
    };
  },

  INVALID_OPTION: { text: "चुकीचा पर्याय निवडला आहे.\nकृपया योग्य पर्याय निवडा.", type: "text" } as InteractiveMessage,
  INVALID_RATING: { text: "कृपया 1 ते 5 मधील पर्याय निवडा.", type: "text" } as InteractiveMessage,
  OFFICE_NOT_FOUND: (officeId: string): InteractiveMessage => ({ text: `⚠️ Office with ID *${officeId}* was not found in the system.`, type: "text" }),
  SESSION_COMPLETED: { text: "आपण आधीच अभिप्राय दिला आहे. धन्यवाद.", type: "text" } as InteractiveMessage,
  ERROR: { text: "त्रुटी झाली आहे.\nकृपया पुन्हा प्रयत्न करा.", type: "text" } as InteractiveMessage,
};

export const QUESTIONS_EN = {
  // ── GREETING ──
  GREETING: (officeName: string): InteractiveMessage => ({
    text: `Welcome to Maharashtra Citizen Governance Feedback System\n\nThis is not a complaint portal.\nYour feedback helps improve government services.\n\nIt takes less than 30 seconds.\n\nPlease select an option:`,
    type: "button",
    options: ["Office Experience", "Policy Suggestion", "Process Reform"],
  }),

  CAT1_Q1: { text: "Help Desk available?", type: "button", options: ["Yes", "No"] } as InteractiveMessage,
  CAT1_Q2: { text: "Citizen Charter & Job Chart displayed?", type: "button", options: ["Yes", "No", "Partially"] } as InteractiveMessage,
  CAT1_Q3: { text: "Entrance map of all desks available?", type: "button", options: ["Yes", "No"] } as InteractiveMessage,
  CAT1_Q4: { text: "Seating comfortable for visitors?", type: "list", options: ["5 Stars (Excellent)", "4 Stars (Good)", "3 Stars (Average)", "2 Stars (Poor)", "1 Star (Very Poor)"] } as InteractiveMessage,
  CAT1_Q5: { text: "Drinking water hygienic & available?", type: "button", options: ["Yes", "No"] } as InteractiveMessage,
  CAT1_Q6: { text: "Toilets clean, functional, separate M/W?", type: "list", options: ["5 Stars (Excellent)", "4 Stars (Good)", "3 Stars (Average)", "2 Stars (Poor)", "1 Star (Very Poor)"] } as InteractiveMessage,
  CAT1_Q7: { text: "Purpose of visit fulfilled?", type: "button", options: ["Fully", "Partially", "No"] } as InteractiveMessage,
  CAT1_Q8: { text: "Which service/scheme did you visit for?", type: "list", options: ["Certificate", "License", "Scheme Approval", "Land Record", "Other"] } as InteractiveMessage,
  CAT1_Q9: { text: "Overall Experience Rating?", type: "list", options: ["5 Stars (Excellent)", "4 Stars (Good)", "3 Stars (Average)", "2 Stars (Poor)", "1 Star (Very Poor)"] } as InteractiveMessage,
  CAT1_Q10: { text: "Any additional comments or suggestions? (Type or send Voice Note)", type: "button", options: ["Skip"] } as InteractiveMessage,
  FINAL_OFFICE: { text: "Thank you for your feedback.\nYour submission has been recorded and will help improve governance.", type: "text" } as InteractiveMessage,

  CAT2_FLOW_SELECT: { text: "What would you like to suggest?", type: "button", options: ["Improve Scheme", "Amend Policy / Act", "Suggest New Scheme"] } as InteractiveMessage,
  CAT2_2A_Q1_SCHEME: { text: "Select Scheme:", type: "list", options: ["PM Kisan", "Scholarship", "Housing Scheme", "Social welfare Scheme", "Other"] } as InteractiveMessage,
  CAT2_2A_Q2_IMPROVEMENT: { text: "What improvement is needed?", type: "list", options: ["Reduce Documentation", "Faster Approval Timeline", "Increase Benefit Amount", "Eligibility Confusion", "Staff Support Inadequate", "Multiple Visits Required", "Low Benefit Amount"] } as InteractiveMessage,
  CAT2_2B_Q1_AREA: { text: "Select Area of Policy:", type: "list", options: ["Agriculture", "Education", "Health", "Employment", "Infrastructure", "Industry", "Environment", "Other"] } as InteractiveMessage,
  CAT2_2C_Q1_BENEFICIARY: { text: "Who should the new scheme benefit?", type: "list", options: ["Farmers", "Women", "Youth", "Senior Citizens", "Tribal communities", "Urban Poor", "Other"] } as InteractiveMessage,
  CAT2_MANDATORY_TEXT: { text: "Please type your detailed suggestion, problem description, or scheme idea here (Or send Voice Note)", type: "text" } as InteractiveMessage,
  FINAL_POLICY: { text: "Thank you. Your feedback has been submitted.", type: "text" } as InteractiveMessage,

  CAT3_Q1_CHANGE: { text: "What should be changed?", type: "list", options: ["Reduce documentation", "Simplify procedure", "Remove extra approvals", "Digitise service", "Restructure workflow"] } as InteractiveMessage,
  CAT3_Q2_SUGGESTION: { text: "Describe Your Suggestion (Type or send Voice Note):", type: "text" } as InteractiveMessage,
  CAT3_Q3_DEPARTMENT: { text: "Optional: Your suggestion is for:", type: "list", options: ["Agriculture", "Education", "Health", "Employment", "Industry", "Environment", "Skip"] } as InteractiveMessage,
  FINAL_PROCESS: { text: "Thank you. Your feedback has been submitted.", type: "text" } as InteractiveMessage,

  CONTINUE_MENU: (completedFlows: number[]): InteractiveMessage => {
    const flow1Text = completedFlows.includes(1) ? "Office Experience ✅" : "Office Experience";
    const flow2Text = completedFlows.includes(2) ? "Policy Suggestion ✅" : "Policy Suggestion";
    const flow3Text = completedFlows.includes(3) ? "Process Reform ✅" : "Process Reform";
    return {
      text: "Would you like to add more feedback?",
      type: "list",
      options: [flow1Text, flow2Text, flow3Text, "Submit and Finish"],
    };
  },

  INVALID_OPTION: { text: "⚠️ Invalid option selected. Please choose a valid option.", type: "text" } as InteractiveMessage,
  INVALID_RATING: { text: "⚠️ Please reply with a number between 1 and 5.", type: "text" } as InteractiveMessage,
  OFFICE_NOT_FOUND: (officeId: string): InteractiveMessage => ({ text: `⚠️ Office with ID *${officeId}* was not found in the system.`, type: "text" }),
  SESSION_COMPLETED: { text: "✅ You have already submitted your feedback. Thank you!", type: "text" } as InteractiveMessage,
  ERROR: { text: "⚠️ Something went wrong on our end. Please try again or scan the QR code to restart.", type: "text" } as InteractiveMessage,
};

export function getQuestions(lang: string | null) {
  return lang === "mr" ? QUESTIONS_MR : QUESTIONS_EN;
}

// ── Inward Translation Maps (Marathi/English -> English DB Storage) ──

export const MAP_YES_NO: Record<string, string> = {
  "हो": "Yes",
  "नाही": "No",
  "Yes": "Yes",
  "No": "No",
  "1": "Yes",
  "2": "No",
};

export const MAP_YES_NO_PARTIAL: Record<string, string> = {
  "हो": "Yes",
  "नाही": "No",
  "अंशतः": "Partially",
  "Yes": "Yes",
  "No": "No",
  "Partially": "Partially",
  "1": "Yes",
  "2": "No",
  "3": "Partially",
};

export const MAP_RATING: Record<string, number> = {
  "5 स्टार (उत्कृष्ट)": 5,
  "4 स्टार (चांगले)": 4,
  "3 स्टार (सामान्य)": 3,
  "2 स्टार (खराब)": 2,
  "1 स्टार (खूप खराब)": 1,
  "खूप खराब": 1,
  "खराब": 2,
  "सामान्य": 3,
  "चांगले": 4,
  "उत्कृष्ट": 5,
  "5 Stars (Excellent)": 5,
  "4 Stars (Good)": 4,
  "3 Stars (Average)": 3,
  "2 Stars (Poor)": 2,
  "1 Star (Very Poor)": 1,
  "1 Stars (Very Poor)": 1,
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
};

export const MAP_FULFILLED: Record<string, string> = {
  "पूर्ण झाले": "Fully",
  "अंशतः झाले": "Partially",
  "झाले नाही": "No",
  "Fully": "Fully",
  "Partially": "Partially",
  "No": "No",
  "1": "Fully",
  "2": "Partially",
  "3": "No",
};

export const MAP_SERVICES: Record<string, string> = {
  "प्रमाणपत्र": "Certificate",
  "परवाना": "License",
  "योजना मंजुरी": "Scheme Approval",
  "जमीन नोंद": "Land Record",
  "इतर": "Other",
  "Certificate": "Certificate",
  "License": "License",
  "Scheme Approval": "Scheme Approval",
  "Land Record": "Land Record",
  "Other": "Other",
  "1": "Certificate",
  "2": "License",
  "3": "Scheme Approval",
  "4": "Land Record",
  "5": "Other",
};

export const MAP_FLOWS: Record<string, number> = {
  "कार्यालय अनुभव": 1,
  "कार्यालय अनुभव ✅": 1,
  "धोरण सूचना": 2,
  "धोरण सूचना ✅": 2,
  "प्रक्रिया सुधारणा": 3,
  "प्रक्रिया सुधारणा ✅": 3,
  "पूर्ण करा": 0,
  "Office Experience": 1,
  "Office Experience ✅": 1,
  "Policy Suggestion": 2,
  "Policy Suggestion ✅": 2,
  "Process Reform": 3,
  "Process Reform ✅": 3,
  "Submit and Finish": 0,
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 0,
  "0": 0,
};

export const MAP_POLICY_FLOWS: Record<string, string> = {
  "योजनेत सुधारणा": "Improve Existing Scheme",
  "धोरण / कायदे बदल": "Amend Existing Policy / Act",
  "नवीन योजना सुचवा": "Suggest New Scheme",
  "Improve Scheme": "Improve Existing Scheme",
  "Improve Existing Sch": "Improve Existing Scheme", // Legacy Fallback
  "Amend Policy / Act": "Amend Existing Policy / Act",
  "Suggest New Scheme": "Suggest New Scheme",
  "1": "Improve Existing Scheme",
  "2": "Amend Existing Policy / Act",
  "3": "Suggest New Scheme",
};

export const MAP_SCHEMES: Record<string, string> = {
  "PM Kisan": "PM Kisan",
  "शिष्यवृत्ती": "Scholarship",
  "गृह योजना": "Housing Scheme",
  "सामाजिक कल्याण योजना": "Social welfare Scheme",
  "इतर": "Other",
  "Scholarship": "Scholarship",
  "Housing Scheme": "Housing Scheme",
  "Social welfare Scheme": "Social welfare Scheme",
  "Other": "Other",
  "1": "PM Kisan",
  "2": "Scholarship",
  "3": "Housing Scheme",
  "4": "Social welfare Scheme",
  "5": "Other",
};

export const MAP_IMPROVEMENTS: Record<string, string> = {
  "कागदपत्रे कमी करावीत": "Reduce Documentation",
  "मंजुरी लवकर मिळावी": "Faster Approval Timeline",
  "अनुदान वाढवावे": "Increase Benefit Amount",
  "पात्रता नियम अस्पष्ट": "Eligibility Confusion",
  "कर्मचारी मदत कमी": "Staff Support Inadequate",
  "अनेक फेऱ्या माराव्या": "Multiple Visits Required",
  "अनुदान कमी आहे": "Low Benefit Amount",
  "Reduce Documentation": "Reduce Documentation",
  "Faster Approval Timeline": "Faster Approval Timeline",
  "Increase Benefit Amount": "Increase Benefit Amount",
  "Eligibility Confusion": "Eligibility Confusion",
  "Staff Support Inadequate": "Staff Support Inadequate",
  "Multiple Visits Required": "Multiple Visits Required",
  "Low Benefit Amount": "Low Benefit Amount",
  "1": "Reduce Documentation",
  "2": "Faster Approval Timeline",
  "3": "Increase Benefit Amount",
  "4": "Eligibility Confusion",
  "5": "Staff Support Inadequate",
  "6": "Multiple Visits Required",
  "7": "Low Benefit Amount",
};

export const MAP_AREAS: Record<string, string> = {
  "कृषी": "Agriculture",
  "शिक्षण": "Education",
  "आरोग्य": "Health",
  "रोजगार": "Employment",
  "पायाभूत सुविधा": "Infrastructure",
  "उद्योग": "Industry",
  "पर्यावरण": "Environment",
  "इतर": "Other",
  "Agriculture": "Agriculture",
  "Education": "Education",
  "Health": "Health",
  "Employment": "Employment",
  "Infrastructure": "Infrastructure",
  "Industry": "Industry",
  "Environment": "Environment",
  "Other": "Other",
  "1": "Agriculture",
  "2": "Education",
  "3": "Health",
  "4": "Employment",
  "5": "Infrastructure",
  "6": "Industry",
  "7": "Environment",
  "8": "Other",
};

export const MAP_BENEFICIARIES: Record<string, string> = {
  "शेतकरी": "Farmers",
  "महिला": "Women",
  "युवक": "Youth",
  "ज्येष्ठ नागरिक": "Senior Citizens",
  "आदिवासी": "Tribal communities",
  "शहरी गरीब": "Urban Poor",
  "इतर": "Other",
  "Farmers": "Farmers",
  "Women": "Women",
  "Youth": "Youth",
  "Senior Citizens": "Senior Citizens",
  "Tribal communities": "Tribal communities",
  "Urban Poor": "Urban Poor",
  "Other": "Other",
  "1": "Farmers",
  "2": "Women",
  "3": "Youth",
  "4": "Senior Citizens",
  "5": "Tribal communities",
  "6": "Urban Poor",
  "7": "Other",
};

export const MAP_CHANGES: Record<string, string> = {
  "कागदपत्रे कमी करावीत": "Reduce documentation",
  "प्रक्रिया सोपी करावी": "Simplify procedure",
  "अनावश्यक मंजुरी रद्द": "Remove redundant approvals",
  "सेवा ऑनलाईन करावी": "Digitise service",
  "कार्यपद्धती सुधारावी": "Restructure service workflow",
  "Reduce documentation": "Reduce documentation",
  "Simplify procedure": "Simplify procedure",
  "Remove redundant approvals": "Remove redundant approvals",
  "Remove extra approvals": "Remove redundant approvals",
  "Digitise service": "Digitise service",
  "Restructure workflow": "Restructure service workflow",
  "1": "Reduce documentation",
  "2": "Simplify procedure",
  "3": "Remove redundant approvals",
  "4": "Digitise service",
  "5": "Restructure service workflow",
};

export const MAP_DEPARTMENTS: Record<string, string> = {
  "कृषी": "Agriculture",
  "शिक्षण": "Education",
  "आरोग्य": "Health",
  "रोजगार": "Employment",
  "उद्योग": "Industry",
  "पर्यावरण": "Environment",
  "वगळा": "Skip",
  "Agriculture": "Agriculture",
  "Education": "Education",
  "Health": "Health",
  "Employment": "Employment",
  "Industry": "Industry",
  "Environment": "Environment",
  "Skip": "Skip",
  "1": "Agriculture",
  "2": "Education",
  "3": "Health",
  "4": "Employment",
  "5": "Industry",
  "6": "Environment",
  "7": "Skip",
};
