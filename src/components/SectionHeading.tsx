import Reveal from "./Reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
}

export default function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <Reveal className="mx-auto mb-14 max-w-2xl text-center">
      <p className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl font-bold tracking-tight text-navy-800 sm:text-4xl dark:text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg leading-relaxed text-navy-500 dark:text-navy-200">
          {description}
        </p>
      )}
    </Reveal>
  );
}
