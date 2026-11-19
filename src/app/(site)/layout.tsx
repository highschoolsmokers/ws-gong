import Chrome from "./Chrome";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Chrome>{children}</Chrome>;
}
