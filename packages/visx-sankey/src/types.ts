export type SankeyNodeAlign = 'left' | 'right' | 'center' | 'justify';
export type SankeyNodeId = string | number;

export interface SankeyNodeInput {
  id: SankeyNodeId;
}

interface SankeyNodeCalculatedOutput<N extends SankeyNodeInput, L extends SankeyLinkInput> {
  sourceLinks: SankeyLinkOutput<N, L>[];
  targetLinks: SankeyLinkOutput<N, L>[];
  value: number;
  index: number;
  /**
   * Node’s zero-based graph depth, derived from the graph topology.
   */
  depth: number;
  /**
   * Node’s zero-based graph height, derived from the graph topology.
   */
  height: number;
  /**
   * Node's minimum horizontal position (derived from the node.depth).
   */
  x0: number;
  /**
   * Node’s maximum horizontal position (node.x0 + sankey.nodeWidth).
   */
  x1: number;
  /**
   * Node's minimum vertical position.
   */
  y0: number;
  /**
   * Node's maximum vertical position (node.y1 - node.y0 is proportional to node.value).
   */
  y1: number;
}

export type SankeyNodeOutput<
  N extends SankeyNodeInput,
  L extends SankeyLinkInput,
> = SankeyNodeCalculatedOutput<N, L> & N;

export interface SankeyLinkInput {
  source: SankeyNodeId;
  target: SankeyNodeId;
  value: number;
}

interface SankeyLinkCalculatedOutput<N extends SankeyNodeInput, L extends SankeyLinkInput> {
  /**
   * Link's source node.
   */
  source: SankeyNodeOutput<N, L>;
  /**
   * Link's target node.
   */
  target: SankeyNodeOutput<N, L>;
  /**
   * Link's numeric value.
   */
  value: number;
  /**
   * Link's vertical starting position (at source node).
   */
  y0: number;
  /**
   * Link's vertical end position (at target node).
   */
  y1: number;
  /**
   * Link's width (proportional to its value).
   */
  width: number;
  /**
   * Link's zero-based index within the array of links.
   */
  index: number;
}

export type SankeyLinkOutput<
  N extends SankeyNodeInput,
  L extends SankeyLinkInput,
> = SankeyLinkCalculatedOutput<N, L> & L;

export interface SankeyInput<N extends SankeyNodeInput, L extends SankeyLinkInput> {
  nodes: N[];
  links: L[];
}

export interface SankeyOutput<N extends SankeyNodeInput, L extends SankeyLinkInput> {
  nodes: SankeyNodeOutput<N, L>[];
  links: SankeyLinkOutput<N, L>[];
}

/** Re-export useful types from d3-sankey. */
