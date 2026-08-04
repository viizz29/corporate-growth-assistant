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
    const useAzure =
      !!this.azureApiKey && !!this.azureEndpoint && !!this.azureDeployment;
    const useOpenAi = !!this.openAiApiKey;

    if (!useAzure && !useOpenAi) {
      return null;
    }

    if (typeof fetch !== 'function') {
      throw new InternalServerErrorException(
        'Global fetch is not available in this Node environment',
      );
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

    const isAzure = useAzure;

    const url = isAzure
      ? `${this.azureEndpoint}/openai/deployments/${encodeURIComponent(
          this.azureDeployment,
        )}/chat/completions?api-version=${encodeURIComponent(
          this.azureApiVersion,
        )}`
      : this.openAiEndpoint;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (isAzure) {
      headers['api-key'] = this.azureApiKey;
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
        max_tokens: 900,
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

    const feedback = this.parseJson(content);
    return {
      ...(feedback ?? {}),
      rawResponse: content,
    } as AtsAiFeedback;
  }

  private parseJson(content: string): AtsAiFeedback | null {
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }

    const candidate = content.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate) as AtsAiFeedback;
    } catch {
      try {
        return JSON.parse(content) as AtsAiFeedback;
      } catch {
        return null;
      }
    }
  }
}
