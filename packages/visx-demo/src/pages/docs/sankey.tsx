import React from 'react';
import SankeyReadme from '!!raw-loader!../../../../visx-sankey/Readme.md';
import { sankey, SankeyDiagram } from '../../../../visx-sankey/src';
import DocPage from '../../components/DocPage';
import SankeyTile from '../../components/Gallery/SankeyTile';

const components = [sankey, SankeyDiagram];

const examples = [SankeyTile];

function SankeyDocs() {
  return (
    <DocPage
      components={components}
      examples={examples}
      readme={SankeyReadme}
      visxPackage="sankey"
    />
  );
}
export default SankeyDocs;