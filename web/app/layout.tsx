import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'wanka-compiler Editor',
  description: 'AI 玩卡编译器 - 卡片配置可视化编辑器'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
