import { create } from 'zustand';
import { DataFiles, Scrimmage, Team } from './models';

export interface State {
  teams: Team[] | null;
  teamsTimestamp: Date | null;

  scrimmages: Scrimmage[] | null;
  scrimmagesTimestamp: Date | null;

  scrimmagesByTeam: Map<number, Scrimmage[]> | null;

  setTeams: (data: DataFiles['teams'], timestamp: Date) => void;
  setScrimmages: (data: DataFiles['scrimmages'], timestamp: Date) => void;
}

export const useStore = create<State>(set => ({
  teams: null,
  teamsTimestamp: null,

  scrimmages: null,
  scrimmagesTimestamp: null,

  scrimmagesByTeam: null,

  setTeams: (data, timestamp) => {
    const teams = Object.values(data).sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

    set({
      teams,
      teamsTimestamp: timestamp,
    });
  },

  setScrimmages: (data, timestamp) => {
    const scrimmages = Object.values(data).sort((a, b) => Date.parse(a.created) - Date.parse(b.created));

    const scrimmagesByTeam = new Map<number, Scrimmage[]>();
    for (const scrimmage of scrimmages) {
      if (scrimmage.participants === null) {
        continue;
      }

      for (const participant of scrimmage.participants) {
        if (!scrimmagesByTeam.has(participant.team)) {
          scrimmagesByTeam.set(participant.team, []);
        }

        scrimmagesByTeam.get(participant.team)!.push(scrimmage);
      }
    }

    set({
      scrimmages,
      scrimmagesByTeam,
      scrimmagesTimestamp: timestamp,
    });
  },
}));
