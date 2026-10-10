"use client";

import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import { formatPrice, toBengaliNumber } from "@/lib/utils";

const API_URL = "https://openapi.programming-hero.com/api/bazardor";

const unitMap = {
  kg: "কেজি",
  litre: "লিটার",
  liter: "লিটার",
  dozen: "ডজন",
  piece: "পিস",
};

export default function PriceTicker() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        const productList = Array.isArray(data)
          ? data
          : data.products || data.data || [];

        if (!cancelled) {
          setProducts(productList);
        }
      } catch (error) {
        console.error("Price ticker error:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="border-t border-green-100 bg-green-50 px-4 py-2">
        <p className="text-center text-xs text-gray-500">
          বাজারদরের তথ্য লোড হচ্ছে...
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="border-t border-green-100 bg-green-50 px-4 py-2">
        <p className="text-center text-xs text-gray-500">
          এই মুহূর্তে বাজারদরের তথ্য পাওয়া যাচ্ছে না।
        </p>
      </div>
    );
  }

 return (
  <div className="h-[28px] overflow-hidden border-t border-green-100 bg-green-50">
    <Marquee
      speed={33}
      direction="left"
      pauseOnHover={false}
      autoFill={true}
      gradient={false}
      className="h-full"
    >
      {products.map((product, index) => {
        const direction = product.change?.dir || "flat";
        const percentage = Math.abs(
          Number(product.change?.pct || 0)
        );

        const unit =
          unitMap[product.unit] ||
          product.unit ||
          "একক";

        return (
          <div
            key={`${product.id ?? product.slug ?? index}`}
            className="mx-[2px] flex h-[28px] shrink-0 items-center gap-1 text-[10px] sm:text-[11px]"
          >
            <span className="text-xs">
              {product.image || "🛒"}
            </span>

            <span className="font-medium text-gray-700">
              {product.nameBn || product.name || "পণ্য"}
            </span>

            <span className="text-gray-500">
              {formatPrice(product.today)} টাকা/{unit}
            </span>

            <span
              className={`font-semibold ${
                direction === "up"
                  ? "text-red-600"
                  : direction === "down"
                  ? "text-green-600"
                  : "text-gray-400"
              }`}
            >
              {direction === "up"
                ? "▲"
                : direction === "down"
                ? "▼"
                : "—"}{" "}
              {toBengaliNumber(percentage.toFixed(1))}%
            </span>

            <span className="mx-1 text-green-300">•</span>
          </div>
        );
      })}
    </Marquee>
  </div>
  );
}
