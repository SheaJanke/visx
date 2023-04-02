import {
  sankey as d3Sankey,
  sankeyCenter,
  SankeyExtraProperties,
  sankeyJustify,
  sankeyLeft,
  sankeyRight,
} from 'd3-sankey';
import { SankeyGraph } from 'd3-sankey';

import {
  SankeyInput,
  SankeyLinkInput,
  SankeyLinkOutput,
  SankeyNodeAlign,
  SankeyNodeInput,
  SankeyNodeOutput,
  SankeyOutput,
} from './types';

const CLIP_PADDING = 1;

interface Config<N extends SankeyNodeInput, L extends SankeyLinkInput> {
  data: SankeyInput<N, L>;
  /** The total width of the sankey layout. */
  width?: number;
  /** The total width of the sankey layout. */
  height?: number;

  nodeAlign?: SankeyNodeAlign;

  nodeWidth?: number;

  nodePadding?: number;

  nodeSort?: (a: N, b: N) => number;

  linkSort?: (a: L, b: L) => number;
}

const NODE_ALIGN_MAP = {
  left: sankeyLeft,
  right: sankeyRight,
  center: sankeyCenter,
  justify: sankeyJustify,
};

function validateSankeyGraph<N extends SankeyNodeInput, L extends SankeyLinkInput>(
  graph: SankeyGraph<N, L>,
): SankeyOutput<N, L> {
  return {
    nodes: graph.nodes.map((node) => ({
      depth: node.depth || 0,
      height: node.height || 0,
      id: node.id,
      index: node.index || 0,
      sourceLinks: node.sourceLinks || [],
      targetLinks: node.targetLinks || [],
      value: node.value || 0,
      x0: node.value || 0,
      x1: node.x1 || 0,
      y0: node.y0 || 0,
      y1: node.y1 || 0,
    })),
  };
}

export function sankey<N extends SankeyNodeInput, L extends SankeyLinkInput>({
  data,
  width = 0,
  height = 0,
  nodeAlign,
  nodeWidth,
  nodePadding,
  nodeSort,
  linkSort,
}: Config<N, L>): SankeyOutput<N, L> | null {
  const sankeyLayout = d3Sankey<SankeyGraph<N, L>, N, L>();
  sankeyLayout.size([width, height]);
  sankeyLayout.nodeId((node) => node.id);
  nodeAlign && sankeyLayout.nodeAlign(NODE_ALIGN_MAP[nodeAlign]);
  nodeWidth && sankeyLayout.nodeWidth(nodeWidth);
  nodePadding && sankeyLayout.nodePadding(nodePadding);
  nodeSort && sankeyLayout.nodeSort(nodeSort);
  linkSort && sankeyLayout.linkSort(linkSort);
  return sankeyLayout(data);
}
