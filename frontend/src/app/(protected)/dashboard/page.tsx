"use client";

import { useEffect, useState } from "react";

interface User {
  name: string;
  username: string;
  email: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) {
    return null; // The layout handles the loading state
  }

  return (
    <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800">Your Profile</h2>
          <div className="mt-4 space-y-2">
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
          </div>
        </div>
        <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
            <div className="mt-4 space-y-2">
                <p>You have no recent activity.</p>
            </div>
        </div>
    </div>
  );
}