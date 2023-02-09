import { createStyles } from '@mantine/core';
import { AnchorHTMLAttributes, ReactNode } from 'react';

const useStyles = createStyles(theme => ({
  link: {
    color: theme.primaryColor,
  },
}));

export interface LinkProps {
  href?: string;
  onClick?: () => void;
  children?: ReactNode;
}

export function Link({ href, onClick, children }: LinkProps): JSX.Element {
  const { classes } = useStyles();

  const props: AnchorHTMLAttributes<any> = {
    className: classes.link,
  };

  if (href !== undefined) {
    props.href = href;
    props.target = '_blank';
    props.rel = 'noreferrer';
  } else if (onClick !== undefined) {
    props.href = '#';
    props.onClick = e => {
      onClick();
      e.preventDefault();
    };
  }

  return <a {...props}>{children}</a>;
}
