import { Card, Title, useMantineTheme } from '@mantine/core';
import { ReactNode } from 'react';

export interface SectionProps {
  title: string;
  children?: ReactNode;
}

export function Section({ title, children }: SectionProps): JSX.Element {
  const theme = useMantineTheme();

  return (
    <Card withBorder shadow="xs" radius="xs">
      <Card.Section withBorder inheritPadding py={8} style={{ background: theme.colors.gray[2] }}>
        <Title order={4}>{title}</Title>
      </Card.Section>

      {children}
    </Card>
  );
}
