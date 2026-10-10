"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const API_URLS = [
  "https://api.api-store.workers.dev/api/bazardor",
  "https://api.abcz.workers.dev/api/bazardor",
];

function getProducts(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.products)) return data.data.products;

  return [];
}

function getPrice(value) {
  const banglaDigits = "০১২৩৪৫৬৭৮৯";

  const normalized = String(value ?? "0")
    .replace(/[০-৯]/g, (digit) =>
      String(banglaDigits.indexOf(digit))
    )
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "");

  return Number(normalized) || 0;
}

function formatPrice(value) {
  return Number(value || 0).toLocaleString("bn-BD");
}

function getUnit(unit) {
  const units = {
    kg: "প্রতি কেজি",
    litre: "প্রতি লিটার",
    liter: "প্রতি লিটার",
    dozen: "প্রতি ডজন",
    piece: "প্রতি পিস",
  };

  return units[unit] || unit || "প্রতি একক";
}

function getProductName(product) {
  return (
    product?.nameBn ||
    product?.name_bn ||
    product?.name ||
    "পণ্যের নাম"
  );
}

function getProductId(product) {
  return String(product?.slug ?? product?.id ?? product?._id ?? "");
}

function getCategoryName(product) {
  return (
    product?.categoryNameBn ||
    product?.category_name_bn ||
    product?.category?.nameBn ||
    product?.category?.name ||
    product?.category ||
    "অন্যান্য"
  );
}

function getMarkets(product) {
  if (Array.isArray(product?.markets)) return product.markets;
  if (Array.isArray(product?.marketPrices)) return product.marketPrices;
  if (Array.isArray(product?.market_prices)) return product.market_prices;

  return [];
}

function getMarketName(market) {
  return (
    market?.marketNameBn ||
    market?.market_name_bn ||
    market?.marketName ||
    market?.market_name ||
    market?.nameBn ||
    market?.name ||
    market?.market ||
    "বাজার"
  );
}

function getMarketPrices(market) {
  const min = getPrice(
    market?.min ??
      market?.minPrice ??
      market?.min_price ??
      market?.price
  );

  const max = getPrice(
    market?.max ??
      market?.maxPrice ??
      market?.max_price ??
      market?.price
  );

  return { min, max };
}

