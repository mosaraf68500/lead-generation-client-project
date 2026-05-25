'use client';

/**
 * Lead-capture CTA for the course detail page sticky aside.
 * Replaces the old inline LeadForm with a button that opens the global
 * LeadCaptureModal. Keeps the static "what's included" markup in the parent
 * server component so SEO + initial paint stay fast.
 */

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLeadCapture } from '@/context/LeadCaptureContext';

interface CourseEnrollCtaProps {
  courseId: string;
  slug: string;
  title: string;
  onSale: boolean;
}

export const CourseEnrollCta = ({ courseId, slug, title, onSale }: CourseEnrollCtaProps) => {
  const { open } = useLeadCapture();

  return (
    <Button
      type="button"
      size="lg"
      className="w-full"
      rightIcon={<ArrowRight className="h-4 w-4" />}
      onClick={() =>
        open({
          source: `course:${slug}`,
          course: { id: courseId, title, onSale },
          heading: onSale ? `Claim your offer — ${title}` : `Enroll in ${title}`,
          cta: onSale ? 'Claim my offer' : 'Submit & enroll',
        })
      }
    >
      {onSale ? 'Claim special offer' : 'Enroll now'}
    </Button>
  );
};
