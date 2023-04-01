import React from 'react';
import { SankeyExtraProperties, SankeyGraph } from "d3-sankey";
import { Bar, Link, LinkHorizontal } from '@visx/shape';

interface Props<N extends SankeyExtraProperties, L extends SankeyExtraProperties> {
    graph: SankeyGraph<N, L>;
    width: number;
    height: number;
}

export default function Sankey<N extends SankeyExtraProperties, L extends SankeyExtraProperties>({ graph, width, height }: Props<N, L>) {
    const nodes = Array.from(graph.nodes);
    const links = Array.from(graph.links);
    console.log('graph', graph);
    return <svg width={width} height={height}>
        {nodes.map((node) => {
            const nodeWidth = node.x1! - node.x0!;
            const nodeHeight = node.y1! - node.y0!;
            return <Bar width={nodeWidth} height={nodeHeight} x={node.x0} y={node.y0} fill='red'/>
        })}
        {links.map((link) => {
            return <LinkHorizontal data={link} x1={link.source.x1} x2={link.target.x0} y1={link.y0} y2={link.y1}/>
        })}
    </svg>
}