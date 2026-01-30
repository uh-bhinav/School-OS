/**
 * Timetable Generator Feature Module
 *
 * Fully integrated timetable generation within SchoolOS ERP.
 * This module provides:
 * - Generate timetables with constraint-based solver
 * - View and manage timetable results
 * - Configure hard/soft constraints
 * - Track job history
 *
 * Routes:
 * - /timetable - Main generation page
 * - /timetable/results/:jobId - View results
 * - /timetable/constraints - Configure constraints
 * - /timetable/jobs - View job history
 */

// Pages
export {
  GeneratePage,
  ResultsPage,
  ConstraintsPage,
  RecentJobsPage,
} from './pages';

// Stores
export {
  useUploadStore,
  useConstraintsStore,
  useJobStore,
  useResultStore,
  useUIStore,
} from './stores';

// API
export {
  healthCheck,
  uploadData,
  validateData,
  getSampleData,
  createSolveJob,
  createJobFromUpload,
  createJobFromInput,
  getJobStatus,
  getJobLogs,
  getJobResult,
  downloadResult,
  listJobs,
  cancelJob,
  rerunJob,
} from './lib/api';

// Types
export type {
  School,
  Teacher,
  Subject,
  ClassSection,
  Resource,
  Constraints,
  SoftWeights,
  SolverInput,
  SolverOutput,
  TimetablePeriod,
  JobStatus,
  SolverStatus,
  JobStatusResponse,
  JobResultResponse,
  JobListItem,
  JobListResponse,
} from './lib/schemas';

// Utils
export {
  cn,
  formatDate,
  formatDateTime,
  formatTime,
  formatDuration,
  formatDistanceToNow,
} from './lib/utils';
