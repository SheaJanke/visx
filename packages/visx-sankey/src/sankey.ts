import { sankey as d3Sankey } from 'd3-sankey';
import { SankeyGraph, SankeyLayout, SankeyLinkMinimal } from 'd3-sankey';

const CLIP_PADDING = 1;

interface Config<NodeExtraProperties, LinkExtraProperties> {
    /** The total width of the sankey layout. */
    width?: number;
    /** The total width of the sankey layout. */
    height?: number;
    /** Set the x-value accessor function for the voronoi layout. */
    x?: (d: Datum) => number;
    /** Set the y-value accessor function for the voronoi layout. */
    y?: (d: Datum) => number;
  }

export function sankey(graph: SankeyLinkMinimal) {
    const sankeyLayout = d3Sankey();
    sankeyLayout({nodes: [], links: []}, )
}