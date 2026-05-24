import { Construction } from 'lucide-react';
import { PageHeader } from './PageHeader';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <div className="flex flex-col items-center justify-center h-64 gap-3 rounded-xl border border-dashed border-border bg-muted/30">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center">
          <Construction className="size-5 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Module coming soon</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            This section is under development and will be available in the next release.
          </p>
        </div>
      </div>
    </div>
  );
}
