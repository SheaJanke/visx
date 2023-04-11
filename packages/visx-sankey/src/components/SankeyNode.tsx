import React from 'react';
import cx from 'classnames';
import { AddSVGProps } from '@visx/shape/lib/types';
import { SankeyLinkInput, SankeyNodeInput, SankeyNodeOutput } from '../types';

export type SankeyNodeProps<N extends SankeyNodeInput, L extends SankeyLinkInput> = {
  node: SankeyNodeOutput<N, L>;
  /** className to apply to rect element. */
  className?: string;
  /** reference to rect element. */
  innerRef?: React.Ref<SVGRectElement>;
};

export type AllSankeyNodeProps<N extends SankeyNodeInput, L extends SankeyLinkInput> = AddSVGProps<
  SankeyNodeProps<N, L>,
  SVGRectElement
>;

export default function SankeyNode<N extends SankeyNodeInput, L extends SankeyLinkInput>({
  node,
  className,
  innerRef,
  ...restProps
}: AddSVGProps<SankeyNodeProps<N, L>, SVGRectElement>) {
  return (
    <rect
      ref={innerRef}
      className={cx('visx-sankey-node', className)}
      x={node.x0}
      y={node.y0}
      width={node.x1 - node.x0}
      height={node.y1 - node.y0}
      {...restProps}
    />
  );
}
