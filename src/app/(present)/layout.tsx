import { AuthGuard } from "@/components/providers/AuthGuard";

export default function PresentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
