import { Table } from '@mantine/core';
import { Link } from './Link';

export type StatisticsTableCell = string | { label: string; action: () => void };
export type StatisticsTableRow =
  | [StatisticsTableCell, StatisticsTableCell]
  | [StatisticsTableCell, StatisticsTableCell, StatisticsTableCell];

export interface StatisticsTableProps {
  rows: StatisticsTableRow[];
}

export function StatisticsTable({ rows }: StatisticsTableProps): JSX.Element {
  const rowElements = rows.map((row, i) => {
    const cells = row.map((cell, j) => {
      if (typeof cell === 'string') {
        return cell;
      } else {
        return (
          <Link key={j} onClick={cell.action}>
            {cell.label}
          </Link>
        );
      }
    });

    if (row.length === 2) {
      return (
        <tr key={i}>
          <td>{cells[0]}</td>
          <td style={{ textAlign: 'right' }}>{cells[1]}</td>
        </tr>
      );
    } else {
      return (
        <tr key={i}>
          <td style={{ width: '1px', textAlign: 'right' }}>{cells[0]}</td>
          <td>{cells[1]}</td>
          <td style={{ textAlign: 'right' }}>{cells[2]}</td>
        </tr>
      );
    }
  });

  return (
    <Table>
      <tbody>{rowElements}</tbody>
    </Table>
  );
}
