import { Mail, Phone, Link2, MapPin } from "lucide-react";
import { OptimizedResume, THEME_COLORS, ThemeColorKey, ResumeTemplateKey } from "@/lib/schema";

interface TemplateProps {
  resume: OptimizedResume;
  accent: string;
}

function ContactItems({ resume }: { resume: OptimizedResume }) {
  const { personalInfo } = resume;
  return (
    <>
      {personalInfo.email ? (
        <span className="flex items-center gap-1">
          <Mail className="h-3 w-3" /> {personalInfo.email}
        </span>
      ) : null}
      {personalInfo.phone ? (
        <span className="flex items-center gap-1">
          <Phone className="h-3 w-3" /> {personalInfo.phone}
        </span>
      ) : null}
      {personalInfo.linkedin ? (
        <span className="flex items-center gap-1">
          <Link2 className="h-3 w-3" /> {personalInfo.linkedin}
        </span>
      ) : null}
      {personalInfo.location ? (
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {personalInfo.location}
        </span>
      ) : null}
    </>
  );
}

function ClassicPreview({ resume, accent }: TemplateProps) {
  const { personalInfo, summary, skills, experiences, education } = resume;

  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-2xl font-bold" style={{ color: accent }}>
        {personalInfo.fullName || "Name not provided"}
      </h2>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
        <ContactItems resume={resume} />
      </div>

      {summary ? (
        <section className="mt-5">
          <h3
            className="border-b pb-1 text-xs font-bold tracking-wide uppercase"
            style={{ color: accent, borderColor: accent }}
          >
            Professional Summary
          </h3>
          <p className="mt-2 leading-relaxed text-neutral-700">{summary}</p>
        </section>
      ) : null}

      {skills.length > 0 ? (
        <section className="mt-5">
          <h3
            className="border-b pb-1 text-xs font-bold tracking-wide uppercase"
            style={{ color: accent, borderColor: accent }}
          >
            Skills
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {skills.map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="rounded border px-2 py-0.5 text-[11px]"
                style={{ color: accent, borderColor: accent }}
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {experiences.length > 0 ? (
        <section className="mt-5">
          <h3
            className="border-b pb-1 text-xs font-bold tracking-wide uppercase"
            style={{ color: accent, borderColor: accent }}
          >
            Professional Experience
          </h3>
          <div className="mt-2 space-y-3">
            {experiences.map((exp, index) => (
              <div key={`${exp.company}-${index}`}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-neutral-900">
                    {exp.role}
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {exp.period}
                  </span>
                </div>
                <div className="text-neutral-600">{exp.company}</div>
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-neutral-700">
                  {exp.bulletPoints.map((point, pointIndex) => (
                    <li key={pointIndex}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {education.length > 0 ? (
        <section className="mt-5">
          <h3
            className="border-b pb-1 text-xs font-bold tracking-wide uppercase"
            style={{ color: accent, borderColor: accent }}
          >
            Education
          </h3>
          <div className="mt-2 space-y-1.5">
            {education.map((edu, index) => (
              <div key={`${edu.institution}-${index}`}>
                <div className="font-semibold text-neutral-900">
                  {edu.degree}
                </div>
                <div className="text-neutral-600">
                  {edu.institution}
                  {edu.year ? ` • ${edu.year}` : ""}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ModernPreview({ resume, accent }: TemplateProps) {
  const { personalInfo, summary, skills, experiences, education } = resume;

  return (
    <div className="flex h-full">
      <div
        className="w-[34%] shrink-0 p-5 text-white"
        style={{ backgroundColor: accent }}
      >
        <h2 className="text-lg font-bold">
          {personalInfo.fullName || "Name not provided"}
        </h2>

        <div className="mt-4 flex flex-col gap-1.5 text-[11px] opacity-90">
          <ContactItems resume={resume} />
        </div>

        {skills.length > 0 ? (
          <div className="mt-5">
            <h3 className="text-[10px] font-bold tracking-wide uppercase opacity-90">
              Skills
            </h3>
            <ul className="mt-2 space-y-1 text-[11px] opacity-95">
              {skills.map((skill, index) => (
                <li key={`${skill}-${index}`}>• {skill}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {education.length > 0 ? (
          <div className="mt-5">
            <h3 className="text-[10px] font-bold tracking-wide uppercase opacity-90">
              Education
            </h3>
            <div className="mt-2 space-y-2 text-[11px]">
              {education.map((edu, index) => (
                <div key={`${edu.institution}-${index}`}>
                  <div className="font-semibold">{edu.degree}</div>
                  <div className="opacity-90">
                    {edu.institution}
                    {edu.year ? ` • ${edu.year}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="w-[66%] p-5">
        {summary ? (
          <section>
            <h3
              className="text-xs font-bold tracking-wide uppercase"
              style={{ color: accent }}
            >
              Profile
            </h3>
            <p className="mt-2 leading-relaxed text-neutral-700">{summary}</p>
          </section>
        ) : null}

        {experiences.length > 0 ? (
          <section className="mt-5">
            <h3
              className="text-xs font-bold tracking-wide uppercase"
              style={{ color: accent }}
            >
              Experience
            </h3>
            <div className="mt-2 space-y-3">
              {experiences.map((exp, index) => (
                <div key={`${exp.company}-${index}`}>
                  <div className="font-semibold text-neutral-900">
                    {exp.role}
                  </div>
                  <div className="text-[11px]" style={{ color: accent }}>
                    {exp.company}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    {exp.period}
                  </div>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-neutral-700">
                    {exp.bulletPoints.map((point, pointIndex) => (
                      <li key={pointIndex}>{point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function MinimalPreview({ resume, accent }: TemplateProps) {
  const { personalInfo, summary, skills, experiences, education } = resume;

  return (
    <div className="p-8 sm:p-10">
      <h2 className="text-xl font-normal tracking-wide text-neutral-900">
        {personalInfo.fullName || "Name not provided"}
      </h2>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-neutral-400">
        <ContactItems resume={resume} />
      </div>

      {summary ? (
        <section className="mt-6">
          <h3
            className="text-[10px] font-bold tracking-[0.2em] uppercase"
            style={{ color: accent }}
          >
            Summary
          </h3>
          <p className="mt-2 leading-relaxed text-neutral-600">{summary}</p>
        </section>
      ) : null}

      {experiences.length > 0 ? (
        <section className="mt-6">
          <h3
            className="text-[10px] font-bold tracking-[0.2em] uppercase"
            style={{ color: accent }}
          >
            Experience
          </h3>
          <div className="mt-3 space-y-4">
            {experiences.map((exp, index) => (
              <div key={`${exp.company}-${index}`}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-neutral-900">
                    {exp.role}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {exp.period}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400">{exp.company}</div>
                <ul className="mt-1.5 space-y-1 text-neutral-600">
                  {exp.bulletPoints.map((point, pointIndex) => (
                    <li key={pointIndex}>— {point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {skills.length > 0 ? (
        <section className="mt-6">
          <h3
            className="text-[10px] font-bold tracking-[0.2em] uppercase"
            style={{ color: accent }}
          >
            Skills
          </h3>
          <p className="mt-2 text-neutral-600">{skills.join("  ·  ")}</p>
        </section>
      ) : null}

      {education.length > 0 ? (
        <section className="mt-6">
          <h3
            className="text-[10px] font-bold tracking-[0.2em] uppercase"
            style={{ color: accent }}
          >
            Education
          </h3>
          <div className="mt-2 space-y-1.5">
            {education.map((edu, index) => (
              <div key={`${edu.institution}-${index}`}>
                <div className="font-semibold text-neutral-900">
                  {edu.degree}
                </div>
                <div className="text-neutral-400">
                  {edu.institution}
                  {edu.year ? ` • ${edu.year}` : ""}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

interface ResumePreviewProps {
  resume: OptimizedResume;
  themeColor: ThemeColorKey;
  templateId: ResumeTemplateKey;
}

export function ResumePreview({ resume, themeColor, templateId }: ResumePreviewProps) {
  const accent = THEME_COLORS[themeColor];

  return (
    <div className="aspect-[210/297] w-full overflow-y-auto rounded-md border bg-white text-[13px] text-neutral-800 shadow-sm">
      {templateId === "modern" ? (
        <ModernPreview resume={resume} accent={accent} />
      ) : templateId === "minimal" ? (
        <MinimalPreview resume={resume} accent={accent} />
      ) : (
        <ClassicPreview resume={resume} accent={accent} />
      )}
    </div>
  );
}
