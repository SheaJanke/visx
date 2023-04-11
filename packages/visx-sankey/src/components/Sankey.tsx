import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
  SankeyLinkInput,
  SankeyLinkOutput,
  SankeyNodeInput,
  SankeyNodeOutput,
  SankeyOutput,
} from '../types';
import SankeyNode, { AllSankeyNodeProps } from './SankeyNode';
import SankeyLink, { AllSankeyLinkProps } from './SankeyLink';
import { LinearGradient } from '@visx/gradient';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { Text, TextProps } from '@visx/text';
import { useSprings, animated, UseSpringsProps } from '@react-spring/web';
import { TooltipInPortalProps, UseTooltipPortalOptions } from '@visx/tooltip/lib/hooks/useTooltipInPortal';

type GetNodeColor<N extends SankeyNodeInput, L extends SankeyLinkInput> = (
  node: SankeyNodeOutput<N, L>,
) => string;

interface TooltipNodeData<N extends SankeyNodeInput, L extends SankeyLinkInput> {
  type: 'node';
  data: SankeyNodeOutput<N, L>;
  getNodeColor: GetNodeColor<N, L>;
}

interface TooltipLinkData<N extends SankeyNodeInput, L extends SankeyLinkInput> {
  type: 'link';
  data: SankeyLinkOutput<N, L>;
  getNodeColor: GetNodeColor<N, L>;
}

type TooltipData<N extends SankeyNodeInput, L extends SankeyLinkInput> =
  | TooltipNodeData<N, L>
  | TooltipLinkData<N, L>;

