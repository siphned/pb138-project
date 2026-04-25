import { db, closeConnection } from './db/db';
import {
  users,
  teams,
  teamMembers,
  projects,
  tasks,
  taskStatusEnum,
} from './db/schema';
import { and, eq, isNull, desc, sql } from 'drizzle-orm';

/**
 * Task 5 – Query the Database (Task Manager) — Solution
 *
 * Notes:
 * - Access scope is enforced via team membership joins.
 * - Soft delete is filtered via deletedAt IS NULL where applicable.
 */

async function main() {
  /**
   * Sub-task 5.1 – Select all users
   */
  const allUsers = await db.select().from(users);
  console.log('All users:', allUsers);

  /**
   * Sub-task 5.2 – Select teams of the first user (membership scoped)
   */
  if (allUsers.length > 0) {
    const firstUser = allUsers[0];

    const teamsForUser = await db
      .select({
        id: teams.id,
        name: teams.name,
        ownerId: teams.ownerId,
      })
      .from(teams)
      .innerJoin(teamMembers, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.userId, firstUser.id));

    console.log('Teams for first user:', teamsForUser);
  }

  /**
   * Sub-task 5.3 – Select tasks for a specific project (soft delete + ordering)
   */
  const someProjects = await db
    .select()
    .from(projects)
    .where(isNull(projects.deletedAt))
    .limit(1);

  if (someProjects.length > 0) {
    const projectId = someProjects[0].id;

    const projectTasks = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.projectId, projectId), isNull(tasks.deletedAt)))
      .orderBy(desc(tasks.createdAt))
      .limit(10);

    console.log('Tasks for project:', projectTasks);
  }

  /**
   * Sub-task 5.Bonus – Select “busy projects” (optional)
   *
   * Projects with more than 5 non-deleted tasks.
   */
  const busyProjects = await db
    .select({
      projectId: projects.id,
      projectName: projects.name,
      taskCount: sql<number>`count(${tasks.id})`,
    })
    .from(projects)
    .innerJoin(tasks, eq(tasks.projectId, projects.id))
    .where(and(isNull(projects.deletedAt), isNull(tasks.deletedAt)))
    .groupBy(projects.id, projects.name)
    .having(sql`count(${tasks.id}) > 5`)
    .orderBy(sql`count(${tasks.id}) desc`);

  console.log('Busy projects:', busyProjects);

  await closeConnection();
}

main();