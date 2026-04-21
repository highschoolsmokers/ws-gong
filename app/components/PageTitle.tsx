export default function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="swiss-display text-[2.5rem] md:text-[3.5rem] pb-10">
      {children}
    </h1>
  );
}
