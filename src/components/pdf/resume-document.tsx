import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { OptimizedResume, THEME_COLORS, ThemeColorKey, ResumeTemplateKey } from "@/lib/schema";
import { Language } from "@/lib/language";
import { translations } from "@/lib/translations";

type DocLabels = { [K in keyof (typeof translations)["en"]["doc"]]: string };

interface TemplateProps {
  resume: OptimizedResume;
  accent: string;
  doc: DocLabels;
}

const classicStyles = (accent: string) =>
  StyleSheet.create({
    page: {
      paddingTop: 40,
      paddingBottom: 40,
      paddingHorizontal: 44,
      fontSize: 10,
      fontFamily: "Helvetica",
      color: "#1f2937",
    },
    name: {
      fontSize: 22,
      fontFamily: "Helvetica-Bold",
      color: accent,
      marginBottom: 4,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
    contactItem: {
      fontSize: 9,
      color: "#4b5563",
    },
    sectionTitle: {
      fontSize: 12,
      fontFamily: "Helvetica-Bold",
      color: accent,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 6,
      marginTop: 14,
      borderBottomWidth: 1,
      borderBottomColor: accent,
      paddingBottom: 3,
    },
    paragraph: {
      fontSize: 10,
      lineHeight: 1.5,
      color: "#374151",
    },
    skillsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    skillPill: {
      fontSize: 9,
      color: accent,
      borderWidth: 1,
      borderColor: accent,
      borderRadius: 3,
      paddingVertical: 2,
      paddingHorizontal: 6,
      marginBottom: 4,
    },
    experienceBlock: {
      marginBottom: 10,
    },
    experienceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    role: {
      fontSize: 11,
      fontFamily: "Helvetica-Bold",
      color: "#111827",
    },
    company: {
      fontSize: 10,
      color: "#374151",
    },
    period: {
      fontSize: 9,
      color: "#6b7280",
    },
    bullet: {
      flexDirection: "row",
      marginBottom: 2,
    },
    bulletDot: {
      width: 10,
      fontSize: 10,
      color: accent,
    },
    bulletText: {
      flex: 1,
      fontSize: 9.5,
      lineHeight: 1.4,
      color: "#374151",
    },
    educationBlock: {
      marginBottom: 6,
    },
    degree: {
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
      color: "#111827",
    },
    institution: {
      fontSize: 9.5,
      color: "#4b5563",
    },
  });

function ClassicTemplate({ resume, accent, doc }: TemplateProps) {
  const styles = classicStyles(accent);
  const { personalInfo, summary, skills, experiences, education } = resume;

  const contactItems = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.linkedin,
    personalInfo.location,
  ].filter(Boolean);

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.name}>{personalInfo.fullName || doc.nameNotProvided}</Text>
      <View style={styles.contactRow}>
        {contactItems.map((item, index) => (
          <Text key={`${item}-${index}`} style={styles.contactItem}>
            {item}
            {index < contactItems.length - 1 ? "  •" : ""}
          </Text>
        ))}
      </View>

      {summary ? (
        <View>
          <Text style={styles.sectionTitle}>{doc.summary}</Text>
          <Text style={styles.paragraph}>{summary}</Text>
        </View>
      ) : null}

      {skills.length > 0 ? (
        <View>
          <Text style={styles.sectionTitle}>{doc.skills}</Text>
          <View style={styles.skillsRow}>
            {skills.map((skill, index) => (
              <Text key={`${skill}-${index}`} style={styles.skillPill}>
                {skill}
              </Text>
            ))}
          </View>
        </View>
      ) : null}

      {experiences.length > 0 ? (
        <View>
          <Text style={styles.sectionTitle}>{doc.experience}</Text>
          {experiences.map((exp, index) => (
            <View key={`${exp.company}-${index}`} style={styles.experienceBlock} wrap={false}>
              <View style={styles.experienceHeader}>
                <Text style={styles.role}>{exp.role}</Text>
                <Text style={styles.period}>{exp.period}</Text>
              </View>
              <Text style={styles.company}>{exp.company}</Text>
              {exp.bulletPoints.map((point, pointIndex) => (
                <View key={pointIndex} style={styles.bullet}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{point}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : null}

      {education.length > 0 ? (
        <View>
          <Text style={styles.sectionTitle}>{doc.education}</Text>
          {education.map((edu, index) => (
            <View key={`${edu.institution}-${index}`} style={styles.educationBlock}>
              <Text style={styles.degree}>{edu.degree}</Text>
              <Text style={styles.institution}>
                {edu.institution}
                {edu.year ? ` • ${edu.year}` : ""}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </Page>
  );
}

const modernStyles = (accent: string) =>
  StyleSheet.create({
    page: {
      flexDirection: "row",
      fontSize: 10,
      fontFamily: "Helvetica",
      color: "#1f2937",
    },
    sidebar: {
      width: "34%",
      backgroundColor: accent,
      paddingVertical: 36,
      paddingHorizontal: 20,
      color: "#ffffff",
    },
    main: {
      width: "66%",
      paddingVertical: 36,
      paddingHorizontal: 26,
    },
    name: {
      fontSize: 18,
      fontFamily: "Helvetica-Bold",
      color: "#ffffff",
      marginBottom: 14,
    },
    sidebarSectionTitle: {
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
      color: "#ffffff",
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 6,
      marginTop: 18,
      opacity: 0.9,
    },
    contactItem: {
      fontSize: 8.5,
      color: "#ffffff",
      marginBottom: 5,
      opacity: 0.95,
    },
    sidebarSkill: {
      fontSize: 8.5,
      color: "#ffffff",
      marginBottom: 4,
      opacity: 0.95,
    },
    educationBlockSidebar: {
      marginBottom: 8,
    },
    degreeSidebar: {
      fontSize: 9,
      fontFamily: "Helvetica-Bold",
      color: "#ffffff",
    },
    institutionSidebar: {
      fontSize: 8.5,
      color: "#ffffff",
      opacity: 0.9,
    },
    mainSectionTitle: {
      fontSize: 12,
      fontFamily: "Helvetica-Bold",
      color: accent,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 8,
      marginTop: 16,
    },
    paragraph: {
      fontSize: 10,
      lineHeight: 1.5,
      color: "#374151",
    },
    experienceBlock: {
      marginBottom: 10,
    },
    role: {
      fontSize: 11,
      fontFamily: "Helvetica-Bold",
      color: "#111827",
    },
    company: {
      fontSize: 9.5,
      color: accent,
      marginBottom: 2,
    },
    period: {
      fontSize: 9,
      color: "#6b7280",
      marginBottom: 3,
    },
    bullet: {
      flexDirection: "row",
      marginBottom: 2,
    },
    bulletDot: {
      width: 10,
      fontSize: 10,
      color: accent,
    },
    bulletText: {
      flex: 1,
      fontSize: 9.5,
      lineHeight: 1.4,
      color: "#374151",
    },
  });

function ModernTemplate({ resume, accent, doc }: TemplateProps) {
  const styles = modernStyles(accent);
  const { personalInfo, summary, skills, experiences, education } = resume;

  const contactItems = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.linkedin,
    personalInfo.location,
  ].filter(Boolean);

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.sidebar}>
        <Text style={styles.name}>{personalInfo.fullName || doc.nameNotProvided}</Text>

        {contactItems.length > 0 ? (
          <View>
            <Text style={styles.sidebarSectionTitle}>{doc.contact}</Text>
            {contactItems.map((item, index) => (
              <Text key={`${item}-${index}`} style={styles.contactItem}>
                {item}
              </Text>
            ))}
          </View>
        ) : null}

        {skills.length > 0 ? (
          <View>
            <Text style={styles.sidebarSectionTitle}>{doc.skills}</Text>
            {skills.map((skill, index) => (
              <Text key={`${skill}-${index}`} style={styles.sidebarSkill}>
                • {skill}
              </Text>
            ))}
          </View>
        ) : null}

        {education.length > 0 ? (
          <View>
            <Text style={styles.sidebarSectionTitle}>{doc.education}</Text>
            {education.map((edu, index) => (
              <View key={`${edu.institution}-${index}`} style={styles.educationBlockSidebar}>
                <Text style={styles.degreeSidebar}>{edu.degree}</Text>
                <Text style={styles.institutionSidebar}>
                  {edu.institution}
                  {edu.year ? ` • ${edu.year}` : ""}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.main}>
        {summary ? (
          <View>
            <Text style={styles.mainSectionTitle}>{doc.profile}</Text>
            <Text style={styles.paragraph}>{summary}</Text>
          </View>
        ) : null}

        {experiences.length > 0 ? (
          <View>
            <Text style={styles.mainSectionTitle}>{doc.experienceShort}</Text>
            {experiences.map((exp, index) => (
              <View key={`${exp.company}-${index}`} style={styles.experienceBlock} wrap={false}>
                <Text style={styles.role}>{exp.role}</Text>
                <Text style={styles.company}>{exp.company}</Text>
                <Text style={styles.period}>{exp.period}</Text>
                {exp.bulletPoints.map((point, pointIndex) => (
                  <View key={pointIndex} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{point}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Page>
  );
}

const minimalStyles = (accent: string) =>
  StyleSheet.create({
    page: {
      paddingTop: 48,
      paddingBottom: 48,
      paddingHorizontal: 56,
      fontSize: 10,
      fontFamily: "Helvetica",
      color: "#27272a",
    },
    name: {
      fontSize: 20,
      fontFamily: "Helvetica",
      color: "#18181b",
      marginBottom: 6,
      letterSpacing: 0.5,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 22,
    },
    contactItem: {
      fontSize: 8.5,
      color: "#71717a",
    },
    sectionTitle: {
      fontSize: 9,
      fontFamily: "Helvetica-Bold",
      color: accent,
      textTransform: "uppercase",
      letterSpacing: 2,
      marginBottom: 8,
      marginTop: 18,
    },
    paragraph: {
      fontSize: 9.5,
      lineHeight: 1.6,
      color: "#3f3f46",
    },
    skillsInline: {
      fontSize: 9.5,
      lineHeight: 1.6,
      color: "#3f3f46",
    },
    experienceBlock: {
      marginBottom: 12,
    },
    experienceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 1,
    },
    role: {
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
      color: "#18181b",
    },
    company: {
      fontSize: 9,
      color: "#71717a",
      marginBottom: 4,
    },
    period: {
      fontSize: 8.5,
      color: "#a1a1aa",
    },
    bulletText: {
      fontSize: 9.5,
      lineHeight: 1.5,
      color: "#3f3f46",
      marginBottom: 2,
    },
    educationBlock: {
      marginBottom: 5,
    },
    degree: {
      fontSize: 9.5,
      fontFamily: "Helvetica-Bold",
      color: "#18181b",
    },
    institution: {
      fontSize: 9,
      color: "#71717a",
    },
  });

function MinimalTemplate({ resume, accent, doc }: TemplateProps) {
  const styles = minimalStyles(accent);
  const { personalInfo, summary, skills, experiences, education } = resume;

  const contactItems = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.linkedin,
    personalInfo.location,
  ].filter(Boolean);

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.name}>{personalInfo.fullName || doc.nameNotProvided}</Text>
      <View style={styles.contactRow}>
        {contactItems.map((item, index) => (
          <Text key={`${item}-${index}`} style={styles.contactItem}>
            {item}
          </Text>
        ))}
      </View>

      {summary ? (
        <View>
          <Text style={styles.sectionTitle}>{doc.summaryShort}</Text>
          <Text style={styles.paragraph}>{summary}</Text>
        </View>
      ) : null}

      {experiences.length > 0 ? (
        <View>
          <Text style={styles.sectionTitle}>{doc.experienceShort}</Text>
          {experiences.map((exp, index) => (
            <View key={`${exp.company}-${index}`} style={styles.experienceBlock} wrap={false}>
              <View style={styles.experienceHeader}>
                <Text style={styles.role}>{exp.role}</Text>
                <Text style={styles.period}>{exp.period}</Text>
              </View>
              <Text style={styles.company}>{exp.company}</Text>
              {exp.bulletPoints.map((point, pointIndex) => (
                <Text key={pointIndex} style={styles.bulletText}>
                  — {point}
                </Text>
              ))}
            </View>
          ))}
        </View>
      ) : null}

      {skills.length > 0 ? (
        <View>
          <Text style={styles.sectionTitle}>{doc.skills}</Text>
          <Text style={styles.skillsInline}>{skills.join("  ·  ")}</Text>
        </View>
      ) : null}

      {education.length > 0 ? (
        <View>
          <Text style={styles.sectionTitle}>{doc.education}</Text>
          {education.map((edu, index) => (
            <View key={`${edu.institution}-${index}`} style={styles.educationBlock}>
              <Text style={styles.degree}>{edu.degree}</Text>
              <Text style={styles.institution}>
                {edu.institution}
                {edu.year ? ` • ${edu.year}` : ""}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </Page>
  );
}

const boldStyles = (accent: string) =>
  StyleSheet.create({
    page: {
      fontSize: 10,
      fontFamily: "Helvetica",
      color: "#1f2937",
    },
    headerBand: {
      backgroundColor: accent,
      paddingVertical: 28,
      paddingHorizontal: 44,
    },
    name: {
      fontSize: 26,
      fontFamily: "Helvetica-Bold",
      color: "#ffffff",
      marginBottom: 8,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    contactItem: {
      fontSize: 9,
      color: "#ffffff",
      opacity: 0.95,
    },
    body: {
      paddingTop: 28,
      paddingBottom: 40,
      paddingHorizontal: 44,
    },
    sectionTitle: {
      fontSize: 12,
      fontFamily: "Helvetica-Bold",
      color: accent,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 8,
      marginTop: 16,
      paddingLeft: 10,
      borderLeftWidth: 4,
      borderLeftColor: accent,
    },
    paragraph: {
      fontSize: 10,
      lineHeight: 1.5,
      color: "#374151",
    },
    skillsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    skillPill: {
      fontSize: 9,
      color: "#ffffff",
      backgroundColor: accent,
      borderRadius: 3,
      paddingVertical: 3,
      paddingHorizontal: 8,
      marginBottom: 4,
    },
    experienceBlock: {
      marginBottom: 10,
    },
    experienceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    role: {
      fontSize: 11,
      fontFamily: "Helvetica-Bold",
      color: "#111827",
    },
    company: {
      fontSize: 10,
      color: accent,
    },
    period: {
      fontSize: 9,
      color: "#6b7280",
    },
    bullet: {
      flexDirection: "row",
      marginBottom: 2,
    },
    bulletDot: {
      width: 10,
      fontSize: 10,
      color: accent,
    },
    bulletText: {
      flex: 1,
      fontSize: 9.5,
      lineHeight: 1.4,
      color: "#374151",
    },
    educationBlock: {
      marginBottom: 6,
    },
    degree: {
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
      color: "#111827",
    },
    institution: {
      fontSize: 9.5,
      color: "#4b5563",
    },
  });

function BoldTemplate({ resume, accent, doc }: TemplateProps) {
  const styles = boldStyles(accent);
  const { personalInfo, summary, skills, experiences, education } = resume;

  const contactItems = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.linkedin,
    personalInfo.location,
  ].filter(Boolean);

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.headerBand}>
        <Text style={styles.name}>{personalInfo.fullName || doc.nameNotProvided}</Text>
        <View style={styles.contactRow}>
          {contactItems.map((item, index) => (
            <Text key={`${item}-${index}`} style={styles.contactItem}>
              {item}
              {index < contactItems.length - 1 ? "  •" : ""}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.body}>
        {summary ? (
          <View>
            <Text style={styles.sectionTitle}>{doc.summary}</Text>
            <Text style={styles.paragraph}>{summary}</Text>
          </View>
        ) : null}

        {skills.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>{doc.skills}</Text>
            <View style={styles.skillsRow}>
              {skills.map((skill, index) => (
                <Text key={`${skill}-${index}`} style={styles.skillPill}>
                  {skill}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        {experiences.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>{doc.experience}</Text>
            {experiences.map((exp, index) => (
              <View key={`${exp.company}-${index}`} style={styles.experienceBlock} wrap={false}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.role}>{exp.role}</Text>
                  <Text style={styles.period}>{exp.period}</Text>
                </View>
                <Text style={styles.company}>{exp.company}</Text>
                {exp.bulletPoints.map((point, pointIndex) => (
                  <View key={pointIndex} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{point}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {education.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>{doc.education}</Text>
            {education.map((edu, index) => (
              <View key={`${edu.institution}-${index}`} style={styles.educationBlock}>
                <Text style={styles.degree}>{edu.degree}</Text>
                <Text style={styles.institution}>
                  {edu.institution}
                  {edu.year ? ` • ${edu.year}` : ""}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Page>
  );
}

interface ResumeDocumentProps {
  resume: OptimizedResume;
  themeColor: ThemeColorKey;
  templateId: ResumeTemplateKey;
  language: Language;
}

export function ResumeDocument({ resume, themeColor, templateId, language }: ResumeDocumentProps) {
  const accent = THEME_COLORS[themeColor];
  const doc = translations[language].doc;

  return (
    <Document title={`Resume - ${resume.personalInfo.fullName || doc.nameNotProvided}`}>
      {templateId === "modern" ? (
        <ModernTemplate resume={resume} accent={accent} doc={doc} />
      ) : templateId === "minimal" ? (
        <MinimalTemplate resume={resume} accent={accent} doc={doc} />
      ) : templateId === "bold" ? (
        <BoldTemplate resume={resume} accent={accent} doc={doc} />
      ) : (
        <ClassicTemplate resume={resume} accent={accent} doc={doc} />
      )}
    </Document>
  );
}
