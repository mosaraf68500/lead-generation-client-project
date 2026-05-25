'use client';

import { Flame, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLeadCapture } from '@/context/LeadCaptureContext';

interface OfferCardCtaProps {
  title: string;
  cta: string;
  source: string;
}

/** Single offer-card CTA button: opens the LeadCaptureModal pre-bound to the offer. */
export const OfferCardCta = ({ title, cta, source }: OfferCardCtaProps) => {
  const { open } = useLeadCapture();
  return (
    <Button
      type="button"
      size="sm"
      onClick={() =>
        open({
          source,
          heading: title,
          subheading: 'Tell us where to send the discount code — our team confirms within 24 hours.',
          cta,
        })
      }
    >
      {cta}
    </Button>
  );
};

interface OfferCaptureCtaProps {
  courses: Array<{ id: string; title: string }>;
}

/** Big bottom CTA on the special-offers page — multi-course lead bucket. */
export const OfferCaptureCta = ({ courses }: OfferCaptureCtaProps) => {
  const { open } = useLeadCapture();
  return (
    <Button
      type="button"
      size="lg"
      onClick={() =>
        open({
          source: 'special-offers',
          courses,
          heading: 'Claim your special offer',
          subheading:
            'A team member will reach out on WhatsApp within 24 hours with your custom discount code.',
          cta: 'Send me my discount',
        })
      }
      rightIcon={<Flame className="h-4 w-4" />}
    >
      Claim my offer
    </Button>
  );
};

interface ClaimAllProps {
  cta?: string;
}

export const ClaimAllOffers = ({ cta = 'Talk to an advisor' }: ClaimAllProps) => {
  const { open } = useLeadCapture();
  return (
    <Button
      type="button"
      variant="outline"
      size="md"
      leftIcon={<Tag className="h-4 w-4" />}
      onClick={() =>
        open({
          source: 'special-offers-talk',
          heading: 'Not sure which to pick?',
          subheading: 'Our advisor will recommend the best offer for your goals — free, no obligations.',
          cta: 'Help me choose',
        })
      }
    >
      {cta}
    </Button>
  );
};
