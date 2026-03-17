/**
 * FIXED BOT QUESTIONS — INTERACTIVE WhatsApp UI
 *
 * Defines Native WhatsApp Buttons (<= 3 options) and Lists (> 3 options).
 * Fully translated into Marathi for the citizen-facing UI.
 */

export type InteractiveMessage = {
  text: string;
  type: "text" | "button" | "list";
  options?: string[]; // Allowed exact text values for buttons/lists
};

export const QUESTIONS = {
  // ── STEP 1: LANGUAGE CHOICE ──
  LANGUAGE_SELECT: {
    text: "Namaskar / Hello\nकृपया भाषा निवडा / Please choose language",
    type: "button",
    options: ["मराठी", "English"],
  } as InteractiveMessage,

  // ── GREETING ──
  GREETING: (officeName: string): InteractiveMessage => ({
    text: `महाराष्ट्र नागरिक शासकीय अभिप्राय प्रणालीमध्ये आपले स्वागत आहे\n\nही तक्रार नोंदविण्याची प्रणाली नाही.\nआपला अभिप्राय शासकीय सेवा सुधारण्यासाठी उपयोगी ठरेल.\n\nहे पूर्ण करायला 30 सेकंदांपेक्षा कमी वेळ लागेल.\n\nकृपया पर्याय निवडा:`,
    type: "button",
    options: ["कार्यालय अनुभव", "धोरण सूचना", "प्रक्रिया सुधारणा सूचना"],
  }),

  // ── CATEGORY 1: OFFICE EXPERIENCE ──
  CAT1_Q1: {
    text: `माहिती कक्ष (Help Desk) उपलब्ध होता का?`,
    type: "button",
    options: ["हो", "नाही"],
  } as InteractiveMessage,

  CAT1_Q2: {
    text: `नागरिक सनद व कामाचे चार्ट लावलेले होते का?`,
    type: "button",
    options: ["हो", "नाही", "अंशतः"],
  } as InteractiveMessage,

  CAT1_Q3: {
    text: `कार्यालयातील सर्व टेबल/काउंटरचा नकाशा लावलेला होता का?`,
    type: "button",
    options: ["हो", "नाही"],
  } as InteractiveMessage,

  CAT1_Q4: {
    text: `बसण्याची व्यवस्था समाधानकारक होती का?`,
    type: "list",
    options: ["खूप खराब", "खराब", "सामान्य", "चांगले", "उत्कृष्ट"],
  } as InteractiveMessage,

  CAT1_Q5: {
    text: `पिण्याचे पाणी स्वच्छ व उपलब्ध होते का?`,
    type: "button",
    options: ["हो", "नाही"],
  } as InteractiveMessage,

  CAT1_Q6: {
    text: `स्वच्छतागृह स्वच्छ व कार्यरत होते का? पुरुष/स्त्री वेगळे होते का?`,
    type: "list",
    options: ["खूप खराब", "खराब", "सामान्य", "चांगले", "उत्कृष्ट"],
  } as InteractiveMessage,

  CAT1_Q7: {
    text: `आपले काम पूर्ण झाले का?`,
    type: "button",
    options: ["पूर्ण झाले", "अंशतः झाले", "झाले नाही"],
  } as InteractiveMessage,

  CAT1_Q8: {
    text: `आपण कोणत्या सेवेसाठी आला होता?`,
    type: "list",
    options: ["प्रमाणपत्र", "परवाना", "योजना मंजुरी", "जमीन नोंद", "इतर"],
  } as InteractiveMessage,

  CAT1_Q9: {
    text: `एकूण अनुभव कसा होता?`,
    type: "list",
    options: ["खूप खराब", "खराब", "सामान्य", "चांगले", "उत्कृष्ट"],
  } as InteractiveMessage,

  CAT1_Q10: {
    text: `अतिरिक्त सूचना / अभिप्राय असल्यास लिहा किंवा आवाज संदेश पाठवा`,
    type: "button",
    options: ["वगळा"], // Allow them to click skip instead of typing
  } as InteractiveMessage,

  FINAL_OFFICE: {
    text: `आपल्या अभिप्रायाबद्दल धन्यवाद.\nआपली नोंद करण्यात आली आहे.\nयामुळे शासकीय सेवा सुधारण्यास मदत होईल.`,
    type: "text",
  } as InteractiveMessage,


  // ── CATEGORY 2: POLICY SUGGESTION ──
  CAT2_FLOW_SELECT: {
    text: `आपण काय सुचवू इच्छिता?`,
    type: "button",
    options: ["विद्यमान योजनेत सुधारणा", "विद्यमान धोरण / कायद्यात बदल", "नवीन योजना सुचवा"],
  } as InteractiveMessage,

  CAT2_2A_Q1_SCHEME: {
    text: `योजना निवडा:`,
    type: "list",
    options: ["PM Kisan", "शिष्यवृत्ती", "गृह योजना", "सामाजिक कल्याण योजना", "इतर"],
  } as InteractiveMessage,

  CAT2_2A_Q2_IMPROVEMENT: {
    text: `सुधारणा कोणती हवी?`,
    type: "list",
    options: [
      "कागदपत्रे कमी करावीत",
      "मंजुरी लवकर मिळावी",
      "अनुदान वाढवावे",
      "पात्रता नियम स्पष्ट नाहीत",
      "कर्मचारी मदत कमी",
      "अनेक वेळा कार्यालयात यावे लागते",
      "अनुदान कमी आहे"
    ],
  } as InteractiveMessage,

  CAT2_2B_Q1_AREA: {
    text: `धोरण क्षेत्र निवडा:`,
    type: "list",
    options: [
      "कृषी",
      "शिक्षण",
      "आरोग्य",
      "रोजगार",
      "पायाभूत सुविधा",
      "उद्योग",
      "पर्यावरण",
      "इतर"
    ],
  } as InteractiveMessage,

  CAT2_2C_Q1_BENEFICIARY: {
    text: `नवीन योजना कोणासाठी असावी?`,
    type: "list",
    options: [
      "शेतकरी",
      "महिला",
      "युवक",
      "ज्येष्ठ नागरिक",
      "आदिवासी",
      "शहरी गरीब",
      "इतर"
    ],
  } as InteractiveMessage,

  CAT2_MANDATORY_TEXT: {
    text: `आपली सूचना / समस्या / योजना तपशील लिहा\nकिंवा आवाज संदेश पाठवा`,
    type: "text",
  } as InteractiveMessage,

  FINAL_POLICY: {
    text: `धन्यवाद.\nआपला अभिप्राय नोंदविण्यात आला आहे.`,
    type: "text",
  } as InteractiveMessage,


  // ── CATEGORY 3: PROCESS REFORM ──
  CAT3_Q1_CHANGE: {
    text: `काय बदल करणे आवश्यक आहे?`,
    type: "list",
    options: [
      "कागदपत्रे कमी करावीत",
      "प्रक्रिया सोपी करावी",
      "अनावश्यक मंजुरी काढाव्यात",
      "सेवा ऑनलाईन करावी",
      "कार्यपद्धती सुधारावी"
    ],
  } as InteractiveMessage,

  CAT3_Q2_SUGGESTION: {
    text: `आपली सूचना लिहा\nकिंवा आवाज संदेश पाठवा`,
    type: "text",
  } as InteractiveMessage,

  CAT3_Q3_DEPARTMENT: {
    text: `आपली सूचना कोणत्या विभागासाठी आहे?`,
    type: "list", // Too many for buttons (7 options including 'skip')
    options: [
      "कृषी",
      "शिक्षण",
      "आरोग्य",
      "रोजगार",
      "उद्योग",
      "पर्यावरण",
      "वगळा"
    ],
  } as InteractiveMessage,

  FINAL_PROCESS: {
    text: `धन्यवाद.\nआपला अभिप्राय नोंदविण्यात आला आहे.`,
    type: "text",
  } as InteractiveMessage,


  // ── CONTINUE MENU ──
  CONTINUE_MENU: (completedFlows: number[]): InteractiveMessage => {
    // Generate dynamic button options based on what is completed
    const flow1Text = completedFlows.includes(1) ? "कार्यालय अनुभव ✅" : "कार्यालय अनुभव";
    const flow2Text = completedFlows.includes(2) ? "धोरण सूचना ✅" : "धोरण सूचना";
    const flow3Text = completedFlows.includes(3) ? "प्रक्रिया सुधारणा ✅" : "प्रक्रिया सुधारणा";
    
    // Twilio only allows max 3 buttons per message. We have 4 options (3 flows + 1 submit).
    // WhatsApp native buttons are strictly limited to 3.
    // So we MUST use a "list" type here if there are more than 3 options.
    return {
      text: `आपण आणखी अभिप्राय द्यायचा आहे का?`,
      type: "list",
      options: [
        flow1Text,
        flow2Text,
        flow3Text,
        "पूर्ण करा" // Submit and Finish
      ],
    };
  },


  // ── ERRORS & FALLBACKS ──
  INVALID_OPTION: {
    text: `चुकीचा पर्याय निवडला आहे.\nकृपया योग्य पर्याय निवडा.`,
    type: "text",
  } as InteractiveMessage,

  INVALID_RATING: {
    text: `कृपया 1 ते 5 मधील पर्याय निवडा.`,
    type: "text",
  } as InteractiveMessage,

  OFFICE_NOT_FOUND: (officeId: string): InteractiveMessage => ({
    text: `⚠️ Office with ID *${officeId}* was not found in the system.`,
    type: "text",
  }),

  SESSION_COMPLETED: {
    text: `आपण आधीच अभिप्राय दिला आहे. धन्यवाद.`,
    type: "text",
  } as InteractiveMessage,

  ERROR: {
    text: `त्रुटी झाली आहे.\nकृपया पुन्हा प्रयत्न करा.`,
    type: "text",
  } as InteractiveMessage,
};

