import Session from "@/models/Session";
import Office from "@/models/Office";

/**
 * Calculates and updates the real-time OMES (Office Management Experience Score),
 * total monthly submissions, and trend direction for a specific office.
 * 
 * Target this to run locally inside logic paths every time an Office Experience loop successfully completes.
 */
export async function computeOfficeMetrics(officeId: string) {
    try {
        console.log(`📊 [Metrics Worker] recalculating metrics for Office ${officeId}`);

        // Grabbing the current month start and previous month start for baseline comparisons
        const now = new Date();
        const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // 1. Fetch all Office flow ratings globally for this office across all time (for general trend)
        const allSessions = await Session.find({
            office_id: officeId,
            completed: true,
            "answers.flow_choice": 1, // Explicitly Office Rating flow
            "answers.office_rating": { $ne: null }
        }).lean();

        // Setup arrays mapped by timeframe
        const thisMonthRatings = allSessions.filter(s => new Date(s.created_at) >= firstDayThisMonth);
        const lastMonthRatings = allSessions.filter(
            s => new Date(s.created_at) >= firstDayLastMonth && new Date(s.created_at) < firstDayThisMonth
        );

        // Baseline Total Average Math
        const calculateAvg = (sessions: any[]) => {
            if (sessions.length === 0) return 0;
            const total = sessions.reduce((sum, s) => sum + (s.answers.office_rating || 0), 0);
            return Number((total / sessions.length).toFixed(2));
        };

        const currentOMES = calculateAvg(thisMonthRatings) || calculateAvg(allSessions) || 0;
        const previousOMES = calculateAvg(lastMonthRatings) || 0;

        // Trend Logic:
        let computedTrend = "stable";
        if (previousOMES > 0) {
            if (currentOMES > previousOMES + 0.2) computedTrend = "improving";
            if (currentOMES < previousOMES - 0.2) computedTrend = "declining";
        }

        // Identify AI Themes directly parsed across the office's active pool
        const aiThemeFreqMap: Record<string, number> = {};
        let confidencePoints = 0;

        allSessions.forEach(session => {
            if (session.ai_analysis?.themes) {
                session.ai_analysis.themes.forEach((t: string) => {
                    aiThemeFreqMap[t] = (aiThemeFreqMap[t] || 0) + 1;
                });
            }
            if (session.ai_analysis?.confidence) {
                confidencePoints += session.ai_analysis.confidence;
            }
        });

        const topThemes = Object.entries(aiThemeFreqMap)
            .sort((a, b) => b[1] - a[1]) // highest first
            .slice(0, 3)
            .map(entry => entry[0]);

        // Simple aggregate math on confidence scale 0-100 logic
        const avgConfidenceNum = allSessions.length ? (confidencePoints / allSessions.length) : 0;
        const computeConfidenceLabel = (conf: number) => {
            if (conf > 85) return "High";
            if (conf > 60) return "Medium";
            return "Low";
        };

        const updatedMetadata = {
            omes: currentOMES,
            trend: computedTrend,
            themes: topThemes,
            confidence: computeConfidenceLabel(avgConfidenceNum),
            submissions_monthly: thisMonthRatings.length
        };

        // Upsert payload to Master Office Table
        await Office.findOneAndUpdate(
            { office_id: officeId },
            { $set: { metadata: updatedMetadata } }
        );

        console.log(`✅ [Metrics] Uploaded calculated OMES: ${currentOMES} | Trend: ${computedTrend}`);
        return updatedMetadata;

    } catch (error) {
        console.error("❌ [Metrics Worker] Error computing OMES stats:", error);
        return null;
    }
}
