import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM University & Student Portal",
  description: "Multi-tenant CRM for international education teams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
