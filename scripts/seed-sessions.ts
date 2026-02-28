/**
 * Seed script — populates the `sessions` collection with sample realistic feedback data.
 *
 * Usage:
 *   npx tsx scripts/seed-sessions.ts
 *
 * Requirements:
 *   MONGODB_URI must be set in your .env or .env.local file.
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load .env or .env.local
const envLocal = path.resolve(process.cwd(), ".env.local");
const envFile = path.resolve(process.cwd(), ".env");
dotenv.config({ path: fs.existsSync(envLocal) ? envLocal : envFile });

import Session from "../models/Session";

// Pre-defined realistic offices matching seed-offices.ts
const offices = [
    { id: "MH-PUN-COL-001", name: "Collector Office Pune" },
    { id: "MH-PUN-RTO-001", name: "RTO Pune (MH-12)" },
    { id: "MH-MUM-BMC-001", name: "BMC Headquarters Mumbai" },
    { id: "MH-NAS-COL-001", name: "Collector Office Nashik" },
    { id: "MH-NAG-NMC-001", name: "Nagpur Municipal Corporation" },
    { id: "MH-CSN-COL-001", name: "Collector Office Chhatrapati Sambhajinagar" },
    { id: "MH-AMR-COL-001", name: "Collector Office Amravati" },
    { id: "MH-THA-COL-001", name: "Collector Office Thane" },
    { id: "MH-PUN-PMC-001", name: "Pune Municipal Corporation Main Building" },
    { id: "MH-JAL-ZP-001", name: "Zilla Parishad Jalgaon" }
];

// Helper to generate a random phone number
const randomPhone = () => `+919${Math.floor(100000000 + Math.random() * 900000000)}`;

// Helper to generate a date within the last 30 days
const randomDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * 30));
    d.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60)); // Random time during work hours
    return d;
};

// Generate highly realistic, mostly positive, often multilingual feedback templates
const feedbackTemplates: any[] = [
    // -------- CATEGORY 1: OFFICE EXPERIENCE (10 STEPS) --------
    {
        flow: 1,
        rating: 5, // used for feedback text rating
        feedback: "The staff was very helpful and the token system moved fast.",
        // Cat1 Specifics:
        cat1_q1_helpdesk: "Yes",
        cat1_q2_charter: "Yes",
        cat1_q3_map: "Yes",
        cat1_q4_seating: 5,
        cat1_q5_water: "Yes",
        cat1_q6_toilets: 4,
        cat1_q7_fulfilled: "Fully",
        cat1_q8_service: "Certificate",
        cat1_q9_overall: 5,
        cat1_q10_comments: "The staff was very helpful and the token system moved fast.",

        // For backwards compatibility metrics:
        office_rating: 5,
        office_positive: "Token system efficiency",

        sentiment: "Positive",
        confidence: 94,
        themes: ["Queue Flow Efficiency", "Staff Behavior"],
        keywords: ["fast", "helpful staff", "token system"],
    },
    {
        flow: 1,
        rating: 4,
        feedback: "माझे काम एकाच दिवसात झाले. 7/12 लवकर मिळाला.",
        translated_text: "My work was done in a single day. Got the 7/12 extract quickly.",

        cat1_q1_helpdesk: "Yes",
        cat1_q2_charter: "Partially",
        cat1_q3_map: "No",
        cat1_q4_seating: 3,
        cat1_q5_water: "Yes",
        cat1_q6_toilets: 3,
        cat1_q7_fulfilled: "Fully",
        cat1_q8_service: "Land Record",
        cat1_q9_overall: 4,
        cat1_q10_comments: "माझे काम एकाच दिवसात झाले. 7/12 लवकर मिळाला.",

        office_rating: 4,
        office_positive: "Same-day delivery",

        sentiment: "Positive",
        confidence: 92,
        themes: ["Document Issuance", "Processing Speed"],
        keywords: ["लवकर", "quick", "7/12"],
    },
    {
        flow: 1,
        rating: 1,
        feedback: "Have been visiting for 3 weeks just for one signature. Very frustrating slow process.",

        cat1_q1_helpdesk: "No",
        cat1_q2_charter: "No",
        cat1_q3_map: "No",
        cat1_q4_seating: 2,
        cat1_q5_water: "No",
        cat1_q6_toilets: 1,
        cat1_q7_fulfilled: "No",
        cat1_q8_service: "Other",
        cat1_q9_overall: 1,
        cat1_q10_comments: "Have been visiting for 3 weeks just for one signature.",

        office_rating: 1,
        office_issue: "Excessive delay in approvals",

        sentiment: "Negative",
        confidence: 97,
        themes: ["Approval Flow Delays", "Staff Unresponsiveness"],
        keywords: ["3 weeks", "frustrating", "slow"],
    },

    // -------- CATEGORY 2: POLICY SUGGESTION --------
    {
        flow: 2,
        rating: 4,
        feedback: "Please increase awareness about this scheme in remote villages through Gram Panchayats.",
        policy_suggestion: "Please increase awareness about this scheme in remote villages through Gram Panchayats.",

        cat2_flow_type: "Improve Existing Scheme",
        cat2_scheme_name: "PM Kisan",
        cat2_improvement_needed: "Eligibility Confusion",
        cat2_mandatory_feedback: "Please increase awareness about this scheme in remote villages through Gram Panchayats.",

        sentiment: "Positive",
        confidence: 89,
        themes: ["Digital Access Awareness", "Rural Outreach"],
        keywords: ["awareness", "villages", "scheme outreach"],
        reform: "Mandate local Gram Panchayat awareness drives for state welfare schemes.",
    },
    {
        flow: 2,
        rating: 5,
        feedback: "जेष्ठ नागरिकांना वारंवार कार्यालयात यावे लागते.",
        translated_text: "It would be great if senior citizens could submit life certificates online. Senior citizens have to visit the office frequently.",
        policy_suggestion: "It would be great if senior citizens could submit life certificates online.",

        cat2_flow_type: "Amend Existing Policy / Act",
        cat2_policy_area: "Health",
        cat2_mandatory_feedback: "It would be great if senior citizens could submit life certificates online. जेष्ठ नागरिकांना वारंवार कार्यालयात यावे लागते.",

        sentiment: "Positive",
        confidence: 91,
        themes: ["Digital Accessibility", "Senior Citizen Friendly"],
        keywords: ["online", "life certificate", "जेष्ठ नागरिक", "senior citizen"],
        reform: "Develop digital portal for remote life certificate submission.",
    },

    // -------- CATEGORY 3: PROCESS REFORM --------
    {
        flow: 3,
        rating: 4,
        feedback: "If Aadhar is linked, you should automatically fetch the address instead of asking for proof again.",
        process_suggestion: "If Aadhar is linked, you should automatically fetch the address instead of asking for proof again.",

        cat3_change_type: "Reduce documentation",
        cat3_suggestion: "If Aadhar is linked, you should automatically fetch the address instead of asking for proof again.",
        cat3_department: "Employment",

        sentiment: "Neutral",
        confidence: 90,
        themes: ["Documentation Rationalisation", "Tech Integration"],
        keywords: ["aadhar", "automatic address fetch", "documents"],
        reform: "Integrate Aadhar API for automated address verification during renewals.",
    },
    {
        flow: 3,
        rating: 5,
        feedback: "ऑनलाईन पेमेंट सिस्टम अधिक चांगली करा. खूप वेळा सर्व्हर डाऊन असतो.",
        translated_text: "Make the online payment system better. The server is down many times.",
        process_suggestion: "ऑनलाईन पेमेंट सिस्टम अधिक चांगली करा. खूप वेळा सर्व्हर डाऊन असतो.",

        cat3_change_type: "Digitise service",
        cat3_suggestion: "ऑनलाईन पेमेंट सिस्टम अधिक चांगली करा. खूप वेळा सर्व्हर डाऊन असतो.",
        cat3_department: "Infrastructure", // Actually not in the dictionary exactly, but allows free text optionally

        sentiment: "Neutral",
        confidence: 85,
        themes: ["Digital Infrastructure", "Service Reliability"],
        keywords: ["सर्व्हर", "payment", "server down"],
        reform: "Upgrade municipal payment gateway server capacity.",
    },
];

async function seedSessions() {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        console.error("❌  MONGODB_URI is not defined. Check your .env file.");
        process.exit(1);
    }

    console.log("🔌  Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅  Connected.");

    // Clear existing sessions to avoid clutter
    console.log("🧹  Clearing existing sessions...");
    await Session.deleteMany({});

    const generatedSessions = [];

    // Generate 150 realistic sessions
    for (let i = 0; i < 150; i++) {
        const office = offices[Math.floor(Math.random() * offices.length)];
        const template = feedbackTemplates[Math.floor(Math.random() * feedbackTemplates.length)];
        const sessionDate = randomDate();

        generatedSessions.push({
            phone: randomPhone(),
            office_id: office.id,
            office_name: office.name,
            current_step: 5, // Mark as completed workflow
            completed: true,
            created_at: sessionDate,
            updated_at: sessionDate,

            answers: {
                flow_choice: template.flow,
                rating: template.rating,
                feedback: template.flow === 1 ? template.feedback : null,
                policy_suggestion: template.flow === 2 ? template.policy_suggestion : null,
                process_suggestion: template.flow === 3 ? template.process_suggestion : null,

                // Extended mapped answers based on the flow
                office_rating: template.office_rating || null,
                office_positive: template.office_positive || null,
                office_issue: template.office_issue || null,

                // CAT 1 fields
                cat1_q1_helpdesk: template.cat1_q1_helpdesk || null,
                cat1_q2_charter: template.cat1_q2_charter || null,
                cat1_q3_map: template.cat1_q3_map || null,
                cat1_q4_seating: template.cat1_q4_seating || null,
                cat1_q5_water: template.cat1_q5_water || null,
                cat1_q6_toilets: template.cat1_q6_toilets || null,
                cat1_q7_fulfilled: template.cat1_q7_fulfilled || null,
                cat1_q8_service: template.cat1_q8_service || null,
                cat1_q9_overall: template.cat1_q9_overall || null,
                cat1_q10_comments: template.cat1_q10_comments || null,

                // CAT 2 Fields
                cat2_flow_type: template.cat2_flow_type || null,
                cat2_scheme_name: template.cat2_scheme_name || null,
                cat2_improvement_needed: template.cat2_improvement_needed || null,
                cat2_policy_area: template.cat2_policy_area || null,
                cat2_beneficiary: template.cat2_beneficiary || null,
                cat2_mandatory_feedback: template.cat2_mandatory_feedback || null,

                // CAT 3 Fields
                cat3_change_type: template.cat3_change_type || null,
                cat3_suggestion: template.cat3_suggestion || null,
                cat3_department: template.cat3_department || null,
            },

            ai_analysis: {
                sentiment: template.sentiment,
                confidence: template.confidence,
                themes: template.themes,
                keywords: template.keywords,
                translated_text: template.translated_text || null,
                reform_recommendation: template.reform || null,
            },
        });
    }

    console.log("⏳  Inserting 150 realistic multilingual sessions...");
    await Session.insertMany(generatedSessions);
    console.log("✅  Seeded successfully.");

    await mongoose.disconnect();
    console.log("🔌  Disconnected.");
}

seedSessions().catch((err) => {
    console.error("❌  Seed failed:", err);
    process.exit(1);
});
