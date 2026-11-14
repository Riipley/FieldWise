'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import type { MonthlyData } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';

interface ClimateChartsProps {
  monthly: MonthlyData[];
}

const AR_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

export default function ClimateCharts({ monthly }: ClimateChartsProps) {
  const { t, isAr } = useLanguage();

  const localizedData = monthly.map((m, i) => ({
    ...m,
    displayMonth: isAr ? AR_MONTHS[i] : m.month,
  }));

  return (
    <div className="space-y-8">
      {/* 1. TEMPERATURE CHART */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              {t.tempChartTitle}
            </h3>
            <p className="text-xs text-stone-500">
              {t.tempChartDesc}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs mt-2 sm:mt-0">
            <span className="flex items-center gap-1 text-red-600 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> {isAr ? 'القصوى' : 'Max'}
            </span>
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> {isAr ? 'المتوسط' : 'Mean'}
            </span>
            <span className="flex items-center gap-1 text-blue-600 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> {isAr ? 'الدنيا' : 'Min'}
            </span>
          </div>
        </div>

        <div className="h-72 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={localizedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="displayMonth" tick={{ fontSize: 11, fill: '#78716c' }} />
              <YAxis unit="°C" tick={{ fontSize: 12, fill: '#78716c' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e7e5e4',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="maxTemp"
                name={isAr ? 'أعلى حرارة' : 'Max Temp'}
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="meanTemp"
                name={isAr ? 'متوسط الحرارة' : 'Mean Temp'}
                stroke="#059669"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="minTemp"
                name={isAr ? 'أدنى حرارة' : 'Min Temp'}
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. PRECIPITATION & HUMIDITY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Precipitation Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <div className="mb-4 pb-2 border-b border-stone-100">
            <h3 className="text-base font-bold text-stone-900">
              {t.rainChartTitle}
            </h3>
            <p className="text-xs text-stone-500">
              {t.rainChartDesc}
            </p>
          </div>

          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={localizedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="displayMonth" tick={{ fontSize: 10, fill: '#78716c' }} />
                <YAxis unit={isAr ? 'ملم' : 'mm'} tick={{ fontSize: 11, fill: '#78716c' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e7e5e4',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <ReferenceLine
                  y={40}
                  stroke="#f97316"
                  strokeDasharray="4 4"
                  label={{ value: isAr ? 'عتبة رطوبة 40 ملم' : '40mm moisture baseline', fill: '#ea580c', fontSize: 10 }}
                />
                <Bar
                  dataKey="precipitation"
                  name={isAr ? 'الأمطار (ملم)' : 'Precipitation (mm)'}
                  fill="#0284c7"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Solar Radiation & Humidity Chart */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <div className="mb-4 pb-2 border-b border-stone-100">
            <h3 className="text-base font-bold text-stone-900">
              {t.humiditySolarChartTitle}
            </h3>
            <p className="text-xs text-stone-500">
              {t.humiditySolarChartDesc}
            </p>
          </div>

          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={localizedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="displayMonth" tick={{ fontSize: 10, fill: '#78716c' }} />
                <YAxis
                  yAxisId="left"
                  unit="%"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#0d9488' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  unit="MJ"
                  tick={{ fontSize: 11, fill: '#d97706' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e7e5e4',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="humidity"
                  name={isAr ? 'الرطوبة (RH2M %)' : 'Humidity (RH2M %)'}
                  stroke="#0d9488"
                  fill="#ccfbf1"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="solarRad"
                  name={isAr ? 'الإشعاع الشمسي (ميغاجول)' : 'Solar Radiation (MJ/m²/d)'}
                  stroke="#d97706"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
