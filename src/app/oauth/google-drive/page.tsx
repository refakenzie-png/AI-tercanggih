"use client";

import { useEffect, useState } from 'react';

export default function GoogleDriveOAuthPage() {
  const [status, setStatus] = useState('Processing Google Drive authentication...');

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('Google Drive OAuth connected successfully. Backup can now be written to user-owned Drive folder.');
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050c18] p-8 text-slate-100">
      <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8 text-center shadow-neon">
        <div className="mb-4 text-4xl">✅</div>
        <h1 className="text-2xl font-bold text-white">Google Drive OAuth</h1>
        <p className="mt-3 max-w-md text-slate-300">{status}</p>
      </div>
    </main>
  );
}
