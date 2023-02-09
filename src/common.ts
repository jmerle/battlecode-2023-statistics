import Highcharts from 'highcharts';

export function formatNumber(value: number, decimals: number = 0): string {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: decimals > 0 ? decimals : 0,
    maximumFractionDigits: decimals > 0 ? decimals : 0,
  });
}

export const tournaments = [
  ['Sprint 1', '2023-01-17T19:00:00-05:00'],
  ['Sprint 2', '2023-01-24T19:00:00-05:00'],
  ['International Qualifier', '2023-01-28T19:00:00-05:00'],
  ['US Qualifier', '2023-01-30T19:00:00-05:00'],
  ['Newbie & High School', '2023-02-01T19:00:00-05:00'],
  ['Final', '2023-02-05T19:00:00-05:00'],
];

export const highchartsOptionsBase: Highcharts.Options = {
  chart: {
    zooming: {
      type: 'x',
    },
    panning: {
      enabled: true,
      type: 'x',
    },
    panKey: 'shift',
    numberFormatter: formatNumber,
  },
  time: {
    useUTC: false,
  },
  credits: {
    href: 'javascript:window.open("https://www.highcharts.com/?credits", "_blank")',
  },
  exporting: {
    sourceWidth: 1600,
    sourceHeight: 800,
    allowHTML: true,
  },
  xAxis: {
    type: 'datetime',
    title: {
      text: 'Local Date & Time',
    },
    crosshair: {
      width: 1,
    },
    plotLines: tournaments.map(([name, timestamp]) => ({
      color: '#ccd6eb',
      zIndex: 1000,
      value: Date.parse(timestamp),
      label: {
        text: name,
        useHTML: true,
        x: 12,
        y: 1,
        rotation: 270,
        verticalAlign: 'bottom',
        style: {
          background: 'rgba(255, 255, 255, 0.5)',
          color: '#000000',
          padding: '3px',
          border: '1px solid #ccd6eb',
          borderTop: '0',
        },
      },
    })),
  },
  yAxis: {
    allowDecimals: false,
  },
  tooltip: {
    split: true,
    valueDecimals: 0,
  },
};
