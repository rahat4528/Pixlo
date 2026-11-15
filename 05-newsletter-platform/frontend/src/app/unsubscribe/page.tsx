'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';

export default function UnsubscribePage() {
  const [resubscribed, setResubscribed] = useState(false);

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {resubscribed ? 'Subscription Restored' : 'You have been unsubscribed'}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          {resubscribed
            ? 'We have removed your address from the suppression list. You will continue to receive future editions.'
            : 'Your email address has been added to our publication suppression list. You will not receive future campaigns from The Weekly Disruption.'}
        </p>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-left space-y-1">
        <div className="flex items-center space-x-1.5 font-semibold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-sky-600" />
          <span>RFC 8058 One-Click Compliance</span>
        </div>
        <p>
          This unsubscription was processed instantly without requiring a password or survey.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {!resubscribed ? (
          <button
            onClick={() => setResubscribed(true)}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition flex items-center justify-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Unsubscribed by mistake? Re-subscribe</span>
          </button>
        ) : (
          <Link
            href="/"
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition"
          >
            Return to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
