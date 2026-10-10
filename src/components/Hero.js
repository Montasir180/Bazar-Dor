"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const banglaWeekdays = [
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
];

const banglaMonths = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

function getBanglaDate() {
  const now = new Date();

  // Bangladesh local time
  const dateString = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const [year, month, day] = dateString.split("-").map(Number);

  // Get weekday using Bangladesh's calendar date
  const weekday = new Date(
    Date.UTC(year, month - 1, day)
  ).getUTCDay();

  const banglaNumber = (number) =>
    String(number).replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[digit]);

  return `${banglaWeekdays[weekday]}, ${banglaNumber(day)} ${banglaMonths[month - 1]}, ${banglaNumber(year)}`;
}

export default function Hero() {
  const [date, setDate] = useState("");

  useEffect(() => {
    const updateDate = () => {
      setDate(getBanglaDate());
    };

    updateDate();

    // Update every minute to handle date changes at midnight
    const interval = setInterval(updateDate, 60_000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-[#f0f5f0] px-3 py-5 sm:px-5 sm:py-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-5 overflow-hidden rounded-3xl border border-green-100 bg-[#fcfdfc] px-5 py-6 sm:px-8 sm:py-8 md:grid-cols-[1.5fr_0.8fr] md:gap-8 md:px-10 lg:px-12">
        {/* Left Content */}
        <div className="min-w-0">
          {/* Real-time Bangladesh Date */}
          <div className="mb-4 inline-flex max-w-full items-center rounded-full bg-[#e2f5e9] px-3 py-2 text-xs font-bold text-green-700 sm:mb-5 sm:px-4 sm:text-sm">
            <span className="truncate">
              {date || "তারিখ লোড হচ্ছে..."}
            </span>
          </div>

          {/* Heading */}
          <h1 className="max-w-3xl text-2xl font-extrabold leading-tight tracking-tight text-[#17251d] sm:text-3xl md:text-4xl lg:text-5xl">
            আজকের বাজারের দাম এক নজরে
          </h1>

          {/* Subtitle */}
          <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:mt-5 sm:text-base sm:leading-8 md:text-lg">
            চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলার দাম —
            বাজারভিত্তিক বিস্তারিত তথ্য, সহজে সর্বনিম্ন-সর্বোচ্চ
            এবং বাজারের সর্বশেষ এক জায়গায়।
          </p>

          {/* CTA */}
          <Link
            href="/#সব-পণ্য"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-green-800 active:scale-[0.98] sm:mt-7 sm:px-7 sm:text-base"
          >
            সব পণ্য দেখুন
          </Link>
        </div>

        {/* Right Hero Image */}
        <div className="relative mx-auto flex w-full max-w-[220px] items-center justify-center sm:max-w-[280px] md:max-w-[320px] lg:max-w-[360px]">
          <Image
            src="/bazar-hero.png"
            alt="বাজারের বিভিন্ন পণ্যের ছবি"
            width={500}
            height={400}
            priority
            className="h-auto w-full object-contain"
            sizes="(max-width: 640px) 220px, (max-width: 1024px) 280px, 360px"
          />
        </div>
      </div>
    </section>
  );
}