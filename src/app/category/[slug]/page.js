"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

const API_URLS = [
  "https://api.api-store.workers.dev/api/bazardor",
  "https://api.abcz.workers.dev/api/bazardor",
];



const CATEGORY_CONFIG = {
  chal: {
    name: "চাল",
    icon: "🍚",
    aliases: ["chal", "rice", "চাল"],
  },

  dal: {
    name: "ডাল",
    icon: "🫘",
    aliases: ["dal", "lentil", "lentils", "ডাল"],
  },

  tel: {
    name: "তেল",
    icon: "🫙",
    aliases: ["tel", "oil", "তেল"],
  },

  shobji: {
    name: "সবজি",
    icon: "🥬",
    aliases: [
      "shobji",
      "sobji",
      "vegetable",
      "vegetables",
      "সবজি",
      "শাকসবজি",
    ],
  },

  mach: {
    name: "মাছ",
    icon: "🐟",
    aliases: ["mach", "fish", "মাছ"],
  },

  mangsho: {
    name: "মাংস",
    icon: "🥩",
    aliases: [
      "mangsho",
      "mangso",
      "meat",
      "chicken",
      "beef",
      "মাংস",
    ],
  },

  dimdudh: {
    name: "ডিম-দুধ",
    icon: "🥚",
    aliases: [
      "dimdudh",
      "dim-dudh",
      "dim_dudh",
      "dim",
      "dudh",
      "egg",
      "eggs",
      "milk",
      "eggmilk",
      "eggs-milk",
      "ডিম",
      "দুধ",
      "ডিম-দুধ",
      "ডিম ও দুধ",
    ],
  },

  moshla: {
    name: "মসলা",
    icon: "🌶️",
    aliases: ["moshla", "mosola", "spice", "spices", "মসলা"],
  },
};



function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function getRouteSlug(value) {
  const slug = normalize(value);

  if (
    [
      "sobji",
      "vegetable",
      "vegetables",
      "সবজি",
      "শাকসবজি",
    ].includes(slug)
  ) {
    return "shobji";
  }

  if (
    [
      "dim",
      "dudh",
      "egg",
      "eggs",
      "milk",
      "eggmilk",
      "eggsandmilk",
      "ডিম",
      "দুধ",
      "ডিমওদুধ",
      "ডিমদুধ",
    ].includes(slug)
  ) {
    return "dimdudh";
  }

  if (slug === "mangso" || slug === "meat") {
    return "mangsho";
  }

  if (slug === "mosola" || slug === "spice" || slug === "spices") {
    return "moshla";
  }

  if (slug === "fish") return "mach";
  if (slug === "rice") return "chal";
  if (slug === "lentil" || slug === "lentils") return "dal";
  if (slug === "oil") return "tel";

  return slug;
}

function getAliases(slug) {
  const normalizedSlug = getRouteSlug(slug);
  const config = CATEGORY_CONFIG[normalizedSlug];

  return [
    normalizedSlug,
    ...(config?.aliases ?? []),
  ].map(normalize);
}



function getArray(data, type) {
  if (Array.isArray(data)) {
    return data;
  }

  if (type === "products") {
    const candidates = [
      data?.products,
      data?.data?.products,
      data?.data,
      data?.items,
      data?.results,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate;
      }
    }
  }

  if (type === "categories") {
    const candidates = [
      data?.categories,
      data?.data?.categories,
      data?.data,
      data?.items,
      data?.results,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate;
      }
    }
  }

  return [];
}

async function fetchFromApi(endpoint) {
  let lastError;

  for (const baseUrl of API_URLS) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 12000);

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

      return await response.json();
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError ?? new Error("API data load failed");
}



function getCategoryIdentifiers(category) {
  if (
    typeof category === "string" ||
    typeof category === "number"
  ) {
    return [normalize(category)];
  }

  if (!category || typeof category !== "object") {
    return [];
  }

  const values = [
    category.slug,
    category.categorySlug,
    category.category_slug,
    category.key,
    category.id,
    category.name,
    category.nameBn,
    category.name_bn,
    category.title,
    category.label,
    category.category,
    category.categoryName,
    category.category_name,
  ];

  return values
    .filter((value) => value !== undefined && value !== null)
    .map(normalize);
}

function getCategoryName(category) {
  if (typeof category === "string") {
    return category;
  }

  return (
    category?.nameBn ??
    category?.name_bn ??
    category?.name ??
    category?.title ??
    category?.label ??
    category?.categoryNameBn ??
    category?.category_name_bn ??
    ""
  );
}

function categoryMatchesRoute(category, routeSlug) {
  const routeAliases = getAliases(routeSlug);
  const identifiers = getCategoryIdentifiers(category);

  return identifiers.some((identifier) =>
    routeAliases.includes(identifier)
  );
}



