import type { ISODate, LabelledValue, MediaRef, IconName } from './common';

/* ============================ MISSION (project) ============================ */

export type MissionStatus = 'completed' | 'in-progress' | 'classified';

export interface MissionLinks {
  live?: string;
  repo?: string;
  caseStudy?: string;
}

export interface Mission {
  /** slug, used as route param /missions/:id */
  id: string;
  /** narrative mission code, e.g. "M-001" */
  code: string;
  title: string;
  /** one-line summary, used in cards and meta descriptions */
  summary: string;
  /** rich body (markdown-ish) for the briefing */
  description: string;
  status: MissionStatus;
  role: string;
  durationLabel: string;
  period: { start: ISODate; end?: ISODate };
  /** references to Technology.id */
  technologies: string[];
  highlights: string[];
  challenges: string[];
  metrics?: LabelledValue[];
  links: MissionLinks;
  cover: MediaRef;
  gallery?: MediaRef[];
  featured: boolean;
  order: number;
}

/* ============================ TECHNOLOGY (planet) ========================== */

export type TechCategory = 'language' | 'framework' | 'database' | 'cloud' | 'tooling';

export interface TechnologyPlanet {
  /** semantic color token reference, e.g. "--color-accent" */
  color: string;
  size: 's' | 'm' | 'l';
  /** orbit ring index (1 = closest to the sun) */
  orbit: number;
}

export interface Technology {
  /** slug, referenced by Mission.technologies & Experience.technologies */
  id: string;
  name: string;
  category: TechCategory;
  /** mastery 0-100 */
  proficiency: number;
  since: ISODate;
  description: string;
  /** derived index of Mission.ids (computed at load, not hand-maintained) */
  usedInMissions?: string[];
  planet: TechnologyPlanet;
  featured: boolean;
  order: number;
}

/* ============================ EXPERIENCE (logbook) ======================== */

export type EmploymentType = 'full-time' | 'contract' | 'freelance';

export interface Experience {
  id: string;
  period: { start: ISODate; end: ISODate | 'present' };
  company: string;
  role: string;
  location: string | 'remote';
  summary: string;
  responsibilities: string[];
  achievements: string[];
  /** references to Technology.id */
  technologies: string[];
  type: EmploymentType;
  order: number;
}

/* ============================ ARCHIVE (knowledge) ========================= */

export type ArchiveSectionId = 'lng' | 'ing' | 'ops' | 'bit';

export interface ArchiveSection {
  id: ArchiveSectionId;
  /** stamped shelf code, e.g. "S-LNG" */
  code: string;
  label: string;
}

/** Index-level record data (light: safe to import from eager chunks). */
export interface ArchiveMeta {
  /** slug, used as route param /archive/:id */
  id: string;
  /** serial code, e.g. "REG-001" */
  code: string;
  title: string;
  /** two-line summary shown in the manifest and meta descriptions */
  abstract: string;
  section: ArchiveSectionId;
  tags: string[];
  archivedAt: ISODate;
  readingMinutes: number;
}

/** Structured body segment; 'h' segments are auto-numbered §01, §02… */
export type ArchiveSegment =
  | { kind: 'h'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'code'; lang: string; code: string };

export interface ArchiveRecord extends ArchiveMeta {
  body: ArchiveSegment[];
  /** cross-references to other ArchiveMeta.ids */
  refs: string[];
}

/* ============================ CONTACT (comms) ============================= */

export interface Frequency {
  id: 'github' | 'linkedin' | 'email';
  label: string;
  handle: string;
  url: string;
  icon: IconName;
  primary: boolean;
}

export interface TransmissionPayload {
  from: string;
  frequency: string; // email
  message: string;
  /** anti-spam honeypot — must stay empty */
  honeypot?: string;
}

export type TransmissionState =
  | 'idle'
  | 'validating'
  | 'transmitting'
  | 'in-transit'
  | 'success'
  | 'error';

/* ============================ PILOT (profile) ============================= */

export interface Pilot {
  name: string;
  callsign: string;
  role: string;
  available: boolean;
  bio: string;
  manifesto: string;
  stats: LabelledValue[];
  avatar: MediaRef;
  resumeUrl: string;
  location: string;
}
