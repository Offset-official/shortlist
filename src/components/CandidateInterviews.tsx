'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Loading from './ui/loading';
/** Shape returned by the API */
export interface Interview {
  id: number;
  jobTitle: string;
  type: 'TECHNICAL' | 'HR';
  topics: string[];
  scheduledDateTime: string; // ISO 8601
}

interface ApiResponse {
  interviews: Interview[];
  page: number;
  totalPages: number;
}

const PAGE_SIZE = 8;

export default function CandidateInterviews() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchInterviews() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/interviews?page=${page}&pageSize=${PAGE_SIZE}`);
        if (!res.ok) throw new Error(await res.text());
        const json: ApiResponse = await res.json();
        if (!ignore) setData(json);
      } catch (err: any) {
        if (!ignore) setError(err.message ?? 'Failed to load');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchInterviews();
    return () => {
      ignore = true;
    };
  }, [page]);

  const nextPage = () => setPage((p) => Math.min(p + 1, data?.totalPages ?? p));
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Scheduled Interviews</h1>

      {loading && <Loading />}
      {error && <p className="text-destructive">{error}</p>}

      {!loading && data && data.interviews.length === 0 && (
        <p className="text-muted-foreground">No interviews scheduled yet.</p>
      )}

      {!loading && data && data.interviews.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.interviews.map((iv) => (
            <Card key={iv.id} className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  {iv.jobTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 flex-1">
                <p className="text-sm">
                  <span className="font-medium">Type:</span> {iv.type}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Date:</span>{' '}
                  {new Date(iv.scheduledDateTime).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
                {iv.type === 'TECHNICAL' && iv.topics.length > 0 && (
                  <p className="text-sm">
                    <span className="font-medium">Topics:</span> {iv.topics.join(', ')}
                  </p>
                )}
              </CardContent>
              <div className="p-4 pt-0">
                <Button className="w-full" disabled>
                  Start Interview
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={prevPage}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {page} / {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={nextPage}
            disabled={page === data.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
