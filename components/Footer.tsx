'use client';

import React from 'react';
import Link from 'next/link';
import { Sprout, ExternalLink, ShieldCheck, Database, Award } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export default function Footer() {
  const { t, isAr } = useLanguage();

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center shrink-0">
                <img src="/fieldwise-emblem.png" alt="FieldWise Emblem" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Field<span className="text-emerald-400">Wise</span>
              </span>
            </div>
            <p className="text-stone-400 text-sm max-w-md leading-relaxed">
              {t.footerMission}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-stone-800 text-stone-300 border border-stone-700">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                NASA POWER API
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-stone-800 text-stone-300 border border-stone-700">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                {isAr ? 'منظومة قرار شفافة' : 'Transparent Decision Rules'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-stone-800 text-stone-300 border border-stone-700">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                NASA Space Apps 2026
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              {isAr ? 'صفحات المنصة' : 'Platform'}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition">
                  {t.navHome}
                </Link>
              </li>
              <li>
                <Link href="/farm" className="hover:text-emerald-400 transition">
                  {t.navFarm}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-400 transition">
                  {t.navDashboard}
                </Link>
              </li>
              <li>
                <Link href="/recommendations" className="hover:text-emerald-400 transition">
                  {t.navRecommendations}
                </Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-emerald-400 transition">
                  {t.navReport}
                </Link>
              </li>
            </ul>
          </div>

          {/* Scientific Disclaimer & Sources */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              {isAr ? 'الإسناد العلمي والبيانات' : 'Scientific Attribution'}
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed mb-3">
              {isAr ? 'البيانات البيئية مستمدة من منصة ' : 'Environmental observations provided by '}
              <a
                href="https://power.larc.nasa.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline inline-flex items-center gap-0.5"
              >
                NASA POWER API <ExternalLink className="w-3 h-3" />
              </a>{' '}
              (Prediction of Worldwide Energy Resources).
            </p>
            <div className="p-3 bg-stone-800/80 rounded-lg border border-stone-700/60 text-[11px] text-stone-400 leading-normal">
              <strong>{isAr ? 'تنويه علمي: ' : 'Notice: '}</strong>
              {t.footerDisclaimer}
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500">
          <p>&copy; 2026 {t.footerCopyright}</p>
          <p className="mt-2 sm:mt-0">
            {isAr
              ? 'صُمم لدعم استدامة الزراعة العالمية وإدارة الدورات المحصولية.'
              : 'Designed for resilient global agriculture & sustainable crop rotations.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
