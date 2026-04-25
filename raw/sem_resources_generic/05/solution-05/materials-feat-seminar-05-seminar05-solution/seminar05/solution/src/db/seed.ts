import { faker } from '@faker-js/faker';
import { db, closeConnection } from './db';
import {
  users,
  teams,
  teamMembers,
  projects,
  tasks,
  comments,
  taskAssignees,
} from './schema';
import type {
  InsertUser,
  InsertTeam,
  InsertTeamMember,
  InsertProject,
  InsertTask,
  InsertComment,
  InsertTaskAssignee,
} from './types';

/**
 * Task — Seed the Database (Task Manager)
 *
 * Your goal is to generate mock data using `faker` and insert it into the database
 * for testing and learning purposes.
 *
 * Implement the `generateX()` functions as described below.
 */

const config = {
  seeding: {
    userCount: 6,
    teamCount: 3,
    membersPerTeam: { min: 2, max: 5 },
    projectsPerTeam: { min: 1, max: 3 },
    tasksPerProject: { min: 4, max: 10 },
    commentsPerTask: { min: 0, max: 3 },
    assigneesPerTask: { min: 0, max: 2 },
  },
};

// Small helpers
function pickOne<T>(arr: readonly T[]): T {
  return arr[faker.number.int({ min: 0, max: arr.length - 1 })]!;
}

function pickManyUnique<T>(arr: readonly T[], count: number): T[] {
  const copy = [...arr];
  faker.helpers.shuffle(copy);
  return copy.slice(0, Math.min(count, copy.length));
}

async function truncateAll() {
  // ⚠️ Destructive: clear in reverse dependency order (children → parents)
  await db.delete(taskAssignees);
  await db.delete(comments);
  await db.delete(tasks);
  await db.delete(projects);
  await db.delete(teamMembers);
  await db.delete(teams);
  await db.delete(users);
}

async function main() {
  console.log('Starting database seeding (task manager)...');

  try {
    await truncateAll();

    // 1) Users
    const createdUsers = await db
      .insert(users)
      .values(generateUsers(config.seeding.userCount))
      .returning();

    console.log(`Created ${createdUsers.length} users`);

    // 2) Teams (owned by random users)
    const createdTeams = await db
      .insert(teams)
      .values(generateTeams(config.seeding.teamCount, createdUsers.map((u) => u.id)))
      .returning();

    console.log(`Created ${createdTeams.length} teams`);

    // 3) Team members (owner + random members)
    for (const team of createdTeams) {
      const membersData = generateTeamMembers(team.id, team.ownerId, createdUsers.map((u) => u.id));
      await db.insert(teamMembers).values(membersData);
      console.log(`Inserted ${membersData.length} members for team ${team.name}`);
    }

    // 4) Projects per team
    const createdProjects: Array<{ id: string; teamId: string; name: string }> = [];
    for (const team of createdTeams) {
      const projectsData = generateProjects(team.id);
      const inserted = await db.insert(projects).values(projectsData).returning();
      createdProjects.push(...inserted.map((p) => ({ id: p.id, teamId: p.teamId, name: p.name })));
      console.log(`Inserted ${inserted.length} projects for team ${team.name}`);
    }

    // 5) Tasks + comments + assignees
    for (const project of createdProjects) {
      const projectTeam = createdTeams.find((t) => t.id === project.teamId);
      if (!projectTeam) continue;

      // Get member user IDs for the team (for comments/assignees)
      const teamMemberRows = await db
        .select({ userId: teamMembers.userId })
        .from(teamMembers)
      const memberUserIds = teamMemberRows.map((r) => r.userId);

      const tasksData = generateTasks(project.id);
      const insertedTasks = await db.insert(tasks).values(tasksData).returning();
      console.log(`Inserted ${insertedTasks.length} tasks for project ${project.name}`);

      for (const task of insertedTasks) {
        // Comments
        const commentData = generateComments(task.id, memberUserIds);
        if (commentData.length) {
          await db.insert(comments).values(commentData);
        }

        // Assignees
        const assigneeData = generateTaskAssignees(task.id, memberUserIds);
        if (assigneeData.length) {
          await db.insert(taskAssignees).values(assigneeData);
        }
      }
    }

    console.log('Database seeding completed.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await closeConnection();
  }
}

/**
 * Sub-task — Generate Users
 *
 * Generate an array of users. Each user should have:
 * - email
 * - full name
 * - createdAt
 */
function generateUsers(count: number): InsertUser[] {
  return Array.from({ length: count }, () => {
    const first = faker.person.firstName();
    const last = faker.person.lastName();
    const name = `${first} ${last}`;

    return {
      email: faker.internet.email({ firstName: first, lastName: last }).toLowerCase(),
      name
    } satisfies InsertUser;
  });
}

/**
 * Sub-task — Generate Teams
 *
 * Generate teams. Each team should have:
 * - name
 * - ownerId (random from created users)
 * - createdAt
 */
function generateTeams(count: number, userIds: string[]): InsertTeam[] {
  return Array.from({ length: count }, () => {
    const ownerId = pickOne(userIds);
    return {
      name: `${faker.company.name()} Team`,
      ownerId,
    } satisfies InsertTeam;
  });
}

/**
 * Sub-task — Generate Team Members
 *
 * For each team:
 * - Always include the owner as OWNER
 * - Add a random number of additional members
 *
 * Constraints:
 * - Do not duplicate (teamId, userId)
 */
function generateTeamMembers(teamId: string, ownerId: string, allUserIds: string[]): InsertTeamMember[] {
  const count = faker.number.int(config.seeding.membersPerTeam);
  const otherUserIds = allUserIds.filter((id) => id !== ownerId);

  const picked = pickManyUnique(otherUserIds, Math.max(0, count - 1));

  const rows: InsertTeamMember[] = [
    {
      teamId,
      userId: ownerId,
    },
  ];

  for (const userId of picked) {
    rows.push({
      teamId,
      userId
    });
  }

  return rows;
}

/**
 * Sub-task — Generate Projects
 *
 * Generate a random number of projects per team.
 * Each project should include:
 * - teamId
 * - name
 * - createdAt
 * - deletedAt (usually null)
 */
function generateProjects(teamId: string): InsertProject[] {
  const count = faker.number.int(config.seeding.projectsPerTeam);
  return Array.from({ length: count }, () => {
    const softDeleted = faker.datatype.boolean({ probability: 0.1 });

    return {
      teamId,
      name: faker.commerce.department() + ' Project',
    } satisfies InsertProject;
  });
}

function generateTasks(projectId: string): InsertTask[] {
  const count = faker.number.int(config.seeding.tasksPerProject);
  return Array.from({ length: count }, () => {
    const createdAt = faker.date.recent({ days: 30 });

    return {
      projectId,
      title: faker.hacker.phrase().slice(0, 180),
    } satisfies InsertTask;
  });
}

function generateComments(taskId: string, memberUserIds: string[]): InsertComment[] {
  const count = faker.number.int(config.seeding.commentsPerTask);
  return Array.from({ length: count }, () => {
    return {
      taskId,
      authorId: pickOne(memberUserIds),
      body: faker.lorem.sentences({ min: 1, max: 2 }),
    } satisfies InsertComment;
  });
}

function generateTaskAssignees(taskId: string, memberUserIds: string[]): InsertTaskAssignee[] {
  const count = faker.number.int(config.seeding.assigneesPerTask);
  const picked = pickManyUnique(memberUserIds, count);

  return picked.map((userId) =>
    ({
      taskId,
      userId,
    }) satisfies InsertTaskAssignee,
  );
}

main();
