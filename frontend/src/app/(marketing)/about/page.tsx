import { Globe2, HeartHandshake, Target } from 'lucide-react';
import { FeatureCard } from '@/components/common/FeatureCard';

const About = () => (
  <section className="container py-16">
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">About us</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
        Built by practitioners, for ambitious learners.
      </h1>
      <p className="mt-4 text-lg text-ink-500">
        Smart Earning Pro began as an internal lead-generation training program for our own remote
        agency. Today it&apos;s an outcome-focused school helping thousands of professionals turn skills
        into real income.
      </p>
    </div>

    <div className="mt-12 grid gap-6 sm:grid-cols-3">
      <FeatureCard
        icon={Target}
        title="Outcome-first"
        description="Every program is built backwards from a specific career or revenue outcome."
      />
      <FeatureCard
        icon={HeartHandshake}
        title="Mentor-led"
        description="Our instructors are senior practitioners actively working in the field they teach."
      />
      <FeatureCard
        icon={Globe2}
        title="Globally distributed"
        description="Asynchronous-first cohorts let learners from 50+ countries study on their own schedule."
      />
    </div>

    <div className="mt-16 grid gap-10 rounded-3xl border border-ink-100 bg-white p-8 shadow-card lg:grid-cols-2 lg:p-12">
      <div>
        <h2 className="text-2xl font-bold text-ink-900">Our mission</h2>
        <p className="mt-3 text-ink-500">
          To make career-changing skills as accessible as a Netflix subscription, with the rigour of a
          top-tier bootcamp and the freedom of self-paced learning.
        </p>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-ink-900">Where we&apos;re headed</h2>
        <p className="mt-3 text-ink-500">
          We&apos;re investing in mentor networks, employer partnerships and AI-assisted feedback to
          shorten the path from learner to professional.
        </p>
      </div>
    </div>
  </section>
);

export default About;
