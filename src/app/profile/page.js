"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [name, setName] = useState("");
  const [updating, setUpdating] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const inputName = name || user?.name || "";

  useEffect(() => {
    if (!isPending && !user) {
      toast.error("প্রোফাইল দেখতে প্রথমে সাইন ইন করুন।");
      router.replace("/signin");
    }
  }, [isPending, user, router]);

  if (isPending || !user) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-[#f0f5f0] px-4">
        <div className="w-full max-w-xl animate-pulse rounded-xl border border-green-100 bg-white p-6">
          <div className="h-16 rounded-lg bg-gray-100" />
          <div className="mt-5 h-32 rounded-lg bg-gray-100" />
        </div>
      </main>
    );
  }

  const handleUpdate = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("আপনার নাম লিখুন।");
      return;
    }

    if (trimmedName === user.name) {
      toast("আপনার নামে কোনো পরিবর্তন হয়নি।");
      return;
    }

    try {
      setUpdating(true);

      const result = await authClient.updateUser({
        name: trimmedName,
      });

      if (result?.error) {
        toast.error(
          result.error.message || "নাম আপডেট করা যায়নি।"
        );
        return;
      }

      toast.success("আপনার নাম সফলভাবে আপডেট হয়েছে।");

      await authClient.getSession();
      router.refresh();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("নাম আপডেট করতে সমস্যা হয়েছে।");
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoggingOut(true);

      const result = await authClient.signOut();

      if (result?.error) {
        toast.error("সাইন আউট করা যায়নি। আবার চেষ্টা করুন।");
        return;
      }

      toast.success("সফলভাবে সাইন আউট হয়েছেন।");

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("সাইন আউট করতে সমস্যা হয়েছে।");
    } finally {
      setLoggingOut(false);
    }
  };

  const initial = (user.name || user.email || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <main className="min-h-[70vh] bg-[#f0f5f0] px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-xl">
        {/* Page Heading */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            আমার প্রোফাইল
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            আপনার অ্যাকাউন্টের তথ্য এখানে দেখুন।
          </p>
        </div>

        {/* User Information Card */}
        <section className="rounded-xl border border-[#e1e9e1] bg-[#fbfdfb] p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
            {/* Avatar */}
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "Profile"}
                className="h-14 w-14 shrink-0 rounded-xl border border-gray-100 object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-green-100 text-xl font-bold text-green-800">
                {initial}
              </div>
            )}

            {/* Name and Email */}
            <div className="min-w-0 flex-1">
              <h2 className="break-words text-sm font-bold text-gray-900 sm:text-base">
                {user.name || "নাম দেওয়া নেই"}
              </h2>

              <p className="mt-1 break-all text-xs text-gray-500 sm:text-sm">
                {user.email}
              </p>
            </div>

            {/* Sign Out */}
            <button
              type="button"
              onClick={handleSignOut}
              disabled={loggingOut}
              className="shrink-0 rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              {loggingOut ? "অপেক্ষা করুন..." : "↪ সাইন আউট"}
            </button>
          </div>
        </section>

        {/* Update Name Card */}
        <section className="mt-4 rounded-xl border border-[#e1e9e1] bg-[#fbfdfb] p-5 sm:p-6">
          <h2 className="text-base font-bold text-gray-900">
            তথ্য
          </h2>

          <form onSubmit={handleUpdate} className="mt-6">
            <label
              htmlFor="profile-name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              নাম
            </label>

            <input
              id="profile-name"
              type="text"
              autoComplete="name"
              placeholder="আপনার নাম লিখুন"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              className="w-full rounded-md border border-[#dce5dc] bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />

            <button
              type="submit"
              disabled={updating}
              className="mt-4 w-full rounded-md bg-[#07883f] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#066d33] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updating ? "আপডেট হচ্ছে..." : "আপডেট"}
            </button>
          </form>
        </section>

        {/* Home Link */}
        <Link
          href="/"
          className="mt-5 block text-center text-sm text-gray-500 transition hover:text-green-700"
        >
          ← হোম পেজে ফিরে যান
        </Link>
      </div>
    </main>
  );
}