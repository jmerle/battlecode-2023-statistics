import { createStyles, Grid, LoadingOverlay, Stack, Text } from '@mantine/core';
import axios from 'axios';
import * as localForage from 'localforage';
import * as pako from 'pako';
import { useCallback, useEffect, useMemo } from 'react';
import { Link } from './components/Link';
import { ScrimmageStatisticsSection } from './components/ScrimmageStatisticsSection';
import { Section } from './components/Section';
import { TeamDistributionSection } from './components/TeamDistributionSection';
import { TeamMetricSection } from './components/TeamMetricSection';
import { TeamPerformanceSection } from './components/TeamPerformanceSection';
import { TeamStatisticsSection } from './components/TeamStatisticsSection';
import { DataFiles, Scrimmage, ScrimmageStatus, Team } from './models';
import { useStore } from './store';

const useStyles = createStyles(theme => ({
  container: {
    margin: '8px auto',
    width: '1320px',
    paddingLeft: '8px',
    paddingRight: '8px',

    [theme.fn.smallerThan(1500)]: {
      width: '100%',
    },
  },
}));

async function loadData<T extends keyof DataFiles>(key: T): Promise<[DataFiles[T], Date]> {
  const timestampKey = `${key}-timestamp`;
  const dataKey = `${key}-data`;

  const localTimestamp = await localForage.getItem(timestampKey);
  const latestTimestampResponse = await axios.get(`${key}.txt`);
  const latestTimestamp = parseInt(latestTimestampResponse.data);

  if (localTimestamp === latestTimestamp) {
    const localData = await localForage.getItem(dataKey);
    if (localData !== null) {
      return [localData as DataFiles[T], new Date(localTimestamp)];
    }
  }

  const deflated = await axios.get(`${key}.zlib`, { responseType: 'arraybuffer' });
  const latestData = JSON.parse(pako.inflate(deflated.data, { to: 'string' }));

  await localForage.setItem(dataKey, latestData);
  await localForage.setItem(timestampKey, latestTimestamp);

  return [latestData, new Date(latestTimestamp)];
}

