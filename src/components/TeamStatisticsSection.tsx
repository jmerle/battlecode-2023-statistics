import { useCallback } from 'react';
import { formatNumber } from '../common';
import { Team } from '../models';
import { SplitTeamSection } from './SplitTeamSection';
import { StatisticsTableRow } from './StatisticsTable';
import { openTeamListModal } from './TeamListModal';

export function TeamStatisticsSection(): JSX.Element {
  const rowBuilder = useCallback((teamsArr: Team[], hasSubmission: boolean): StatisticsTableRow[] => {
    const teamsBySize = new Map<number, Team[]>();
    let totalMembers = 0;

    for (const team of teamsArr) {
      if (!teamsBySize.has(team.members.length)) {
        teamsBySize.set(team.members.length, []);
      }

      teamsBySize.get(team.members.length)!.push(team);
      totalMembers += team.members.length;
    }

    const sizeRows: StatisticsTableRow[] = [...teamsBySize.keys()]
      .sort((a, b) => a - b)
      .map(size => {
        const title = `${size}-person teams`;
        return [
          title,
          {
            label: formatNumber(teamsBySize.get(size)!.length),
            action: () => openTeamListModal(title + (hasSubmission ? ' with submissions' : ''), teamsBySize.get(size)!),
          },
        ];
      });

    return [['Average team size', formatNumber(totalMembers / teamsArr.length, 2)], ...sizeRows];
  }, []);

  return <SplitTeamSection title="Team Statistics" rowBuilder={rowBuilder} />;
}
