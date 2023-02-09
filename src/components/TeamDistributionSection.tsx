import { useCallback } from 'react';
import { formatNumber } from '../common';
import { Eligibility, getEligibilityLabel, getTeamEligibilities, Team } from '../models';
import { SplitTeamSection } from './SplitTeamSection';
import { StatisticsTableRow } from './StatisticsTable';
import { openTeamListModal } from './TeamListModal';

export function TeamDistributionSection(): JSX.Element {
  const rowBuilder = useCallback((teamsArr: Team[], hasSubmission: boolean): StatisticsTableRow[] => {
    const teamsByEligibility = new Map<Eligibility, Team[]>();

    for (const team of teamsArr) {
      for (const eligibility of getTeamEligibilities(team)) {
        if (!teamsByEligibility.has(eligibility)) {
          teamsByEligibility.set(eligibility, []);
        }

        teamsByEligibility.get(eligibility)!.push(team);
      }
    }

    const eligibilityRows: StatisticsTableRow[] = [...teamsByEligibility.keys()]
      .sort((a, b) => a - b)
      .map(eligibility => {
        const title = `${getEligibilityLabel(eligibility)} teams`;
        return [
          title,
          {
            label: formatNumber(teamsByEligibility.get(eligibility)!.length),
            action: () =>
              openTeamListModal(
                title + (hasSubmission ? ' with submissions' : ''),
                teamsByEligibility.get(eligibility)!,
              ),
          },
        ];
      });

    return [
      [
        'Teams',
        {
          label: formatNumber(teamsArr.length),
          action: () => openTeamListModal('Teams' + (hasSubmission ? ' with submissions' : ''), teamsArr),
        },
      ],
      ...eligibilityRows,
    ];
  }, []);

  return <SplitTeamSection title="Team Distribution" rowBuilder={rowBuilder} />;
}
