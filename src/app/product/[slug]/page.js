import { Suspense } from "react";
import ProductDetailsClient from "./ProductDetailsClient";

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
      <ProductDetailsClient />
    </Suspense>
  );
}