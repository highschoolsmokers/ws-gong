import PageShell from "../components/PageShell";
import { EmailIcon } from "../(site)/about/SocialIcons";

export default function TechLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageShell
      header={
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-medium tracking-[0.08em] uppercase">
            W.S. Gong
          </span>
          <nav>
            <a
              href="/contact"
              className="hover:opacity-50 transition-opacity"
              aria-label="Contact"
            >
              <EmailIcon />
            </a>
          </nav>
        </div>
      }
    >
      {children}
    </PageShell>
  );
}
