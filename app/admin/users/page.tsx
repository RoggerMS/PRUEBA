'use client';

import React from 'react';
import { UserManagement } from '@/components/admin/UserManagement';

export default function AdminUsersPage() {
  return (
    <div className="container mx-auto py-6">
      <UserManagement />
    </div>
  );
}