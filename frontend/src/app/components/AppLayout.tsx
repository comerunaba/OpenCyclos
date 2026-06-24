"use client";

import { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface User {
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push("/");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("sessionToken");
    router.push("/");
  };

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p>Loading...</p>
      </main>
    );
  }

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", roles: ['admin', 'user'] },
    { href: "/accounts", label: "Accounts", roles: ['admin', 'user'] },
    { href: "/payments", label: "Payments", roles: ['admin', 'user'] },
    // Admin-only links
    { href: "/admin/settings", label: "System Settings", roles: ['admin'] },
    { href: "/admin/roles", label: "Role Management", roles: ['admin'] },
    { href: "/admin/users", label: "User Management", roles: ['admin'] },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Cyclos</h2>
          <p className="text-sm text-gray-400">{user.name} ({user.role})</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navLinks.filter(link => link.roles.includes(user.role)).map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-2 rounded-md ${pathname === link.href ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm font-medium text-left bg-red-600 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  );
}