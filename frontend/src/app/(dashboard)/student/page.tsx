import Link from 'next/link';
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Inbox,
  Heart,
  BookmarkPlus,
  LifeBuoy,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/common/StatCard';
import { ActionCard } from '@/components/common/ActionCard';
import { CourseGrid } from '@/components/common/CourseGrid';
import { Button } from '@/components/ui/Button';
import { requireSessionRole } from '@/services/session';
import { fetchCourses } from '@/services/courses';
import { fetchMyLeads } from '@/services/leads';
import { StudentLeadsTimeline } from './StudentLeadsTimeline';
import { StudentProfileForm } from './StudentProfileForm';

export const dynamic = 'force-dynamic';

const formatToday = (): string =>
  new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const StudentDashboard = async () => {
  const user = await requireSessionRole('student', 'staff', 'admin');

  const today = formatToday();
  const kicker = `Today · ${today}`;

  const [{ courses }, myLeads] = await Promise.all([
    fetchCourses({ limit: 6, isPublished: true }),
    fetchMyLeads(),
  ]);

  // Until a dedicated enrolments collection exists, we treat any lead with a
  // chosen `interestedCourse` as a "in-flight enrolment" and surface it here.
  const enrolledLeads = myLeads.filter((lead) => Boolean(lead.interestedCourse));
  const recommendedCourses = courses;

  const stats = {
    applications: myLeads.length,
    enrolling: enrolledLeads.length,
    enrolled: myLeads.filter(
      (l) => l.status === 'in_progress' || l.status === 'enrolled',
    ).length,
  };

  return (
    <DashboardLayout
      title={`Welcome back, ${user.name.split(' ')[0]}`}
      overview={`Overview for Today (${today})`}
      subtitle="Track your applications, manage your profile and discover what to learn next."
      actions={
        <Link href="/course">
          <Button variant="primary" leftIcon={<GraduationCap className="h-4 w-4" />}>
            Browse courses
          </Button>
        </Link>
      }
    >
      {/* ── KPI strip ──────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Courses available"
          value={recommendedCourses.length}
          kicker="Catalog"
          tone="brand"
        />
        <StatCard
          icon={Inbox}
          label="Your applications"
          value={stats.applications}
          kicker={kicker}
          hint="Lead-form + advisor requests"
          tone="accent"
        />
        <StatCard
          icon={GraduationCap}
          label="Enrolling now"
          value={stats.enrolling}
          kicker={kicker}
          tone="neutral"
        />
        <StatCard
          icon={Sparkles}
          label="In progress / enrolled"
          value={stats.enrolled}
          kicker={kicker}
          tone="brand"
        />
      </div>

      {/* ── Personal quick actions ─────────────────────────────── */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <ActionCard
          icon={BookmarkPlus}
          value="Open"
          label="Your interested courses"
          tone="brand"
          href="/dashboard/interested"
        />
        <ActionCard
          icon={Heart}
          value="View"
          label="Your wishlist"
          tone="amber"
          href="/dashboard/wishlist"
        />
        <ActionCard
          icon={LifeBuoy}
          value="Ask"
          label="Support center"
          tone="accent"
          href="/dashboard/support"
        />
      </div>

      {/* ── Applications timeline + profile ─────────────────────── */}
      <section className="mt-10 grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        <StudentLeadsTimeline leads={myLeads} />
        <StudentProfileForm user={user} />
      </section>

      {/* ── Recommended ─────────────────────────────────────────── */}
      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-100">
              Recommended for you
            </h2>
            <p className="text-sm text-ink-500">
              Hand-picked courses based on what learners with your profile loved.
            </p>
          </div>
          <Link href="/course" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
            All courses &rarr;
          </Link>
        </div>
        <CourseGrid courses={recommendedCourses} emptyTitle="No courses to recommend yet" />
      </section>
    </DashboardLayout>
  );
};

export default StudentDashboard;
