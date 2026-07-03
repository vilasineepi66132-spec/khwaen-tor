import "./globals.css";

export const metadata = {
  title: "แขวนต่อ — ตลาดเสื้อผ้ามือสอง",
  description: "ให้เสื้อผ้าได้ไปต่อ ซื้อ-ขายเสื้อผ้ามือสองในชุมชน",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className="font-body bg-cream min-h-screen">{children}</body>
    </html>
  );
}
