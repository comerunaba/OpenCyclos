"use client";

import { useEffect, useState } from "react";

type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
};

type Account = {
  id: string;
  type: string;
  name: string;
  number: string;
  balance: number;
  currency: string;
};

export default function AccountDetails({ params }: { params: { id: string } }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch account details
    fetch(`http://localhost:6001/api/accounts/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setAccount(data);
      });

    // Fetch transactions
    fetch(`http://localhost:6001/api/accounts/${params.id}/transactions`)
      .then(res => res.json())
      .then(data => {
        setTransactions(data);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!account) {
    return <div>Account not found</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{account.name}</h1>
      <p>{account.number}</p>
      <p className="text-lg font-semibold">{account.balance} {account.currency}</p>

      <h2 className="text-xl font-bold mt-8 mb-4">Transactions</h2>
      <ul>
        {transactions.map(tx => (
          <li key={tx.id} className="flex justify-between border-b py-2">
            <span>{tx.date}</span>
            <span>{tx.description}</span>
            <span>{tx.amount}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}