"use client";

import { useEffect, useState } from "react";

interface Account {
  id: string;
  type: string;
  name: string;
  number: string;
  balance: number;
  currency: string;
}

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:6001/api/accounts")
      .then((res) => res.json())
      .then((data) => {
        setAccounts(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div key={account.id} className="border p-4 rounded-lg">
            <h2 className="font-bold">{account.name}</h2>
            <p>{account.number}</p>
            <p className="text-lg font-semibold">{account.balance} {account.currency}</p>
          </div>
        ))}
      </div>
    </div>
  );
}