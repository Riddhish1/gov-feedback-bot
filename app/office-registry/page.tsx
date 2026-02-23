"use client";

import React, { useState, useMemo } from 'react';
import { Search, TrendingUp, Minus, Filter, Download, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  shadow: '0 1px 4px rgba(15,23,36,0.06), 0 1px 2px rgba(15,23,36,0.04)',
  green: '#10B981',
};

const officeRegistry = [
  { id: 1, name: 'Pune Revenue Office A', dept: 'Revenue', type: 'Revenue', district: 'Pune', division: 'Pune', omes: 3.12, trend: 'improving', status: 'Active', submissions: 2840 },
  { id: 2, name: 'Nashik Municipal North', dept: 'Municipal', type: 'Municipal', district: 'Nashik', division: 'Nashik', omes: 2.94, trend: 'improving', status: 'Escalation Review', submissions: 1920 },
  { id: 3, name: 'Nagpur Tahsildar Office B', dept: 'Revenue', type: 'Tahsildar', district: 'Nagpur', division: 'Nagpur', omes: 3.28, trend: 'stable', status: 'Active', submissions: 3120 },
  { id: 4, name: 'Mumbai Transport Office Central', dept: 'Transport', type: 'Transport', district: 'Mumbai', division: 'Konkan', omes: 3.05, trend: 'improving', status: 'Escalation Review', submissions: 4680 },
  { id: 5, name: 'Aurangabad Revenue Office A', dept: 'Revenue', type: 'Revenue', district: 'Aurangabad', division: 'Aurangabad', omes: 3.58, trend: 'improving', status: 'Active', submissions: 1840 },
  { id: 6, name: 'Pune Municipal Office East', dept: 'Municipal', type: 'Municipal', district: 'Pune', division: 'Pune', omes: 3.74, trend: 'improving', status: 'Active', submissions: 3240 },
  { id: 7, name: 'Kolhapur Tahsildar North', dept: 'Revenue', type: 'Tahsildar', district: 'Kolhapur', division: 'Pune', omes: 3.42, trend: 'stable', status: 'Active', submissions: 1680 },
  { id: 8, name: 'Solapur Revenue Office B', dept: 'Revenue', type: 'Revenue', district: 'Solapur', division: 'Pune', omes: 2.87, trend: 'improving', status: 'Active', submissions: 1280 },
  { id: 9, name: 'Nagpur Municipal West', dept: 'Municipal', type: 'Municipal', district: 'Nagpur', division: 'Nagpur', omes: 3.65, trend: 'stable', status: 'Active', submissions: 2960 },
  { id: 10, name: 'Mumbai Sub-Divisional Office A', dept: 'Revenue', type: 'Sub-Divisional', district: 'Mumbai', division: 'Konkan', omes: 4.02, trend: 'improving', status: 'Active', submissions: 5840 },
  { id: 11, name: 'Nashik Revenue Office South', dept: 'Revenue', type: 'Revenue', district: 'Nashik', division: 'Nashik', omes: 3.31, trend: 'stable', status: 'Active', submissions: 1540 },
  { id: 12, name: 'Aurangabad Municipal Central', dept: 'Municipal', type: 'Municipal', district: 'Aurangabad', division: 'Aurangabad', omes: 3.19, trend: 'improving', status: 'Active', submissions: 2240 },
  { id: 13, name: 'Pune Transport Office Central', dept: 'Transport', type: 'Transport', district: 'Pune', division: 'Pune', omes: 3.88, trend: 'improving', status: 'Active', submissions: 4120 },
  { id: 14, name: 'Amravati Revenue Office A', dept: 'Revenue', type: 'Revenue', district: 'Amravati', division: 'Amravati', omes: 2.76, trend: 'improving', status: 'Active', submissions: 980 },
  { id: 15, name: 'Nagpur Transport Office B', dept: 'Transport', type: 'Transport', district: 'Nagpur', division: 'Nagpur', omes: 3.46, trend: 'stable', status: 'Active', submissions: 3680 },
];

