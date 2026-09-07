import React from 'react';
import AuthGuard from '@/components/AuthGuard';
import AssessmentWizardClient from './components/AssesmentWizardClient';

export default function AssessmentWizardPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#F5F5F5] py-10">
        <AssessmentWizardClient />
      </div>
    </AuthGuard>
  );
}