export function App(): JSX.Element {
  const { classes } = useStyles();

  const teams = useStore(state => state.teams);
  const scrimmages = useStore(state => state.scrimmages);
  const scrimmagesTimestamp = useStore(state => state.scrimmagesTimestamp);
  const setTeams = useStore(state => state.setTeams);
  const setScrimmages = useStore(state => state.setScrimmages);

  useEffect(() => {
    (async () => {
      const [data, timestamp] = await loadData('teams');
      setTeams(data, timestamp);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const [data, timestamp] = await loadData('scrimmages');
      setScrimmages(data, timestamp);
    })();
  }, []);

  const scrimmagesByTeam = useMemo(() => {
    const map = new Map<number, Scrimmage[]>();
    if (scrimmages === null) {
      return map;
    }

    for (const scrimmage of Object.values(scrimmages).sort((a, b) => Date.parse(a.created) - Date.parse(b.created))) {
      if (scrimmage.participants === null) {
        continue;
      }

      for (const participant of scrimmage.participants) {
        if (!map.has(participant.team)) {
          map.set(participant.team, []);
        }

        map.get(participant.team)!.push(scrimmage);
      }
    }

    return map;
  }, [scrimmages]);

  const metricRating = useCallback((team: Team): number => {
    return team.profile.rating;
  }, []);

  const metricScrimmages = useCallback(
    (team: Team): number => {
      const teamScrimmages = scrimmagesByTeam.get(team.id) || [];
      return teamScrimmages.filter(s => s.status == ScrimmageStatus.Completed).length;
    },
    [scrimmagesByTeam],
  );

  const metricRankedScrimmages = useCallback(
    (team: Team): number => {
      const teamScrimmages = scrimmagesByTeam.get(team.id) || [];
      return teamScrimmages.filter(s => s.status == ScrimmageStatus.Completed && s.is_ranked).length;
    },
    [scrimmagesByTeam],
  );

  const metricUnrankedScrimmages = useCallback(
    (team: Team): number => {
      const teamScrimmages = scrimmagesByTeam.get(team.id) || [];
      return teamScrimmages.filter(s => s.status == ScrimmageStatus.Completed && !s.is_ranked).length;
    },
    [scrimmagesByTeam],
  );

  const metricMatches = useCallback(
    (team: Team): number => {
      const teamScrimmages = scrimmagesByTeam.get(team.id) || [];
      return teamScrimmages
        .filter(s => s.status == ScrimmageStatus.Completed && s.maps !== null)
        .map(s => s.maps!.length)
        .reduce((acc, val) => acc + val, 0);
    },
    [scrimmagesByTeam],
  );

  const metricUnrankedMatches = useCallback(
    (team: Team): number => {
      const teamScrimmages = scrimmagesByTeam.get(team.id) || [];
      return teamScrimmages
        .filter(s => s.status == ScrimmageStatus.Completed && !s.is_ranked && s.maps !== null)
        .map(s => s.maps!.length)
        .reduce((acc, val) => acc + val, 0);
    },
    [scrimmagesByTeam],
  );

  const metricMatchesPerUnrankedScrimmage = useCallback(
    (team: Team): number => {
      const scrims = metricUnrankedScrimmages(team);
      if (scrims === 0) {
        return 0;
      }

      return metricUnrankedMatches(team) / scrims;
    },
    [metricUnrankedScrimmages, metricUnrankedMatches],
  );

  const createStreakMetric = useCallback(
    (continueStreak: (selfScore: number, opponentScore: number) => boolean): ((team: Team) => number) => {
      return team => {
        const teamScrimmages = scrimmagesByTeam.get(team.id) || [];

        let longestStreak = 0;
        let currentStreak = 0;

        for (const scrimmage of teamScrimmages.filter(s => s.status == ScrimmageStatus.Completed && s.is_ranked)) {
          const selfScore = scrimmage.participants!.find(p => p.team === team.id)!.score;
          const opponentScore = scrimmage.participants!.find(p => p.team !== team.id)!.score;

          if (selfScore === null || opponentScore === null) {
            continue;
          }

          if (continueStreak(selfScore, opponentScore)) {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
          } else {
            currentStreak = 0;
          }
        }

        return longestStreak;
      };
    },
    [scrimmagesByTeam],
  );

  const metricWinStreak = useCallback(
    createStreakMetric((self, opponent) => self > opponent),
    [createStreakMetric],
  );

  const metricLoseStreak = useCallback(
    createStreakMetric((self, opponent) => self < opponent),
    [createStreakMetric],
  );

  if (teams === null || scrimmages === null || scrimmagesTimestamp === null) {
    return <LoadingOverlay visible />;
  }

  return (
    <div className={classes.container}>
      <Grid>
        <Grid.Col span={12}>
          <Section title="Battlecode 2023 Statistics">
            {/* prettier-ignore */}
            <Stack mt="sm">
              <Text>
                Based on data scraped from the Battlecode 2023 API, last updated on {scrimmagesTimestamp.toString()}.
              </Text>
              <Text>
                The source code and raw data are available in the <Link href="https://github.com/jmerle/battlecode-2023-statistics">jmerle/battlecode-2023-statistics</Link> GitHub repository.
              </Text>
              <Text>
                See <Link href="https://jmerle.github.io/battlecode-2022-statistics/">jmerle.github.io/battlecode-2022-statistics</Link> for the 2022 edition.
              </Text>
            </Stack>
          </Section>
        </Grid.Col>
        <Grid.Col span={12}>
          <TeamPerformanceSection />
        </Grid.Col>
        <Grid.Col md={4} sm={12}>
          <ScrimmageStatisticsSection />
        </Grid.Col>
        <Grid.Col md={4} sm={12}>
          <TeamStatisticsSection />
        </Grid.Col>
        <Grid.Col md={4} sm={12}>
          <TeamDistributionSection />
        </Grid.Col>
        <Grid.Col md={4} sm={12}>
          <TeamMetricSection
            metric={metricScrimmages}
            title="Scrimmages Played"
            labelSingular="scrimmage"
            labelPlural="scrimmages"
          />
        </Grid.Col>
        <Grid.Col md={4} sm={12}>
          <TeamMetricSection
            metric={metricRankedScrimmages}
            title="Ranked Scrimmages Played"
            labelSingular="scrimmage"
            labelPlural="scrimmages"
          />
        </Grid.Col>
        <Grid.Col md={4} sm={12}>
          <TeamMetricSection
            metric={metricUnrankedScrimmages}
            title="Unranked Scrimmages Played"
            labelSingular="scrimmage"
            labelPlural="scrimmages"
          />
        </Grid.Col>
        <Grid.Col md={4} sm={12}>
          <TeamMetricSection
            metric={metricMatches}
            title="Matches Played"
            labelSingular="match"
            labelPlural="matches"
          />
        </Grid.Col>
        <Grid.Col md={4} sm={12}>
          <TeamMetricSection
            metric={metricUnrankedMatches}
            title="Unranked Matches Played"
            labelSingular="match"
            labelPlural="matches"
          />
        </Grid.Col>
        <Grid.Col md={4} sm={12}>
          <TeamMetricSection
            metric={metricMatchesPerUnrankedScrimmage}
            title="Matches Per Unranked Scrimmage"
            labelSingular="match"
            labelPlural="matches"
            decimals={2}
          />
        </Grid.Col>
        <Grid.Col md={4} sm={12}>
          <TeamMetricSection metric={metricRating} title="Rating" labelSingular="rating" labelPlural="rating" />
        </Grid.Col>
        <Grid.Col md={4} sm={12}>
          <TeamMetricSection
            metric={metricWinStreak}
            title="Longest Ranked Win Streak"
            labelSingular="scrimmage"
            labelPlural="scrimmages"
          />
        </Grid.Col>
        <Grid.Col md={4} sm={12}>
          <TeamMetricSection
            metric={metricLoseStreak}
            title="Longest Ranked Lose Streak"
            labelSingular="scrimmage"
            labelPlural="scrimmages"
          />
        </Grid.Col>
      </Grid>
    </div>
  );
}
