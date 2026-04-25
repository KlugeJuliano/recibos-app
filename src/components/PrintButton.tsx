'use client';

type PrintButtonProps = {
  children: React.ReactNode;
  className?: string;
};

export default function PrintButton({ children, className = '' }: PrintButtonProps) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      {children}
    </button>
  );
}
