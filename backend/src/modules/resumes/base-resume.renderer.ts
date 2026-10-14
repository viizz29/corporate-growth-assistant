import { Injectable } from '@nestjs/common';
import React from 'react';
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from '@react-pdf/renderer';
import type { ReactElement } from 'react';
import type { DocumentProps } from '@react-pdf/renderer';
import type { ResumeTemplate } from './resume-template.model';
import type {
  ResumeRenderData,
  ResumeTemplateRenderer,
  TailoredResumeLanguage,
} from './resume-render.types';

type ResumeLabels = {
  targetRole: string;
  headline: string;
  atsScore: string;
  profile: string;
  experience: string;
  education: string;
  skills: string;
  projects: string;
  languages: string;
  techStack: string;
  present: string;
};

@Injectable()
export abstract class BaseResumeRenderer implements ResumeTemplateRenderer {
  async render(data: ResumeRenderData): Promise<Buffer> {
    const pdfBuffer = await renderToBuffer(this.buildDocument(data));
    return Buffer.from(pdfBuffer);
  }

  abstract supports(template: ResumeTemplate): boolean;

  protected abstract buildDocument(
    data: ResumeRenderData,
  ): ReactElement<DocumentProps>;

  protected createDocument(
    data: ResumeRenderData,
    page: ReactElement,
  ): ReactElement<DocumentProps> {
    return React.createElement(
      Document,
      {
        title: `${data.user.name} Resume`,
        author: data.user.name,
        subject: data.jobAd
          ? `Resume tailored for ${data.jobAd.title}`
          : 'General purpose resume',
        language: data.language,
      },
      page,
    );
  }

  protected createPage(
    styles: Record<string, any>,
    ...children: ReactElement[]
  ) {
    return React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      ...children,
    );
  }

  protected getLabels(language: string): ResumeLabels {
    if (language === 'hi') {
      return {
        targetRole: 'लक्षित भूमिका',
        headline: 'शीर्षक',
        atsScore: 'एटीएस स्कोर',
        profile: 'प्रोफ़ाइल',
        experience: 'अनुभव',
        education: 'शिक्षा',
        skills: 'कौशल',
        projects: 'प्रोजेक्ट्स',
        languages: 'भाषाएँ',
        techStack: 'टेक स्टैक',
        present: 'वर्तमान',
      };
    }

    return {
      targetRole: 'Target Role',
      headline: 'Headline',
      atsScore: 'ATS Score',
      profile: 'Profile',
      experience: 'Experience',
      education: 'Education',
      skills: 'Skills',
      projects: 'Projects',
      languages: 'Languages',
      techStack: 'Tech Stack',
      present: 'Present',
    };
  }

  protected createSummary(data: ResumeRenderData): string {
    return data.tailoredContent.profileSummary;
  }

  protected createHeadline(data: ResumeRenderData): string {
    return data.tailoredContent.headline || data.jobAd?.title || '';
  }

  protected getResumeSkills(data: ResumeRenderData) {
    return data.tailoredContent.skills;
  }

  protected getResumeWorkExperiences(data: ResumeRenderData) {
    return data.tailoredContent.workExperiences;
  }

  protected getResumeProjects(data: ResumeRenderData) {
    return data.tailoredContent.projects;
  }

  protected getResumeEducations(data: ResumeRenderData) {
    return data.tailoredContent.educations;
  }

  protected getResumeLanguages(data: ResumeRenderData) {
    return data.tailoredContent.languages;
  }

  private static readonly languageProficiencyRatios: ReadonlyArray<{
    keywords: string[];
    ratio: number;
  }> = [
    {
      keywords: ['native', 'mother tongue', 'bilingual', 'मातृभाषा'],
      ratio: 1,
    },
    {
      keywords: ['fluent', 'full professional', 'धाराप्रवाह'],
      ratio: 0.9,
    },
    { keywords: ['advanced', 'उन्नत'], ratio: 0.8 },
    {
      keywords: ['intermediate', 'conversational', 'working', 'मध्यवर्ती'],
      ratio: 0.6,
    },
    {
      keywords: ['elementary', 'basic', 'beginner', 'प्रारंभिक'],
      ratio: 0.3,
    },
  ];

  protected getLanguageProficiencyRatio(level?: string | null): number {
    if (!level) {
      return 0.5;
    }

    const normalized = level.trim().toLowerCase();
    if (!normalized) {
      return 0.5;
    }

    const match = BaseResumeRenderer.languageProficiencyRatios.find((entry) =>
      entry.keywords.some((keyword) => normalized.includes(keyword)),
    );

    return match ? match.ratio : 0.5;
  }

  protected createLanguageBar(
    styles: ReturnType<typeof StyleSheet.create>,
    language: TailoredResumeLanguage,
  ): ReactElement {
    const ratio = this.getLanguageProficiencyRatio(language.proficiencyLevel);

    return React.createElement(
      View,
      { key: language.id, style: styles.languageRow as any },
      React.createElement(
        View,
        { style: styles.languageHeader as any },
        React.createElement(
          Text,
          { style: styles.languageName as any },
          language.languageName,
        ),
        language.proficiencyLevel
          ? React.createElement(
              Text,
              { style: styles.languageLevel as any },
              language.proficiencyLevel,
            )
          : null,
      ),
      React.createElement(
        View,
        { style: styles.languageBarTrack as any },
        React.createElement(View, {
          style: [
            styles.languageBarFill as any,
            { width: `${Math.round(ratio * 100)}%` },
          ],
        }),
      ),
    );
  }

  protected createFallbackSummary(data: ResumeRenderData): string {
    const strongestSkill = this.getResumeSkills(data)[0]?.skillName;
    const latestRole = this.getResumeWorkExperiences(data)[0]?.role;

    const intro = data.jobAd
      ? `${data.user.name} is preparing a targeted resume for the ${data.jobAd.title} role.`
      : `${data.user.name} is presenting a general purpose resume that highlights their overall experience and strengths.`;

    const atsLine = data.jobAd
      ? `This version is aligned against the job requirements with an ATS score of ${data.atsScore.toFixed(0)}%.`
      : null;

    return [
      intro,
      latestRole ? `Recent experience includes ${latestRole}.` : null,
      strongestSkill
        ? `Core strengths include ${strongestSkill} and other role-relevant skills.`
        : null,
      atsLine,
    ]
      .filter(Boolean)
      .join(' ');
  }

  protected formatDateRange(
    language: string,
    startDate?: string | null,
    endDate?: string | null,
  ): string {
    if (!startDate && !endDate) {
      return '';
    }

    return `${this.formatMonthYear(language, startDate)} - ${this.formatMonthYear(language, endDate)}`;
  }

  protected formatMonthYear(language: string, date?: string | null): string {
    if (!date) {
      return this.getLabels(language).present;
    }

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }

  protected isTemplateMatch(
    template: ResumeTemplate,
    names: string[],
  ): boolean {
    const normalizedName = template.name.trim().toLowerCase();
    return names.some((name) => normalizedName === name.trim().toLowerCase());
  }

  protected createStyles<T extends Parameters<typeof StyleSheet.create>[0]>(
    styles: T,
  ) {
    return StyleSheet.create(styles);
  }

  protected text(style: unknown, value: string): ReactElement {
    return React.createElement(Text, { style } as any, value);
  }

  protected view(
    style: unknown,
    ...children: Array<ReactElement | null>
  ): ReactElement {
    return React.createElement(
      View,
      { style } as any,
      ...children.filter(Boolean),
    );
  }
}
