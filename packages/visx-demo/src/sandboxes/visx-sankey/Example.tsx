import React from 'react';
import { lesMiserables } from '../../../../visx-mock-data/src';
import { sankey, Sankey } from "../../../../visx-sankey/src"

export type SankeyProps = {
  width: number;
  height: number;
};

export default function Example({ width, height }: SankeyProps) {
  const sankeyGraph = sankey({data: lesMiserables, width, height, nodeId: (node) => node.id, nodeWidth: 10});

  return <Sankey graph={sankeyGraph} width={width} height={height}/>;
}
