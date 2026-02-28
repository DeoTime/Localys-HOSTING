'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function Home() {
  return (
    <ProtectedRoute>
      {/* Video feed is rendered persistently via PersistentVideoFeed in layout.tsx */}
      <></>
    </ProtectedRoute>
  );
}
