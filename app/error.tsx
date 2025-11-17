'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            {error.message || 'An unexpected error occurred'}
          </p>
          <div className="flex gap-4">
            <button
              onClick={reset}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Try Again
            </button>
            <a
              href="/"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Go Home
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