type SortKey = 'name' | 'district' | 'omes' | 'submissions';

export function OfficeRegistry() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('omes');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const divisions = [...new Set(officeRegistry.map((o) => o.division))].sort();
  const departments = [...new Set(officeRegistry.map((o) => o.dept))].sort();

  const filtered = useMemo(() => {
    return officeRegistry
      .filter((o) => {
        const matchSearch =
          o.name.toLowerCase().includes(search.toLowerCase()) ||
          o.district.toLowerCase().includes(search.toLowerCase());
        const matchDiv = divisionFilter ? o.division === divisionFilter : true;
        const matchDept = deptFilter ? o.dept === deptFilter : true;
        return matchSearch && matchDiv && matchDept;
      })
      .sort((a, b) => {
        let va: string | number = a[sortKey] ?? '';
        let vb: string | number = b[sortKey] ?? '';
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [search, divisionFilter, deptFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
    ) : null;

  const avgOmes = (filtered.reduce((sum, o) => sum + o.omes, 0) / filtered.length).toFixed(2);

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', color: C.textSec }}>Maharashtra</span>
          <span style={{ color: C.border }}>›</span>
          <span style={{ fontSize: '12px', color: C.blue, fontWeight: '500' }}>Office Registry</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '680', color: C.text, letterSpacing: '-0.6px', marginBottom: '6px' }}>
              Full Office Registry
            </h1>
            <p style={{ fontSize: '14px', color: C.textSec }}>
              All registered offices across Maharashtra · 312 total
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '9px 16px', background: C.white, border: `1px solid ${C.border}`,
                borderRadius: '9px', fontSize: '13px', color: C.textSec, cursor: 'pointer',
                fontFamily: 'inherit', boxShadow: C.shadow,
              }}
            >
              <Download size={13} />
              Export
            </button>
            <button
              onClick={() => router.push('/add-office')}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '9px 18px', background: C.blue, border: 'none',
                borderRadius: '9px', fontSize: '13px', fontWeight: '520', color: 'white',
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 2px 8px rgba(11,108,245,0.25)',
              }}
            >
              <Plus size={13} />
              Add Office
            </button>
          </div>
        </div>
      </div>

      {/* Summary Strip */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Showing', value: `${filtered.length} Offices` },
          { label: 'Avg OMES', value: avgOmes },
          { label: 'Improving', value: `${filtered.filter(o => o.trend === 'improving').length}` },
          { label: 'Under Review', value: `${filtered.filter(o => o.status !== 'Active').length}` },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: C.white, border: `1px solid ${C.border}`, borderRadius: '10px',
              padding: '12px 18px', boxShadow: C.shadow, flex: 1,
            }}
          >
            <div style={{ fontSize: '11px', color: C.textSec, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '18px', fontWeight: '660', color: C.text, letterSpacing: '-0.4px' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div
        style={{
          background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px',
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
            placeholder="Search by office name or district…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: '13.5px', color: C.text, fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={13} color={C.textSec} />
        </div>

        <select
          value={divisionFilter}
          onChange={(e) => setDivisionFilter(e.target.value)}
          style={{
            padding: '9px 12px', background: C.bg, border: `1px solid ${C.border}`,
            borderRadius: '9px', fontSize: '13px', color: divisionFilter ? C.text : C.textSec,
            cursor: 'pointer', fontFamily: 'inherit', outline: 'none', minWidth: '140px',
          }}
        >
          <option value="">All Divisions</option>
          {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          style={{
            padding: '9px 12px', background: C.bg, border: `1px solid ${C.border}`,
            borderRadius: '9px', fontSize: '13px', color: deptFilter ? C.text : C.textSec,
            cursor: 'pointer', fontFamily: 'inherit', outline: 'none', minWidth: '140px',
          }}
        >
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          background: C.white, border: `1px solid ${C.border}`, borderRadius: '16px',
          boxShadow: C.shadow, overflow: 'hidden',
        }}
      >
        {/* Table Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr 1fr 1fr',
            padding: '12px 24px',
            background: '#FAFBFC',
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          {[
            { k: 'name' as SortKey, label: 'Office' },
            { k: null, label: 'Dept' },
            { k: 'district' as SortKey, label: 'District' },
            { k: null, label: 'Division' },
            { k: 'omes' as SortKey, label: 'OMES' },
            { k: null, label: 'Trend' },
            { k: 'submissions' as SortKey, label: 'Submissions' },
          ].map(({ k, label }) => (
            <div
              key={label}
              onClick={() => k && handleSort(k)}
              style={{
                fontSize: '11px', fontWeight: '600', color: C.textSec,
                textTransform: 'uppercase', letterSpacing: '0.07em',
                cursor: k ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', gap: '4px',
                userSelect: 'none',
              }}
            >
              {label}
              {k && <SortIcon k={k} />}
            </div>
          ))}
        </div>

        {/* Rows */}
        {filtered.map((office, idx) => (
          <div
            key={office.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr 1fr 1fr',
              padding: '14px 24px',
              borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none',
              alignItems: 'center',
              transition: 'background 0.1s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = C.bg)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
          >
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: '520', color: C.text, letterSpacing: '-0.2px', marginBottom: '2px' }}>
                {office.name}
              </div>
              <span
                style={{
                  padding: '2px 8px',
                  background: office.status === 'Active' ? C.bg : '#FFFBEB',
                  color: office.status === 'Active' ? C.textSec : '#92400E',
                  borderRadius: '20px',
                  fontSize: '10.5px',
                  fontWeight: '500',
                  border: `1px solid ${office.status === 'Active' ? C.border : '#FDE68A'}`,
                }}
              >
                {office.status}
              </span>
            </div>

            <div style={{ fontSize: '12.5px', color: C.textSec }}>{office.dept}</div>
            <div style={{ fontSize: '12.5px', color: C.text }}>{office.district}</div>
            <div style={{ fontSize: '12.5px', color: C.textSec }}>{office.division}</div>

            <div>
              <span style={{ fontSize: '14px', fontWeight: '640', color: C.text, letterSpacing: '-0.3px' }}>
                {office.omes.toFixed(2)}
              </span>
              <div style={{ height: '2.5px', background: C.border, borderRadius: '2px', marginTop: '5px', width: '40px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(office.omes / 5) * 100}%`, background: C.blue, borderRadius: '2px', opacity: 0.6 }} />
              </div>
            </div>

            <div>
              {office.trend === 'improving' ? (
                <span
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '3px 9px', background: '#F0FDF4', color: '#15803D',
                    borderRadius: '20px', fontSize: '11px', fontWeight: '520',
                  }}
                >
                  <TrendingUp size={9} /> Improving
                </span>
              ) : (
                <span
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '3px 9px', background: C.bg, color: C.textSec,
                    borderRadius: '20px', fontSize: '11px', fontWeight: '520',
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <Minus size={9} /> Stable
                </span>
              )}
            </div>

            <div style={{ fontSize: '13px', fontWeight: '520', color: C.text }}>
              {office.submissions.toLocaleString()}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: C.textSec, fontSize: '14px' }}>
            No offices match your current filters.
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px', borderTop: `1px solid ${C.border}`, background: '#FAFBFC',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '12px', color: C.textSec }}>
            Showing {filtered.length} of 312 registered offices
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3, '...', 21].map((p, i) => (
              <button
                key={i}
                style={{
                  width: '28px', height: '28px', borderRadius: '7px',
                  border: `1px solid ${p === 1 ? C.blue : C.border}`,
                  background: p === 1 ? C.blue : C.white,
                  color: p === 1 ? 'white' : C.textSec,
                  fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Default export for Next.js App Router
export default function Page() {
  return <OfficeRegistry />;
}
