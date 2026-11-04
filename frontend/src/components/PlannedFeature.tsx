import Link from "next/link";

export default function PlannedFeature({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <main className="min-h-screen bg-[#F1F4F8] px-6 py-10 text-[#1A2E45]">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs uppercase tracking-[0.24em] text-[#356A9A]">
          Product roadmap
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[#1A2E45]">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#526477]">
          {description}
        </p>

        <section className="mt-8 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6">
          <span className="rounded-full border border-amber-500/30 px-3 py-1 text-xs font-medium text-amber-900">
            Not available yet
          </span>
          <p className="mt-4 text-sm leading-6 text-[#304258]">
            This page is a roadmap placeholder. It does not display fabricated
            performance data or execute strategies.
          </p>
        </section>

        <section className="mt-6 rounded-3xl border border-[#D7DFE8] bg-[#FDFEFF] p-6">
          <h2 className="text-lg font-semibold text-[#1A2E45]">
            Planned capabilities
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-[#D7DFE8] bg-[#F1F4F8]/50 p-4 text-sm text-[#304258]"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-full border border-[#CDD6E1] px-4 py-2 text-sm font-medium text-[#304258] transition hover:border-[#356A9A] hover:text-[#356A9A]"
        >
          Return to overview
        </Link>
      </div>
    </main>
  );
}
