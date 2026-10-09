export function getBanglaDate() {
  // Server ও initial client render-এ একই date দেখাবে
  return "শুক্রবার, ৯ অক্টোবর, ২০২৬";
}

export function toBengaliNumber(value) {
  const digits = "০১২৩৪৫৬৭৮৯";

  return String(value).replace(
    /\d/g,
    (digit) => digits[Number(digit)]
  );
}

export function formatPrice(price) {
  return Number(price || 0).toLocaleString("bn-BD");
}

export function getUnitBn(unit) {
  const units = {
    kg: "প্রতি কেজি",
    litre: "প্রতি লিটার",
    liter: "প্রতি লিটার",
    dozen: "প্রতি ডজন",
    piece: "প্রতি পিস",
  };

  return units[unit] || unit || "প্রতি একক";
}