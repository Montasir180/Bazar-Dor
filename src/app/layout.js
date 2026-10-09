import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "বাজার দর | BazarDor",
  description:
    "বাংলাদেশের নিত্যপ্রয়োজনীয় পণ্যের বাজারদর এক নজরে দেখুন।",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" data-theme="light">
      <body className="min-h-screen">
        <Toaster position="top-center" />
        <Navbar />

        <main className="min-h-[70vh]">{children}</main>

        <footer className="border-t border-green-100 bg-white py-5">
          <div className="container-main flex flex-col justify-between gap-3 text-sm text-gray-500 sm:flex-row sm:items-center">
            <p>
              <span className="font-semibold text-green-800">
                বাজার দর
              </span>{" "}
              — প্রয়োজনীয় পণ্যের দাম এক নজরে।
            </p>

            <p className="text-xs">
              সকল দাম সম্ভাব্য; বাজার অবস্থার ওপর নির্ভর করে পরিবর্তিত হয়।
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}