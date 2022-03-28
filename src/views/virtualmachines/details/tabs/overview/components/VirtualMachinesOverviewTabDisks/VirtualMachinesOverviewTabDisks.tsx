import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useDisksTableData from '@kubevirt-utils/resources/vm/hooks/disk/useDisksTableData';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';
import { Card, CardBody, CardTitle, Divider } from '@patternfly/react-core';

import useVirtualMachinesOverviewTabDisksColumns from './hooks/useVirtualMachinesOverviewTabDisksColumns';
import VirtualMachinesOverviewTabDisksRow from './VirtualMachinesOverviewTabDisksRow';

import './virtual-machines-overview-tab-disks.scss';

const VirtualMachinesOverviewTabDisks = ({ vm }) => {
  const [disks, loaded, loadedError] = useDisksTableData(vm);
  const { t } = useKubevirtTranslation();
  const columns = useVirtualMachinesOverviewTabDisksColumns();

  return (
    <div className="VirtualMachinesOverviewTabDisks--main">
      <Card>
        <CardTitle className="text-muted">
          {t('Disk ({{count}})', { count: disks.length || 0 })}
        </CardTitle>
        <Divider />
        <CardBody isFilled>
          <VirtualizedTable<DiskRowDataLayout>
            data={disks}
            unfilteredData={disks}
            loaded={loaded}
            loadError={loadedError}
            columns={columns}
            Row={VirtualMachinesOverviewTabDisksRow}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default VirtualMachinesOverviewTabDisks;
