'use client';

import React from 'react';
import { SystemStats } from '@/components/admin/SystemStats';

export default function AdminAnalyticsPage() {
  return (
    <div className="container mx-auto py-6">
      <SystemStats />
    </div>
  );
}