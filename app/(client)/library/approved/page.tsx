'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatDate, getAdTypeName, getFileType } from '@/lib/utils';
import { Check } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const PAGE_SIZE = 12;

export default function ApprovedLibraryPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [selectedCreative, setSelectedCreative] = useState<any>(null);

  // Fetch approved creatives
  const { data, error, isLoading } = useSWR(
    session?.user?.clientId
      ? `/api/client/${session.user.clientId}/creatives/approved?page=${page}&limit=${PAGE_SIZE}`
      : null,
    fetcher
  );

  // Check session and handle unauthorized access
  useEffect(() => {
    if (session && session.user.role !== 'CLIENT') {
      router.push('/');
    }
  }, [session, router]);

  const loadMore = () => {
    setPage(page + 1);
  };

  if (error) return <div>Failed to load approved creatives</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Approved Creatives</h1>
        <Button variant="outline" onClick={() => router.push('/library/rejected')}>
          View Rejected
        </Button>
      </div>

      {/* Grid of creatives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data?.creatives.map((creative: any) => (
          <div
            key={creative.id}
            className="bg-white rounded-lg shadow overflow-hidden cursor-pointer"
            onClick={() => setSelectedCreative(creative)}
          >
            <div className="aspect-square relative bg-gray-100">
              {getFileType(creative.url) === 'image' ? (
                <img
                  src={creative.url}
                  alt="Creative"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              )}
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {getAdTypeName(creative.adType)}
              </div>
              <div className="absolute bottom-2 right-2 bg-green-500 text-white rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm text-gray-500">
                Approved on {formatDate(creative.approvals[0]?.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Load more button */}
      {data?.hasMore && (
        <div className="mt-8 flex justify-center">
          <Button onClick={loadMore} variant="outline">
            Load More
          </Button>
        </div>
      )}

      {/* Creative detail modal */}
      <Dialog open={!!selectedCreative} onOpenChange={(open) => !open && setSelectedCreative(null)}>
        <DialogContent className="max-w-3xl">
          {selectedCreative && (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                {getFileType(selectedCreative.url) === 'image' ? (
                  <img
                    src={selectedCreative.url}
                    alt="Creative"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={selectedCreative.url}
                    controls
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      Approved
                    </span>
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      {getAdTypeName(selectedCreative.adType)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDate(selectedCreative.approvals[0]?.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 