function ProductDetailsContent() {
  const params = useParams();

  const slug = decodeURIComponent(
    String(
      Array.isArray(params?.slug)
        ? params.slug[0] ?? ""
        : params?.slug ?? ""
    )
  );

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProduct = useCallback(async () => {
    if (!slug) {
      setError("পণ্যের পরিচয় পাওয়া যায়নি।");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setProduct(null);

    let foundProduct = null;
    let lastError = null;

    for (const baseUrl of API_URLS) {
      try {
        // First, try the single-product endpoint.
        const singleResponse = await fetch(
          `${baseUrl}/products/${encodeURIComponent(slug)}`,
          { cache: "no-store" }
        );

        if (singleResponse.ok) {
          const singleData = await singleResponse.json();

          const candidate =
            singleData?.product ??
            singleData?.data?.product ??
            singleData?.data ??
            singleData;

          if (
            candidate &&
            !Array.isArray(candidate) &&
            typeof candidate === "object" &&
            (
              candidate.id != null ||
              candidate.slug != null ||
              candidate._id != null ||
              candidate.name != null ||
              candidate.nameBn != null ||
              candidate.name_bn != null
            )
          ) {
            foundProduct = candidate;
          }
        }

        // If not found, search the complete product list.
        if (!foundProduct) {
          const response = await fetch(`${baseUrl}/products`, {
            cache: "no-store",
          });

          if (!response.ok) {
            throw new Error(`Products API error: ${response.status}`);
          }

          const data = await response.json();
          const products = getProducts(data);

          foundProduct =
            products.find(
              (item) => getProductId(item) === slug
            ) || null;
        }

        if (foundProduct) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      console.error("Product details API error:", lastError);

      setError(
        lastError
          ? "পণ্যের তথ্য লোড করা যায়নি। আবার চেষ্টা করো।"
          : "এই পণ্যটি API-তে পাওয়া যায়নি।"
      );
    }

    setLoading(false);
  }, [slug]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!slug) {
        setError("পণ্যের পরিচয় পাওয়া যায়নি।");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setProduct(null);

      let foundProduct = null;
      let lastError = null;

      for (const baseUrl of API_URLS) {
        try {
          const singleResponse = await fetch(
            `${baseUrl}/products/${encodeURIComponent(slug)}`,
            { cache: "no-store" }
          );

          if (singleResponse.ok) {
            const singleData = await singleResponse.json();

            const candidate =
              singleData?.product ??
              singleData?.data?.product ??
              singleData?.data ??
              singleData;

            if (
              candidate &&
              !Array.isArray(candidate) &&
              typeof candidate === "object" &&
              (
                candidate.id != null ||
                candidate.slug != null ||
                candidate._id != null ||
                candidate.name != null ||
                candidate.nameBn != null ||
                candidate.name_bn != null
              )
            ) {
              foundProduct = candidate;
            }
          }

          if (!foundProduct) {
            const response = await fetch(`${baseUrl}/products`, {
              cache: "no-store",
            });

            if (!response.ok) {
              throw new Error(`Products API error: ${response.status}`);
            }

            const data = await response.json();
            const products = getProducts(data);

            foundProduct =
              products.find(
                (item) => getProductId(item) === slug
              ) || null;
          }

          if (foundProduct) break;
        } catch (err) {
          lastError = err;
        }
      }

      if (cancelled) return;

      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        console.error("Product details API error:", lastError);

        setError(
          lastError
            ? "পণ্যের তথ্য লোড করা যায়নি। আবার চেষ্টা করো।"
            : "এই পণ্যটি API-তে পাওয়া যায়নি।"
        );
      }

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f0f5f0] px-3 py-8">
        <div className="mx-auto max-w-[900px] animate-pulse space-y-5">
          <div className="h-36 rounded-2xl bg-white" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 rounded-2xl bg-white"
              />
            ))}
          </div>

          <div className="h-56 rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-[#f0f5f0] px-4">
        <div className="w-full max-w-md rounded-2xl border border-[#e4ebe4] bg-white p-8 text-center">
          <div className="text-4xl">🔎</div>

          <h1 className="mt-3 text-xl font-bold text-gray-800">
            {error ? "তথ্য লোড করা যায়নি" : "পণ্য পাওয়া যায়নি"}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {error || "এই পণ্যটি API-তে পাওয়া যায়নি।"}
          </p>

          {error && (
            <button
              type="button"
              onClick={loadProduct}
              className="mt-4 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white"
            >
              আবার চেষ্টা করো
            </button>
          )}

          <div>
            <Link
              href="/"
              className="mt-4 inline-flex rounded-lg border border-green-700 px-5 py-2.5 text-sm font-semibold text-green-800 hover:bg-green-50"
            >
              হোম পেজে ফিরে যাও
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const name = getProductName(product);
  const unit = getUnit(product.unit);
  const markets = getMarkets(product);

  const marketPrices = markets.map((market) => ({
    market,
    ...getMarketPrices(market),
  }));

  const validPrices = marketPrices.filter(
    (item) => item.min > 0 && item.max > 0
  );

  const minimumPrice =
    validPrices.length > 0
      ? Math.min(...validPrices.map((item) => item.min))
      : null;

  const maximumPrice =
    validPrices.length > 0
      ? Math.max(...validPrices.map((item) => item.max))
      : null;

  const averagePrice =
    validPrices.length > 0
      ? Math.round(
          validPrices.reduce(
            (sum, item) => sum + (item.min + item.max) / 2,
            0
          ) / validPrices.length
        )
      : null;

  const direction = product.change?.dir || "flat";

  const percentage = Math.abs(
    Number(product.change?.pct || 0)
  );

  const changeClass =
    direction === "up"
      ? "bg-red-50 text-red-600"
      : direction === "down"
        ? "bg-green-50 text-green-700"
        : "bg-gray-100 text-gray-600";

  const changeIcon =
    direction === "up"
      ? "▲"
      : direction === "down"
        ? "▼"
        : "—";

  const categorySlug =
    typeof product.category === "object"
      ? product.category?.slug || product.category?.id || ""
      : product.category || "";

  return (
    <main className="min-h-screen bg-[#f0f5f0] px-3 py-4 sm:py-5">
      <div className="mx-auto max-w-[900px]">
        {/* Breadcrumb */}
        <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-green-700">
            হোম
          </Link>

          <span>/</span>

          {categorySlug ? (
            <Link
              href={`/category/${encodeURIComponent(categorySlug)}`}
              className="hover:text-green-700"
            >
              {getCategoryName(product)}
            </Link>
          ) : (
            <span>{getCategoryName(product)}</span>
          )}

          <span>/</span>

          <span className="font-semibold text-gray-800">
            {name}
          </span>
        </nav>

        {/* Product Summary */}
        <section className="rounded-xl border border-[#e3eae3] bg-[#fbfdfb] p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eff4ef] text-2xl sm:h-14 sm:w-14 sm:text-3xl">
                {product.image || product.emoji || "🛒"}
              </div>

              <div className="min-w-0">
                <h1 className="text-base font-bold text-[#263129] sm:text-xl">
                  {name}
                </h1>

                <p className="mt-1 text-[10px] text-gray-500 sm:text-xs">
                  {getCategoryName(product)} · {unit}
                </p>

                <p className="mt-1 text-[10px] text-gray-600 sm:text-xs">
                  সর্বশেষ বাজারদর ও পণ্যের বিস্তারিত তথ্য।
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-lg bg-[#f0f5f0] px-3 py-2 text-center">
              <p className="text-[9px] text-gray-500 sm:text-[10px]">
                আজকের বাজারদর
              </p>

              <p className="mt-1 text-lg font-bold text-[#263129] sm:text-2xl">
                {formatPrice(
                  product.today ??
                    product.currentPrice ??
                    product.price ??
                    0
                )}
              </p>

              <p className="text-[9px] text-gray-500">
                টাকা / একক
              </p>

              <span className={`text-[9px] font-semibold ${changeClass}`}>
                {changeIcon}{" "}
                {percentage.toLocaleString("bn-BD", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
                %
              </span>
            </div>
          </div>
        </section>

        {/* Price Summary */}
        <section className="mt-3 rounded-xl border border-[#e3eae3] bg-[#fbfdfb] p-3 sm:p-4">
          <h2 className="mb-3 text-sm font-bold text-[#263129]">
            দামের সারসংক্ষেপ
          </h2>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-[#e5ebe5] bg-white p-3">
              <p className="text-[10px] text-gray-500 sm:text-xs">
                সর্বনিম্ন দাম
              </p>

              <p className="mt-1 text-base font-bold text-green-700 sm:text-lg">
                {minimumPrice === null
                  ? "তথ্য নেই"
                  : `${formatPrice(minimumPrice)} টাকা`}
              </p>

              <p className="mt-1 text-[9px] text-gray-500">
                বাজারের সর্বনিম্ন মূল্য
              </p>
            </div>

            <div className="rounded-lg border border-[#e5ebe5] bg-white p-3">
              <p className="text-[10px] text-gray-500 sm:text-xs">
                সর্বোচ্চ দাম
              </p>

              <p className="mt-1 text-base font-bold text-red-600 sm:text-lg">
                {maximumPrice === null
                  ? "তথ্য নেই"
                  : `${formatPrice(maximumPrice)} টাকা`}
              </p>

              <p className="mt-1 text-[9px] text-gray-500">
                বাজারের সর্বোচ্চ মূল্য
              </p>
            </div>

            <div className="rounded-lg border border-[#e5ebe5] bg-white p-3">
              <p className="text-[10px] text-gray-500 sm:text-xs">
                গড় দাম
              </p>

              <p className="mt-1 text-base font-bold text-[#263129] sm:text-lg">
                {averagePrice === null
                  ? "তথ্য নেই"
                  : `${formatPrice(averagePrice)} টাকা`}
              </p>

              <p className="mt-1 text-[9px] text-gray-500">
                সব বাজারের গড় মূল্য
              </p>
            </div>
          </div>
        </section>

        {/* Market-wise Prices */}
        <section className="mt-3 rounded-xl border border-[#e3eae3] bg-[#fbfdfb] p-3 sm:p-4">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-[#263129]">
              বাজারভিত্তিক আজকের দাম
            </h2>

            <p className="mt-1 text-[10px] text-gray-500">
              বিভিন্ন বাজারের দামের তুলনা
            </p>
          </div>

          {marketPrices.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-[#e5ebe5]">
              <table className="w-full min-w-[500px] border-collapse text-left text-[10px] sm:text-xs">
                <thead className="bg-[#f0f5f0] text-gray-600">
                  <tr>
                    <th className="px-3 py-3 font-semibold">বাজার</th>
                    <th className="px-3 py-3 font-semibold">বিভাগ</th>
                    <th className="px-3 py-3 font-semibold">সর্বনিম্ন</th>
                    <th className="px-3 py-3 font-semibold">সর্বোচ্চ</th>
                    <th className="px-3 py-3 text-right font-semibold">
                      গড় দাম
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {marketPrices.map(({ market, min, max }, index) => {
                    const marketAverage =
                      min > 0 && max > 0
                        ? Math.round((min + max) / 2)
                        : null;

                    const division =
                      market.divisionBn ||
                      market.division_bn ||
                      market.divisionName ||
                      market.division_name ||
                      market.division ||
                      "—";

                    return (
                      <tr
                        key={
                          market.id ??
                          market._id ??
                          `${getMarketName(market)}-${index}`
                        }
                        className="border-t border-[#e5ebe5] bg-white transition hover:bg-[#f6faf6]"
                      >
                        <td className="px-3 py-3 font-medium text-[#263129]">
                          {getMarketName(market)}
                        </td>

                        <td className="px-3 py-3 text-gray-600">
                          {typeof division === "object"
                            ? division.nameBn || division.name || "—"
                            : division}
                        </td>

                        <td className="px-3 py-3 text-green-700">
                          {min > 0
                            ? `${formatPrice(min)} টাকা`
                            : "তথ্য নেই"}
                        </td>

                        <td className="px-3 py-3 text-red-600">
                          {max > 0
                            ? `${formatPrice(max)} টাকা`
                            : "তথ্য নেই"}
                        </td>

                        <td className="px-3 py-3 text-right font-medium text-[#263129]">
                          {marketAverage === null
                            ? "তথ্য নেই"
                            : `${formatPrice(marketAverage)} টাকা`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[#dce7dc] bg-white p-6 text-center">
              <p className="text-sm text-gray-500">
                API-তে এই পণ্যের বাজারভিত্তিক দামের তথ্য পাওয়া যায়নি।
              </p>
            </div>
          )}
        </section>

        <div className="mt-7">
          <Link
            href="/"
            className="inline-flex rounded-xl border border-green-700 px-5 py-3 text-sm font-semibold text-green-800 transition hover:bg-green-50"
          >
            ← সব পণ্যে ফিরে যাও
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ProductDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f0f5f0] px-3 py-8">
          <div className="mx-auto max-w-[900px] animate-pulse space-y-5">
            <div className="h-36 rounded-2xl bg-white" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-28 rounded-2xl bg-white"
                />
              ))}
            </div>

            <div className="h-56 rounded-2xl bg-white" />
          </div>
        </main>
      }
    >
      <ProductDetailsContent />
    </Suspense>
  );
}