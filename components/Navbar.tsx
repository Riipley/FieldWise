'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sprout, BarChart3, Compass, FileText, Menu, X, Orbit, MapPin, Languages } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, lang, toggleLang, isAr } = useLanguage();

  const navItems = [
    { name: t.navHome, href: '/', icon: Orbit },
    { name: t.navFarm, href: '/farm', icon: MapPin },
    { name: t.navDashboard, href: '/dashboard', icon: BarChart3 },
    { name: t.navRecommendations, href: '/recommendations', icon: Compass },
    { name: t.navReport, href: '/report', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-11 h-11 flex items-center justify-center shrink-0">
              <img
                src="/fieldwise-emblem.png"
                alt="FieldWise Logo"
                className="w-full h-full object-contain transform group-hover:scale-105 transition"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-stone-900 group-hover:text-emerald-800 transition">
                  Field<span className="text-emerald-700">Wise</span>
                </span>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  {isAr ? 'بيانات ناسا' : 'NASA Data'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                {t.heroSubtitle}
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 rtl:space-x-reverse">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                      : 'text-stone-600 hover:text-emerald-700 hover:bg-stone-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-stone-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Action / Language Switcher */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Toggle Button */}
            <button
              onClick={toggleLang}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-xs font-bold text-stone-700 transition"
              title="تغيير اللغة / Switch Language"
            >
              <Languages className="w-4 h-4 text-emerald-700" />
              <span>{lang === 'en' ? 'العربية' : 'English'}</span>
            </button>

            <div className="text-right rtl:text-left">
              <span className="text-xs font-semibold text-stone-700 block">{t.spaceAppsBadge}</span>
              <span className="text-[10px] text-stone-500 block">{t.challengeTitle}</span>
            </div>

            <Link
              href="/farm"
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition hover:shadow flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              {t.navAnalyzeBtn}
            </Link>
          </div>

          {/* Mobile Menu & Language Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleLang}
              className="px-2.5 py-1 rounded-lg border border-stone-300 bg-stone-50 text-xs font-bold text-stone-700"
            >
              {lang === 'en' ? 'عربي' : 'EN'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-stone-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                    : 'text-stone-600 hover:text-emerald-700 hover:bg-stone-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-stone-400'}`} />
                {item.name}
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              href="/farm"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              {t.navAnalyzeBtn}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
