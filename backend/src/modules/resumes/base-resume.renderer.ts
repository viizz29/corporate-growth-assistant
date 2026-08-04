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
} from './resume-render.types';

type ResumeLabels = {
  targetRole: string;
  atsScore: string;
  profile: string;
  experience: string;
  education: string;
  skills: string;
  projects: string;
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
        subject: `Resume tailored for ${data.jobAd.title}`,
        language: data.template.language,
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
        atsScore: 'एटीएस स्कोर',
        profile: 'प्रोफ़ाइल',
        experience: 'अनुभव',
        education: 'शिक्षा',
        skills: 'कौशल',
        projects: 'प्रोजेक्ट्स',
        techStack: 'टेक स्टैक',
        present: 'वर्तमान',
      };
    }

    return {
      targetRole: 'Target Role',
      atsScore: 'ATS Score',
      profile: 'Profile',
      experience: 'Experience',
      education: 'Education',
      skills: 'Skills',
      projects: 'Projects',
      techStack: 'Tech Stack',
      present: 'Present',
    };
  }

  protected createSummary(data: ResumeRenderData): string {
    const strongestSkill = data.skills[0]?.skillName;
    const latestRole = data.workExperiences[0]?.role;

    return [
      `${data.user.name} is preparing a targeted resume for the ${data.jobAd.title} role.`,
      latestRole ? `Recent experience includes ${latestRole}.` : null,
      strongestSkill
        ? `Core strengths include ${strongestSkill} and other role-relevant skills.`
        : null,
      `This version is aligned against the job requirements with an ATS score of ${data.atsScore.toFixed(0)}%.`,
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

  protected text(style: any, value: string): ReactElement {
    return React.createElement(Text, { style }, value);
  }

  protected view(
    style: any,
    ...children: Array<ReactElement | null>
  ): ReactElement {
    return React.createElement(View, { style }, ...children.filter(Boolean));
  }
}
