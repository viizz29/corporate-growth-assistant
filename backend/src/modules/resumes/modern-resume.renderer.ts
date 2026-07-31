import { Injectable } from '@nestjs/common';
import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { BaseResumeRenderer } from './base-resume.renderer';
import type { ResumeTemplate } from './resume-template.model';
import type { ResumeRenderData } from './resume-render.types';

@Injectable()
export class ModernResumeRenderer extends BaseResumeRenderer {
  supports(template: ResumeTemplate): boolean {
    return this.isTemplateMatch(template, ['Modern', 'आधुनिक']);
  }

  protected buildDocument(data: ResumeRenderData) {
    const labels = this.getLabels(data.template.language);
    const styles = this.createStyles({
      page: {
        padding: 28,
        fontSize: 10,
        color: '#0f172a',
        fontFamily: 'Helvetica',
        backgroundColor: '#f8fafc',
      },
      shell: {
        flexDirection: 'row',
        minHeight: '100%',
      },
      sidebar: {
        width: '30%',
        backgroundColor: '#0f766e',
        color: '#f0fdfa',
        padding: 18,
      },
      main: {
        width: '70%',
        paddingTop: 6,
        paddingLeft: 18,
      },
      name: {
        fontSize: 22,
        fontWeight: 700,
        marginBottom: 4,
      },
      contact: {
        fontSize: 9,
        marginBottom: 12,
      },
      sidebarTitle: {
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        marginBottom: 6,
      },
      sidebarText: {
        fontSize: 9,
        lineHeight: 1.45,
        marginBottom: 10,
      },
      section: {
        marginBottom: 14,
      },
      sectionTitle: {
        fontSize: 11,
        fontWeight: 700,
        color: '#0f766e',
        borderBottomWidth: 1,
        borderBottomColor: '#99f6e4',
        paddingBottom: 4,
        marginBottom: 8,
        textTransform: 'uppercase',
      },
      leadRole: {
        fontSize: 13,
        fontWeight: 700,
        color: '#134e4a',
        marginBottom: 4,
      },
      leadMeta: {
        fontSize: 9,
        color: '#115e59',
        marginBottom: 10,
      },
      paragraph: {
        fontSize: 10,
        lineHeight: 1.45,
      },
      entry: {
        marginBottom: 10,
      },
      entryTitle: {
        fontSize: 10,
        fontWeight: 700,
        marginBottom: 2,
      },
      entrySubtitle: {
        fontSize: 9,
        color: '#0f766e',
        marginBottom: 2,
      },
      entryDate: {
        fontSize: 8,
        color: '#64748b',
        marginBottom: 3,
      },
      skillPill: {
        backgroundColor: '#ccfbf1',
        color: '#115e59',
        fontSize: 9,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 10,
        marginBottom: 6,
      },
    });

    return this.createDocument(
      data,
      this.createPage(
        styles,
        React.createElement(
          View,
          { style: styles.shell },
          React.createElement(
            View,
            { style: styles.sidebar },
            React.createElement(Text, { style: styles.name }, data.user.name),
            React.createElement(Text, { style: styles.contact }, data.user.email),
            React.createElement(Text, { style: styles.sidebarTitle }, labels.profile),
            React.createElement(Text, { style: styles.sidebarText }, this.createSummary(data)),
            React.createElement(Text, { style: styles.sidebarTitle }, labels.skills),
            ...data.skills.map((skill) =>
              React.createElement(
                Text,
                { key: skill.id, style: styles.skillPill },
                skill.proficiencyLevel
                  ? `${skill.skillName} - ${skill.proficiencyLevel}`
                  : skill.skillName,
              ),
            ),
          ),
          React.createElement(
            View,
            { style: styles.main },
            React.createElement(Text, { style: styles.leadRole }, data.jobAd.title),
            React.createElement(
              Text,
              { style: styles.leadMeta },
              [
                `${labels.targetRole}: ${data.jobAd.title}`,
                data.jobAd.location,
                `${labels.atsScore}: ${data.atsScore.toFixed(0)}%`,
              ]
                .filter(Boolean)
                .join(' | '),
            ),
            ...data.workExperiences.length
              ? [
                  this.view(
                    styles.section,
                    this.text(styles.sectionTitle, labels.experience),
                    ...data.workExperiences.map((experience) =>
                      this.view(
                        styles.entry,
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
                        this.text(styles.entryTitle, project.projectName),
                        this.text(
                          styles.entryDate,
                          this.formatDateRange(
                            data.template.language,
                            project.startDate,
                            project.endDate,
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
                          styles.entryDate,
                          this.formatDateRange(
                            data.template.language,
                            education.startDate,
                            education.endDate,
                          ),
                        ),
                        this.text(
                          styles.entrySubtitle,
                          [education.degree, education.fieldOfStudy ? `(${education.fieldOfStudy})` : null]
                            .filter(Boolean)
                            .join(' '),
                        ),
                        education.description
                          ? this.text(styles.paragraph, education.description)
                          : null,
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
