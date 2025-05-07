'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Check, X } from 'lucide-react';
import { AdType, Status } from '@prisma/client';
import { getAdTypeName, getFileType } from '@/lib/utils';
import { createApproval } from './actions';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ReviewPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [swipingDirection, setSwipingDirection] = useState<'left' | 'right' | null>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  // Get list of creatives to review for the user's client
  const { data: creativesToReview, error, mutate } = useSWR(
    session?.user?.clientId ? `/api/client/${session.user.clientId}/creatives/pending` : null,
    fetcher
  );

  // Check session and handle unauthorized access
  useEffect(() => {
    if (session && session.user.role !== 'CLIENT') {
      router.push('/');
    }
  }, [session, router]);

  // Handle when there are no more creatives to review
  useEffect(() => {
    if (creativesToReview && creativesToReview.length === 0) {
      router.push('/client/library');
    }
  }, [creativesToReview, router]);

  if (error) return <div>Failed to load</div>;
  if (!creativesToReview) return <div>Loading...</div>;
  if (creativesToReview.length === 0) return <div>No creatives to review</div>;

  const currentCreative = creativesToReview[currentIndex];

  // Handle drag end for swipe
  const handleDragEnd = async (_, { offset }: { offset: { x: number } }) => {
    if (offset.x > 100) {
      // Swipe right - approve
      await handleApprove();
    } else if (offset.x < -100) {
      // Swipe left - reject
      setFeedbackOpen(true);
      setSwipingDirection('left');
    }
    
    x.set(0); // Reset position
  };

  // Handle approve
  const handleApprove = async () => {
    setSwipingDirection('right');
    
    try {
      await createApproval({
        creativeId: currentCreative.id,
        status: Status.APPROVED,
      });
      
      // Move to next creative or refresh list
      if (currentIndex < creativesToReview.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        mutate();
      }
    } catch (error) {
      console.error('Error approving creative:', error);
    }
    
    setSwipingDirection(null);
  };

  // Handle reject with feedback
  const handleReject = async () => {
    try {
      await createApproval({
        creativeId: currentCreative.id,
        status: Status.REJECTED,
        feedback: feedbackText,
      });
      
      // Move to next creative or refresh list
      if (currentIndex < creativesToReview.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        mutate();
      }
      
      // Reset feedback
      setFeedbackText('');
      setFeedbackOpen(false);
    } catch (error) {
      console.error('Error rejecting creative:', error);
    }
    
    setSwipingDirection(null);
  };

  return (
    <div className="container py-10 max-w-md mx-auto flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-8">Review Creatives</h1>
      
      {/* Swipe card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        style={{ x, rotate, opacity }}
        className="w-full cursor-grab active:cursor-grabbing"
      >
        <Card className="w-full shadow-lg">
          <CardContent className="p-4">
            {/* Creative display */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              {getFileType(currentCreative.url) === 'image' ? (
                <img
                  src={currentCreative.url}
                  alt="Creative"
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={currentCreative.url}
                  controls
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {getAdTypeName(currentCreative.adType)}
              </div>
            </div>
            
            {/* Swipe indicators */}
            <div className="flex justify-between items-center mt-4">
              <div className="bg-red-100 text-red-700 rounded-full p-3">
                <X className="h-6 w-6" />
              </div>
              <div className="text-sm text-gray-500">
                {currentIndex + 1} of {creativesToReview.length}
              </div>
              <div className="bg-green-100 text-green-700 rounded-full p-3">
                <Check className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Manual approval/rejection buttons */}
      <div className="flex space-x-4 mt-6">
        <Button
          variant="outline"
          size="lg"
          className="rounded-full p-3 border-2 border-red-400 hover:bg-red-50"
          onClick={() => setFeedbackOpen(true)}
        >
          <X className="h-6 w-6 text-red-500" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="rounded-full p-3 border-2 border-green-400 hover:bg-green-50"
          onClick={handleApprove}
        >
          <Check className="h-6 w-6 text-green-500" />
        </Button>
      </div>
      
      {/* Feedback dialog */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <textarea
              className="w-full rounded-md border-gray-300 p-2 min-h-[100px]"
              placeholder="Please provide feedback on why you're rejecting this creative..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackOpen(false)}>Cancel</Button>
            <Button onClick={handleReject}>Submit & Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 