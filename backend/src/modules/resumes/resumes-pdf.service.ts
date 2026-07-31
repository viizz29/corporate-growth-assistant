import { Injectable, NotFoundException } from '@nestjs/common';
import { ClassicResumeRenderer } from './classic-resume.renderer';
import { ExecutiveResumeRenderer } from './executive-resume.renderer';
import { ModernResumeRenderer } from './modern-resume.renderer';
import type { ResumeRenderData, ResumeTemplateRenderer } from './resume-render.types';

@Injectable()
export class ResumesPdfService {
  private readonly renderers: ResumeTemplateRenderer[];

  constructor(
    classicResumeRenderer: ClassicResumeRenderer,
    modernResumeRenderer: ModernResumeRenderer,
    executiveResumeRenderer: ExecutiveResumeRenderer,
  ) {
    this.renderers = [
      classicResumeRenderer,
      modernResumeRenderer,
      executiveResumeRenderer,
    ];
  }

  async render(data: ResumeRenderData): Promise<Buffer> {
    const renderer = this.renderers.find((candidate) =>
      candidate.supports(data.template),
    );

    if (!renderer) {
      throw new NotFoundException(
        `No PDF renderer registered for template "${data.template.name}"`,
      );
    }

    return renderer.render(data);
  }
}
