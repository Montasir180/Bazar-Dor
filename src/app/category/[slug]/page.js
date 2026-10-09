"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import ProductCard from "@/components/ProductCard";

const API_URLS = [
  "https://api.api-store.workers.dev/api/bazardor",
  "https://api.abcz.workers.dev/api/bazardor",
];

const CATEGORY_ICONS = {
  chal: "🍚",
  dal: "🫘",
  tel: "🫙",
  sobji: "🥬",
  mach: "🐟",
  mangsho: "🥩",
  dim: "🥚",
  moshla: "🌶️",
};

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function getSlug(item) {
  if (typeof item === "string") return item;

  return (
    item?.slug ??
    item?.categorySlug ??
    item?.category_slug ??
    item?.key ??
    item?.id ??
    ""
  );
}

function getCategoryName(item) {
  if (typeof item === "string") return item;

  return (
    item?.nameBn ??
    item?.name_bn ??
    item?.name ??
    item?.title ??
    item?.label ??
    ""
  );
}

function getArray(data) {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.data)) return data.data;

  if (Array.isArray(data?.data?.products)) {
    return data.data.products;
  }

  if (Array.isArray(data?.data?.categories)) {
    return data.data.categories;
  }

  return [];
}

async function fetchFromApi(endpoint) {
  let lastError;

  for (const baseUrl of API_URLS) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 10000);

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        signal: controller.signal,
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${endpoint}`
        );
      }

      const data = await response.json();

      clearTimeout(timeout);
      return data;
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError ?? new Error("API data load failed");
}

function getProductCategoryValues(product) {
  const values = [];

  const fields = [
    product?.category,
    product?.categorySlug,
    product?.category_slug,
    product?.categoryName,
    product?.category_name,
    product?.categoryBn,
    product?.category_bn,
    product?.categoryId,
    product?.category_id,
  ];

  for (const field of fields) {
    if (typeof field === "string" || typeof field === "number") {
      values.push(String(field));
    } else if (field && typeof field === "object") {
      values.push(
        field.slug,
        field.id,
        field.key,
        field.name,
        field.nameBn,
        field.name_bn,
        field.title
      );
    }
  }

  if (Array.isArray(product?.categories)) {
    for (const category of product.categories) {
      if (typeof category === "string") {
        values.push(category);
      } else if (category && typeof category === "object") {
        values.push(
          category.slug,
          category.id,
          category.key,
          category.name,
          category.nameBn,
          category.name_bn
        );
      }
    }
  }

  return values
    .filter((value) => value !== undefined && value !== null)
    .map(normalize);
}

function getPrice(product) {
  const value =
    product?.today ??
    product?.currentPrice ??
    product?.price ??
    product?.current_price ??
    0;

  const banglaDigits = "০১২৩৪৫৬৭৮৯";

  const normalized = String(value)
    .replace(/[০-৯]/g, (digit) =>
      String(banglaDigits.indexOf(digit))
    )
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "");

  return Number(normalized) || 0;
}

export default function CategoryPage() {
  const params = useParams();
  const slug = decodeURIComponent(String(params?.slug ?? ""));

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("default");

  const loadData = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      setError("ক্যাটাগরি পাওয়া যায়নি।");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // API theke actual category list ebong product list load kori.
      const [categoryResponse, productResponse] = await Promise.all([
        fetchFromApi("/categories"),
        fetchFromApi("/products"),
      ]);

      const categoryList = getArray(categoryResponse);
      const productList = getArray(productResponse);

      setCategories(categoryList);
      setProducts(productList);

      if (categoryList.length === 0) {
        console.warn("Categories API returned no categories.");
      }

      if (productList.length === 0) {
        console.warn("Products API returned no products.");
      }
    } catch (err) {
      console.error("Category page API error:", err);

      setError(
        "API থেকে তথ্য লোড করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করো।"
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedCategory = useMemo(() => {
    return categories.find(
      (category) => normalize(getSlug(category)) === normalize(slug)
    );
  }, [categories, slug]);

  const categoryName = selectedCategory
    ? getCategoryName(selectedCategory)
    : slug;

  const categoryIcon =
    selectedCategory?.emoji ??
    selectedCategory?.icon ??
    CATEGORY_ICONS[normalize(slug)] ??
    "🛒";

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return [];

    const selectedSlug = normalize(getSlug(selectedCategory));
    const selectedName = normalize(getCategoryName(selectedCategory));

    return products.filter((product) => {
      const productCategories = getProductCategoryValues(product);

      return productCategories.some((value) => {
        return value === selectedSlug || value === selectedName;
      });
    });
  }, [products, selectedCategory]);

  const sortedProducts = useMemo(() => {
    const result = [...filteredProducts];

    if (sort === "low") {
      result.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sort === "high") {
      result.sort((a, b) => getPrice(b) - getPrice(a));
    }

    return result;
  }, [filteredProducts, sort]);

  return (
    <main className="min-h-[70vh] bg-[#f0f5f0]">
      <div className="mx-auto max-w-[710px] px-3 pb-10 pt-4 sm:px-0 sm:pt-6">
        {/* Category heading */}
        <section className="flex items-center gap-4 rounded-2xl border border-[#e2ebe2] bg-white/80 p-4 sm:p-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#edf5ed] text-3xl">
            {categoryIcon}
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-[#263129] sm:text-3xl">
              {categoryName || "ক্যাটাগরি"}
            </h1>

            <p className="mt-1 text-sm text-gray-500 sm:text-base">
              এই ক্যাটাগরির পণ্যের আজকের বাজারদর।
            </p>
          </div>
        </section>

        {/* Product list heading and sort */}
        <section className="mt-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[#263129]">
              পণ্যের তালিকা
              {!loading && !error && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({sortedProducts.length})
                </span>
              )}
            </h2>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <span>সাজানো:</span>

              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="h-11 min-w-[145px] rounded-xl border border-[#dce7dc] bg-white px-3 text-sm text-gray-700 outline-none focus:border-green-600"
              >
                <option value="default">ডিফল্ট</option>
                <option value="low">দাম: কম থেকে বেশি</option>
                <option value="high">দাম: বেশি থেকে কম</option>
              </select>
            </label>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-2xl border border-[#e4ebe4] bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gray-100" />

                    <div className="flex-1">
                      <div className="h-4 w-3/4 rounded bg-gray-100" />
                      <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
                    </div>
                  </div>

                  <div className="mt-5 h-4 w-1/3 rounded bg-gray-100" />
                  <div className="mt-3 h-4 w-1/2 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          )}

          {/* API error */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-100 bg-white p-8 text-center">
              <p className="text-sm text-red-600">{error}</p>

              <button
                type="button"
                onClick={loadData}
                className="mt-4 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
              >
                আবার চেষ্টা করো
              </button>
            </div>
          )}

          {/* Category not found */}
          {!loading &&
            !error &&
            !selectedCategory && (
              <div className="rounded-2xl border border-[#e4ebe4] bg-white p-8 text-center">
                <div className="text-4xl">🔎</div>

                <h3 className="mt-3 font-bold text-gray-800">
                  ক্যাটাগরি পাওয়া যায়নি
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  API-এর ক্যাটাগরি তালিকায় এই ক্যাটাগরিটি নেই।
                </p>

                <Link
                  href="/"
                  className="mt-5 inline-flex rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
                >
                  হোম পেজে ফিরে যাও
                </Link>
              </div>
            )}

          {/* No matching products */}
          {!loading &&
            !error &&
            selectedCategory &&
            sortedProducts.length === 0 && (
              <div className="rounded-2xl border border-[#e4ebe4] bg-white p-8 text-center">
                <div className="text-4xl">{categoryIcon}</div>

                <h3 className="mt-3 font-bold text-gray-800">
                  এই ক্যাটাগরিতে পণ্য পাওয়া যায়নি
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  API-এর পণ্যের তথ্যের সঙ্গে এই ক্যাটাগরির মিল পাওয়া যায়নি।
                </p>

                <Link
                  href="/"
                  className="mt-5 inline-flex rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
                >
                  সব পণ্য দেখো
                </Link>
              </div>
            )}

          {/* Actual API products */}
          {!loading &&
            !error &&
            sortedProducts.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sortedProducts.map((product, index) => (
                  <ProductCard
                    key={
                      product.id ??
                      product.slug ??
                      product._id ??
                      index
                    }
                    product={product}
                  />
                ))}
              </div>
            )}
        </section>
      </div>
    </main>
  );
}