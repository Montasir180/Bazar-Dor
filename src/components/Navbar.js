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
    <header className="sticky top-0 z-50 w-full border-b border-green-100 bg-white">
      {/* First Row: Logo and Authentication */}
      <div className="border-b border-gray-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-700 text-lg">
              🛒
            </span>

            <span>
              <span className="block text-sm font-extrabold text-gray-900 sm:text-base">
                বাজার দর
              </span>

              <span className="block text-[9px] text-gray-500 sm:text-[10px]">
                প্রয়োজনীয় পণ্যের দাম এক নজরে
              </span>
            </span>
          </Link>

          {/* Auth Buttons */}
          <div className="flex shrink-0 items-center gap-2">
            {isPending ? (
              <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-100" />
            ) : user ? (
              <>
                {/* Profile */}
                <Link
                  href="/profile"
                  title="আমার প্রোফাইল"
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold transition sm:px-3 sm:text-sm ${
                    pathname.startsWith("/profile")
                      ? "bg-green-100 text-green-800"
                      : "text-gray-700 hover:bg-green-50 hover:text-green-800"
                  }`}
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt=""
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 font-bold text-green-800">
                      {initial}
                    </span>
                  )}

                  <span className="max-w-24 truncate">
                    {user.name || "প্রোফাইল"}
                  </span>

                  <span aria-hidden="true" className="text-[10px]">
                    ▾
                  </span>
                </Link>

                {/* Sign Out */}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="rounded-lg border border-red-200 px-2.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:text-sm"
                >
                  {loggingOut ? "অপেক্ষা করুন..." : "সাইন আউট"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="rounded-lg border border-green-700 px-3 py-1.5 text-xs font-semibold text-green-800 transition hover:bg-green-50 sm:px-4 sm:py-2 sm:text-sm"
                >
                  সাইন ইন
                </Link>

                <Link
                  href="/signup"
                  className="rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-green-800 sm:px-4 sm:py-2 sm:text-sm"
                >
                  সাইন আপ
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Second Row: Categories */}
      <nav
        aria-label="পণ্যের বিভাগ"
        className="border-b border-gray-100"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-start gap-1 overflow-x-auto px-3 py-1.5 sm:justify-center sm:gap-3 sm:px-6">
          {categories.map((category) => {
            const active = isActiveCategory(category.slug);

            return (
              <Link
                key={category.slug}
                href={category.slug}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition sm:px-2.5 sm:text-xs ${
                  active
                    ? "bg-green-100 text-green-800"
                    : "text-gray-600 hover:bg-green-50 hover:text-green-800"
                }`}
              >
                <span>{category.icon}</span>
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
          <div className="mx-auto max-w-7xl px-4 py-4">
            <span className="font-bold text-green-800">🛒 বাজার দর</span>
          </div>
        </header>
      }
    >
      <NavbarContent />
    </Suspense>
  );
}