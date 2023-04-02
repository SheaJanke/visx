import React from 'react';
import { sankey, Sankey } from '../../../../visx-sankey/src';
import lesMiserables, { LesMiserables } from '@visx/mock-data/src/mocks/lesMiserables';
import { cloneDeep } from 'lodash';

export type SankeyProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
};

const defaultMargin = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 76,
};

function getReducedDataset(data: LesMiserables, numNodes: number): LesMiserables {
  const reducedNodeIds: Set<string> = new Set();
  data.nodes.forEach((node, index) => {
    if (index < numNodes) {
      reducedNodeIds.add(node.id);
    }
  });
  return {
    nodes: data.nodes.filter((node) => reducedNodeIds.has(node.id)),
    links: data.links.filter(
      (link) => reducedNodeIds.has(link.source) && reducedNodeIds.has(link.target),
    ),
  };
}

export default function Example({ width, height, margin = defaultMargin }: SankeyProps) {
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const sankeyGraph = sankey({
    data: getReducedDataset(cloneDeep(lesMiserables), 20),
    width: innerWidth,
    height: innerHeight,
    nodeWidth: 10,
  });

  return <Sankey graph={sankeyGraph} width={innerWidth} height={innerHeight} />;
}
