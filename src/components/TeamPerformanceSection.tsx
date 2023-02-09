import { Card } from '@mantine/core';
import Highcharts from 'highcharts';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsOfflineExporting from 'highcharts/modules/offline-exporting';
import HighchartsReact from 'highcharts-react-official';
import { highchartsOptionsBase } from '../common';
import { ScrimmageStatus } from '../models';
import { useStore } from '../store';
import { Section } from './Section';

HighchartsAccessibility(Highcharts);
HighchartsExporting(Highcharts);
HighchartsOfflineExporting(Highcharts);

export function TeamPerformanceSection(): JSX.Element {
  const teams = useStore(state => state.teams)!;
  const scrimmagesByTeam = useStore(state => state.scrimmagesByTeam)!;

  const mobileLegend: Highcharts.LegendOptions = {
    layout: 'horizontal',
    align: 'left',
    verticalAlign: 'bottom',
    width: '100%',
    maxHeight: 100,
    alignColumns: false,
  };

  const desktopLegend: Highcharts.LegendOptions = {
    layout: 'vertical',
    align: 'right',
    verticalAlign: 'top',
    width: 250,
    maxHeight: 1e6,
    alignColumns: false,
  };

  const options: Highcharts.Options = {
    ...highchartsOptionsBase,
    exporting: {
      chartOptions: {
        title: {
          text: 'Team Performance',
        },
      },
    },
    yAxis: {
      title: {
        text: 'Rating',
      },
    },
    title: {
      text: '',
    },
    legend: window.innerWidth < 992 ? mobileLegend : desktopLegend,
    responsive: {
      rules: [
        {
          condition: {
            callback: () => window.innerWidth < 992,
          },
          chartOptions: {
            legend: mobileLegend,
          },
        },
        {
          condition: {
            callback: () => window.innerWidth >= 992,
          },
          chartOptions: {
            legend: desktopLegend,
          },
        },
      ],
    },
    series: teams
      .filter(team => team.profile.rating > 0)
      .sort((a, b) => b.profile.rating - a.profile.rating)
      .map((team, teamIndex) => {
        const values: [number, number][] = [];

        const teamScrimmages =
          scrimmagesByTeam
            .get(team.id)
            ?.filter(s => s.status == ScrimmageStatus.Completed && s.participants !== null) || [];

        if (teamScrimmages.length > 0) {
          let scrimmageIndex = 0;

          const currentDate = new Date(Date.parse(teamScrimmages[0].created));
          currentDate.setMilliseconds(0);
          currentDate.setSeconds(0);
          currentDate.setMinutes(0);
          currentDate.setHours(currentDate.getHours() + 24);

          const endDate = Date.parse(teamScrimmages[teamScrimmages.length - 1].created);

          while (currentDate.getTime() < endDate) {
            currentDate.setHours(currentDate.getHours() + 1);

            for (let i = scrimmageIndex + 1; i < teamScrimmages.length; i++) {
              if (Date.parse(teamScrimmages[i].created) > currentDate.getTime()) {
                break;
              }

              scrimmageIndex++;
            }

            values.push([
              currentDate.getTime(),
              teamScrimmages[scrimmageIndex].participants!.find(p => p.team === team.id)!.rating!,
            ]);
          }
        }

        return {
          type: 'line',
          name: team.name,
          data: values,
          visible: teamIndex < 5,
          marker: {
            enabled: false,
            symbol: 'circle',
          },
        };
      }),
  };

  return (
    <Section title="Team Performance">
      <Card.Section>
        <HighchartsReact highcharts={Highcharts} options={options} />
      </Card.Section>
    </Section>
  );
}
