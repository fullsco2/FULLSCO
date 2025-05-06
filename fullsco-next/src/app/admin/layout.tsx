'use client';

import { ProtectedRoute } from '@/lib/protected-route';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';
import { Suspense } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute adminOnly>
      <div className="relative min-h-screen bg-background lg:grid lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <div className="flex min-h-screen flex-col">
          <AdminHeader />
          <main className="flex-1 p-4 lg:p-8">
            <Suspense fallback={<div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg"></span></div>}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
