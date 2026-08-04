import { Injectable } from '@nestjs/common';
import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { BaseResumeRenderer } from './base-resume.renderer';
import type { ResumeTemplate } from './resume-template.model';
import type { ResumeRenderData } from './resume-render.types';

@Injectable()
export class ClassicResumeRenderer extends BaseResumeRenderer {
  supports(template: ResumeTemplate): boolean {
    return this.isTemplateMatch(template, ['Classic', 'क्लासिक']);
  }

  protected buildDocument(data: ResumeRenderData) {
    const labels = this.getLabels(data.template.language);
    const styles = this.createStyles({
      page: {
        paddingTop: 32,
        paddingBottom: 32,
        paddingHorizontal: 36,
        fontSize: 10,
        color: '#1f2933',
        fontFamily: 'Helvetica',
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 2,
        borderBottomColor: '#1f3a5f',
        paddingBottom: 12,
        marginBottom: 18,
      },
      headerIdentity: {
        flexGrow: 1,
        paddingRight: 16,
      },
      headerMeta: {
        width: 150,
        backgroundColor: '#d9e2ec',
        borderRadius: 6,
        padding: 8,
      },
      name: {
        fontSize: 21,
        fontWeight: 700,
        color: '#1f3a5f',
        marginBottom: 4,
      },
      contact: {
        fontSize: 10,
      },
      metaLabel: {
        fontSize: 8,
        textTransform: 'uppercase',
        color: '#52606d',
        marginBottom: 2,
      },
      metaValue: {
        fontSize: 11,
        fontWeight: 700,
        marginBottom: 4,
      },
      metaSecondary: {
        fontSize: 9,
        color: '#52606d',
        marginBottom: 2,
      },
      section: {
        marginBottom: 14,
      },
      sectionTitle: {
        fontSize: 11,
        fontWeight: 700,
        color: '#1f3a5f',
        textTransform: 'uppercase',
        marginBottom: 8,
      },
      paragraph: {
        fontSize: 10,
        lineHeight: 1.45,
      },
      entry: {
        marginBottom: 8,
      },
      entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
      },
      entryTitle: {
        fontSize: 10,
        fontWeight: 700,
        width: '72%',
      },
      entryDate: {
        fontSize: 9,
        color: '#52606d',
        textAlign: 'right',
        width: '28%',
      },
      entrySubtitle: {
        fontSize: 9,
        color: '#52606d',
        marginBottom: 2,
      },
      skillList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
      },
      skillChip: {
        backgroundColor: '#d9e2ec',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 6,
        marginBottom: 6,
      },
      skillText: {
        fontSize: 9,
        color: '#1f2933',
      },
    });

    return this.createDocument(
      data,
      this.createPage(
        styles,
        React.createElement(
          View,
          { style: styles.header },
          React.createElement(
            View,
            { style: styles.headerIdentity },
            React.createElement(Text, { style: styles.name }, data.user.name),
            React.createElement(
              Text,
              { style: styles.contact },
              data.user.email,
            ),
          ),
          React.createElement(
            View,
            { style: styles.headerMeta },
            React.createElement(
              Text,
              { style: styles.metaLabel },
              labels.targetRole,
            ),
            React.createElement(
              Text,
              { style: styles.metaValue },
              data.jobAd.title,
            ),
            data.jobAd.location
              ? React.createElement(
                  Text,
                  { style: styles.metaSecondary },
                  data.jobAd.location,
                )
              : null,
            React.createElement(
              Text,
              { style: styles.metaSecondary },
              `${labels.atsScore}: ${data.atsScore.toFixed(0)}%`,
            ),
          ),
        ),
        this.view(
          styles.section,
          this.text(styles.sectionTitle, labels.profile),
          this.text(styles.paragraph, this.createSummary(data)),
        ),
        ...(data.workExperiences.length
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
          : []),
        ...(data.educations.length
          ? [
              this.view(
                styles.section,
                this.text(styles.sectionTitle, labels.education),
                ...data.educations.map((education) =>
                  this.view(
                    styles.entry,
                    this.view(
                      styles.entryHeader,
                      this.text(styles.entryTitle, education.institution),
                      this.text(
                        styles.entryDate,
                        this.formatDateRange(
                          data.template.language,
                          education.startDate,
                          education.endDate,
                        ),
                      ),
                    ),
                    this.text(
                      styles.entrySubtitle,
                      [
                        education.degree,
                        education.fieldOfStudy
                          ? `(${education.fieldOfStudy})`
                          : null,
                      ]
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
          : []),
        ...(data.skills.length
          ? [
              this.view(
                styles.section,
                this.text(styles.sectionTitle, labels.skills),
                React.createElement(
                  View,
                  { style: styles.skillList },
                  ...data.skills.map((skill) =>
                    React.createElement(
                      View,
                      { key: skill.id, style: styles.skillChip },
                      React.createElement(
                        Text,
                        { style: styles.skillText },
                        skill.proficiencyLevel
                          ? `${skill.skillName} - ${skill.proficiencyLevel}`
                          : skill.skillName,
                      ),
                    ),
                  ),
                ),
              ),
            ]
          : []),
        ...(data.projects.length
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
          : []),
      ),
    );
  }
}
