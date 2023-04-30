import React from 'react';
import SankeyDiagram from '../sandboxes/visx-sankey/Example';
import packageJson from '../sandboxes/visx-sankey/package.json';
import Show from '../components/Show';
import SankeyDiagramSource from '!!raw-loader!../sandboxes/visx-sankey/Example';

function SankeyPage() {
  return (
    <Show
      events
      margin={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      component={SankeyDiagram}
      title="Sankey"
      codeSandboxDirectoryName="visx-sankey"
      packageJson={packageJson}
    >
      {SankeyDiagramSource}
    </Show>
  );
}
export default SankeyPage;