// ── Inward Translation Maps (Marathi -> English DB Storage) ──
// These maps allow us to accept the exact Marathi text from WhatsApp buttons
// but cleanly save the English equivalent in MongoDB to preserve backward compatibility & analytics.

export const MAP_YES_NO: Record<string, string> = {
  "हो": "Yes",
  "नाही": "No",
  "1": "Yes",
  "2": "No",
};

export const MAP_YES_NO_PARTIAL: Record<string, string> = {
  "हो": "Yes",
  "नाही": "No",
  "अंशतः": "Partially",
  "1": "Yes",
  "2": "No",
  "3": "Partially",
};

export const MAP_RATING: Record<string, number> = {
  "खूप खराब": 1,
  "खराब": 2,
  "सामान्य": 3,
  "चांगले": 4,
  "उत्कृष्ट": 5,
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
  "प्रक्रिया सुधारणा सूचना": 3,
  "प्रक्रिया सुधारणा ✅": 3,
  "प्रक्रिया सुधारणा": 3,
  "पूर्ण करा": 0,
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 0,
  "0": 0,
};

export const MAP_POLICY_FLOWS: Record<string, string> = {
  "विद्यमान योजनेत सुधारणा": "Improve Existing Scheme",
  "विद्यमान धोरण / कायद्यात बदल": "Amend Existing Policy / Act",
  "नवीन योजना सुचवा": "Suggest New Scheme",
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
  "पात्रता नियम स्पष्ट नाहीत": "Eligibility Confusion",
  "कर्मचारी मदत कमी": "Staff Support Inadequate",
  "अनेक वेळा कार्यालयात यावे लागते": "Multiple Visits Required",
  "अनुदान कमी आहे": "Low Benefit Amount",
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
  "अनावश्यक मंजुरी काढाव्यात": "Remove redundant approvals",
  "सेवा ऑनलाईन करावी": "Digitise service",
  "कार्यपद्धती सुधारावी": "Restructure service workflow",
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
  "1": "Agriculture",
  "2": "Education",
  "3": "Health",
  "4": "Employment",
  "5": "Industry",
  "6": "Environment",
  "7": "Skip",
};
