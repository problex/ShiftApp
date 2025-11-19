import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shift Tracker",
  description: "Track and manage your work shifts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

