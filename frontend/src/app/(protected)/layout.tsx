import AppLayout from "../components/AppLayout";

export default function ProtectedPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}