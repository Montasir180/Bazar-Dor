import Link from "next/link";
import { getBanglaDate } from "@/lib/utils";

function BasketIllustration() {
  return (
    <svg
      viewBox="0 0 220 180"
      className="h-[135px] w-[170px] sm:h-[165px] sm:w-[205px]"
      role="img"
      aria-label="বাজারের ঝুড়িতে বিভিন্ন পণ্য"
    >
      {/* Ground shadow */}
      <ellipse
        cx="110"
        cy="164"
        rx="82"
        ry="10"
        fill="#e5e7e3"
      />

      {/* Green vegetable */}
      <path
        d="M121 70 C111 51 116 34 132 23"
        fill="none"
        stroke="#168443"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M132 23 C144 26 148 34 147 42 C137 39 132 32 132 23"
        fill="#168443"
      />

      <ellipse cx="132" cy="69" rx="25" ry="32" fill="#20c46a" />

      {/* Tomato */}
      <path
        d="M78 74 C70 56 79 45 93 42"
        fill="none"
        stroke="#168443"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M93 42 C105 45 109 54 105 62"
        fill="none"
        stroke="#168443"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <circle cx="83" cy="82" r="24" fill="#f04452" />

      <ellipse
        cx="75"
        cy="74"
        rx="6"
        ry="10"
        fill="#ff8d92"
        transform="rotate(25 75 74)"
      />

      {/* Orange */}
      <circle cx="112" cy="94" r="17" fill="#ff7918" />

      {/* Purple onion */}
      <circle cx="63" cy="99" r="14" fill="#b94bf3" />

      {/* Yellow-orange vegetable */}
      <path
        d="M149 88 C147 74 157 66 169 69"
        fill="none"
        stroke="#168443"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <circle cx="158" cy="96" r="17" fill="#ffa500" />

      {/* Basket body */}
      <path
        d="M51 103 L169 103 L157 154 Q155 161 147 161 L72 161 Q64 161 62 153 Z"
        fill="#b9580b"
      />

      {/* Basket top */}
      <path
        d="M48 99 L172 99 L167 112 L53 112 Z"
        fill="#85420c"
      />

      {/* Basket texture */}
      <g
        stroke="#773707"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M72 114 L76 151" />
        <path d="M94 114 L96 156" />
        <path d="M116 114 L116 157" />
        <path d="M138 114 L134 153" />
        <path d="M158 114 L151 151" />
      </g>
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="bg-[#f0f5f0] px-3 py-4 sm:px-5 sm:py-4">
      <div className="mx-auto grid max-w-[710px] grid-cols-1 items-center gap-3 rounded-2xl border border-[#e0e9e0] bg-[#fbfdfb] px-4 py-4 sm:min-h-[180px] sm:grid-cols-[1fr_200px] sm:px-5 sm:py-3">
        {/* Left side */}
        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-[#e2f3e8] px-2 py-1 text-[9px] font-semibold text-green-700">
            {getBanglaDate()}
          </span>

          <h1 className="mt-2 text-[22px] font-extrabold leading-tight tracking-tight text-[#202923] sm:text-[23px]">
            আজকের বাজারের দাম এক নজরে
          </h1>

          <p className="mt-3 max-w-[390px] text-[10px] leading-[1.8] text-gray-500 sm:text-[11px]">
            চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলার দাম —
            বাজারভিত্তিক বিস্তারিত তথ্য, সহজে সর্বনিম্ন-সর্বোচ্চ এবং
            বাজারের সর্বশেষ এক জায়গায়।
          </p>

          <Link
            href="#সব-পণ্য"
            className="mt-4 inline-flex h-[28px] items-center justify-center rounded-md bg-green-700 px-4 text-[10px] font-semibold text-white shadow-sm transition hover:bg-green-800"
          >
            সব পণ্য দেখুন
          </Link>
        </div>

        {/* Right side: original inline SVG */}
        <div className="flex items-center justify-center sm:justify-end">
          <BasketIllustration />
        </div>
      </div>
    </section>
  );
}