import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AtsAiFeedback {
  currentScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvementAreas: Array<{ area: string; detail: string }>;
  skillRecommendations: Array<{ skill: string; why: string }>;
  projectSuggestions: Array<{
    name: string;
    description: string;
    skills: string[];
    why: string;
  }>;
  rawResponse?: string;
}

export interface ResumeTailoringAiResult {
  headline: string;
  profileSummary: string;
  selectedSkillIds: string[];
  selectedWorkExperiences: Array<{
    id: string;
    rewrittenDescription: string | null;
    relevanceReason: string;
  }>;
  selectedProjects: Array<{
    id: string;
    rewrittenDescription: string | null;
    relevanceReason: string;
  }>;
  selectedEducationIds: string[];
  omittedItemIds: {
    skillIds: string[];
    workExperienceIds: string[];
    projectIds: string[];
    educationIds: string[];
  };
  rawResponse?: string;
}

@Injectable()
export class OpenAiService {
  private readonly openAiApiKey?: string;
  private readonly azureApiKey?: string;
  private readonly model: string;
  private readonly openAiEndpoint: string;
  private readonly azureEndpoint?: string;
  private readonly azureDeployment?: string;
  private readonly azureApiVersion: string;

  constructor(private readonly configService: ConfigService) {
    this.openAiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.azureApiKey = this.configService.get<string>('AZURE_OPENAI_API_KEY');
    this.model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4.1-mini');
    this.openAiEndpoint = this.configService.get<string>(
      'OPENAI_API_BASE_URL',
      'https://api.openai.com/v1/chat/completions',
    );
    this.azureEndpoint = this.configService.get<string>(
      'AZURE_OPENAI_ENDPOINT',
    );
    this.azureDeployment = this.configService.get<string>(
      'AZURE_OPENAI_DEPLOYMENT_NAME',
    );
    this.azureApiVersion = this.configService.get<string>(
      'AZURE_OPENAI_API_VERSION',
      '2023-05-15',
    );
  }

  async generateAtsFeedback(input: {
    jobAd: { title: string; description: string; requirements: string };
    educations: Array<{
      institution: string;
      degree: string | null;
      fieldOfStudy: string | null;
    }>;
    workExperiences: Array<{
      company: string;
      role: string;
      description: string | null;
    }>;
    skills: Array<{ skillName: string; proficiencyLevel: string | null }>;
    projects: Array<{
      projectName: string;
      description: string | null;
      techStack: string | null;
    }>;
    localScore: number;
  }): Promise<AtsAiFeedback | null> {
    if (!this.isConfigured()) {
      return null;
    }

    const messages = [
      {
        role: 'system',
        content:
          'You are an expert career advisor specialized in technical hiring, resume optimization, and ATS feedback.',
      },
      {
        role: 'user',
        content: `I will provide a job advertisement and a candidate profile. Return only valid JSON with the exact keys below and no markdown:\n\n${JSON.stringify(
          {
            currentScore: input.localScore,
            summary: 'string',
            strengths: ['string'],
            weaknesses: ['string'],
            improvementAreas: [{ area: 'string', detail: 'string' }],
            skillRecommendations: [{ skill: 'string', why: 'string' }],
            projectSuggestions: [
              {
                name: 'string',
                description: 'string',
                skills: ['string'],
                why: 'string',
              },
            ],
          },
          null,
          2,
        )}\n\nUse the job ad and candidate profile to provide constructive guidance. Make the recommendations specific to the role and explain why each recommended skill and project matters for the target job. If the profile already contains some strengths, include them.`,
      },
      {
        role: 'user',
        content: `Job advertisement:\nTitle: ${input.jobAd.title}\nDescription: ${input.jobAd.description}\nRequirements: ${input.jobAd.requirements}\n\nCandidate profile:\nEducations: ${JSON.stringify(input.educations, null, 2)}\nWork experiences: ${JSON.stringify(input.workExperiences, null, 2)}\nSkills: ${JSON.stringify(input.skills, null, 2)}\nProjects: ${JSON.stringify(input.projects, null, 2)}\n\nDo not include anything other than the JSON object described above.`,
      },
    ];

    const content = await this.requestJsonCompletion(messages, 900);
    const feedback = this.parseJson<AtsAiFeedback>(content);
    return {
      ...(feedback ?? {}),
      rawResponse: content,
    } as AtsAiFeedback;
  }

