"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Account = {
  id: string;
  name: string;
  number: string;
  status: {
    balance: number;
  };
  currency: string;
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:6001/rest/accounts");
        if (!response.ok) throw new Error("Failed to fetch accounts");
        setAccounts(await response.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  if (isLoading) return <div>Loading accounts...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Your Accounts</h1>
      <div className="space-y-4">
        {accounts.map(account => (
          <Link key={account.id} href={`/accounts/${account.id}`}>
            <div className="block bg-white p-6 rounded-lg shadow-md hover:bg-gray-50 transition">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{account.name}</h2>
                  <p className="text-gray-500">{account.number}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: account.currency }).format(account.status.balance)}
                  </p>
                  <p className="text-sm text-gray-500">{account.currency}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}