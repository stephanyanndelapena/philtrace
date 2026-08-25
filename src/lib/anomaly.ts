export type AnomalyType = 'stalled' | 'never_started' | 'overdue';

export interface ProjectAnomalyInfo {
  isStalled: boolean;
  isNeverStarted: boolean;
  isOverdue: boolean;
  flags: AnomalyType[];
}

export function computeProjectAnomalies(project: {
  status: string;
  startDate: Date | string;
  completionDate?: Date | string | null;
  lastActivityAt?: Date | string | null;
  commentsCount?: number;
  agencyUpdatesCount?: number;
}): ProjectAnomalyInfo {
  const now = new Date();
  const start = new Date(project.startDate);
  const completion = project.completionDate ? new Date(project.completionDate) : null;
  const lastActivity = project.lastActivityAt ? new Date(project.lastActivityAt) : null;

  const totalUpdates = (project.commentsCount || 0) + (project.agencyUpdatesCount || 0);

  // 1. Overdue: completionDate has passed and status is still "ongoing"
  const isOverdue = project.status === 'ongoing' && completion !== null && completion < now;

  // 2. Stalled: status = "ongoing", project started > 6 months ago, and no activity in the last 6 months (180 days)
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  const isStalled =
    project.status === 'ongoing' &&
    start < sixMonthsAgo &&
    (!lastActivity || lastActivity < sixMonthsAgo);

  // 3. Never started: startDate has passed by > 30 days and zero updates/comments exist at all
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const isNeverStarted =
    project.status === 'ongoing' &&
    start < thirtyDaysAgo &&
    totalUpdates === 0 &&
    !lastActivity;

  const flags: AnomalyType[] = [];
  if (isStalled) flags.push('stalled');
  if (isNeverStarted) flags.push('never_started');
  if (isOverdue) flags.push('overdue');

  return {
    isStalled,
    isNeverStarted,
    isOverdue,
    flags,
  };
}
