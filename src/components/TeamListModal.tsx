import { Table } from '@mantine/core';
import { openModal } from '@mantine/modals';
import { getEligibilityLabel, getTeamEligibilities, Team } from '../models';
import { Link } from './Link';
import { openTeamModal } from './TeamModal';

export function openTeamListModal(title: string, teams: Team[] | [Team, string][]): void {
  const rows = teams.map((value, i) => {
    const team = Array.isArray(value) ? value[0] : value;

    return (
      <tr key={i}>
        <td style={{ width: '1px', textAlign: 'right', whiteSpace: 'nowrap' }}>{i + 1}.</td>
        <td>
          <Link onClick={() => openTeamModal(team)}>{team.name}</Link>
        </td>
        <td>
          {getTeamEligibilities(team)
            .map(eligibility => getEligibilityLabel(eligibility))
            .join(', ')}
        </td>
        {Array.isArray(value) && <td style={{ textAlign: 'right' }}>{value[1]}</td>}
      </tr>
    );
  });

  openModal({
    title,
    overflow: 'inside',
    size: 'xl',
    styles: {
      body: {
        marginLeft: '-20px',
        marginRight: '-20px',
        marginBottom: '-20px',
      },
    },
    children: (
      <Table>
        <tbody>{rows}</tbody>
      </Table>
    ),
  });
}
