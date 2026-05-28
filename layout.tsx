import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PyCompiler Visual | Compilador Python Interactivo',
  description: 'Visualiza las fases léxica, sintáctica y semántica de un compilador Python con generación de código C y Ensamblador.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