function getProductCategoryValues(product) {
  const values = [];

  const fields = [
    product?.category,
    product?.categorySlug,
    product?.category_slug,
    product?.categoryName,
    product?.category_name,
    product?.categoryNameBn,
    product?.category_name_bn,
    product?.categoryBn,
    product?.category_bn,
    product?.categoryId,
    product?.category_id,
    product?.categoryKey,
    product?.category_key,
  ];

  for (const field of fields) {
    if (
      typeof field === "string" ||
      typeof field === "number"
    ) {
      values.push(String(field));
    } else if (field && typeof field === "object") {
      values.push(
        field.slug,
        field.categorySlug,
        field.category_slug,
        field.id,
        field.key,
        field.name,
        field.nameBn,
        field.name_bn,
        field.title,
        field.label
      );
    }
  }

  if (Array.isArray(product?.categories)) {
    for (const category of product.categories) {
      values.push(...getCategoryIdentifiers(category));
    }
  }

  return values
    .filter((value) => value !== undefined && value !== null)
    .map(normalize);
}

function productMatchesCategory(product, selectedCategory, routeSlug) {
  const routeAliases = getAliases(routeSlug);

  const selectedIdentifiers =
    getCategoryIdentifiers(selectedCategory);

  const acceptedIdentifiers = new Set([
    ...routeAliases,
    ...selectedIdentifiers,
  ]);

  const productCategories = getProductCategoryValues(product);

  return productCategories.some((value) =>
    acceptedIdentifiers.has(value)
  );
}



function getPrice(product) {
  const value =
    product?.today ??
    product?.currentPrice ??
    product?.current_price ??
    product?.price ??
    product?.priceToday ??
    product?.price_today ??
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



function CategoryContent() {
  const params = useParams();

  const rawSlug = decodeURIComponent(
    String(params?.slug ?? "")
  );

  const slug = getRouteSlug(rawSlug);

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
      const [categoryResponse, productResponse] =
        await Promise.all([
          fetchFromApi("/categories"),
          fetchFromApi("/products"),
        ]);

      const categoryList = getArray(
        categoryResponse,
        "categories"
      );

      const productList = getArray(
        productResponse,
        "products"
      );

      setCategories(categoryList);
      setProducts(productList);

      if (categoryList.length === 0) {
        console.warn(
          "Categories API returned no categories:",
          categoryResponse
        );
      }

      if (productList.length === 0) {
        console.warn(
          "Products API returned no products:",
          productResponse
        );
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
    return categories.find((category) =>
      categoryMatchesRoute(category, slug)
    ) ?? null;
  }, [categories, slug]);

  const categoryConfig = CATEGORY_CONFIG[slug];

  const categoryName =
    getCategoryName(selectedCategory) ||
    categoryConfig?.name ||
    rawSlug;

  const categoryIcon =
    selectedCategory?.emoji ??
    selectedCategory?.icon ??
    categoryConfig?.icon ??
    "🛒";

 

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }

    return products.filter((product) =>
      productMatchesCategory(
        product,
        selectedCategory,
        slug
      )
    );
  }, [products, selectedCategory, slug]);

  /*
  |--------------------------------------------------------------------------
  | Sort products
  |--------------------------------------------------------------------------
  */

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

        {/* Product list heading and sorting */}

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
                onChange={(event) =>
                  setSort(event.target.value)
                }
                className="h-11 min-w-[145px] rounded-xl border border-[#dce7dc] bg-white px-3 text-sm text-gray-700 outline-none focus:border-green-600"
              >
                <option value="default">ডিফল্ট</option>

                <option value="low">
                  দাম: কম থেকে বেশি
                </option>

                <option value="high">
                  দাম: বেশি থেকে কম
                </option>
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
              <p className="text-sm text-red-600">
                {error}
              </p>

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

          {!loading && !error && !selectedCategory && (
            <div className="rounded-2xl border border-[#e4ebe4] bg-white p-8 text-center">
              <div className="text-4xl">🔎</div>

              <h3 className="mt-3 font-bold text-gray-800">
                ক্যাটাগরি পাওয়া যায়নি
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                API-এর ক্যাটাগরি তালিকায় এই ক্যাটাগরিটি পাওয়া যায়নি।
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
                <div className="text-4xl">
                  {categoryIcon}
                </div>

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



export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[70vh] bg-[#f0f5f0]">
          <div className="mx-auto max-w-[710px] px-3 pb-10 pt-4 sm:px-0 sm:pt-6">
            <section className="animate-pulse rounded-2xl border border-[#e2ebe2] bg-white/80 p-4 sm:p-6">
              <div className="h-14 rounded-xl bg-[#edf5ed]" />

              <div className="mt-5 h-4 w-40 rounded bg-gray-100" />

              <div className="mt-3 h-3 w-64 max-w-full rounded bg-gray-100" />
            </section>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-36 animate-pulse rounded-2xl border border-[#e4ebe4] bg-white p-4"
                >
                  <div className="h-12 w-12 rounded-xl bg-gray-100" />

                  <div className="mt-4 h-4 w-3/4 rounded bg-gray-100" />

                  <div className="mt-3 h-4 w-1/2 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          </div>
        </main>
      }
    >
      <CategoryContent />
    </Suspense>
  );
}