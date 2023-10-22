import { cloneDeep } from 'lodash';
import React from 'react';
import lesMiserables, {
  LesMiserables,
  LesMiserablesLink,
  LesMiserablesNode,
} from '@visx/mock-data/src/mocks/lesMiserables';
// FIXME: This should import from '@visx/sankey'
import { sankey, SankeyDiagram, SankeyDiagramProps } from '../../../../visx-sankey';

export type Props = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
};

const defaultMargin = {
  top: 16,
  left: 16,
  right: 16,
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

export default function Example({ width, height, margin = defaultMargin }: Props) {
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const sankeyGraph = sankey({
    data: getReducedDataset(cloneDeep(lesMiserables), 20),
    width: innerWidth,
    height: innerHeight,
    nodeWidth: 10,
  });

  const nodeLabel: SankeyDiagramProps<LesMiserablesNode, LesMiserablesLink>['nodeLabel'] = (node) =>
    node.id;

  const renderTooltip: SankeyDiagramProps<LesMiserablesNode, LesMiserablesLink>['renderTooltip'] = (
    tooltipData,
    getNodeColor,
  ) => {
    if (tooltipData.type === 'node') {
      const node = tooltipData.data;
      return (
        <span style={{ color: getNodeColor(node), fontWeight: 'bold' }}>{nodeLabel(node)}</span>
      );
    }
    const { source, target, value } = tooltipData.data;
    return (
      <div style={{ display: 'flex', gap: '4px', fontWeight: 'bold', color: '#161616' }}>
        <span style={{ color: getNodeColor(source) }}>{nodeLabel(source)}</span>
        &rarr;
        <span style={{ color: getNodeColor(target) }}>{nodeLabel(target)}</span>: {value}
      </div>
    );
  };

  return (
    <div style={{ marginLeft: margin.left, marginTop: margin.top, marginRight: margin.right }}>
      <SankeyDiagram
        graph={sankeyGraph}
        width={innerWidth}
        height={innerHeight}
        nodeLabel={nodeLabel}
        renderTooltip={renderTooltip}
        linkProps={(link) => ({ strokeWidth: link.width - 1 })}
        nodeProps={() => ({ rx: 2 })}
      />
    </div>
  );
}
