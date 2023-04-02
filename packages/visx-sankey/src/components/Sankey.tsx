import React, { useEffect, useState } from 'react';
import { SankeyLinkInput, SankeyLinkOutput, SankeyNodeInput, SankeyNodeOutput, SankeyOutput } from '../types';
import SankeyNode from './SankeyNode';
import SankeyLink from './SankeyLink';
import { LinearGradient } from '@visx/gradient';
import { useSprings, animated } from '@react-spring/web'; 

interface Props<N extends SankeyNodeInput, L extends SankeyLinkInput> {
  graph: SankeyOutput<N, L>;
  width: number;
  height: number;
  linkOpacity?: number;
  linkHoverOpacity?: number;
  linkHoverOthersOpacity?: number;
  nodeColor?: (node: SankeyNodeOutput<N, L>) => string;
  nodeOpacity?: number;
  nodeHoverOpacity?: number;
  nodeHoverOthersOpacity?: number;
}

const DEFAULT_COLORS = [
  '#D32F2F',
  '#7B1FA2',
  '#303F9F',
  '#0288D1',
  '#00796B',
  '#689F38',
  '#FBC02D',
  '#F57C00',
  '#5D4037',
  '#455A64',
];

export default function Sankey<N extends SankeyNodeInput, L extends SankeyLinkInput>({
  graph,
  width,
  height,
  linkOpacity = 0.4,
  linkHoverOpacity = 0.7,
  linkHoverOthersOpacity = 0.2,
  nodeColor,
  nodeOpacity = 0.8,
  nodeHoverOpacity = 1,
  nodeHoverOthersOpacity = 0.5
}: Props<N, L>) {
  const [highlightedIds, setHighlightedIds] = useState<Set<string | number>>(new Set());
  const nodes = graph.nodes;
  const links = graph.links;

  function getLinkId(link: SankeyLinkOutput<N, L>) {
    return `${link.source.id}_${link.target.id}`;
  }

  function getLinkOpacity(link: SankeyLinkOutput<N, L>) {
    if(highlightedIds.size === 0){
        return linkOpacity;
    }
    if(highlightedIds.has(getLinkId(link))){
        return linkHoverOpacity;
    }
    return linkHoverOthersOpacity;
  }

  function getNodeColor(node: SankeyNodeOutput<N, L>) {
    if (nodeColor) {
      return nodeColor(node);
    }
    return DEFAULT_COLORS[node.index % DEFAULT_COLORS.length];
  }

  function getNodeOpacity(node: SankeyNodeOutput<N, L>) {
    if(highlightedIds.size === 0){
        return nodeOpacity;
    }
    if(highlightedIds.has(node.id)) {
        return nodeHoverOpacity;
    }
    return nodeHoverOthersOpacity;
  }

  const [nodeSprings, nodeSpringsApi] = useSprings(nodes.length, (index) => ({
    opacity: getNodeOpacity(nodes[index]),
    config: {
        duration: 500
    }
  }));

  const [linkSprings, linkSpringsApi] = useSprings(links.length, (index) => ({
    opacity: getLinkOpacity(links[index]),
    config: {
        duration: 500
    }
  }));

  useEffect(() => {
    nodeSpringsApi.start((index) => ({
        opacity: getNodeOpacity(nodes[index])
    }));
  }, [nodes, highlightedIds]);

  useEffect(() => {
    linkSpringsApi.start((index) => ({
        opacity: getLinkOpacity(links[index])
    }));
  }, [nodes, highlightedIds]);

  const AnimatedSankeyNode = animated(SankeyNode);
  const AnimatedSankeyLink = animated(SankeyLink);

  return (
    <svg width={width} height={height}>
      {links.map((link, index) => {
        const linkId = getLinkId(link);
        return (
          <g key={linkId}>
            <LinearGradient
              id={linkId}
              from={getNodeColor(link.source)}
              to={getNodeColor(link.target)}
              gradientUnits="userSpaceOnUse"
              x1={link.source.x1}
              x2={link.target.x0}
            />
            <AnimatedSankeyLink
              link={link}
              onMouseEnter={() => {
                setHighlightedIds(new Set([linkId, link.source.id, link.target.id]));
              }}
              onMouseLeave={() => setHighlightedIds(new Set())}
              opacity={linkSprings[index].opacity}
              stroke={`url(#${linkId})`}
            />
          </g>
        );
      })}
      {nodes.map((node, i) => {
        return (
          <AnimatedSankeyNode
            key={node.id}
            node={node}
            fill={getNodeColor(node)}
            onMouseEnter={() => {
                const newHighlightedIds = new Set<string | number>([node.id]);
                node.sourceLinks.forEach((link) => {
                    newHighlightedIds.add(getLinkId(link));
                    newHighlightedIds.add(link.target.id);
                });
                node.targetLinks.forEach((link) => {
                    newHighlightedIds.add(getLinkId(link));
                    newHighlightedIds.add(link.source.id);
                });
              setHighlightedIds(newHighlightedIds);
            }}
            onMouseLeave={() => setHighlightedIds(new Set())}
            opacity={nodeSprings[i].opacity}
          />
        );
      })}
    </svg>
  );
}
