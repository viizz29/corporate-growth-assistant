import { Injectable } from '@nestjs/common';
import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { BaseResumeRenderer } from './base-resume.renderer';
import type { ResumeTemplate } from './resume-template.model';
import type { ResumeRenderData } from './resume-render.types';

@Injectable()
export class ExecutiveResumeRenderer extends BaseResumeRenderer {
  supports(template: ResumeTemplate): boolean {
    return this.isTemplateMatch(template, ['Executive']);
  }

  protected buildDocument(data: ResumeRenderData) {
    const labels = this.getLabels(data.template.language);
    const styles = this.createStyles({
      page: {
        paddingTop: 34,
        paddingBottom: 30,
        paddingHorizontal: 34,
        fontSize: 10,
        color: '#292524',
        fontFamily: 'Helvetica',
      },
      masthead: {
        alignItems: 'center',
        marginBottom: 18,
      },
      name: {
        fontSize: 24,
        fontWeight: 700,
        color: '#7c2d12',
        marginBottom: 4,
      },
      contact: {
        fontSize: 10,
        marginBottom: 6,
      },
      roleLine: {
        fontSize: 10,
        color: '#9a3412',
      },
      summaryBand: {
        backgroundColor: '#ffedd5',
        borderLeftWidth: 4,
        borderLeftColor: '#c2410c',
        padding: 12,
        marginBottom: 16,
      },
      summaryText: {
        fontSize: 10,
        lineHeight: 1.5,
      },
      section: {
        marginBottom: 14,
      },
      sectionTitle: {
        fontSize: 11,
        fontWeight: 700,
        color: '#7c2d12',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
      },
      twoColumn: {
        flexDirection: 'row',
      },
      primaryColumn: {
        width: '64%',
        paddingRight: 14,
      },
      secondaryColumn: {
        width: '36%',
        paddingLeft: 14,
        borderLeftWidth: 1,
        borderLeftColor: '#fed7aa',
      },
      entry: {
        marginBottom: 10,
      },
      entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
      },
      entryTitle: {
        fontSize: 10,
        fontWeight: 700,
        width: '68%',
      },
      entryDate: {
        fontSize: 8,
        color: '#78716c',
        textAlign: 'right',
        width: '32%',
      },
      entrySubtitle: {
        fontSize: 9,
        color: '#9a3412',
        marginBottom: 3,
      },
      paragraph: {
        fontSize: 10,
        lineHeight: 1.45,
      },
      skillItem: {
        fontSize: 9,
        marginBottom: 5,
      },
    });

    return this.createDocument(
      data,
      this.createPage(
        styles,
        React.createElement(
          View,
          { style: styles.masthead },
          React.createElement(Text, { style: styles.name }, data.user.name),
          React.createElement(Text, { style: styles.contact }, data.user.email),
          React.createElement(
            Text,
            { style: styles.roleLine },
            [
              `${labels.targetRole}: ${data.jobAd.title}`,
              data.jobAd.location,
              `${labels.atsScore}: ${data.atsScore.toFixed(0)}%`,
            ]
              .filter(Boolean)
              .join(' | '),
          ),
        ),
        React.createElement(
          View,
          { style: styles.summaryBand },
          React.createElement(Text, { style: styles.summaryText }, this.createSummary(data)),
        ),
        React.createElement(
          View,
          { style: styles.twoColumn },
          React.createElement(
            View,
            { style: styles.primaryColumn },
            ...data.workExperiences.length
              ? [
                  this.view(
                    styles.section,
                    this.text(styles.sectionTitle, labels.experience),
                    ...data.workExperiences.map((experience) =>
                      this.view(
                        styles.entry,
                        this.view(
                          styles.entryHeader,
                          this.text(
                            styles.entryTitle,
                            `${experience.role} | ${experience.company}`,
                          ),
                          this.text(
                            styles.entryDate,
                            this.formatDateRange(
                              data.template.language,
                              experience.startDate,
                              experience.endDate,
                            ),
                          ),
                        ),
                        experience.description
                          ? this.text(styles.paragraph, experience.description)
                          : null,
                      ),
                    ),
                  ),
                ]
              : [],
            ...data.projects.length
              ? [
                  this.view(
                    styles.section,
                    this.text(styles.sectionTitle, labels.projects),
                    ...data.projects.map((project) =>
                      this.view(
                        styles.entry,
                        this.view(
                          styles.entryHeader,
                          this.text(styles.entryTitle, project.projectName),
                          this.text(
                            styles.entryDate,
                            this.formatDateRange(
                              data.template.language,
                              project.startDate,
                              project.endDate,
                            ),
                          ),
                        ),
                        project.description
                          ? this.text(styles.paragraph, project.description)
                          : null,
                        project.techStack
                          ? this.text(
                              styles.entrySubtitle,
                              `${labels.techStack}: ${project.techStack}`,
                            )
                          : null,
                      ),
                    ),
                  ),
                ]
              : [],
          ),
          React.createElement(
            View,
            { style: styles.secondaryColumn },
            ...data.educations.length
              ? [
                  this.view(
                    styles.section,
                    this.text(styles.sectionTitle, labels.education),
                    ...data.educations.map((education) =>
                      this.view(
                        styles.entry,
                        this.text(styles.entryTitle, education.institution),
                        this.text(
                          styles.entrySubtitle,
                          [education.degree, education.fieldOfStudy ? `(${education.fieldOfStudy})` : null]
                            .filter(Boolean)
                            .join(' '),
                        ),
                        this.text(
                          styles.entryDate,
                          this.formatDateRange(
                            data.template.language,
                            education.startDate,
                            education.endDate,
                          ),
                        ),
                      ),
                    ),
                  ),
                ]
              : [],
            ...data.skills.length
              ? [
                  this.view(
                    styles.section,
                    this.text(styles.sectionTitle, labels.skills),
                    ...data.skills.map((skill) =>
                      this.text(
                        styles.skillItem,
                        skill.proficiencyLevel
                          ? `• ${skill.skillName} - ${skill.proficiencyLevel}`
                          : `• ${skill.skillName}`,
                      ),
                    ),
                  ),
                ]
              : [],
          ),
        ),
      ),
    );
  }
}
