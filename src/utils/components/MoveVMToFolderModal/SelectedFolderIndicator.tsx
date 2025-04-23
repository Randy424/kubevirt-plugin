import React, { FC } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { StackItem } from '@patternfly/react-core';
import { FolderIcon, ProjectDiagramIcon } from '@patternfly/react-icons';

type SelectedFolderIndicatorProps = {
  folderName: string;
};

const SelectedFolderIndicator: FC<SelectedFolderIndicatorProps> = ({ folderName }) => (
  <StackItem>
    {folderName ? <FolderIcon /> : <ProjectDiagramIcon />}
    <span className="pf-v6-u-ml-sm">{folderName || t('Project root')}</span>
  </StackItem>
);

export default SelectedFolderIndicator;