  async generateTailoredResumeContent(input: {
    language: string;
    jobAd: {
      title: string;
      description: string;
      requirements: string;
      location: string | null;
    };
    user: {
      name: string;
      email: string;
    };
    educations: Array<{
      id: string;
      institution: string;
      degree: string | null;
      fieldOfStudy: string | null;
      startDate: string | null;
      endDate: string | null;
      description: string | null;
    }>;
    workExperiences: Array<{
      id: string;
      company: string;
      role: string;
      startDate: string | null;
      endDate: string | null;
      description: string | null;
    }>;
    skills: Array<{
      id: string;
      skillName: string;
      proficiencyLevel: string | null;
    }>;
    projects: Array<{
      id: string;
      projectName: string;
      description: string | null;
      startDate: string | null;
      endDate: string | null;
      techStack: string | null;
    }>;
  }): Promise<ResumeTailoringAiResult | null> {
    if (!this.isConfigured()) {
      return null;
    }

    const responseShape = {
      headline: 'string',
      profileSummary: 'string',
      selectedSkillIds: ['string'],
      selectedWorkExperiences: [
        {
          id: 'string',
          rewrittenDescription: 'string | null',
          relevanceReason: 'string',
        },
      ],
      selectedProjects: [
        {
          id: 'string',
          rewrittenDescription: 'string | null',
          relevanceReason: 'string',
        },
      ],
      selectedEducationIds: ['string'],
      omittedItemIds: {
        skillIds: ['string'],
        workExperienceIds: ['string'],
        projectIds: ['string'],
        educationIds: ['string'],
      },
    };

    const messages = [
      {
        role: 'system',
        content:
          'You are an expert resume strategist and technical recruiter. Tailor resumes truthfully for a target role. Use only facts present in the candidate profile. Never invent employers, projects, metrics, achievements, dates, or skills. Decide what to keep, what to omit, and how to rewrite descriptions so they sound strong, concise, and ATS-friendly for the target role. Return only valid JSON.',
      },
      {
        role: 'user',
        content: `Tailor this candidate resume for the target role and return only valid JSON matching this schema:\n${JSON.stringify(
          responseShape,
          null,
          2,
        )}\n\nRules:\n- Output all prose in ${input.language === 'hi' ? 'Hindi' : 'English'}.\n- Headline must be at most 12 words.\n- Profile summary must be 2 to 3 sentences.\n- Select only the most relevant skills, work experiences, projects, and educations for this job.\n- Prefer 6 to 12 skills, 2 to 4 work experiences, 2 to 4 projects, and 1 to 3 educations when enough relevant options exist.\n- rewrittenDescription must stay faithful to the original content while emphasizing relevance to the job.\n- relevanceReason should be short and specific.\n- If an item's original description is empty, keep rewrittenDescription as null.\n- Every omitted item should appear in omittedItemIds.\n- Do not include markdown or explanatory text.`,
      },
      {
        role: 'user',
        content: `Target job:\n${JSON.stringify(
          input.jobAd,
          null,
          2,
        )}\n\nCandidate basics:\n${JSON.stringify(
          input.user,
          null,
          2,
        )}\n\nEducations:\n${JSON.stringify(
          input.educations,
          null,
          2,
        )}\n\nWork experiences:\n${JSON.stringify(
          input.workExperiences,
          null,
          2,
        )}\n\nSkills:\n${JSON.stringify(
          input.skills,
          null,
          2,
        )}\n\nProjects:\n${JSON.stringify(
          input.projects,
          null,
          2,
        )}`,
      },
    ];

    const content = await this.requestJsonCompletion(messages, 1400);
    const parsed = this.parseJson<ResumeTailoringAiResult>(content);
    if (!parsed || !this.isValidResumeTailoringResult(parsed)) {
      return null;
    }

    return {
      ...parsed,
      rawResponse: content,
    };
  }

  private isConfigured(): boolean {
    const useAzure =
      !!this.azureApiKey && !!this.azureEndpoint && !!this.azureDeployment;
    const useOpenAi = !!this.openAiApiKey;
    return useAzure || useOpenAi;
  }

  private async requestJsonCompletion(
    messages: Array<{ role: string; content: string }>,
    maxTokens: number,
  ): Promise<string> {
    const useAzure =
      !!this.azureApiKey && !!this.azureEndpoint && !!this.azureDeployment;

    if (typeof fetch !== 'function') {
      throw new InternalServerErrorException(
        'Global fetch is not available in this Node environment',
      );
    }

    const url = useAzure
      ? `${this.azureEndpoint}/openai/deployments/${encodeURIComponent(
          this.azureDeployment!,
        )}/chat/completions?api-version=${encodeURIComponent(
          this.azureApiVersion,
        )}`
      : this.openAiEndpoint;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (useAzure) {
      headers['api-key'] = this.azureApiKey!;
    } else {
      headers.Authorization = `Bearer ${this.openAiApiKey}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.3,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new InternalServerErrorException(
        `OpenAI request failed: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new InternalServerErrorException(
        'OpenAI response did not contain a message',
      );
    }

    return content;
  }

  private parseJson<T>(content: string): T | null {
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }

    const candidate = content.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate) as T;
    } catch {
      try {
        return JSON.parse(content) as T;
      } catch {
        return null;
      }
    }
  }

  private isValidResumeTailoringResult(
    value: ResumeTailoringAiResult,
  ): value is ResumeTailoringAiResult {
    return (
      !!value &&
      typeof value.headline === 'string' &&
      typeof value.profileSummary === 'string' &&
      Array.isArray(value.selectedSkillIds) &&
      Array.isArray(value.selectedWorkExperiences) &&
      Array.isArray(value.selectedProjects) &&
      Array.isArray(value.selectedEducationIds) &&
      !!value.omittedItemIds &&
      Array.isArray(value.omittedItemIds.skillIds) &&
      Array.isArray(value.omittedItemIds.workExperienceIds) &&
      Array.isArray(value.omittedItemIds.projectIds) &&
      Array.isArray(value.omittedItemIds.educationIds) &&
      value.selectedSkillIds.every((id) => typeof id === 'string') &&
      value.selectedEducationIds.every((id) => typeof id === 'string') &&
      value.selectedWorkExperiences.every(
        (item) =>
          !!item &&
          typeof item.id === 'string' &&
          (typeof item.rewrittenDescription === 'string' ||
            item.rewrittenDescription === null) &&
          typeof item.relevanceReason === 'string',
      ) &&
      value.selectedProjects.every(
        (item) =>
          !!item &&
          typeof item.id === 'string' &&
          (typeof item.rewrittenDescription === 'string' ||
            item.rewrittenDescription === null) &&
          typeof item.relevanceReason === 'string',
      )
    );
  }
}
