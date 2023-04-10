import React from 'react';
import cx from 'classnames';
import { AddSVGProps } from '@visx/shape/lib/types';
import { SankeyLinkInput, SankeyLinkOutput, SankeyNodeInput } from '../types';
import { linkHorizontal } from 'd3-shape';

export type SankeyLinkProps<N extends SankeyNodeInput, L extends SankeyLinkInput> = {
  link: SankeyLinkOutput<N, L>;
  /** className to apply to rect element. */
  className?: string;
  /** reference to rect element. */
  innerRef?: React.Ref<SVGRectElement>;
};

export type AllSankeyLinkProps<N extends SankeyNodeInput, L extends SankeyLinkInput> = AddSVGProps<
  SankeyLinkProps<N, L>,
  SVGPathElement
>;

export default function SankeyLink<N extends SankeyNodeInput, L extends SankeyLinkInput>({
  link,
  className,
  innerRef,
  ...restProps
}: AllSankeyLinkProps<N, L>) {
  const linkPath = linkHorizontal()({
    source: [link.source.x1, link.y0],
    target: [link.target.x0, link.y1],
  });

  if (!linkPath) {
    return null;
  }
  return (
    <path
      className={cx('visx-sankey-link', className)}
      ref={innerRef}
      d={linkPath}
      strokeWidth={link.width}
      fill="none"
      {...restProps}
    />
  );
}