export interface Props<N extends SankeyNodeInput, L extends SankeyLinkInput> {
  graph: SankeyOutput<N, L>;
  width: number;
  height: number;
  hideTooltipDebounceMs?: number;
  linkOpacity?: number;
  linkHoverOpacity?: number;
  linkHoverOthersOpacity?: number;
  linkProps?: (
    link: SankeyLinkOutput<N, L>,
    getNodeColor: GetNodeColor<N, L>,
  ) => Omit<AllSankeyLinkProps<N, L>, 'link'>;
  nodeColor?: (node: SankeyNodeOutput<N, L>) => string | undefined;
  nodeLabel?: (node: SankeyNodeOutput<N, L>) => string | undefined;
  nodeLabelProps?: (
    node: SankeyNodeOutput<N, L>,
    getNodeColor: GetNodeColor<N, L>,
  ) => TextProps | undefined;
  nodeProps?: (
    node: SankeyNodeOutput<N, L>,
    getNodeColor: GetNodeColor<N, L>,
  ) => Omit<AllSankeyNodeProps<N, L>, 'node'>;
  nodeOpacity?: number;
  nodeHoverOpacity?: number;
  nodeHoverOthersOpacity?: number;
  opacityAnimationConfig?: UseSpringsProps['config'];
  tooltipOptions?: UseTooltipPortalOptions;
  tooltipProps?: TooltipInPortalProps;
  renderTooltip?: (data: TooltipData<N, L>, getNodeColor: GetNodeColor<N, L>) => ReactNode;
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
  hideTooltipDebounceMs = 400,
  linkOpacity = 0.4,
  linkHoverOpacity = 0.7,
  linkHoverOthersOpacity = 0.2,
  linkProps,
  nodeColor,
  nodeLabel,
  nodeLabelProps,
  nodeOpacity = 0.9,
  nodeProps,
  nodeHoverOpacity = 1,
  nodeHoverOthersOpacity = 0.5,
  opacityAnimationConfig = { duration: 500 },
  tooltipOptions = {
    detectBounds: true,
    scroll: true,
  },
  tooltipProps = {},
  renderTooltip,
}: Props<N, L>) {
  const [highlightedIds, setHighlightedIds] = useState<Set<string | number>>(new Set());
  const { tooltipData, tooltipOpen, tooltipLeft, tooltipTop, hideTooltip, showTooltip } =
    useTooltip<TooltipData<N, L>>();
  const { containerRef, TooltipInPortal } = useTooltipInPortal(tooltipOptions);
  const hideTooltipRef = useRef<NodeJS.Timeout | null>(null);
  const nodes = graph.nodes;
  const links = graph.links;

  function debouncedHideTooltip() {
    hideTooltipRef.current = setTimeout(() => {
      hideTooltip();
    }, hideTooltipDebounceMs);
  }

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
    config: opacityAnimationConfig
  }));

  const [linkSprings, linkSpringsApi] = useSprings(links.length, (index) => ({
    opacity: getLinkOpacity(links[index]),
    config: opacityAnimationConfig
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

  if (width <= 0 || height <= 0) {
    return null;
  }

  return (
    <div className="visx-sankey" style={{ position: 'relative' }}>
      <svg ref={containerRef} width={width} height={height}>
        {links.map((link, index) => {
          const linkId = getLinkId(link);
          const { onMouseEnter, onMouseMove, onMouseLeave, ...restLinkProps } =
            linkProps?.(link, getNodeColor) || {};
          return (
            <animated.g key={linkId} opacity={linkSprings[index].opacity}>
              <LinearGradient
                id={linkId}
                from={getNodeColor(link.source)}
                to={getNodeColor(link.target)}
                gradientUnits="userSpaceOnUse"
                x1={link.source.x1}
                x2={link.target.x0}
              />
              <SankeyLink
                link={link}
                onMouseEnter={(event) => {
                  setHighlightedIds(new Set([linkId, link.source.id, link.target.id]));
                  onMouseEnter && onMouseEnter(event);
                }}
                onMouseMove={(event) => {
                  const point = localPoint(event);
                  if(hideTooltipRef.current){
                    clearTimeout(hideTooltipRef.current);
                    hideTooltipRef.current = null;
                  }
                  showTooltip({
                    tooltipData: {
                      type: 'link',
                      data: link,
                      getNodeColor,
                    },
                    tooltipLeft: point?.x,
                    tooltipTop: point?.y,
                  });
                  onMouseMove && onMouseMove(event);
                }}
                onMouseLeave={(event) => {
                  setHighlightedIds(new Set());
                  debouncedHideTooltip();
                  onMouseLeave && onMouseLeave(event);
                }}
                stroke={`url(#${linkId})`}
                {...restLinkProps}
              />
            </animated.g>
          );
        })}
        {nodes.map((node, i) => {
          const label = nodeLabel?.(node);
          const labelOnLeft = node.x0 > width / 2;
          const labelProps = nodeLabelProps?.(node, getNodeColor) || {};
          const { onMouseEnter, onMouseMove, onMouseLeave, ...restNodeProps } =
            nodeProps?.(node, getNodeColor) || {};
          return (
            <animated.g key={node.id} opacity={nodeSprings[i].opacity}>
              <SankeyNode
                key={node.id}
                node={node}
                fill={getNodeColor(node)}
                onMouseEnter={(event) => {
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
                  onMouseEnter && onMouseEnter(event);
                }}
                onMouseMove={(event) => {
                  const point = localPoint(event);
                  if(hideTooltipRef.current){
                    clearTimeout(hideTooltipRef.current);
                    hideTooltipRef.current = null;
                  }
                  showTooltip({
                    tooltipData: {
                      type: 'node',
                      data: node,
                      getNodeColor,
                    },
                    tooltipLeft: point?.x,
                    tooltipTop: point?.y,
                  });
                  onMouseMove && onMouseMove(event);
                }}
                onMouseLeave={(event) => {
                  setHighlightedIds(new Set());
                  debouncedHideTooltip();
                  onMouseLeave && onMouseLeave(event);
                }}
                {...restNodeProps}
              />
              {label && (
                <Text
                  fontSize={10}
                  pointerEvents='none'
                  textAnchor={labelOnLeft ? 'end' : 'start'}
                  verticalAnchor="middle"
                  x={labelOnLeft ? node.x0 - NODE_LABEL_PADDING : node.x1 + NODE_LABEL_PADDING}
                  y={(node.y0 + node.y1) / 2}
                  {...labelProps}
                >
                  {node.id}
                </Text>
              )}
            </animated.g>
          );
        })}
      </svg>
      {tooltipOpen && tooltipData && renderTooltip?.(tooltipData, getNodeColor) && (
        <TooltipInPortal
          className="visx-sankey-tooltip"
          left={tooltipLeft}
          top={tooltipTop}
          key={Math.random()}
          {...tooltipProps}
        >
          {renderTooltip(tooltipData, getNodeColor)}
        </TooltipInPortal>
      )}
    </div>
  );
}
