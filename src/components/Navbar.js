"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import PriceTicker from "@/components/PriceTicker";

const categories = [
  { name: "হোম", slug: "/", icon: "🏠" },
  { name: "চাল", slug: "/category/chal", icon: "🍚" },
  { name: "ডাল", slug: "/category/dal", icon: "🫘" },
  { name: "তেল", slug: "/category/tel", icon: "🫙" },
  { name: "সবজি", slug: "/category/shobji", icon: "🥬" },
  { name: "মাছ", slug: "/category/mach", icon: "🐟" },
  { name: "মাংস", slug: "/category/mangsho", icon: "🍗" },
  { name: "ডিম-দুধ", slug: "/category/dim-dudh", icon: "🥛" },
  { name: "মসলা", slug: "/category/moshla", icon: "🌶️" },
];

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

function toBanglaNumber(value) {
  return String(value).replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[digit]);
}

function getBangladeshDate() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    weekday: "long",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  const weekdayNames = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const weekday = banglaWeekdays[weekdayNames[values.weekday]];
  const day = toBanglaNumber(values.day);
  const month = banglaMonths[Number(values.month) - 1];
  const year = toBanglaNumber(values.year);

  return `${weekday}, ${day} ${month}, ${year}`;
}

function isActiveCategory(pathname, slug) {
  if (slug === "/") {
    return pathname === "/";
  }

  return pathname === slug || pathname.startsWith(`${slug}/`);
}

function NavbarContent() {
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [date, setDate] = useState("");

  useEffect(() => {
    const updateDate = () => {
      setDate(getBangladeshDate());
    };

    updateDate();

    const interval = setInterval(updateDate, 60_000);

    return () => clearInterval(interval);
  }, []);

  const initial = (user?.name || user?.email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  const handleProfileClick = () => {
    router.push("/profile");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-green-100 bg-white">
      {/* Top Row: Logo + Date + Profile/Auth */}
      <div className="border-b border-gray-100">
        <div className="mx-auto flex min-h-[52px] w-full max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:min-h-[64px] sm:px-5">
          {/* Logo and Date */}
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2"
            aria-label="বাজার দর হোম পেজ"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-700 text-base shadow-sm sm:h-10 sm:w-10 sm:rounded-xl sm:text-xl">
              🛒
            </span>

            <span className="min-w-0">
              <span className="block whitespace-nowrap text-sm font-extrabold leading-tight text-gray-900 sm:text-base">
                বাজার দর
              </span>

              <span className="mt-0.5 block max-w-[180px] truncate text-[9px] leading-tight text-gray-500 sm:max-w-none sm:text-[10px]">
                {date || "তারিখ লোড হচ্ছে..."}
              </span>
            </span>
          </Link>

          {/* Authentication / Profile */}
          <div className="flex shrink-0 items-center">
            {isPending ? (
              <div className="h-8 w-16 animate-pulse rounded-full bg-gray-100 sm:w-24" />
            ) : user ? (
              <Link
                href="/profile"
                title="আমার প্রোফাইল"
                aria-label="আমার প্রোফাইল"
                className={`flex max-w-[150px] items-center gap-1.5 rounded-full px-1.5 py-1 transition sm:max-w-[210px] sm:gap-2 sm:px-2 ${
                  pathname.startsWith("/profile")
                    ? "bg-green-50"
                    : "hover:bg-green-50"
                }`}
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt=""
                    className="h-7 w-7 shrink-0 rounded-full object-cover sm:h-8 sm:w-8"
                  />
                ) : (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-800 sm:h-8 sm:w-8 sm:text-sm">
                    {initial}
                  </span>
                )}

                <span className="truncate text-[11px] font-semibold text-gray-800 sm:text-sm">
                  {user.name || user.email || "প্রোফাইল"}
                </span>

                <span className="hidden text-[9px] text-gray-500 sm:inline">
                  ▾
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/signin"
                  className="whitespace-nowrap rounded-md border border-green-700 px-2 py-1.5 text-[10px] font-semibold text-green-800 transition hover:bg-green-50 sm:rounded-lg sm:px-3 sm:py-2 sm:text-xs"
                >
                  সাইন ইন
                </Link>

                <Link
                  href="/signup"
                  className="whitespace-nowrap rounded-md bg-green-700 px-2 py-1.5 text-[10px] font-semibold text-white transition hover:bg-green-800 sm:rounded-lg sm:px-3 sm:py-2 sm:text-xs"
                >
                  সাইন আপ
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <nav
        aria-label="পণ্যের বিভাগ"
        className="w-full border-b border-gray-100 bg-white"
      >
        <div
          className="mx-auto flex w-full max-w-7xl items-center gap-1 overflow-x-auto overscroll-x-contain px-2 py-1 sm:justify-center sm:gap-2 sm:px-4 sm:py-1.5"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {categories.map((category) => {
            const active = isActiveCategory(pathname, category.slug);

            return (
              <Link
                key={category.slug}
                href={category.slug}
                aria-current={active ? "page" : undefined}
                className={`relative flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-md px-2 py-1.5 text-[10px] font-semibold transition sm:gap-1.5 sm:rounded-lg sm:px-2.5 sm:py-2 sm:text-xs ${
                  active
                    ? "bg-green-50 text-green-800"
                    : "text-gray-600 hover:bg-green-50 hover:text-green-800"
                }`}
              >
                <span className="text-[11px] leading-none sm:text-sm">
                  {category.icon}
                </span>

                <span>{category.name}</span>

                {active && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-green-600" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Price Ticker */}
      <PriceTicker />
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense
      fallback={
        <header className="w-full border-b border-green-100 bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-3 sm:px-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-700">
              🛒
            </span>

            <span className="text-sm font-bold text-green-800">
              বাজার দর
            </span>
          </div>
        </header>
      }
    >
      <NavbarContent />
    </Suspense>
  );
}