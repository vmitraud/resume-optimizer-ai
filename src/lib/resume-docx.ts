import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle } from "docx";
import { OptimizedResume } from "@/lib/schema";
import { Language } from "@/lib/language";
import { translations } from "@/lib/translations";

function sectionHeading(text: string, accent: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: accent },
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        color: accent,
        size: 20,
      }),
    ],
  });
}

export async function createResumeDocx(
  resume: OptimizedResume,
  accent: string,
  language: Language,
): Promise<Buffer> {
  const doc = translations[language].doc;
  const { personalInfo, summary, skills, experiences, education } = resume;

  const contactItems = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.linkedin,
    personalInfo.location,
  ].filter(Boolean);

  const children: Paragraph[] = [
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: personalInfo.fullName || doc.nameNotProvided,
          bold: true,
          color: accent,
          size: 40,
        }),
      ],
    }),
  ];

  if (contactItems.length > 0) {
    children.push(
      new Paragraph({
        spacing: { after: 160 },
        children: [
          new TextRun({
            text: contactItems.join("  •  "),
            size: 18,
            color: "6b7280",
          }),
        ],
      }),
    );
  }

  if (summary) {
    children.push(
      sectionHeading(doc.summary, accent),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: summary, size: 20 })],
      }),
    );
  }

  if (skills.length > 0) {
    children.push(
      sectionHeading(doc.skills, accent),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: skills.join("  •  "), size: 20 })],
      }),
    );
  }

  if (experiences.length > 0) {
    children.push(sectionHeading(doc.experience, accent));
    for (const exp of experiences) {
      children.push(
        new Paragraph({
          spacing: { before: 120 },
          children: [
            new TextRun({ text: exp.role, bold: true, size: 21 }),
            new TextRun({ text: `   ${exp.period}`, size: 18, color: "6b7280" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 60 },
          children: [new TextRun({ text: exp.company, size: 19, color: "374151" })],
        }),
      );
      for (const point of exp.bulletPoints) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [new TextRun({ text: point, size: 19 })],
          }),
        );
      }
    }
  }

  if (education.length > 0) {
    children.push(sectionHeading(doc.education, accent));
    for (const edu of education) {
      children.push(
        new Paragraph({
          spacing: { before: 80 },
          children: [new TextRun({ text: edu.degree, bold: true, size: 20 })],
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: `${edu.institution}${edu.year ? `  •  ${edu.year}` : ""}`,
              size: 19,
              color: "374151",
            }),
          ],
        }),
      );
    }
  }

  const document = new Document({
    title: `Resume - ${personalInfo.fullName || doc.nameNotProvided}`,
    sections: [{ children }],
  });

  return Packer.toBuffer(document);
}
