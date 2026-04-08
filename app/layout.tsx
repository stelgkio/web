import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col antialiased">
      <Providers>
        <SiteHeader />
        <div className="flex-1">{children}</div>
      </Providers>
    </div>
  );
}
