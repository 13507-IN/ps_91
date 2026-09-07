import { FeasibilityReportClient } from '../feasibilty-report/components/components/FeasibilityReportClient';

export default function FeasibilityReportPage({
  searchParams,
}: {
  searchParams?: {
    id?: string;
    from?: string;
  };
}) {
  return (
    <FeasibilityReportClient
      reportId={searchParams?.id}
      isNew={searchParams?.from === 'assessment'}
    />
  );
}
