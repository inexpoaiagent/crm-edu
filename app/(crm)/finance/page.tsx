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

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-2xl font-semibold">Finance module</h1>
      </section>
      <section className="card">
        <h2 className="text-lg font-semibold">Track payment</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={createPayment}>
          {Object.entries(form).map(([key, value]) => (
            <label key={key} className="text-sm text-muted">
              {key}
              <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" value={value} onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))} />
            </label>
          ))}
          <button className="btn-solid md:col-span-2" type="submit">
            Save payment
          </button>
        </form>
      </section>
      <section className="card">
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
              {payments.map((payment) => (
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
