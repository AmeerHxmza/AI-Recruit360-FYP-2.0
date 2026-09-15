import { BrandLogo } from "@/components/brand/brand-logo";

export function AuthIntroduction() {
  return (
    <aside className="hidden lg:flex lg:w-[44%] flex-col justify-between bg-sidebar text-white p-12 xl:p-16">
      <BrandLogo href="/" />
      <div className="max-w-md py-20">
        <p className="text-sm text-white/65 mb-5">A clearer way to hire</p>
        <h2 className="text-4xl font-semibold tracking-tight leading-tight">
          Every candidate.
          <br />
          The complete picture.
        </h2>
        <p className="mt-6 text-base leading-relaxed text-white/75">
          Bring resumes, skills assessments, and interview evidence into one
          organized workspace.
        </p>
        <ol className="mt-10 border-t border-white/20">
          {[
            "Publish a role and share its application link",
            "Review skills and interview evidence",
            "Make an informed hiring decision",
          ].map((item, index) => (
            <li
              key={item}
              className="flex gap-4 py-5 border-b border-white/20 text-sm"
            >
              <span className="text-white/50 tabular-nums">0{index + 1}</span>
              {item}
            </li>
          ))}
        </ol>
      </div>
      <p className="text-xs text-white/60">
        Recruit360 · Software Engineering FYP
      </p>
    </aside>
  );
}
