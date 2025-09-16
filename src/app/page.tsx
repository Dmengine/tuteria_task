"use client";

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<any[]>([]);

  const [form, setForm] = useState({
    userEmail: "",
    userName: "",
    referredName: "",
    courseName: "",
    currency: "USD",
    referralAmount: "10",
  });

  async function submit(e: React.FormEvent) {
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
        }); // Reset form after success
      } else {
        setStatus(`Error: ${json?.error ?? "Unknown"}`);
      }
    } catch (err: any) {
      setStatus(`Request failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function fetchReferrals() {
    try {
      const resp = await fetch("/api/referrals");
      const json = await resp.json();
      if (resp.ok) {
        setReferrals(json.referrals);
      } else {
        setStatus(`Error: ${json?.error ?? "Unknown"}`);
      }
    } catch (err: any) {
      setStatus(`Fetch failed: ${err.message}`);
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
    </main>
  );
}