import { Card, useMantineTheme } from '@mantine/core';
import { formatNumber } from '../common';
import { Team } from '../models';
import { useStore } from '../store';
import { Link } from './Link';
import { Section } from './Section';
import { StatisticsTable, StatisticsTableRow } from './StatisticsTable';
import { openTeamListModal } from './TeamListModal';
import { openTeamModal } from './TeamModal';

export interface TeamMetricSectionProps {
  metric: (team: Team) => number;
  title: string;
  labelSingular: string;
  labelPlural: string;
  decimals?: number;
}

export function TeamMetricSection({
  metric,
  title,
  labelSingular,
  labelPlural,
  decimals,
}: TeamMetricSectionProps): JSX.Element {
  const theme = useMantineTheme();

  const teams = useStore(state => state.teams)!;

  const sortedTeams = teams
    .map(team => [team, metric(team)] as [Team, number])
    .sort((a, b) => b[1] - a[1])
    .map(
      ([team, value]) =>
        [team, `${formatNumber(value, decimals || 0)} ${value === 1 ? labelSingular : labelPlural}`] as [Team, string],
    );

  const rowsTop10: StatisticsTableRow[] = sortedTeams.slice(0, 10).map(([team, value], i) => {
    return [
      `${i + 1}.`,
      {
        label: team.name,
        action: () => openTeamModal(team),
      },
      value,
    ];
  });

  const showMore = (): void => {
    openTeamListModal(title, sortedTeams);
  };

  return (
    <Section title={title}>
      <Card.Section>
        <StatisticsTable rows={rowsTop10} />
      </Card.Section>

      <Card.Section withBorder inheritPadding py={8} style={{ background: theme.colors.gray[2] }}>
        <Link onClick={showMore}>More...</Link>
      </Card.Section>
    </Section>
  );
}
