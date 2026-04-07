"use client";

import { useEffect, useState } from "react";

type Payment = {
  id: string;
  studentId: string;
  type: string;
  amount: number;
  currency: string;
  commission?: number | null;
};

export default function FinancePage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [form, setForm] = useState({
    studentId: "",
    type: "Tuition",
    amount: "0",
    currency: "TRY",
    description: "",
  });
  const [currencyFilter, setCurrencyFilter] = useState("ALL");

  async function load() {
    const response = await fetch("/api/payments");
    const payload = (await response.json()) as { payments: Payment[] };
    setPayments(payload.payments ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createPayment(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: Number(form.amount),
      }),
    });
    if (response.ok) {
      setForm((prev) => ({ ...prev, amount: "0", description: "" }));
      await load();
    }
  }

  const visiblePayments = payments.filter((payment) => (currencyFilter === "ALL" ? true : payment.currency === currencyFilter));
  const totalsByCurrency = visiblePayments.reduce<Record<string, number>>((acc, payment) => {
    acc[payment.currency] = (acc[payment.currency] ?? 0) + payment.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-2xl font-semibold">Finance module</h1>
      </section>
      <section className="card">
        <h2 className="text-lg font-semibold">Track payment</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={createPayment}>
          <label className="text-sm text-muted">
            studentId
            <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.studentId} onChange={(event) => setForm((prev) => ({ ...prev, studentId: event.target.value }))} />
          </label>
          <label className="text-sm text-muted">
            type
            <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))} />
          </label>
          <label className="text-sm text-muted">
            amount
            <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.amount} onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))} />
          </label>
          <label className="text-sm text-muted">
            currency
            <select className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.currency} onChange={(event) => setForm((prev) => ({ ...prev, currency: event.target.value }))}>
              <option value="TRY">TRY</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </label>
          <label className="text-sm text-muted md:col-span-2">
            description
            <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
          </label>
          <button className="btn-solid md:col-span-2" type="submit">
            Save payment
          </button>
        </form>
      </section>
      <section className="card">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <button className={`btn-ghost ${currencyFilter === "ALL" ? "bg-secondary" : ""}`} onClick={() => setCurrencyFilter("ALL")} type="button">
              All currencies
            </button>
            {["TRY", "USD", "EUR", "GBP"].map((currency) => (
              <button key={currency} className={`btn-ghost ${currencyFilter === currency ? "bg-secondary" : ""}`} onClick={() => setCurrencyFilter(currency)} type="button">
                {currency}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(totalsByCurrency).map(([currency, total]) => (
              <span key={currency} className="badge">
                {currency}: {total.toFixed(2)}
              </span>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-card">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Commission</th>
              </tr>
            </thead>
            <tbody>
              {visiblePayments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.studentId}</td>
                  <td>{payment.type}</td>
                  <td>
                    {payment.amount} {payment.currency}
                  </td>
                  <td>{payment.commission ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
