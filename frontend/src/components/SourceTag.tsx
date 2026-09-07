import React from 'react';

type Source = 'Observed' | 'Reported' | 'Inferred';

interface SourceTagProps {
  source?: Source;
  kind?: Source;
}

export default function SourceTag({ source, kind }: SourceTagProps) {
  const activeSource = source ?? kind ?? 'Observed';
  const classMap: Record<Source, string> = {
    Observed: 'source-observed',
    Reported: 'source-reported',
    Inferred: 'source-inferred',
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${classMap[activeSource]}`}>
      {activeSource}
    </span>
  );
}

export { SourceTag };