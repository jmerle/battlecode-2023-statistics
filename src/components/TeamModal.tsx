import { List, Text } from '@mantine/core';
import { openModal } from '@mantine/modals';
import { formatNumber } from '../common';
import { getEligibilityLabel, getTeamEligibilities, ScrimmageStatus, Team } from '../models';
import { useStore } from '../store';
import { TeamChart } from './TeamChart';

export function openTeamModal(team: Team): void {
  const teams = useStore.getState().teams!;
  const scrimmagesByTeam = useStore.getState().scrimmagesByTeam!;

  const rank = teams
    .map(t => t.profile.rating)
    .sort((a, b) => b - a)
    .findIndex(rating => rating === team.profile.rating);

  const ratings: [number, number][] = [];
  const scrimmagesPlayed: [number, number][] = [];
  const matchesPlayed: [number, number][] = [];

  const scrimmages = scrimmagesByTeam.get(team.id) || [];
  for (const scrimmage of scrimmages) {
    if (scrimmage.status != ScrimmageStatus.Completed || scrimmage.participants === null) {
      continue;
    }

    const self = scrimmage.participants.find(p => p.team === team.id)!;

    ratings.push([Date.parse(scrimmage.created), self.rating!]);
    scrimmagesPlayed.push([Date.parse(scrimmage.created), scrimmagesPlayed.length + 1]);
    matchesPlayed.push([
      Date.parse(scrimmage.created),
      (matchesPlayed.length > 0 ? matchesPlayed[matchesPlayed.length - 1][1] : 0) + scrimmage.maps!.length,
    ]);
  }

  if (ratings.length > 0) {
    const startDate = ratings[0][0];
    while (ratings.length > 0 && ratings[0][0] - startDate < 24 * 60 * 60 * 1000) {
      ratings.shift();
    }
  }

  openModal({
    title: team.name,
    overflow: 'outside',
    size: 'lg',
    children: (
      <>
        <Text>
          <b>Name:</b> {team.name}
        </Text>
        <Text>
          <b>Rating:</b> {formatNumber(team.profile.rating)} (#{formatNumber(rank + 1)})
        </Text>
        <Text>
          <b>Eligibility:</b>{' '}
          {getTeamEligibilities(team)
            .map(e => getEligibilityLabel(e))
            .join(', ')}
        </Text>
        <Text>
          <b>Members:</b>
          <List type="ordered">
            {team.members.map((member, i) => (
              <List.Item key={i}>
                {member.username}
                {member.profile.school && ` (${member.profile.school})`}
              </List.Item>
            ))}
          </List>
        </Text>
        <TeamChart title="Rating" yAxisLabel="Rating" values={ratings} />
        <TeamChart title="Scrimmages played" yAxisLabel="Scrimmages" values={scrimmagesPlayed} />
        <TeamChart title="Matches played" yAxisLabel="Matches" values={matchesPlayed} />
      </>
    ),
  });
}
