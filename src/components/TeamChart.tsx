import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { highchartsOptionsBase } from '../common';

export interface TeamChartProps {
  title: string;
  yAxisLabel: string;
  values: [number, number][];
}

export function TeamChart({ title, yAxisLabel, values }: TeamChartProps): JSX.Element {
  const options: Highcharts.Options = {
    ...highchartsOptionsBase,
    chart: {
      ...highchartsOptionsBase.chart,
      height: 300,
    },
    yAxis: {
      title: {
        text: yAxisLabel,
      },
    },
    title: {
      text: title,
    },
    series: [
      {
        type: 'line',
        name: 'Value',
        data: values,
        marker: {
          enabled: false,
          symbol: 'circle',
        },
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
