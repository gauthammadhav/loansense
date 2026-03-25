import React from 'react';

export function Table({ children, className = '' }) {
  return (
    <div className="w-full overflow-auto">
      <table className={`w-full caption-bottom text-sm font-body ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }) {
  return <thead className="border-b border-border">{children}</thead>;
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children, className = '' }) {
  return (
    <tr className={`border-b border-border transition-colors hover:bg-page/50 data-[state=selected]:bg-page ${className}`}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '' }) {
  return (
    <th className={`h-12 px-4 text-left align-middle text-xs font-bold text-faint uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '' }) {
  return (
    <td className={`p-4 align-middle ${className}`}>
      {children}
    </td>
  );
}
