import { Card } from '@mantine/core';
import { formatNumber } from '../common';
import { ScrimmageStatus } from '../models';
import { useStore } from '../store';
import { Section } from './Section';
import { StatisticsTable, StatisticsTableRow } from './StatisticsTable';

export function ScrimmageStatisticsSection(): JSX.Element {
  const scrimmages = useStore(state => state.scrimmages)!;

  const scrims = scrimmages.filter(s => s.status === ScrimmageStatus.Completed && s.maps !== null);
  const rankedScrims = scrims.filter(s => s.is_ranked);
  const unrankedScrims = scrims.filter(s => !s.is_ranked);

  const matches = scrims.map(s => s.maps!.length).reduce((acc, val) => acc + val, 0);
  const rankedMatches = rankedScrims.map(s => s.maps!.length).reduce((acc, val) => acc + val, 0);
  const unrankedMatches = unrankedScrims.map(s => s.maps!.length).reduce((acc, val) => acc + val, 0);

  const rows: StatisticsTableRow[] = [
    ['Scrimmages played', formatNumber(scrims.length)],
    ['Ranked scrimmages played', formatNumber(rankedScrims.length)],
    ['Unranked scrimmages played', formatNumber(unrankedScrims.length)],
    ['Matches played', formatNumber(matches)],
    ['Ranked matches played', formatNumber(rankedMatches)],
    ['Unranked matches played', formatNumber(unrankedMatches)],
  ];

  return (
    <Section title="Scrimmage Statistics">
      <Card.Section>
        <StatisticsTable rows={rows} />
      </Card.Section>
    </Section>
  );
}
