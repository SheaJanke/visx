import React from 'react';
import Sankey, { Props } from '../../sandboxes/visx-sankey/Example';
import GalleryTile from '../GalleryTile';

export { default as packageJson } from '../../sandboxes/visx-network/package.json';

const tileStyles = { background: '#f3f3f3' };
const detailsStyles = { color: '#191919' };

export default function SankeyTile() {
  return (
    <GalleryTile<Props>
      title="Sankey"
      description="<Sankey.Sankey />"
      exampleRenderer={Sankey}
      exampleUrl="/network"
      detailsStyles={detailsStyles}
      tileStyles={tileStyles}
    />
  );
}
