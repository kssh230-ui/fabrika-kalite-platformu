import "./globals.css";

export const metadata = {
  title: "FabrikaNet — Yalın Üretim Platformu",
  description: "Eğitim ve Kalite Takip Sistemi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
