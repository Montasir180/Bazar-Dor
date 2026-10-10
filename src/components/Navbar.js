
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
    <header className="sticky top-0 z-50 w-full max-w-full border-b border-green-100 bg-white shadow-sm">
      {/* ROW 1: LOGO + AUTHENTICATION */}

      <div className="border-b border-gray-100">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-5 sm:py-3 lg:px-8">
          {/* Logo */}

          <Link
            href="/"
            aria-label="বাজার দর হোম পেজ"
            className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none sm:gap-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-700 text-lg shadow-sm sm:h-11 sm:w-11 sm:text-xl">
              🛒
            </span>

            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold leading-tight text-gray-900 sm:text-lg lg:text-xl">
                বাজার দর
              </span>

              <span className="mt-1 hidden text-[10px] leading-tight text-gray-500 min-[360px]:block sm:text-xs">
                প্রয়োজনীয় পণ্যের দাম এক নজরে
              </span>
            </span>
          </Link>

          {/* Authentication */}

          <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
            {isPending ? (
              <div className="h-9 w-16 animate-pulse rounded-lg bg-gray-100 sm:h-10 sm:w-24" />
            ) : user ? (
              <>
                {/* Profile */}

                <Link
                  href="/profile"
                  title="আমার প্রোফাইল"
                  aria-label="আমার প্রোফাইল"
                  className={`flex min-h-9 items-center gap-1.5 rounded-xl px-1.5 py-1.5 text-xs font-semibold transition-colors sm:min-h-10 sm:gap-2 sm:px-3 sm:text-sm ${
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

                  <span className="hidden max-w-28 truncate min-[400px]:block">
                    {user.name || "প্রোফাইল"}
                  </span>

                  <span
                    aria-hidden="true"
                    className="hidden text-xs sm:block"
                  >
                    ▾
                  </span>
                </Link>

                {/* Logout */}

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="inline-flex min-h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-xl border border-red-200 px-2 py-2 text-[11px] font-semibold text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-10 sm:px-3 sm:text-sm"
                >
                  {loggingOut ? "অপেক্ষা করুন..." : "সাইন আউট"}
                </button>
              </>
            ) : (
              <>
                {/* Sign In */}

                <Link
                  href="/signin"
                  className="inline-flex min-h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-xl border border-green-700 px-2.5 py-2 text-[11px] font-semibold text-green-800 transition-colors hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 sm:min-h-10 sm:px-4 sm:text-sm"
                >
                  সাইন ইন
                </Link>

                {/* Sign Up */}

                <Link
                  href="/signup"
                  className="inline-flex min-h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-green-700 px-2.5 py-2 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 sm:min-h-10 sm:px-4 sm:text-sm"
                >
                  সাইন আপ
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ROW 2: RESPONSIVE CATEGORY NAVIGATION */}

      {/* Second Row: Categories */}
<nav
  aria-label="পণ্যের বিভাগ"
  className="w-full border-b border-gray-100 bg-white"
>
  <div
    className="
      mx-auto flex w-full max-w-7xl
      items-center gap-1
      overflow-x-auto overscroll-x-contain
      px-2 py-1.5
      sm:justify-center sm:gap-2 sm:px-4 sm:py-2
      lg:gap-3
    "
    style={{
      scrollbarWidth: "none",
      msOverflowStyle: "none",
      WebkitOverflowScrolling: "touch",
    }}
  >
    {categories.map((category) => {
      const active = isActiveCategory(category.slug);

      return (
        <Link
          key={category.slug}
          href={category.slug}
          aria-current={active ? "page" : undefined}
          className={`
            relative flex shrink-0 items-center
            justify-center gap-1
            whitespace-nowrap rounded-lg
            border px-2 py-1.5
            text-[10px] font-semibold leading-tight
            transition-colors duration-200
            min-[375px]:px-2.5
            sm:gap-1.5 sm:rounded-xl
            sm:px-3 sm:py-2 sm:text-xs
            ${
              active
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-transparent text-gray-600 hover:bg-green-50 hover:text-green-800"
            }
          `}
        >
          <span
            aria-hidden="true"
            className="text-[11px] leading-none sm:text-sm"
          >
            {category.icon}
          </span>

          <span>{category.name}</span>

          {active && (
            <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-green-600 sm:left-3 sm:right-3" />
          )}
        </Link>
      );
    })}
  </div>
</nav>
      {/* ROW 3: PRICE TICKER */}

      <div className="w-full min-w-0">
        <PriceTicker />
      </div>
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-50 w-full border-b border-green-100 bg-white">
          <div className="mx-auto flex min-h-14 max-w-7xl items-center px-3 sm:px-5 lg:px-8">
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

