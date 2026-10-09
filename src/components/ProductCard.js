import Link from "next/link";

const unitMap = {
  kg: "প্রতি কেজি",
  litre: "প্রতি লিটার",
  liter: "প্রতি লিটার",
  dozen: "প্রতি ডজন",
  piece: "প্রতি পিস",
};

function getPrice(product) {
  return Number(
    product.today ??
      product.currentPrice ??
      product.price ??
      0
  );
}

function getPriceText(price) {
  return Number(price).toLocaleString("bn-BD");
}

function getUnit(unit) {
  return unitMap[unit] || unit || "প্রতি একক";
}

function getProductId(product) {
  return product.slug ?? product.id ?? product._id;
}

export default function ProductCard({ product }) {
  const name =
    product.nameBn ||
    product.name_bn ||
    product.name ||
    "পণ্যের নাম";

  const price = getPrice(product);

  const direction = product.change?.dir || "flat";

  const percentage = Math.abs(
    Number(product.change?.pct || 0)
  );

  const isUp = direction === "up";
  const isDown = direction === "down";

  const productId = getProductId(product);

  const badgeClass = isUp
    ? "bg-red-50 text-red-600"
    : isDown
    ? "bg-green-50 text-green-700"
    : "bg-gray-100 text-gray-500";

  const badgeIcon = isUp ? "▲" : isDown ? "▼" : "—";

  const cardContent = (
    <article className="h-full rounded-xl border border-[#e4ebe4] bg-[#fbfdfb] p-2.5 transition-colors duration-200 hover:border-green-200 sm:p-3">
      {/* Product name and emoji */}
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f0f5f0] text-xl">
          {product.image || product.emoji || "🛒"}
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-[11px] font-bold leading-4 text-[#263129] sm:text-xs">
            {name}
          </h3>

          <p className="mt-0.5 truncate text-[9px] text-gray-500">
            {getUnit(product.unit)}
          </p>
        </div>
      </div>

      {/* Price and change */}
      <div className="mt-2">
        <p className="text-[9px] leading-4 text-gray-500">
          আজকের দাম
        </p>

        <div className="flex items-center justify-between gap-1">
          <p className="text-xs font-bold text-[#263129]">
            {getPriceText(price)} টাকা
          </p>

          <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${badgeClass}`}
          >
            {badgeIcon}{" "}
            {percentage.toLocaleString("bn-BD", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
            %
          </span>
        </div>
      </div>
    </article>
  );

  if (productId == null) {
    return cardContent;
  }

  return (
    <Link
      href={`/product/${productId}`}
      className="block min-w-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
      aria-label={`${name} বিস্তারিত দেখুন`}
    >
      {cardContent}
    </Link>
  );
}