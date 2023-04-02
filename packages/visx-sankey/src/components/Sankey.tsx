import React, { useState } from 'react';
import { SankeyLinkInput, SankeyNodeInput, SankeyOutput } from '../types';
import SankeyNode from './SankeyNode';
import SankeyLink from './SankeyLink';

interface Props<N extends SankeyNodeInput, L extends SankeyLinkInput> {
  graph: SankeyOutput<N, L>;
  width: number;
  height: number;
}

export default function Sankey<N extends SankeyNodeInput, L extends SankeyLinkInput>({
  graph,
  width,
  height,
}: Props<N, L>) {
  const [highlightLinks, setHighlightLinks] = useState<Set<number>>(new Set());
  const nodes = graph.nodes;
  const links = graph.links;

  return (
    <svg width={width} height={height}>
      {links.map((link) => {
        return (
          <SankeyLink
            key={`${link.source.id}_${link.target.id}`}
            link={link}
            onMouseEnter={() => {
              setHighlightLinks(new Set([link.index]));
            }}
            onMouseLeave={() => setHighlightLinks(new Set())}
            strokeOpacity={highlightLinks.has(link.index) ? 0.8 : 0.2}
          />
        );
      })}
      {nodes.map((node) => {
        return <SankeyNode key={node.id} node={node} />;
      })}
    </svg>
  );
}
