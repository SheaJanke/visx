import React from 'react';
import Sankey, { SankeyProps } from '../../sandboxes/visx-sankey/Example';
import GalleryTile from '../GalleryTile';

export { default as packageJson } from '../../sandboxes/visx-network/package.json';

export default function SankeyTile() {
  return (
    <GalleryTile<SankeyProps>
      title="Sankey"
      description="<Sankey.Sankey />"
      exampleRenderer={Sankey}
      exampleUrl="/network"
      //tileStyles={tileStyles}
    />
  );
}
