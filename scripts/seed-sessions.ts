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
const feedbackTemplates = [
    // -------- MOSTLY POSITIVE (Target ~70%) --------

    // Office Experience (Flow 1) - English
    {
        flow: 1,
        rating: 5,
        office_rating: 5,
        feedback: "The staff was very helpful and the token system moved fast.",
        office_positive: "Token system efficiency",
        sentiment: "Positive",
        confidence: 94,
        themes: ["Queue Flow Efficiency", "Staff Behavior"],
        keywords: ["fast", "helpful staff", "token system"],
    },
    {
        flow: 1,
        rating: 4,
        office_rating: 4,
        feedback: "Overall good experience but parking was a little difficult to find.",
        office_issue: "Parking availability",
        office_positive: "General service",
        sentiment: "Positive",
        confidence: 88,
        themes: ["General Experience", "Infrastructure"],
        keywords: ["parking", "good experience"],
    },
    // Office Experience (Flow 1) - Marathi (with translation)
    {
        flow: 1,
        rating: 5,
        office_rating: 5,
        feedback: "खूप छान आणि जलद काम झाले. अधिकाऱ्यांनी चांगली मदत केली.",
        translated_text: "Very good and fast work. Officers helped well.",
        office_positive: "Speed of work and helpful officers",
        sentiment: "Positive",
        confidence: 96,
        themes: ["Processing Speed", "Staff Behavior"],
        keywords: ["जलद", "मदत", "fast work", "helpful"],
    },
    {
        flow: 1,
        rating: 4,
        office_rating: 4,
        feedback: "माझे काम एकाच दिवसात झाले. 7/12 लवकर मिळाला.",
        translated_text: "My work was done in a single day. Got the 7/12 extract quickly.",
        office_positive: "Same-day delivery",
        sentiment: "Positive",
        confidence: 92,
        themes: ["Document Issuance", "Processing Speed"],
        keywords: ["लवकर", "quick", "7/12"],
    },

    // Policy Suggestion (Flow 2) - English
    {
        flow: 2,
        rating: 4,
        policy_name: "Laadki Bahin Yojana",
        policy_improvement_type: "Awareness",
        policy_beneficiary: "Women in rural areas",
        policy_suggestion: "Please increase awareness about this scheme in remote villages through Gram Panchayats.",
        sentiment: "Positive",
        confidence: 89,
        themes: ["Digital Access Awareness", "Rural Outreach"],
        keywords: ["awareness", "villages", "scheme outreach"],
        reform: "Mandate local Gram Panchayat awareness drives for state welfare schemes.",
    },
    // Policy Suggestion (Flow 2) - Marathi / English Mix
    {
        flow: 2,
        rating: 5,
        policy_name: "Sanjay Gandhi Niradhar Yojana",
        policy_improvement_type: "Online Access",
        policy_beneficiary: "Senior Citizens",
        policy_suggestion: "It would be great if senior citizens could submit life certificates online. जेष्ठ नागरिकांना वारंवार कार्यालयात यावे लागते.",
        translated_text: "It would be great if senior citizens could submit life certificates online. Senior citizens have to visit the office frequently.",
        sentiment: "Positive",
        confidence: 91,
        themes: ["Digital Accessibility", "Senior Citizen Friendly"],
        keywords: ["online", "life certificate", "जेष्ठ नागरिक", "senior citizen"],
        reform: "Develop digital portal for remote life certificate submission.",
    },

    // Process Reform (Flow 3) - English
    {
        flow: 3,
        rating: 4,
        process_name: "Driving License Renewal",
        process_difficulty: "Too many documents required",
        process_suggestion: "If Aadhar is linked, you should automatically fetch the address instead of asking for proof again.",
        sentiment: "Neutral", // Constructive
        confidence: 90,
        themes: ["Documentation Rationalisation", "Tech Integration"],
        keywords: ["aadhar", "automatic address fetch", "documents"],
        reform: "Integrate Aadhar API for automated address verification during renewals.",
    },
    // Process Reform (Flow 3) - Marathi
    {
        flow: 3,
        rating: 5,
        process_name: "Property Tax Payment",
        process_difficulty: "Server down issue",
        process_suggestion: "ऑनलाईन पेमेंट सिस्टम अधिक चांगली करा. खूप वेळा सर्व्हर डाऊन असतो.",
        translated_text: "Make the online payment system better. The server is down many times.",
        sentiment: "Neutral",
        confidence: 85,
        themes: ["Digital Infrastructure", "Service Reliability"],
        keywords: ["सर्व्हर", "payment", "server down"],
        reform: "Upgrade municipal payment gateway server capacity.",
    },

    // -------- NEUTRAL / CONSTRUCTIVE (Target ~20%) --------
    {
        flow: 1,
        rating: 3,
        office_rating: 3,
        feedback: "The queue was a bit confusing but I eventually got my certificate.",
        office_issue: "Confusing queue management",
        sentiment: "Neutral",
        confidence: 82,
        themes: ["Citizen Guidance Clarity"],
        keywords: ["confusing queue"],
    },
    {
        flow: 1,
        rating: 3,
        office_rating: 3,
        feedback: "काम झाले पण तिथे बसण्यासाठी पुरेशी व्यवस्था नव्हती.",
        translated_text: "Work was done but there was not enough seating arrangement there.",
        office_issue: "Lack of seating",
        sentiment: "Neutral",
        confidence: 88,
        themes: ["Infrastructure", "Waiting Area"],
        keywords: ["व्यवस्था", "seating"],
    },

    // -------- NEGATIVE (Target ~10%) --------
    {
        flow: 1,
        rating: 1,
        office_rating: 1,
        feedback: "Have been visiting for 3 weeks just for one signature. Very frustrating slow process.",
        office_issue: "Excessive delay in approvals",
        sentiment: "Negative",
        confidence: 97,
        themes: ["Approval Flow Delays", "Staff Unresponsiveness"],
        keywords: ["3 weeks", "frustrating", "slow"],
    },
    {
        flow: 1,
        rating: 2,
        office_rating: 2,
        feedback: "अधिकारी दुपारी २ वाजेपर्यंत जेवणाच्या सुट्टीत असतात.",
        translated_text: "Officers are on lunch break till 2 PM.",
        office_issue: "Extended lunch breaks by staff",
        sentiment: "Negative",
        confidence: 94,
        themes: ["Staff Availability", "Time Management"],
        keywords: ["lunch break", "सुट्टी", "absent"],
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

                policy_name: template.policy_name || null,
                policy_improvement_type: template.policy_improvement_type || null,
                policy_beneficiary: template.policy_beneficiary || null,

                process_name: template.process_name || null,
                process_difficulty: template.process_difficulty || null,
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
