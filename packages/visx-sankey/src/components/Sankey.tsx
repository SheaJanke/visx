import React, { ReactNode, useEffect, useState } from 'react';
import {
  SankeyLinkInput,
  SankeyLinkOutput,
  SankeyNodeInput,
  SankeyNodeOutput,
  SankeyOutput,
} from '../types';
import SankeyNode from './SankeyNode';
import SankeyLink from './SankeyLink';
import { LinearGradient } from '@visx/gradient';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { Text, TextProps } from '@visx/text';
import { useSprings, animated } from '@react-spring/web';
import { TooltipInPortalProps } from '@visx/tooltip/lib/hooks/useTooltipInPortal';

interface TooltipNodeData<N extends SankeyNodeInput, L extends SankeyLinkInput> {
  type: 'node';
  data: SankeyNodeOutput<N, L>;
  getNodeColor: (node: SankeyNodeOutput<N, L>) => string;
}

interface TooltipLinkData<N extends SankeyNodeInput, L extends SankeyLinkInput> {
  type: 'link';
  data: SankeyLinkOutput<N, L>;
  getNodeColor: (node: SankeyNodeOutput<N, L>) => string;
}

type TooltipData<N extends SankeyNodeInput, L extends SankeyLinkInput> =
  | TooltipNodeData<N, L>
  | TooltipLinkData<N, L>;

interface Props<N extends SankeyNodeInput, L extends SankeyLinkInput> {
  graph: SankeyOutput<N, L>;
  width: number;
  height: number;
  linkOpacity?: number;
  linkHoverOpacity?: number;
  linkHoverOthersOpacity?: number;
  nodeColor?: (node: SankeyNodeOutput<N, L>) => string | undefined;
  nodeLabel?: (node: SankeyNodeOutput<N, L>) => string | undefined;
  nodeLabelProps?: (
    node: SankeyNodeOutput<N, L>,
    getNodeColor: (node: SankeyNodeOutput<N, L>) => string,
  ) => TextProps | undefined;
  nodeOpacity?: number;
  nodeHoverOpacity?: number;
  nodeHoverOthersOpacity?: number;
  tooltipProps?: TooltipInPortalProps;
  renderTooltip?: (data: TooltipData<N, L>) => ReactNode;
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
const NODE_LABEL_PADDING = 4;

export default function Sankey<N extends SankeyNodeInput, L extends SankeyLinkInput>({
  graph,
  width,
  height,
  linkOpacity = 0.4,
  linkHoverOpacity = 0.7,
  linkHoverOthersOpacity = 0.2,
  nodeColor,
  nodeLabel,
  nodeLabelProps,
  nodeOpacity = 0.8,
  nodeHoverOpacity = 1,
  nodeHoverOthersOpacity = 0.5,
  tooltipProps = {},
  renderTooltip,
}: Props<N, L>) {
  const [highlightedIds, setHighlightedIds] = useState<Set<string | number>>(new Set());
  const { tooltipData, tooltipOpen, tooltipLeft, tooltipTop, hideTooltip, showTooltip } =
    useTooltip<TooltipData<N, L>>();
  const { containerRef, TooltipInPortal } = useTooltipInPortal({ detectBounds: true });
  const nodes = graph.nodes;
  const links = graph.links;

  function getLinkId(link: SankeyLinkOutput<N, L>) {
    return `${link.source.id}_${link.target.id}`;
  }

  function getLinkOpacity(link: SankeyLinkOutput<N, L>) {
    if (highlightedIds.size === 0) {
      return linkOpacity;
    }
    if (highlightedIds.has(getLinkId(link))) {
      return linkHoverOpacity;
    }
    return linkHoverOthersOpacity;
  }

  function getNodeColor(node: SankeyNodeOutput<N, L>): string {
    return nodeColor?.(node) || DEFAULT_COLORS[node.index % DEFAULT_COLORS.length];
  }

  function getNodeOpacity(node: SankeyNodeOutput<N, L>) {
    if (highlightedIds.size === 0) {
      return nodeOpacity;
    }
    if (highlightedIds.has(node.id)) {
      return nodeHoverOpacity;
    }
    return nodeHoverOthersOpacity;
  }

  const [nodeSprings, nodeSpringsApi] = useSprings(nodes.length, (index) => ({
    opacity: getNodeOpacity(nodes[index]),
    config: {
      duration: 500,
    },
  }));

  const [linkSprings, linkSpringsApi] = useSprings(links.length, (index) => ({
    opacity: getLinkOpacity(links[index]),
    config: {
      duration: 500,
    },
  }));

  useEffect(() => {
    nodeSpringsApi.start((index) => ({
      opacity: getNodeOpacity(nodes[index]),
    }));
  }, [nodes, highlightedIds]);

  useEffect(() => {
    linkSpringsApi.start((index) => ({
      opacity: getLinkOpacity(links[index]),
    }));
  }, [nodes, highlightedIds]);

  const AnimatedSankeyNode = animated(SankeyNode);
  const AnimatedSankeyLink = animated(SankeyLink);

  return (
    <div className="visx-sankey" style={{ position: 'relative' }}>
      <svg ref={containerRef} width={width} height={height}>
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
                onMouseMove={(event) => {
                  const point = localPoint(event);
                  showTooltip({
                    tooltipData: {
                      type: 'link',
                      data: link,
                      getNodeColor,
                    },
                    tooltipLeft: point?.x,
                    tooltipTop: point?.y,
                  });
                }}
                onMouseLeave={() => {
                  setHighlightedIds(new Set());
                  hideTooltip();
                }}
                opacity={linkSprings[index].opacity}
                stroke={`url(#${linkId})`}
              />
            </g>
          );
        })}
        {nodes.map((node, i) => {
          const label = nodeLabel?.(node);
          const labelOnLeft = node.x0 > width / 2;
          const labelProps = nodeLabelProps?.(node, getNodeColor) || {};
          return (
            <g key={node.id}>
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
                onMouseMove={(event) => {
                  const point = localPoint(event);
                  showTooltip({
                    tooltipData: {
                      type: 'node',
                      data: node,
                      getNodeColor,
                    },
                    tooltipLeft: point?.x,
                    tooltipTop: point?.y,
                  });
                }}
                onMouseLeave={() => {
                  setHighlightedIds(new Set());
                  hideTooltip();
                }}
                opacity={nodeSprings[i].opacity}
              />
              {label && (
                <Text
                  fontSize={10}
                  textAnchor={labelOnLeft ? 'end' : 'start'}
                  x={labelOnLeft ? node.x0 - NODE_LABEL_PADDING : node.x1 + NODE_LABEL_PADDING}
                  y={(node.y0 + node.y1) / 2}
                  verticalAnchor="middle"
                  {...labelProps}
                >
                  {node.id}
                </Text>
              )}
            </g>
          );
        })}
      </svg>
      {tooltipOpen && tooltipData && renderTooltip && (
        <TooltipInPortal
          className="visx-sankey-tooltip"
          left={tooltipLeft}
          top={tooltipTop}
          key={Math.random()}
          {...tooltipProps}
        >
          {renderTooltip(tooltipData)}
        </TooltipInPortal>
      )}
    </div>
  );
}
