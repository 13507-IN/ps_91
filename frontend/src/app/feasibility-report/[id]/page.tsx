import { FeasibilityReportClient } from '../../feasibilty-report/components/components/FeasibilityReportClient';

export default function FeasibilityReportDynamicPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { from?: string };
}) {
  return (
    <FeasibilityReportClient
      reportId={params.id}
      isNew={searchParams?.from === 'assessment'}
    />
  );
}
