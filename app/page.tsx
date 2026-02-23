"use client";

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Minus,
  X,
  Upload,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Send,
  AlertTriangle,
  BarChart3,
  FileText,
  MessageSquare,
  Eye,
  Activity,
} from 'lucide-react';

/* ─── Design tokens ─────────────────────────────────────── */
const C = {
  blue: '#0B6CF5',
  blueSoft: '#EAF2FF',
  blueMid: '#BFDBFE',
  bg: '#F7F9FB',
  white: '#FFFFFF',
  text: '#0F1724',
  textSec: '#5B6472',
  border: '#E8EDF3',
  borderLight: '#F0F4F8',
  green: '#10B981',
  greenSoft: '#ECFDF5',
  greenText: '#065F46',
  amber: '#F59E0B',
  amberSoft: '#FFFBEB',
  amberText: '#92400E',
  shadow: '0 1px 4px rgba(15,23,36,0.06), 0 1px 2px rgba(15,23,36,0.04)',
  shadowMd: '0 4px 16px rgba(15,23,36,0.08), 0 1px 4px rgba(15,23,36,0.06)',
};

/* ─── Mini Sparkline ─────────────────────────────────────── */
function Sparkline({
  data,
  color = C.blue,
  id,
  height = 44,
}: {
  data: number[];
  color?: string;
  id: string;
  height?: number;
}) {
  const w = 100;
  const h = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');
  const areaPts = `0,${h} ${pts} ${w},${h}`;
  const gradId = `sg_${id}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.14} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline points={areaPts} fill={`url(#${gradId})`} stroke="none" />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── KPI Card ───────────────────────────────────────────── */
interface KPICardProps {
  label: string;
  value: string;
  micro: string;
  microPositive?: boolean;
  sub: string;
  sparkData: number[];
  sparkColor?: string;
  sparkId: string;
  unit?: string;
}

function KPICard({ label, value, micro, microPositive = true, sub, sparkData, sparkColor, sparkId, unit }: KPICardProps) {
  const trendColor = microPositive ? C.green : C.amber;
  const sc = sparkColor ?? (microPositive ? C.blue : C.amber);

  return (
    <div
      style={{
        background: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: '14px',
        padding: '24px',
        flex: 1,
        boxShadow: C.shadow,
        transition: 'box-shadow 0.2s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = C.shadowMd)}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = C.shadow)}
    >
      <div
        style={{
          fontSize: '11.5px',
          fontWeight: '560',
          color: C.textSec,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          marginBottom: '14px',
        }}
      >
        {label}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <div
            style={{
              fontSize: '34px',
              fontWeight: '660',
              color: C.text,
              letterSpacing: '-1px',
              lineHeight: 1,
              marginBottom: '10px',
            }}
          >
            {value}
            {unit && (
              <span style={{ fontSize: '14px', fontWeight: '500', color: C.textSec, marginLeft: '5px', letterSpacing: '-0.2px' }}>
                {unit}
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '520',
              color: trendColor,
              marginBottom: '5px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {microPositive ? null : null}
            {micro}
          </div>
          <div style={{ fontSize: '11.5px', color: C.textSec, letterSpacing: '-0.1px' }}>{sub}</div>
        </div>
        <div style={{ opacity: 0.85 }}>
          <Sparkline data={sparkData} color={sc} id={sparkId} />
        </div>
      </div>
    </div>
  );
}

/* ─── Office Data ────────────────────────────────────────── */
const officeData = [
  {
    id: 1,
    name: 'Pune Revenue Office A',
    district: 'Pune',
    division: 'Pune',
    omes: 3.12,
    trend: 'improving',
    theme: 'Waiting Time Optimisation',
    submissions: 2840,
    confidence: 'High',
    omonth: [2.7, 2.8, 2.9, 3.0, 3.05, 3.12],
    r3: [2.85, 2.95, 3.06],
    r6: [2.7, 2.75, 2.82, 2.9, 3.0, 3.12],
    themes: ['Waiting Time Optimisation', 'Citizen Guidance Clarity', 'Process Flow Smoothness'],
    snippets: [
      'Process was smooth. Waiting time improving.',
      'Staff guidance was clear and helpful.',
      'Queue system functioning well.',
    ],
  },
  {
    id: 2,
    name: 'Nashik Municipal North',
    district: 'Nashik',
    division: 'Nashik',
    omes: 2.94,
    trend: 'improving',
    theme: 'Queue Flow Efficiency',
    submissions: 1920,
    confidence: 'High',
    omonth: [2.5, 2.6, 2.65, 2.75, 2.84, 2.94],
    r3: [2.65, 2.78, 2.94],
    r6: [2.5, 2.55, 2.6, 2.72, 2.83, 2.94],
    themes: ['Queue Flow Efficiency', 'Service Counter Availability', 'Documentation Clarity'],
    snippets: [
      'Queue management has improved noticeably.',
      'Staff were helpful and well-informed.',
      'Received my certificate without delays.',
    ],
  },
  {
    id: 3,
    name: 'Nagpur Tahsildar Office B',
    district: 'Nagpur',
    division: 'Nagpur',
    omes: 3.28,
    trend: 'stable',
    theme: 'Documentation Clarity',
    submissions: 3120,
    confidence: 'High',
    omonth: [3.2, 3.22, 3.25, 3.24, 3.27, 3.28],
    r3: [3.23, 3.26, 3.28],
    r6: [3.15, 3.18, 3.21, 3.24, 3.26, 3.28],
    themes: ['Documentation Clarity', 'Application Process Simplicity', 'Staff Responsiveness'],
    snippets: [
      'Documents were well-organised and explained.',
      'Process was straightforward once clarified.',
      'Appreciated the clear written instructions.',
    ],
  },
  {
    id: 4,
    name: 'Mumbai Transport Office Central',
    district: 'Mumbai',
    division: 'Konkan',
    omes: 3.05,
    trend: 'improving',
    theme: 'System Throughput',
    submissions: 4680,
    confidence: 'High',
    omonth: [2.7, 2.8, 2.88, 2.95, 3.0, 3.05],
    r3: [2.88, 2.97, 3.05],
    r6: [2.62, 2.7, 2.8, 2.9, 2.97, 3.05],
    themes: ['System Throughput', 'Digital Service Integration', 'Appointment Availability'],
    snippets: [
      'Online booking worked smoothly this time.',
      'Counter staff very efficient.',
      'Wait time much reduced from last visit.',
    ],
  },
];

/* ─── Drawer ─────────────────────────────────────────────── */
function OfficeDrawer({ office, onClose }: { office: (typeof officeData)[0] | null; onClose: () => void }) {
  const [tab, setTab] = useState<'monthly' | 'r3' | 'r6'>('monthly');

  const getChartData = () => {
    if (tab === 'monthly') return office!.omonth.map((v, i) => ({ label: `M${i + 1}`, value: v }));
    if (tab === 'r3') return office!.r3.map((v, i) => ({ label: `Q${i + 1}`, value: v }));
    return office!.r6.map((v, i) => ({ label: `P${i + 1}`, value: v }));
  };

  return (
    <AnimatePresence>
      {office && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 36, 0.18)',
              zIndex: 40,
              backdropFilter: 'blur(2px)',
            }}
          />
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              bottom: 0,
              width: '500px',
              background: C.white,
              zIndex: 50,
              overflow: 'auto',
              boxShadow: '-12px 0 48px rgba(11,108,245,0.08), -2px 0 8px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '28px 28px 20px',
                borderBottom: `1px solid ${C.border}`,
                background: C.white,
                position: 'sticky',
                top: 0,
                zIndex: 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '640', color: C.text, letterSpacing: '-0.4px', marginBottom: '6px' }}>
                    {office.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        background: C.blueSoft,
                        color: C.blue,
                        fontSize: '11.5px',
                        fontWeight: '520',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        border: `1px solid ${C.blueMid}`,
                      }}
                    >
                      {office.district}
                    </span>
                    <span
                      style={{
                        background: C.greenSoft,
                        color: C.greenText,
                        fontSize: '11.5px',
                        fontWeight: '520',
                        padding: '3px 10px',
                        borderRadius: '20px',
                      }}
                    >
                      Active
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: `1px solid ${C.border}`,
                    background: C.white,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: C.textSec,
                    flexShrink: 0,
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div style={{ padding: '24px 28px', flex: 1 }}>
              {/* OMES Trend Chart */}
              <div style={{ marginBottom: '24px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: '580', color: C.text, letterSpacing: '-0.2px' }}>
                    OMES Trend
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {(['monthly', 'r3', 'r6'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: `1px solid ${tab === t ? C.blue : C.border}`,
                          background: tab === t ? C.blueSoft : C.white,
                          color: tab === t ? C.blue : C.textSec,
                          fontSize: '11.5px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {t === 'monthly' ? 'Monthly' : t === 'r3' ? '3-Month' : '6-Month'}
                      </button>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    background: C.bg,
                    borderRadius: '12px',
                    padding: '16px',
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <ResponsiveContainer width="100%" height={140}>
                    <AreaChart data={getChartData()} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                      <defs>
                        <linearGradient id="drawerGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={C.blue} stopOpacity={0.12} />
                          <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: C.textSec }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 10, fill: C.textSec }}
                        axisLine={false}
                        tickLine={false}
                        tickCount={4}
                      />
                      <Tooltip
                        contentStyle={{
                          background: C.white,
                          border: `1px solid ${C.border}`,
                          borderRadius: '8px',
                          fontSize: '12px',
                          boxShadow: C.shadow,
                        }}
                        labelStyle={{ color: C.textSec }}
                        itemStyle={{ color: C.blue }}
                        formatter={(v: number) => [v.toFixed(2), 'OMES']}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={C.blue}
                        strokeWidth={2}
                        fill="url(#drawerGrad)"
                        dot={{ r: 3, fill: C.blue, stroke: C.white, strokeWidth: 1.5 }}
                        activeDot={{ r: 4 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Metrics Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '10px',
                  marginBottom: '24px',
                }}
              >
                {[
                  { label: 'OMES Score', value: office.omes.toFixed(2), sub: 'Current' },
                  { label: 'Submissions', value: office.submissions.toLocaleString(), sub: 'This Month' },
                  { label: 'Confidence', value: office.confidence, sub: 'Data Quality' },
                ].map((m) => (
                  <div
                    key={m.label}
                    style={{
                      background: C.bg,
                      border: `1px solid ${C.border}`,
                      borderRadius: '10px',
                      padding: '14px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '18px', fontWeight: '640', color: C.text, letterSpacing: '-0.5px', marginBottom: '3px' }}>
                      {m.value}
                    </div>
                    <div style={{ fontSize: '10.5px', color: C.textSec }}>{m.label}</div>
                    <div style={{ fontSize: '10px', color: '#9BA5B0' }}>{m.sub}</div>
                  </div>
                ))}
              </div>

              {/* AI Theme Clusters */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: '580', color: C.text, letterSpacing: '-0.2px', marginBottom: '12px' }}>
                  AI Theme Clusters
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {office.themes.map((theme, i) => (
                    <div
                      key={theme}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        background: i === 0 ? C.blueSoft : C.bg,
                        border: `1px solid ${i === 0 ? C.blueMid : C.border}`,
                        borderRadius: '9px',
                      }}
                    >
                      <div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: i === 0 ? C.blue : '#9BA5B0',
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: '13px', color: i === 0 ? C.blue : C.text, fontWeight: i === 0 ? '520' : '420' }}>
                        {theme}
                      </span>
                      {i === 0 && (
                        <span
                          style={{
                            marginLeft: 'auto',
                            fontSize: '10.5px',
                            color: C.blue,
                            fontWeight: '520',
                            background: C.white,
                            padding: '2px 8px',
                            borderRadius: '20px',
                            border: `1px solid ${C.blueMid}`,
                          }}
                        >
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback Snippets */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '13px', fontWeight: '580', color: C.text, letterSpacing: '-0.2px', marginBottom: '12px' }}>
                  Recent Feedback Snippets
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {office.snippets.map((s) => (
                    <div
                      key={s}
                      style={{
                        display: 'flex',
                        gap: '10px',
                        padding: '12px 14px',
                        background: C.bg,
                        border: `1px solid ${C.border}`,
                        borderRadius: '9px',
                      }}
                    >
                      <MessageSquare
                        size={13}
                        style={{ color: C.textSec, flexShrink: 0, marginTop: '1px' }}
                      />
                      <span
                        style={{ fontSize: '12.5px', color: C.textSec, lineHeight: 1.5, fontStyle: 'italic' }}
                      >
                        "{s}"
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Controls */}
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: '580', color: C.text, marginBottom: '12px' }}>
                  Action Controls
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { icon: Upload, label: 'Upload Corrective Action Note', primary: true },
                    { icon: CheckCircle2, label: 'Mark Improvement Initiated', primary: false },
                    { icon: Eye, label: 'View Submission Patterns', primary: false },
                  ].map((a) => (
                    <button
                      key={a.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '9px',
                        padding: '11px 16px',
                        borderRadius: '9px',
                        border: `1px solid ${a.primary ? C.blue : C.border}`,
                        background: a.primary ? C.blue : C.white,
                        color: a.primary ? C.white : C.text,
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        textAlign: 'left',
                        width: '100%',
                      }}
                    >
                      <a.icon size={14} />
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Main Overview Component ────────────────────────────── */
export function Overview() {
  const [selectedOffice, setSelectedOffice] = useState<(typeof officeData)[0] | null>(null);
  const [aiQuery, setAiQuery] = useState('Which administrative themes show highest improvement this quarter?');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponseVisible, setAiResponseVisible] = useState(false);

  const handleAiQuery = () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponseVisible(false);
    setTimeout(() => {
      setAiLoading(false);
      setAiResponseVisible(true);
    }, 1200);
  };

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: C.textSec }}>Maharashtra</span>
              <span style={{ color: C.border, fontSize: '12px' }}>›</span>
              
              <span style={{ color: C.border, fontSize: '12px' }}>›</span>
              
            </div>
            <h1
              style={{
                fontSize: '26px',
                fontWeight: '680',
                color: C.text,
                letterSpacing: '-0.6px',
                marginBottom: '6px',
              }}
            >
              Governance Overview Dashboard
            </h1>
            <p style={{ fontSize: '14px', color: C.textSec }}>
              State-aggregated performance intelligence · February 2026
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                padding: '8px 14px',
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: '9px',
                fontSize: '12.5px',
                color: C.textSec,
                boxShadow: C.shadow,
              }}
            >
              Feb 2026
            </div>
            <div
              style={{
                padding: '8px 16px',
                background: C.blue,
                borderRadius: '9px',
                fontSize: '12.5px',
                color: C.white,
                fontWeight: '500',
                boxShadow: '0 2px 8px rgba(11,108,245,0.28)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <BarChart3 size={13} />
              Export Report
            </div>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '36px' }}>
        <KPICard
          label="Monthly Office Experience Score"
          value="4.18"
          micro="↑ +0.12 vs Last Month"
          microPositive={true}
          sub="Rolling 3-Month Score: 4.05"
          sparkData={[3.72, 3.80, 3.85, 3.90, 3.95, 4.02, 4.10, 4.18]}
          sparkId="omes"
        />
        <KPICard
          label="Offices Below Performance Threshold"
          value="18"
          unit="Offices"
          micro="↓ Improving Trend"
          microPositive={true}
          sub="Rolling 6-Month Stability: Strong"
          sparkData={[26, 25, 23, 22, 21, 20, 19, 18]}
          sparkId="below"
          sparkColor="#10B981"
        />
        <KPICard
          label="Escalation Status"
          value="6"
          unit="Active"
          micro="Pattern-Triggered"
          microPositive={false}
          sub="No critical concentration detected"
          sparkData={[9, 8, 9, 7, 8, 6, 7, 6]}
          sparkId="esc"
          sparkColor={C.amber}
        />
        <KPICard
          label="Citizen Submissions This Month"
          value="19,842"
          micro="↑ Healthy Participation"
          microPositive={true}
          sub="Confidence Level: High"
          sparkData={[14200, 15800, 16900, 17600, 18200, 18800, 19400, 19842]}
          sparkId="subs"
        />
      </div>

      {/* Section 1: Comparative Office Performance */}
      <div
        style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: '16px',
          marginBottom: '24px',
          boxShadow: C.shadow,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '22px 28px',
            borderBottom: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '15px', fontWeight: '620', color: C.text, letterSpacing: '-0.3px', marginBottom: '3px' }}>
              Comparative Office Performance
            </div>
            <div style={{ fontSize: '12.5px', color: C.textSec }}>
              Ranked by OMES · Service optimisation signals
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                padding: '4px 12px',
                background: C.blueSoft,
                color: C.blue,
                borderRadius: '20px',
                fontSize: '11.5px',
                fontWeight: '520',
                border: `1px solid ${C.blueMid}`,
              }}
            >
              4 of 312 Offices
            </span>
          </div>
        </div>

        {/* Table Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2.5fr 1fr 1fr 1.1fr 2fr',
            padding: '12px 28px',
            background: '#FAFBFC',
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          {['Office', 'District', 'OMES', 'Rolling Trend', 'Primary Theme'].map((h) => (
            <div
              key={h}
              style={{
                fontSize: '11px',
                fontWeight: '600',
                color: C.textSec,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Table Rows */}
        {officeData.map((office, idx) => (
          <div
            key={office.id}
            onClick={() => setSelectedOffice(office)}
            style={{
              display: 'grid',
              gridTemplateColumns: '2.5fr 1fr 1fr 1.1fr 2fr',
              padding: '16px 28px',
              borderBottom: idx < officeData.length - 1 ? `1px solid ${C.borderLight}` : 'none',
              cursor: 'pointer',
              transition: 'background 0.12s ease',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = C.bg)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
          >
            {/* Office Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  background: C.blueSoft,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FileText size={13} color={C.blue} />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '520', color: C.text, letterSpacing: '-0.2px' }}>
                  {office.name}
                </div>
                <div style={{ fontSize: '11.5px', color: C.textSec, marginTop: '2px' }}>{office.division} Division</div>
              </div>
            </div>

            {/* District */}
            <div style={{ fontSize: '13px', color: C.textSec }}>{office.district}</div>

            {/* OMES */}
            <div>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '640',
                  color: C.text,
                  letterSpacing: '-0.3px',
                }}
              >
                {office.omes.toFixed(2)}
              </span>
              <div
                style={{
                  height: '3px',
                  background: C.border,
                  borderRadius: '2px',
                  marginTop: '5px',
                  width: '44px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${(office.omes / 5) * 100}%`,
                    background: C.blue,
                    borderRadius: '2px',
                    opacity: 0.6,
                  }}
                />
              </div>
            </div>

            {/* Trend */}
            <div>
              {office.trend === 'improving' ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    background: '#F0FDF4',
                    color: '#15803D',
                    borderRadius: '20px',
                    fontSize: '11.5px',
                    fontWeight: '520',
                  }}
                >
                  <TrendingUp size={10} />
                  Improving
                </span>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    background: C.bg,
                    color: C.textSec,
                    borderRadius: '20px',
                    fontSize: '11.5px',
                    fontWeight: '520',
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <Minus size={10} />
                  Stable
                </span>
              )}
            </div>

            {/* Theme */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  padding: '4px 10px',
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: C.textSec,
                }}
              >
                {office.theme}
              </span>
              <ChevronRight size={14} color={C.textSec} style={{ opacity: 0.5 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Section 2: AI Governance Intelligence Panel */}
      <div
        style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: '16px',
          marginBottom: '24px',
          boxShadow: C.shadow,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '22px 28px',
            borderBottom: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #EAF2FF 0%, #DBEAFE 100%)',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={15} color={C.blue} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '620', color: C.text, letterSpacing: '-0.3px' }}>
              Governance Intelligence Query
            </div>
            <div style={{ fontSize: '12px', color: C.textSec }}>
              AI-advisory · Pattern & trend analysis
            </div>
          </div>
          <div
            style={{
              marginLeft: 'auto',
              padding: '4px 12px',
              background: C.blueSoft,
              color: C.blue,
              borderRadius: '20px',
              fontSize: '11.5px',
              fontWeight: '520',
              border: `1px solid ${C.blueMid}`,
            }}
          >
            Advisory Only
          </div>
        </div>

        <div style={{ padding: '24px 28px' }}>
          {/* Query Input */}
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                gap: '10px',
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: '12px',
                padding: '14px 16px',
                transition: 'border-color 0.15s',
              }}
            >
              <input
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiQuery()}
                placeholder="Ask about patterns, trends, or themes across offices…"
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '14px',
                  color: C.text,
                  letterSpacing: '-0.1px',
                  fontFamily: 'inherit',
                }}
              />
              <button
                onClick={handleAiQuery}
                disabled={aiLoading}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '9px',
                  background: aiLoading ? '#9BBDF8' : C.blue,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: aiLoading ? 'default' : 'pointer',
                  flexShrink: 0,
                  transition: 'background 0.15s',
                  boxShadow: aiLoading ? 'none' : '0 2px 8px rgba(11,108,245,0.25)',
                }}
              >
                {aiLoading ? (
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                ) : (
                  <Send size={14} color="white" />
                )}
              </button>
            </div>
          </div>

          {/* AI Response */}
          <AnimatePresence>
            {(aiResponseVisible || !aiLoading) && aiResponseVisible && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: 'linear-gradient(135deg, #F8FBFF 0%, #EAF2FF 100%)',
                  border: `1px solid ${C.blueMid}`,
                  borderRadius: '12px',
                  padding: '20px 22px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      background: C.blue,
                      borderRadius: '7px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 6px rgba(11,108,245,0.25)',
                    }}
                  >
                    <Sparkles size={13} color="white" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', color: C.text, lineHeight: 1.65, letterSpacing: '-0.1px', marginBottom: '14px' }}>
                      Positive shifts observed in municipal service delivery across 4 divisions.{' '}
                      <strong>Average OMES improvement: +0.18</strong> over the quarter. Primary
                      drivers include{' '}
                      <span style={{ color: C.blue, fontWeight: '520' }}>Queue Flow Efficiency</span> and{' '}
                      <span style={{ color: C.blue, fontWeight: '520' }}>Documentation Clarity</span>.
                      Waiting time optimisation themes show a 23% increase in positive signal frequency.
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          padding: '4px 12px',
                          background: C.white,
                          border: `1px solid #A7C4FC`,
                          borderRadius: '20px',
                          fontSize: '11.5px',
                          color: C.blue,
                          fontWeight: '520',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <CheckCircle2 size={11} />
                        High Confidence
                      </span>
                      <span
                        style={{
                          padding: '4px 12px',
                          background: C.white,
                          border: `1px solid ${C.border}`,
                          borderRadius: '20px',
                          fontSize: '11.5px',
                          color: C.textSec,
                        }}
                      >
                        Based on 19,842 submissions
                      </span>
                      <span
                        style={{
                          padding: '4px 12px',
                          background: C.white,
                          border: `1px solid ${C.border}`,
                          borderRadius: '20px',
                          fontSize: '11.5px',
                          color: C.textSec,
                        }}
                      >
                        Q1 2026 Analysis
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!aiResponseVisible && !aiLoading && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                'Highest OMES improvement this month?',
                'Districts with stable performance patterns?',
                'Policy themes requiring attention?',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => { setAiQuery(q); setAiResponseVisible(false); }}
                  style={{
                    padding: '6px 14px',
                    background: C.white,
                    border: `1px solid ${C.border}`,
                    borderRadius: '20px',
                    fontSize: '12px',
                    color: C.textSec,
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Theme Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Top Experience Themes */}
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: '16px',
            padding: '22px',
            boxShadow: C.shadow,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                background: C.blueSoft,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Activity size={13} color={C.blue} />
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: '620', color: C.text, letterSpacing: '-0.2px' }}>
              Top Experience Themes
            </div>
          </div>
          {['Waiting Time Optimisation', 'Queue Flow Efficiency', 'Citizen Guidance Clarity'].map((t, i) => (
            <div
              key={t}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 0',
                borderBottom: i < 2 ? `1px solid ${C.borderLight}` : 'none',
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  background: i === 0 ? C.blue : C.bg,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '10px',
                  fontWeight: '700',
                  color: i === 0 ? 'white' : C.textSec,
                }}
              >
                {i + 1}
              </div>
              <span style={{ fontSize: '13px', color: C.text, letterSpacing: '-0.1px' }}>{t}</span>
            </div>
          ))}
          <div style={{ marginTop: '14px', padding: '10px 12px', background: C.bg, borderRadius: '8px' }}>
            <p style={{ fontSize: '11.5px', color: C.textSec, lineHeight: 1.5 }}>
              Overall citizen sentiment remains strongly positive.
            </p>
          </div>
        </div>

        {/* Policy Suggestion Intelligence */}
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: '16px',
            padding: '22px',
            boxShadow: C.shadow,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                background: '#F0FDF4',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={13} color="#15803D" />
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: '620', color: C.text, letterSpacing: '-0.2px' }}>
              Policy Suggestion Intelligence
            </div>
          </div>
          {[
            'Simplified Application Tracking',
            'Improved Status Visibility',
            'Digital Access Awareness',
          ].map((t, i) => (
            <div
              key={t}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 0',
                borderBottom: i < 2 ? `1px solid ${C.borderLight}` : 'none',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#10B981',
                  flexShrink: 0,
                  marginLeft: '8px',
                }}
              />
              <span style={{ fontSize: '13px', color: C.text, letterSpacing: '-0.1px' }}>{t}</span>
            </div>
          ))}
          <div style={{ marginTop: '14px', padding: '10px 12px', background: '#F0FDF4', borderRadius: '8px' }}>
            <p style={{ fontSize: '11.5px', color: '#15803D', lineHeight: 1.5 }}>
              AI-surfaced from citizen participation patterns.
            </p>
          </div>
        </div>

        {/* Process Reform Intelligence */}
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: '16px',
            padding: '22px',
            boxShadow: C.shadow,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                background: '#FFFBEB',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BarChart3 size={13} color="#D97706" />
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: '620', color: C.text, letterSpacing: '-0.2px' }}>
              Process Reform Intelligence
            </div>
          </div>
          {[
            'Documentation Rationalisation',
            'Approval Flow Simplification',
            'Service Predictability Enhancements',
          ].map((t, i) => (
            <div
              key={t}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 0',
                borderBottom: i < 2 ? `1px solid ${C.borderLight}` : 'none',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#F59E0B',
                  flexShrink: 0,
                  marginLeft: '8px',
                }}
              />
              <span style={{ fontSize: '13px', color: C.text, letterSpacing: '-0.1px' }}>{t}</span>
            </div>
          ))}
          <div style={{ marginTop: '14px', padding: '10px 12px', background: '#FFFBEB', borderRadius: '8px' }}>
            <p style={{ fontSize: '11.5px', color: '#92400E', lineHeight: 1.5 }}>
              Pattern-derived reform signals · Advisory context.
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: Escalation Intelligence Summary */}
      <div
        style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: '16px',
          marginBottom: '40px',
          boxShadow: C.shadow,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '22px 28px',
            borderBottom: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '15px', fontWeight: '620', color: C.text, letterSpacing: '-0.3px', marginBottom: '3px' }}>
              Escalation Intelligence Summary
            </div>
            <div style={{ fontSize: '12.5px', color: C.textSec }}>
              Pattern-triggered · Procedural review in progress
            </div>
          </div>
          <span
            style={{
              padding: '4px 12px',
              background: C.amberSoft,
              color: C.amberText,
              borderRadius: '20px',
              fontSize: '11.5px',
              fontWeight: '520',
              border: '1px solid #FDE68A',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <AlertTriangle size={11} />
            6 Active Escalations
          </span>
        </div>

        {/* Escalation Table Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2.5fr 2fr 1.5fr 1.5fr',
            padding: '11px 28px',
            background: '#FAFBFC',
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          {['Office', 'Trigger Basis', 'Status', 'Action'].map((h) => (
            <div
              key={h}
              style={{
                fontSize: '11px',
                fontWeight: '600',
                color: C.textSec,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {[
          {
            office: 'Nashik Municipal North',
            district: 'Nashik',
            trigger: 'Rolling Trend Deviation',
            status: 'Under Administrative Review',
            statusColor: C.amberSoft,
            statusText: C.amberText,
            action: 'Review',
          },
          {
            office: 'Mumbai Transport Central',
            district: 'Mumbai',
            trigger: 'Multi-Month Pattern',
            status: 'Monitoring Improvement Trajectory',
            statusColor: C.blueSoft,
            statusText: C.blue,
            action: 'Monitor',
          },
        ].map((row, idx) => (
          <div
            key={row.office}
            style={{
              display: 'grid',
              gridTemplateColumns: '2.5fr 2fr 1.5fr 1.5fr',
              padding: '16px 28px',
              borderBottom: idx === 0 ? `1px solid ${C.borderLight}` : 'none',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: '520', color: C.text, letterSpacing: '-0.2px', marginBottom: '2px' }}>
                {row.office}
              </div>
              <div style={{ fontSize: '11.5px', color: C.textSec }}>{row.district}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: C.amber }} />
              <span style={{ fontSize: '12.5px', color: C.textSec }}>{row.trigger}</span>
            </div>
            <span
              style={{
                display: 'inline-flex',
                padding: '4px 10px',
                background: row.statusColor,
                color: row.statusText,
                borderRadius: '20px',
                fontSize: '11.5px',
                fontWeight: '500',
                maxWidth: 'fit-content',
              }}
            >
              {row.status}
            </span>
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 14px',
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: '7px',
                fontSize: '12px',
                color: C.textSec,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.12s',
                maxWidth: 'fit-content',
              }}
            >
              <Eye size={12} />
              {row.action}
            </button>
          </div>
        ))}

        <div
          style={{
            padding: '14px 28px',
            background: '#FAFBFC',
            borderTop: `1px solid ${C.border}`,
          }}
        >
          <p style={{ fontSize: '11.5px', color: C.textSec }}>
            Escalation is pattern-triggered, not complaint-triggered. All escalations are under standard
            administrative review procedures.
          </p>
        </div>
      </div>

      {/* Office Detail Drawer */}
      <OfficeDrawer office={selectedOffice} onClose={() => setSelectedOffice(null)} />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// Default page export required by Next.js App Router
export default function Page() {
  return <Overview />;
}