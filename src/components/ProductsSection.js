"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";

const API_URL =
  "https://openapi.programming-hero.com/api/bazardor";

function getDirection(product) {
  return product.change?.dir || "flat";
}

function getPercentage(product) {
  return Math.abs(Number(product.change?.pct || 0));
}

function getPrice(product) {
  return Number(
    product.today ??
      product.currentPrice ??
      product.price ??
      0
  );
}

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl border border-[#e4ebe4] bg-white p-3"
        >
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gray-100" />

            <div className="flex-1">
              <div className="h-3 w-3/4 rounded bg-gray-100" />
              <div className="mt-2 h-2 w-1/2 rounded bg-gray-100" />
            </div>
          </div>

          <div className="mt-4 h-3 w-1/3 rounded bg-gray-100" />
          <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

function ProductGroup({
  title,
  direction,
  products,
  loading,
  error,
}) {
  const isUp = direction === "up";

  return (
    <section className="mb-5 sm:mb-6">
      {/* Section heading */}
      <div className="mb-2 flex items-center gap-1.5">
        <span
          className={`text-[10px] ${
            isUp ? "text-red-600" : "text-green-700"
          }`}
        >
          {isUp ? "▲" : "▼"}
        </span>

        <h2 className="text-xs font-bold text-[#263129] sm:text-sm">
          {title}
        </h2>
      </div>

      {loading ? (
        <ProductSkeleton />
      ) : error ? (
        <div className="rounded-xl border border-red-100 bg-white p-4 text-xs text-red-600">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-[#e4ebe4] bg-white p-4 text-xs text-gray-500">
          এই বিভাগে দেখানোর মতো পণ্য পাওয়া যায়নি।
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
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
  );
}

export default function ProductsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        let response = await fetch(`${API_URL}/products`);

        // Primary API ব্যর্থ হলে assignment-এর alternative API
        if (!response.ok) {
          response = await fetch(
            "https://api.abcz.workers.dev/api/bazardor/products"
          );
        }

        if (!response.ok) {
          throw new Error("Products API request failed");
        }

        const data = await response.json();

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.products)
          ? data.products
          : Array.isArray(data.data)
          ? data.data
          : [];

        if (!cancelled) {
          if (list.length === 0) {
            setError(
              "API থেকে পণ্যের তালিকা পাওয়া যায়নি।"
            );
          } else {
            setProducts(list);
          }
        }
      } catch (err) {
        console.error("BazarDor products error:", err);

        if (!cancelled) {
          setError(
            "পণ্যের তথ্য লোড করা যায়নি। API connection পরীক্ষা করো।"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const risers = products
    .filter((product) => getDirection(product) === "up")
    .sort(
      (a, b) => getPercentage(b) - getPercentage(a)
    )
    .slice(0, 6);

  const fallers = products
    .filter((product) => getDirection(product) === "down")
    .sort(
      (a, b) => getPercentage(b) - getPercentage(a)
    )
    .slice(0, 6);

  const allProducts = [...products].sort(
    (a, b) => getPrice(a) - getPrice(b)
  );

  return (
    <main className="bg-[#f0f5f0]">
      <div className="mx-auto max-w-[710px] px-3 pb-5 pt-2 sm:px-0 sm:pt-3">
        {/* Section A */}
        <ProductGroup
          title="আজ দাম বেড়েছে"
          direction="up"
          products={risers}
          loading={loading}
          error={error}
        />

        {/* Section B */}
        <ProductGroup
          title="আজ দাম কমেছে"
          direction="down"
          products={fallers}
          loading={loading}
          error={error}
        />

        {/* Section C */}
        <section id="সব-পণ্য" className="scroll-mt-28">
          <div className="mb-2">
            <h2 className="text-xs font-bold text-[#263129] sm:text-sm">
              সব পণ্য
            </h2>

            <p className="mt-1 text-[9px] text-gray-500">
              নিত্যপ্রয়োজনীয় পণ্যের আজকের বাজারদর
            </p>
          </div>

          {loading ? (
            <ProductSkeleton />
          ) : error ? (
            <div className="rounded-xl border border-red-100 bg-white p-4 text-xs text-red-600">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {allProducts.map((product, index) => (
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