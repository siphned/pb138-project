import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { users, projects, teams, teamMembers, tasks, comments, taskAssignees } from './schema';

export type User = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;

export type Team = InferSelectModel<typeof teams>;
export type InsertTeam = InferInsertModel<typeof teams>;

export type TeamMember = InferSelectModel<typeof teamMembers>;
export type InsertTeamMember = InferInsertModel<typeof teamMembers>;

export type Project = InferSelectModel<typeof projects>;
export type InsertProject = InferInsertModel<typeof projects>;

export type Task = InferSelectModel<typeof tasks>;
export type InsertTask = InferInsertModel<typeof tasks>;

export type Comment = InferSelectModel<typeof comments>;
export type InsertComment = InferInsertModel<typeof comments>;

export type TaskAssignee = InferSelectModel<typeof taskAssignees>;
export type InsertTaskAssignee = InferInsertModel<typeof taskAssignees>;