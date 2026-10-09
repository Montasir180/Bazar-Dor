"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { getBanglaDate } from "@/lib/utils";
import PriceTicker from "@/components/PriceTicker";

const API_URL = "https://api.api-store.workers.dev/api/bazardor";

const categoryIcons = {
  chal: "🍚",
  dal: "🫘",
  tel: "🫙",
  sobji: "🥬",
  mach: "🐟",
  mangsho: "🥩",
  dim: "🥚",
  moshla: "🌶️",
};

function getCategoryName(category) {
  return (
    category.nameBn ||
    category.name_bn ||
    category.name ||
    category.title ||
    "ক্যাটাগরি"
  );
}

function getCategorySlug(category) {
  return (
    category.slug ||
    category.id ||
    category.key ||
    ""
  );
}

function getCategoryIcon(category) {
  return (
    category.emoji ||
    category.icon ||
    categoryIcons[getCategorySlug(category)] ||
    "🛒"
  );
}

export default function Navbar() {
  const pathname = usePathname();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] =
    useState(true);

  // Assignment অনুযায়ী API থেকেই categories আনছি
  useEffect(() => {
    let cancelled = false;

    async function fetchCategories() {
      try {
        let response = await fetch(`${API_URL}/categories`);

        // Primary API কাজ না করলে assignment-এর alternative API
        if (!response.ok) {
          response = await fetch(
            "https://api.abcz.workers.dev/api/bazardor/categories"
          );
        }

        if (!response.ok) {
          throw new Error("Categories API failed");
        }

        const data = await response.json();

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.categories)
          ? data.categories
          : Array.isArray(data.data)
          ? data.data
          : [];

        if (!cancelled) {
          setCategories(list);
        }
      } catch (error) {
        console.error("Categories API error:", error);
      } finally {
        if (!cancelled) {
          setLoadingCategories(false);
        }
      }
    }

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white">
      {/* First row: Logo + date + Login/Logout */}
      <div className="mx-auto flex h-[45px] max-w-[1200px] items-center justify-between px-3 sm:px-5">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="বাজার দর হোম"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-700 text-sm text-white">
            🛒
          </span>

          <span className="flex flex-col">
            <span className="text-[13px] font-bold leading-4 text-gray-900">
              বাজার দর
            </span>

            <span className="text-[8px] leading-3 text-gray-500">
              {getBanglaDate()}
            </span>
          </span>
        </Link>

        {/* Login and Logout buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/signin"
            className="rounded-md border border-green-700 px-3 py-1 text-[10px] font-semibold text-green-800 transition hover:bg-green-50"
          >
            সাইন ইন
          </Link>

          <Link
            href="/signup"
            className="rounded-md bg-green-700 px-3 py-1 text-[10px] font-semibold text-white transition hover:bg-green-800"
          >
            সাইন আপ
          </Link>
        </div>
      </div>

      {/* Second row: API categories */}
      <nav className="border-t border-gray-100">
        <div className="mx-auto flex min-h-[29px] max-w-[1200px] items-center justify-center gap-1 overflow-x-auto px-2 sm:gap-3">
          <Link
            href="/"
            className={`flex shrink-0 items-center gap-1 rounded px-2 py-1 text-[10px] transition ${
              pathname === "/"
                ? "bg-green-50 font-bold text-green-800"
                : "text-gray-700 hover:bg-green-50"
            }`}
          >
            🏠 হোম
          </Link>

          {loadingCategories ? (
            <span className="text-[10px] text-gray-400">
              ক্যাটাগরি লোড হচ্ছে...
            </span>
          ) : (
            categories.map((category, index) => {
              const slug = getCategorySlug(category);

              if (!slug) return null;

              const href = `/category/${slug}`;

              const isActive = pathname === href;

              return (
                <Link
                  key={slug || index}
                  href={href}
                  className={`flex shrink-0 items-center gap-1 rounded px-2 py-1 text-[10px] transition ${
                    isActive
                      ? "bg-green-50 font-bold text-green-800"
                      : "text-gray-700 hover:bg-green-50"
                  }`}
                >
                  <span>{getCategoryIcon(category)}</span>

                  <span>{getCategoryName(category)}</span>
                </Link>
              );
            })
          )}
        </div>
      </nav>

      {/* Third row: API price ticker */}
      <PriceTicker />
    </header>
  );
}