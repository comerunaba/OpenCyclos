"use client";

import { useEffect, useState } from "react";

type Account = {
  id: string;
  name: string;
  number: string;
};

type User = {
    id: string;
    name: string;
    username: string;
}

export default function PaymentsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [fromAccountId, setFromAccountId] = useState('');
  const [toUsername, setToUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [accsRes, usersRes] = await Promise.all([
          fetch("http://localhost:6001/rest/accounts"),
          fetch("http://localhost:6001/rest/users")
        ]);
        if (!accsRes.ok || !usersRes.ok) throw new Error("Failed to fetch initial data");
        
        const accsData = await accsRes.json();
        setAccounts(accsData);
        setUsers(await usersRes.json());
        
        if (accsData.length > 0) {
            setFromAccountId(accsData[0].id);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("http://localhost:6001/rest/payments/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            fromAccountId, 
            toUsername, 
            amount: parseFloat(amount), 
            description 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Payment failed");
      }
      
      setSuccessMessage(`Payment of ${amount} to ${toUsername} was successful!`);
      // Reset form
      setAmount('');
      setDescription('');
      setToUsername('');

    } catch (err: any) {
      setError(err.message);
    }
  };


  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Make a Payment</h1>
      <div className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fromAccount" className="block text-sm font-medium text-gray-700">From Account</label>
            <select id="fromAccount" value={fromAccountId} onChange={e => setFromAccountId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} - {acc.number}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="toUser" className="block text-sm font-medium text-gray-700">To (Username)</label>
            <input list="users" id="toUser" value={toUsername} onChange={e => setToUsername(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="Start typing a username..."/>
            <datalist id="users">
                {users.map(user => <option key={user.id} value={user.username}>{user.name}</option>)}
            </datalist>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
            <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>
          
          {error && <p className="text-sm text-red-600">{error}</p>}
          {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

          <div>
            <button type="submit" className="w-full px-4 py-2 font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}