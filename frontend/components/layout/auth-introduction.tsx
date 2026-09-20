import { BrandLogo } from "@/components/brand/brand-logo";

export function AuthIntroduction() {
  return (
    <aside className="relative hidden lg:flex lg:w-[44%] flex-col justify-between overflow-hidden border-r border-[#E7E7E2] bg-[#F6F6F2] p-12 text-[#121212] xl:p-16">
      {/* Subtle Warm AI Glow */}
      <div className="hero-glow pointer-events-none absolute -left-20 -top-20 size-96 opacity-40" />

      <BrandLogo href="/" />

      <div className="relative max-w-md py-14">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E7E7E2] bg-white px-3 py-1 text-xs font-medium text-[#121212] shadow-2xs">
          <span className="size-1.5 rounded-full bg-[#35C88A]" />
          <span>Your recruitment workspace</span>
        </div>

        <h2 className="text-4xl font-[520] tracking-[-0.04em] leading-[1.08] text-[#121212]">
          Every candidate.
          <br />
          The complete picture.
        </h2>

        <p className="mt-5 text-sm leading-relaxed text-[#60605D]">
          Review resumes, assess skills, and conduct structured interviews in
          one place.
        </p>

        <ol className="mt-8 border-t border-[#E7E7E2]">
          {[
            "Publish a role and share its application link",
            "Review skills alongside resume evidence",
            "Compare assessment and interview results",
          ].map((item, index) => (
            <li
              key={item}
              className="flex gap-4 border-b border-[#E7E7E2] py-4 text-xs font-medium text-[#121212]"
            >
              <span className="font-mono text-[#8C8C87]">0{index + 1}</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </div>

      <p className="text-xs text-[#8C8C87]">
        AI-Recruit360 · AI-assisted recruitment
      </p>
    </aside>
  );
}
