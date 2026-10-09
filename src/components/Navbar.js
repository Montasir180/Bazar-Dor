"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import PriceTicker from "@/components/PriceTicker";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const { data: session, isPending } = authClient.useSession();

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      const result = await authClient.signOut();

      if (result?.error) {
        toast.error("সাইন আউট করা যায়নি। আবার চেষ্টা করুন।");
        return;
      }

      toast.success("সফলভাবে সাইন আউট হয়েছে!");

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("সাইন আউট করার সময় সমস্যা হয়েছে।");
    } finally {
      setLoggingOut(false);
    }
  };

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-green-100 bg-white">
      {/* Top Navbar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 text-xl">
            🛒
          </span>

          <span>
            <span className="block text-base font-extrabold text-gray-900 sm:text-lg">
              বাজার দর
            </span>

            <span className="block text-[10px] text-gray-500 sm:text-xs">
              প্রয়োজনীয় পণ্যের দাম এক নজরে
            </span>
          </span>
        </Link>

        {/* Authentication */}
        <div className="flex shrink-0 items-center gap-2">
          {isPending ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-100" />
          ) : session?.user ? (
            <>
              {/* Profile */}
              <Link
                href="/profile"
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                  pathname.startsWith("/profile")
                    ? "border-green-700 bg-green-50 text-green-800"
                    : "border-green-200 bg-white text-green-800 hover:bg-green-50"
                }`}
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-800">
                    {(session.user.name || session.user.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}

                <span className="hidden sm:inline">
                  {session.user.name || "প্রোফাইল"}
                </span>

                <span className="sm:hidden">প্রোফাইল</span>
              </Link>

              {/* Sign Out */}
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-800 disabled:opacity-60 sm:text-sm"
              >
                {loggingOut ? "অপেক্ষা করুন..." : "সাইন আউট"}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="rounded-lg border border-green-700 px-3 py-2 text-xs font-semibold text-green-800 transition hover:bg-green-50 sm:text-sm"
              >
                সাইন ইন
              </Link>

              <Link
                href="/signup"
                className="rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-green-800 sm:text-sm"
              >
                সাইন আপ
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Category Navigation */}
      <nav className="border-t border-gray-100">
        <div className="mx-auto flex max-w-7xl items-center justify-start gap-1 overflow-x-auto px-3 py-2 sm:justify-center sm:gap-3 sm:px-6">
          {categories.map((category) => {
            const isActive =
              category.slug === "/"
                ? pathname === "/"
                : pathname === category.slug ||
                  pathname.startsWith(`${category.slug}/`);

            return (
              <Link
                key={category.slug}
                href={category.slug}
                className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium transition sm:text-sm ${
                  isActive
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

      {/* Price Ticker */}
      <PriceTicker />
    </header>
  );
}