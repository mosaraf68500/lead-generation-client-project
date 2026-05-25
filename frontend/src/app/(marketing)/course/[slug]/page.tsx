import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CheckCircle2, Clock, Star, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { CourseEnrollCta } from './CourseEnrollCta';
import { fetchCourseBySlug } from '@/services/courses';
import { formatCurrency } from '@/utils';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
}

const CourseDetailPage = async ({ params }: PageProps) => {
  const course = await fetchCourseBySlug(params.slug);
  if (!course) notFound();

  const instructor = typeof course.instructor === 'string' ? null : course.instructor;
  const effectivePrice = course.discountPrice ?? course.price;

  return (
    <article className="container py-12">
      <div className="grid gap-10 lg:grid-cols-[1.4fr,1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge tone="brand" className="capitalize">{course.category}</Badge>
            <Badge tone="neutral" className="capitalize">{course.level}</Badge>
          </div>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink-900 dark:text-ink-100">
            {course.title}
          </h1>
          <p className="mt-3 text-lg text-ink-500">{course.shortDescription}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-500">
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {course.durationHours} hours</span>
            <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> {course.enrollmentsCount.toLocaleString()} learners</span>
            <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-500" /> {course.ratingAvg.toFixed(1)} ({course.ratingCount} reviews)</span>
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-card dark:border-ink-700 dark:bg-ink-900">
            <div className="relative aspect-[16/9]">
              <Image
                src={course.thumbnail.url}
                alt={course.title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
                priority
              />
            </div>
          </div>

          <section className="mt-10">
            <h2 className="text-2xl font-semibold text-ink-900 dark:text-ink-100">About this course</h2>
            <div className="prose mt-3 max-w-none whitespace-pre-line text-ink-700 dark:text-ink-100">
              {course.description}
            </div>
          </section>

          {course.modules.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl font-semibold text-ink-900 dark:text-ink-100">Curriculum</h2>
              <ol className="mt-4 space-y-3">
                {course.modules.map((module, idx) => (
                  <li
                    key={`${module.title}-${idx}`}
                    className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card dark:border-ink-700 dark:bg-ink-900"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                      Module {idx + 1}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-ink-900 dark:text-ink-100">{module.title}</h3>
                    <ul className="mt-3 space-y-1 text-sm text-ink-500">
                      {module.lessons.map((lesson, lessonIdx) => (
                        <li key={`${lesson.title}-${lessonIdx}`} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-accent-600" />
                          <span>{lesson.title}</span>
                          <span className="ml-auto text-xs text-ink-300">{lesson.durationMin} min</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <aside id="lead" className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card dark:border-ink-700 dark:bg-ink-900">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-ink-900 dark:text-ink-100">{formatCurrency(effectivePrice)}</span>
              {course.discountPrice && course.discountPrice < course.price && (
                <span className="text-sm text-ink-300 line-through">{formatCurrency(course.price)}</span>
              )}
              {course.discountPrice && course.discountPrice < course.price && (
                <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Save {Math.round(((course.price - course.discountPrice) / course.price) * 100)}%
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-ink-500">Lifetime access · No credit card required</p>

            <ul className="mt-5 space-y-2 text-sm text-ink-700 dark:text-ink-100">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-600" /> Project-based learning</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-600" /> Mentor reviews</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-600" /> Certificate of completion</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-600" /> Lifetime updates</li>
            </ul>

            <div className="mt-6 border-t border-ink-100 pt-6 dark:border-ink-700">
              <CourseEnrollCta
                courseId={course.id}
                slug={course.slug}
                title={course.title}
                onSale={Boolean(course.discountPrice && course.discountPrice < course.price)}
              />
              <p className="mt-3 text-center text-[11px] text-ink-500">
                A team member will reach out on WhatsApp within one business day.
              </p>
            </div>
          </div>

          {instructor && (
            <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card dark:border-ink-700 dark:bg-ink-900">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Instructor</p>
              <p className="mt-1 text-lg font-semibold text-ink-900 dark:text-ink-100">{instructor.name}</p>
              {instructor.bio && <p className="mt-2 text-sm text-ink-500">{instructor.bio}</p>}
            </div>
          )}
        </aside>
      </div>
    </article>
  );
};

export default CourseDetailPage;
