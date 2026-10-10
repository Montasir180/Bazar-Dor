"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import PriceTicker from "@/components/PriceTicker";

function NavbarContent() {
  const pathname = usePathname();
  const router = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

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

  const isActiveCategory = (slug) => {
    if (slug === "/") {
      return pathname === "/";
    }

    return pathname === slug || pathname.startsWith(`${slug}/`);
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      const result = await authClient.signOut();

      if (result?.error) {
        toast.error("সাইন আউট করা যায়নি। আবার চেষ্টা করুন।");
        return;
      }

      toast.success("সফলভাবে সাইন আউট হয়েছেন!");

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("সাইন আউট করার সময় সমস্যা হয়েছে।");
    } finally {
      setLoggingOut(false);
    }
  };

  const initial = (user?.name || user?.email || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-green-100 bg-white shadow-sm">
      {/* First Row: Logo + Authentication */}
      <div className="border-b border-gray-100">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-6 sm:py-3">
          {/* Logo */}
          <Link
            href="/"
            className="flex min-w-0 shrink items-center gap-2"
            aria-label="বাজার দর হোম পেজ"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-700 text-base sm:h-10 sm:w-10 sm:rounded-xl sm:text-xl">
              🛒
            </span>

            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold leading-tight text-gray-900 sm:text-lg">
                বাজার দর
              </span>

              <span className="mt-0.5 hidden text-[10px] leading-tight text-gray-500 min-[360px]:block sm:text-xs">
                প্রয়োজনীয় পণ্যের দাম এক নজরে
              </span>
            </span>
          </Link>

          {/* Authentication */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {isPending ? (
              <div className="h-8 w-16 animate-pulse rounded-lg bg-gray-100 sm:w-24" />
            ) : user ? (
              <>
                {/* Profile */}
                <Link
                  href="/profile"
                  title="আমার প্রোফাইল"
                  aria-label="আমার প্রোফাইল"
                  className={`flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 text-xs font-semibold transition sm:gap-2 sm:px-3 sm:text-sm ${
                    pathname.startsWith("/profile")
                      ? "bg-green-100 text-green-800"
                      : "text-gray-700 hover:bg-green-50 hover:text-green-800"
                  }`}
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt=""
                      className="h-7 w-7 shrink-0 rounded-full object-cover sm:h-8 sm:w-8"
                    />
                  ) : (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-800 sm:h-8 sm:w-8">
                      {initial}
                    </span>
                  )}

                  <span className="hidden max-w-24 truncate min-[400px]:block">
                    {user.name || "প্রোফাইল"}
                  </span>

                  <span aria-hidden="true" className="hidden text-[10px] sm:block">
                    ▾
                  </span>
                </Link>

                {/* Sign Out */}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="whitespace-nowrap rounded-lg border border-red-200 px-2 py-2 text-[11px] font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:text-sm"
                >
                  {loggingOut ? "অপেক্ষা করুন..." : "সাইন আউট"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="whitespace-nowrap rounded-lg border border-green-700 px-2.5 py-2 text-[11px] font-semibold text-green-800 transition hover:bg-green-50 sm:px-4 sm:text-sm"
                >
                  সাইন ইন
                </Link>

                <Link
                  href="/signup"
                  className="whitespace-nowrap rounded-lg bg-green-700 px-2.5 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:bg-green-800 sm:px-4 sm:text-sm"
                >
                  সাইন আপ
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Second Row: Horizontally Scrollable Categories */}
      <nav
        aria-label="পণ্যের বিভাগ"
        className="border-b border-gray-100"
      >
        <div className="scrollbar-hide mx-auto flex w-full max-w-7xl items-center gap-1 overflow-x-auto overscroll-x-contain px-2 py-1.5 sm:justify-center sm:gap-2 sm:px-6">
          {categories.map((category) => {
            const active = isActiveCategory(category.slug);

            return (
              <Link
                key={category.slug}
                href={category.slug}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center justify-center gap-1 rounded-lg px-2.5 py-2 text-[11px] font-medium transition sm:px-3 sm:text-xs ${
                  active
                    ? "bg-green-100 text-green-800"
                    : "text-gray-600 hover:bg-green-50 hover:text-green-800"
                }`}
              >
                <span aria-hidden="true">{category.icon}</span>
                <span>{category.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Third Row: Price Ticker */}
      <PriceTicker />
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense
      fallback={
        <header className="w-full border-b border-green-100 bg-white">
          <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6">
            <span className="text-sm font-bold text-green-800 sm:text-base">
              🛒 বাজার দর
            </span>
          </div>
        </header>
      }
    >
      <NavbarContent />
    </Suspense>
  );
}