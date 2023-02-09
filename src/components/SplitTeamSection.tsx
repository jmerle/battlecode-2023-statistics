import { Card, Tabs } from '@mantine/core';
import { Team } from '../models';
import { useStore } from '../store';
import { Section } from './Section';
import { StatisticsTable, StatisticsTableRow } from './StatisticsTable';

export interface SplitTeamSectionProps {
  title: string;
  rowBuilder: (teams: Team[], hasSubmission: boolean) => StatisticsTableRow[];
}

export function SplitTeamSection({ title, rowBuilder }: SplitTeamSectionProps): JSX.Element {
  const teams = useStore(state => state.teams)!;
  const teamsWithSubmissions = teams.filter(t => t.has_active_submission);

  return (
    <Section title={title}>
      <Card.Section>
        <Tabs defaultValue="all">
          <Tabs.List grow>
            <Tabs.Tab value="all">All teams</Tabs.Tab>
            <Tabs.Tab value="submissions">Teams with submissions</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="all">
            <StatisticsTable rows={rowBuilder(teams, false)} />
          </Tabs.Panel>

          <Tabs.Panel value="submissions">
            <StatisticsTable rows={rowBuilder(teamsWithSubmissions, true)} />
          </Tabs.Panel>
        </Tabs>
      </Card.Section>
    </Section>
  );
}
