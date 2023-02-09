/* eslint-disable @typescript-eslint/naming-convention */

export interface TeamProfile {
  quote: string;
  biography: string;
  has_avatar: boolean;
  avatar_url: string | null;
  rating: number;
  auto_accept_ranked: boolean;
  auto_accept_unranked: boolean;
  eligible_for: number[];
}

export interface TeamMemberProfile {
  school: string;
  biography: string;
  avatar_url: string | null;
  has_avatar: boolean;
}

export interface TeamMember {
  id: number;
  profile: TeamMemberProfile;
  username: string;
  is_staff: boolean;
}

export interface Team {
  id: number;
  profile: TeamProfile;
  episode: string;
  name: string;
  members: TeamMember[];
  status: string;
  has_active_submission: boolean;
}

export enum ScrimmageStatus {
  Created = 'NEW',
  Queued = 'QUE',
  Running = 'RUN',
  Retry = 'TRY',
  Completed = 'OK!',
  Errored = 'ERR',
  Canceled = 'CAN',
}

export interface ScrimmageParticipant {
  team: number;
  teamname: string;
  submission: number | null;
  match: number;
  player_index: number;
  score: number | null;
  rating: number | null;
  old_rating: number;
}

export interface Scrimmage {
  id: number;
  status: ScrimmageStatus;
  episode: string;
  tournament_round: number | null;
  participants: ScrimmageParticipant[] | null;
  maps: string[] | null;
  alternate_order: boolean;
  created: string;
  is_ranked: boolean;
  replay_url: string | null;
}

export interface DataFiles {
  teams: Record<string, Team>;
  scrimmages: Record<string, Scrimmage>;
}

export enum Eligibility {
  US,
  International,
  Newbie,
  HighSchool,
  NonStudent,
}

export function getTeamEligibilities(team: Team): Eligibility[] {
  const eligibilities: Eligibility[] = [];
  const eligibleFor = team.profile.eligible_for;

  if (eligibleFor.includes(1) && eligibleFor.includes(3) && !eligibleFor.includes(2)) {
    eligibilities.push(Eligibility.US);
  }

  if (eligibleFor.includes(1) && !eligibleFor.includes(2) && !eligibleFor.includes(3)) {
    eligibilities.push(Eligibility.International);
  }

  if (eligibleFor.includes(1) && eligibleFor.includes(4)) {
    eligibilities.push(Eligibility.Newbie);
  }

  if (eligibleFor.includes(2)) {
    eligibilities.push(Eligibility.HighSchool);
  }

  if (eligibilities.length === 0) {
    eligibilities.push(Eligibility.NonStudent);
  }

  return eligibilities;
}

export function getEligibilityLabel(eligibility: Eligibility): string {
  return {
    [Eligibility.US]: 'US',
    [Eligibility.International]: 'International',
    [Eligibility.Newbie]: 'Newbie',
    [Eligibility.HighSchool]: 'High School',
    [Eligibility.NonStudent]: 'Non-student',
  }[eligibility];
}
