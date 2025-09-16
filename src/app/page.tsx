"use client";

import { useState } from "react";

type ReferralForm = {
  userEmail: string;
  userName: string;
  referredName: string;
  courseName: string;
  currency: string;
  referralAmount: string;
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const [form, setForm] = useState<ReferralForm>({
    userEmail: "",
    userName: "",
    referredName: "",
    courseName: "",
    currency: "USD",
    referralAmount: "10",
  });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    const payload = {
      user: { email: form.userEmail, name: form.userName },
      lead: { user: { name: form.referredName }, course: { name: form.courseName } },
      currency: form.currency,
      referral_amount: Number(form.referralAmount),
    };

    try {
      const resp = await fetch("/api/sendReferral/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await resp.json();
      if (resp.ok) {
        setStatus("Email sent & referral saved.");
        setForm({
          userEmail: "",
          userName: "",
          referredName: "",
          courseName: "",
          currency: "USD",
          referralAmount: "10",
        });
      } else {
        setStatus(`Error: ${json?.error ?? "Unknown"}`);
      }
    } catch (err) {
      if (err instanceof Error) {
        setStatus(`Request failed: ${err.message}`);
      } else {
        setStatus("Request failed: Unknown error");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Medbuddy — Referral Follow-up</h1>

      {/* Referral Form */}
      <form onSubmit={submit} className="flex flex-col gap-3">
        <label className="flex flex-col">
          Your Email
          <input
            required
            type="email"
            value={form.userEmail}
            onChange={(e) => setForm((s) => ({ ...s, userEmail: e.target.value }))}
            className="border p-2 rounded"
          />
        </label>

        <label className="flex flex-col">
          Your Name
          <input
            value={form.userName}
            onChange={(e) => setForm((s) => ({ ...s, userName: e.target.value }))}
            className="border p-2 rounded"
          />
        </label>

        <label className="flex flex-col">
          Referred User Name
          <input
            value={form.referredName}
            onChange={(e) => setForm((s) => ({ ...s, referredName: e.target.value }))}
            className="border p-2 rounded"
          />
        </label>

        <label className="flex flex-col">
          Course Name
          <input
            value={form.courseName}
            onChange={(e) => setForm((s) => ({ ...s, courseName: e.target.value }))}
            className="border p-2 rounded"
          />
        </label>

        <label className="flex flex-col">
          Currency
          <input
            value={form.currency}
            onChange={(e) => setForm((s) => ({ ...s, currency: e.target.value }))}
            className="border p-2 rounded"
          />
        </label>

        <label className="flex flex-col">
          Referral Amount
          <input
            type="number"
            value={form.referralAmount}
            onChange={(e) => setForm((s) => ({ ...s, referralAmount: e.target.value }))}
            className="border p-2 rounded"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {loading ? "Sending…" : "Send Referral Email"}
        </button>
      </form>

      {/* Status */}
      {status && <div className="mt-2">{status}</div>}
    </main>
  );
}