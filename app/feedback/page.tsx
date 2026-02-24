"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, MessageSquare, AlertTriangle, Lightbulb, MapPin, Loader2, Sparkles, Languages, CheckCircle2 } from 'lucide-react';

const C = {
    blue: '#0B6CF5',
    blueMid: '#93C5FD',
    blueSoft: '#EFF6FF',
    bg: '#F7F9FB',
    white: '#FFFFFF',
    text: '#0F1724',
    textSec: '#334155',
    border: '#E8EDF3',
    borderLight: '#F0F4F8',
    shadow: '0 1px 4px rgba(15,23,36,0.06), 0 1px 2px rgba(15,23,36,0.04)',
    green: '#10B981',
    greenSoft: '#ECFDF5',
    greenBorder: '#A7F3D0',
    red: '#EF4444',
    redSoft: '#FEF2F2',
    redBorder: '#FECACA',
    yellow: '#F59E0B',
    yellowSoft: '#FFFBEB',
    yellowBorder: '#FDE68A'
};

export default function LiveFeedback() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [sentimentFilter, setSentimentFilter] = useState('');
    const [flowFilter, setFlowFilter] = useState('');

    const fetchFeedback = async () => {
        try {
            setIsLoading(true);
            const query = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                search,
                sentiment: sentimentFilter,
                flow: flowFilter
            });

            const res = await fetch(`/api/feedback?${query.toString()}`);
            const data = await res.json();
            setSessions(data.sessions || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, [page, search, sentimentFilter, flowFilter]);

    // Reset page when filters change
    useEffect(() => { setPage(1); }, [search, sentimentFilter, flowFilter]);

    const getFlowIcon = (flowChoice: number) => {
        switch (flowChoice) {
            case 1: return <MapPin size={14} color={C.blue} />;
            case 2: return <Lightbulb size={14} color={C.blue} />;
            case 3: return <AlertTriangle size={14} color={C.blue} />;
            default: return <MessageSquare size={14} color={C.blue} />;
        }
    };

    const getFlowLabel = (flowChoice: number) => {
        switch (flowChoice) {
            case 1: return 'Office Experience';
            case 2: return 'Policy Suggestion';
            case 3: return 'Process Reform';
            default: return 'External Feedback';
        }
    };

    const getSentimentColors = (sentiment: string) => {
        switch (sentiment?.toLowerCase()) {
            case 'negative': return { bg: C.redSoft, border: C.redBorder, text: '#B91C1C' };
            case 'positive': return { bg: C.greenSoft, border: C.greenBorder, text: '#15803D' };
            case 'neutral': return { bg: C.yellowSoft, border: C.yellowBorder, text: '#D97706' };
            default: return { bg: C.bg, border: C.border, text: C.textSec };
        }
    };

    const getRawText = (answers: any) => {
        if (!answers) return "No text provided.";
        if (answers.feedback) return answers.feedback; // Office Experience
        if (answers.scheme_suggestion) return answers.scheme_suggestion; // Process flow
        if (answers.process_suggestion) return answers.process_suggestion; // Reform flow
        return "Structured choices only (No free-text).";
    };

    return (
        <div style={{ padding: '40px 48px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', color: C.textSec }}>Maharashtra</span>
                    <span style={{ color: C.border }}>›</span>
                    <span style={{ fontSize: '14px', color: C.blue, fontWeight: '500' }}>AI Live Feed</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '680', color: C.text, letterSpacing: '-0.6px', marginBottom: '6px' }}>
                            Live Citizen Feedback
                        </h1>
                        <p style={{ fontSize: '16px', color: C.textSec }}>
                            Real-time WhatsApp submissions enriched with NLP Sentiment & Suggestions
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            style={{
                                display: 'flex', alignItems: 'center', gap: '7px',
                                padding: '9px 16px', background: C.white, border: `1px solid ${C.border}`,
                                borderRadius: '9px', fontSize: '15px', color: C.textSec, cursor: 'pointer',
                                fontFamily: 'inherit', boxShadow: C.shadow,
                            }}
                        >
                            <Download size={13} />
                            Export Feed
                        </button>
                    </div>
                </div>
            </div>



            {/* Constraints Tool Bar */}
            <div
                style={{
                    background: C.white, border: `2px solid ${C.border}`, borderRadius: '12px',
                    padding: '16px 20px', marginBottom: '20px', boxShadow: C.shadow,
                    display: 'flex', gap: '12px', alignItems: 'center',
                }}
            >
                <div
                    style={{
                        flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
                        background: C.bg, border: `1px solid ${C.border}`, borderRadius: '9px', padding: '9px 14px',
                    }}
                >
                    <Search size={14} color={C.textSec} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search raw feedback, office, or keywords…"
                        style={{
                            flex: 1, border: 'none', outline: 'none', background: 'transparent',
                            fontSize: '15.5px', color: C.text, fontFamily: 'inherit',
                        }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Filter size={13} color={C.textSec} />
                </div>

                <select
                    value={sentimentFilter}
                    onChange={(e) => setSentimentFilter(e.target.value)}
                    style={{
                        padding: '9px 12px', background: C.bg, border: `1px solid ${C.border}`,
                        borderRadius: '9px', fontSize: '15px', color: sentimentFilter ? C.text : C.textSec,
                        cursor: 'pointer', fontFamily: 'inherit', outline: 'none', minWidth: '140px',
                    }}
                >
                    <option value="">All Sentiments</option>
                    <option value="Positive">Positive</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Negative">Negative</option>
                </select>

                <select
                    value={flowFilter}
                    onChange={(e) => setFlowFilter(e.target.value)}
                    style={{
                        padding: '9px 12px', background: C.bg, border: `1px solid ${C.border}`,
                        borderRadius: '9px', fontSize: '15px', color: flowFilter ? C.text : C.textSec,
                        cursor: 'pointer', fontFamily: 'inherit', outline: 'none', minWidth: '160px',
                    }}
                >
                    <option value="">All Feedback Types</option>
                    <option value="1">Office Experience</option>
                    <option value="2">Policy Suggestion</option>
                    <option value="3">Process Reform</option>
                </select>
            </div>

            {/* Real-Time Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {isLoading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: C.textSec, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px' }}>
                        <Loader2 size={24} className="animate-spin" color={C.blue} />
                        <span style={{ fontSize: '16px' }}>Parsing latest submissions...</span>
                    </div>
                ) : sessions.length > 0 ? (
                    sessions.map((session: any, idx) => {
                        const sColor = getSentimentColors(session.ai_analysis?.sentiment);
                        const rawText = getRawText(session.answers);
                        const dt = new Date(session.created_at);

                        return (
                            <div key={session._id} style={{ background: C.white, borderRadius: '14px', border: `2px solid ${C.border}`, boxShadow: C.shadow, overflow: 'hidden', display: 'flex' }}>
                                {/* Color stripe anchor */}
                                <div style={{ width: '6px', background: sColor.border }} />

                                <div style={{ padding: '24px', flex: 1 }}>
                                    {/* Card Head */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                    background: C.blueSoft, color: C.blue, padding: '4px 10px',
                                                    borderRadius: '20px', fontSize: '13px', fontWeight: '600'
                                                }}>
                                                    {getFlowIcon(session.answers?.flow_choice)}
                                                    {getFlowLabel(session.answers?.flow_choice)}
                                                </span>
                                                <span style={{ fontSize: '14px', color: C.textSec }}>• {dt.toLocaleDateString()} at {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <h2 style={{ fontSize: '20px', fontWeight: '640', color: C.text, letterSpacing: '-0.3px', margin: 0 }}>
                                                {session.office_name}
                                            </h2>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: sColor.bg, border: `1px solid ${sColor.border}`, padding: '4px 12px', borderRadius: '6px' }}>
                                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: sColor.text }} />
                                                <span style={{ fontSize: '15px', fontWeight: '600', color: sColor.text, textTransform: 'capitalize' }}>{session.ai_analysis?.sentiment || 'Neutral'}</span>
                                            </div>
                                            {session.ai_analysis?.confidence && (
                                                <span style={{ fontSize: '13px', color: C.textSec }}>{session.ai_analysis.confidence}% Confidence</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Split Body Content */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
                                        {/* Left side: Original details */}
                                        <div>
                                            <div style={{ marginBottom: '12px' }}>
                                                <span style={{ fontSize: '13px', color: C.textSec, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                    Raw Submission (WhatsApp)
                                                </span>
                                                <p style={{ marginTop: '6px', fontSize: '16.5px', color: C.text, lineHeight: 1.5, background: C.bg, padding: '12px 14px', borderRadius: '8px', border: `1px solid ${C.borderLight}` }}>
                                                    "{rawText}"
                                                </p>
                                            </div>

                                            {/* Showing structured mapping from answers object briefly */}
                                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                                {session.answers?.rating && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span style={{ fontSize: '13px', color: C.textSec }}>User Rating:</span>
                                                        <span style={{ fontSize: '14px', fontWeight: '600', background: C.yellowSoft, color: '#D97706', padding: '2px 8px', borderRadius: '4px' }}>{session.answers.rating} / 5</span>
                                                    </div>
                                                )}
                                                {session.answers?.process_name && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span style={{ fontSize: '13px', color: C.textSec }}>Target Process:</span>
                                                        <span style={{ fontSize: '14px', fontWeight: '500', color: C.text }}>{session.answers.process_name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Side: AI Analytics block */}
                                        <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '10px', border: `1px solid ${C.borderLight}`, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                <Sparkles size={14} color={C.blue} />
                                                <span style={{ fontSize: '14px', fontWeight: '640', color: C.blue, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Analytics Layer</span>
                                            </div>

                                            {session.ai_analysis?.translated_text && (
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                                        <Languages size={12} color={C.textSec} />
                                                        <span style={{ fontSize: '13px', color: C.textSec, fontWeight: '500' }}>ENGLISH TRANSLATION</span>
                                                    </div>
                                                    <p style={{ fontSize: '15.5px', color: C.text, lineHeight: 1.4, margin: 0 }}>
                                                        {session.ai_analysis.translated_text}
                                                    </p>
                                                </div>
                                            )}

                                            <div>
                                                <div style={{ fontSize: '13px', color: C.textSec, fontWeight: '500', marginBottom: '6px' }}>EXTRACTED THEMES</div>
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    {session.ai_analysis?.themes?.map((t: string) => (
                                                        <span key={t} style={{ fontSize: '13px', background: C.white, border: `1px solid ${C.border}`, padding: '4px 10px', borderRadius: '6px', color: C.text }}>
                                                            {t}
                                                        </span>
                                                    ))}
                                                    {session.ai_analysis?.keywords?.map((k: string) => (
                                                        <span key={k} style={{ fontSize: '13px', background: C.bg, border: `1px solid ${C.borderLight}`, padding: '4px 10px', borderRadius: '6px', color: C.textSec }}>
                                                            #{k}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actionable Reform Banner */}
                                    {session.ai_analysis?.reform_recommendation && (
                                        <div style={{ marginTop: '20px', background: '#F0FDF4', border: '1px solid #16A34A', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                            <CheckCircle2 size={16} color="#16A34A" style={{ marginTop: '2px' }} />
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Actionable Reform Recommendation</div>
                                                <div style={{ fontSize: '16px', color: '#166534', fontWeight: '500' }}>
                                                    {session.ai_analysis.reform_recommendation}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div style={{ padding: '48px', textAlign: 'center', color: C.textSec, fontSize: '16px', background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px' }}>
                        No feedback instances match your current filters.
                    </div>
                )
                }
            </div>

            {/* Footer Paginator */}
            <div
                style={{
                    padding: '24px 0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >
                {totalPages > 1 && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                style={{
                                    width: '32px', height: '32px', borderRadius: '7px',
                                    border: `1px solid ${p === page ? C.blue : C.border}`,
                                    background: p === page ? C.blue : C.white,
                                    color: p === page ? 'white' : C.textSec,
                                    fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.15s'
                                }}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
