import {
  sankey as d3Sankey,
  sankeyCenter,
  SankeyExtraProperties,
  sankeyJustify,
  sankeyLeft,
  SankeyLink,
  SankeyNode,
  sankeyRight,
} from 'd3-sankey';
import { SankeyGraph } from 'd3-sankey';

import { SankeyNodeAlign } from './types';

const CLIP_PADDING = 1;

interface Config<N extends SankeyExtraProperties, L extends SankeyExtraProperties> {
  data: SankeyGraph<N, L>;
  /** The total width of the sankey layout. */
  width?: number;
  /** The total width of the sankey layout. */
  height?: number;

  nodeAlign?: SankeyNodeAlign;

  nodeWidth?: number;

  nodePadding?: number;
  /** The node id accessor for the sankey layout. Defaults to index */
  nodeId?: (node: SankeyNode<N, L>) => string | number;

  nodeSort?: (a: SankeyNode<N, L>, b: SankeyNode<N, L>) => number;

  linkSort?: (a: SankeyLink<N, L>, b: SankeyLink<N, L>) => number;
}

const NODE_ALIGN_MAP = {
  left: sankeyLeft,
  right: sankeyRight,
  center: sankeyCenter,
  justify: sankeyJustify,
};

export function sankey<N extends SankeyExtraProperties, L extends SankeyExtraProperties>({
  data,
  width = 0,
  height = 0,
  nodeAlign,
  nodeWidth,
  nodePadding,
  nodeId,
  nodeSort,
  linkSort,
}: Config<N, L>): SankeyGraph<N, L> {
  const sankeyLayout = d3Sankey<SankeyGraph<N, L>, N, L>();
  sankeyLayout.extent([
    [-CLIP_PADDING, -CLIP_PADDING],
    [width + CLIP_PADDING, height + CLIP_PADDING],
  ]);
  nodeAlign && sankeyLayout.nodeAlign(NODE_ALIGN_MAP[nodeAlign]);
  nodeWidth && sankeyLayout.nodeWidth(nodeWidth);
  nodePadding && sankeyLayout.nodePadding(nodePadding);
  nodeId && sankeyLayout.nodeId(nodeId);
  nodeSort && sankeyLayout.nodeSort(nodeSort);
  linkSort && sankeyLayout.linkSort(linkSort);
  return sankeyLayout(data);
}
