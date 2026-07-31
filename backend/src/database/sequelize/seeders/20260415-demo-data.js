'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const sampleEmails = Array.from({ length: 5 }).map(
      (_, index) => `user${index + 1}@example.com`,
    );
    const users = sampleEmails.map((email, index) => ({
      name: `User ${index + 1}`,
      email,
      password_hash:
        '$2b$10$KiAcpDEwGrA9eZoqouDRz.do8oWxu7brPs.Py7WbQl9cX/CDTtWD6', // password123
      is_email_verified: true,
      created_at: now,
      updated_at: now,
    }));

    await queryInterface.sequelize.transaction(async (transaction) => {
      const existingUsers = await queryInterface.sequelize.query(
        `
          SELECT user_id
          FROM users
          WHERE email IN (:sampleEmails)
        `,
        {
          replacements: { sampleEmails },
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );
      const existingUserIds = existingUsers.map((user) => user.user_id);

      if (existingUserIds.length) {
        await queryInterface.bulkDelete(
          'job_advertisements',
          { user_id: existingUserIds },
          { transaction },
        );
        await queryInterface.bulkDelete(
          'user_projects',
          { user_id: existingUserIds },
          { transaction },
        );
        await queryInterface.bulkDelete(
          'user_skills',
          { user_id: existingUserIds },
          { transaction },
        );
        await queryInterface.bulkDelete(
          'user_work_experiences',
          { user_id: existingUserIds },
          { transaction },
        );
        await queryInterface.bulkDelete(
          'user_educations',
          { user_id: existingUserIds },
          { transaction },
        );
        await queryInterface.bulkDelete(
          'users',
          { user_id: existingUserIds },
          { transaction },
        );
      }

      await queryInterface.bulkInsert('users', users, { transaction });

      const insertedUsers = await queryInterface.sequelize.query(
        `
          SELECT user_id, email
          FROM users
          WHERE email IN (:sampleEmails)
        `,
        {
          replacements: { sampleEmails },
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );

      const user1 = insertedUsers.find(
        (user) => user.email === 'user1@example.com',
      );

      if (!user1) {
        throw new Error('Seeded user user1@example.com was not found');
      }

      await queryInterface.bulkInsert(
        'user_educations',
        [
          {
            user_id: user1.user_id,
            institution: 'University of California, Berkeley',
            degree: 'B.S.',
            field_of_study: 'Computer Science',
            start_date: '2015-08-20',
            end_date: '2019-05-18',
            description:
              'Focused on distributed systems, machine learning, and developer tooling.',
            created_at: now,
            updated_at: now,
          },
          {
            user_id: user1.user_id,
            institution: 'Stanford Online',
            degree: 'Professional Certificate',
            field_of_study: 'Product Management',
            start_date: '2020-02-01',
            end_date: '2020-09-30',
            description:
              'Completed coursework in product strategy, experimentation, and roadmap planning.',
            created_at: now,
            updated_at: now,
          },
        ],
        { transaction },
      );

      await queryInterface.bulkInsert(
        'user_work_experiences',
        [
          {
            user_id: user1.user_id,
            company: 'Northstar Labs',
            role: 'Software Engineer',
            start_date: '2019-07-01',
            end_date: '2022-03-31',
            description:
              'Built internal workflow automation tools, REST APIs, and reporting dashboards for operations teams.',
            created_at: now,
            updated_at: now,
          },
          {
            user_id: user1.user_id,
            company: 'BrightPath AI',
            role: 'Senior Full Stack Engineer',
            start_date: '2022-04-15',
            end_date: null,
            description:
              'Leading delivery of AI-assisted resume tooling, profile enrichment, and job matching experiences.',
            created_at: now,
            updated_at: now,
          },
        ],
        { transaction },
      );

      await queryInterface.bulkInsert(
        'user_skills',
        [
          {
            user_id: user1.user_id,
            skill_name: 'TypeScript',
            proficiency_level: 'advanced',
            created_at: now,
            updated_at: now,
          },
          {
            user_id: user1.user_id,
            skill_name: 'NestJS',
            proficiency_level: 'advanced',
            created_at: now,
            updated_at: now,
          },
          {
            user_id: user1.user_id,
            skill_name: 'PostgreSQL',
            proficiency_level: 'intermediate',
            created_at: now,
            updated_at: now,
          },
          {
            user_id: user1.user_id,
            skill_name: 'React',
            proficiency_level: 'advanced',
            created_at: now,
            updated_at: now,
          },
          {
            user_id: user1.user_id,
            skill_name: 'Prompt Engineering',
            proficiency_level: 'intermediate',
            created_at: now,
            updated_at: now,
          },
        ],
        { transaction },
      );

      await queryInterface.bulkInsert(
        'user_projects',
        [
          {
            user_id: user1.user_id,
            project_name: 'Resume Tailor Pro',
            description:
              'An application that helps job seekers tailor resumes against job descriptions and surface ATS improvements.',
            start_date: '2024-01-10',
            end_date: null,
            tech_stack: 'NestJS, React, PostgreSQL, OpenAI API',
            created_at: now,
            updated_at: now,
          },
          {
            user_id: user1.user_id,
            project_name: 'Ops Insight Dashboard',
            description:
              'Built a data dashboard for operations leaders to monitor SLAs, incidents, and team throughput.',
            start_date: '2021-06-01',
            end_date: '2022-02-28',
            tech_stack: 'Node.js, Vue, PostgreSQL, Redis',
            created_at: now,
            updated_at: now,
          },
        ],
        { transaction },
      );

      await queryInterface.bulkInsert(
        'job_advertisements',
        [
          {
            user_id: user1.user_id,
            title: 'Senior Backend Engineer',
            description:
              'Join our platform team to design resilient APIs, improve system reliability, and support AI-powered product workflows.',
            requirements:
              '5+ years building backend services, strong TypeScript or Node.js skills, SQL proficiency, and experience with cloud infrastructure.',
            location: 'Remote - US',
            language: 'en',
            created_at: now,
            updated_at: now,
          },
          {
            user_id: user1.user_id,
            title: 'Full Stack Product Engineer',
            description:
              'We are looking for an engineer who can move across frontend and backend to ship user-facing workflow tools quickly.',
            requirements:
              'Experience with React, TypeScript, REST APIs, product collaboration, and delivering polished features end to end.',
            location: 'San Francisco, CA',
            language: 'en',
            created_at: now,
            updated_at: now,
          },
          {
            user_id: user1.user_id,
            title: 'AI Solutions Developer',
            description:
              'Build features that combine large language models with structured user data to improve job search and career tooling.',
            requirements:
              'Hands-on LLM integration experience, backend development, prompt design, and a strong product mindset.',
            location: 'Remote',
            language: 'en',
            created_at: now,
            updated_at: now,
          },
        ],
        { transaction },
      );

      const resumeTemplates = [
        {
          name: 'Classic',
          language: 'en',
          is_active: true,
          created_at: now,
          updated_at: now,
        },
        {
          name: 'Modern',
          language: 'en',
          is_active: true,
          created_at: now,
          updated_at: now,
        },
        {
          name: 'Executive',
          language: 'en',
          is_active: true,
          created_at: now,
          updated_at: now,
        },
        {
          name: 'क्लासिक',
          language: 'hi',
          is_active: true,
          created_at: now,
          updated_at: now,
        },
        {
          name: 'आधुनिक',
          language: 'hi',
          is_active: true,
          created_at: now,
          updated_at: now,
        },
      ];

      for (const template of resumeTemplates) {
        await queryInterface.sequelize.query(
          `
            INSERT INTO resume_templates (name, language, is_active, created_at, updated_at)
            VALUES (:name, :language, :is_active, :created_at, :updated_at)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              language = EXCLUDED.language,
              is_active = EXCLUDED.is_active,
              updated_at = EXCLUDED.updated_at
          `,
          {
            replacements: template,
            type: Sequelize.QueryTypes.INSERT,
            transaction,
          },
        );
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const insertedUsers = await queryInterface.sequelize.query(
        `
          SELECT user_id
          FROM users
          WHERE email IN (:sampleEmails)
        `,
        {
          replacements: {
            sampleEmails: Array.from({ length: 5 }).map(
              (_, index) => `user${index + 1}@example.com`,
            ),
          },
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );
      const userIds = insertedUsers.map((user) => user.user_id);

      if (!userIds.length) {
        return;
      }

      await queryInterface.bulkDelete(
        'job_advertisements',
        { user_id: userIds },
        { transaction },
      );
      await queryInterface.bulkDelete(
        'user_projects',
        { user_id: userIds },
        { transaction },
      );
      await queryInterface.bulkDelete(
        'user_skills',
        { user_id: userIds },
        { transaction },
      );
      await queryInterface.bulkDelete(
        'user_work_experiences',
        { user_id: userIds },
        { transaction },
      );
      await queryInterface.bulkDelete(
        'user_educations',
        { user_id: userIds },
        { transaction },
      );
      await queryInterface.bulkDelete(
        'users',
        { user_id: userIds },
        { transaction },
      );

      await queryInterface.bulkDelete(
        'resume_templates',
        {
          id: [
            '11111111-1111-1111-1111-111111111111',
            '22222222-2222-2222-2222-222222222222',
            '33333333-3333-3333-3333-333333333333',
            '44444444-4444-4444-4444-444444444444',
            '55555555-5555-5555-5555-555555555555',
          ],
        },
        { transaction },
      );
    });
  },
};
