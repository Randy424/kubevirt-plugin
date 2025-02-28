import { useCallback, useMemo } from 'react';

import { NodeModel, VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { useSupportsMulticluster } from '@kubevirt-utils/hooks/useSupportsMulticluster';
import { columnSorting } from '@kubevirt-utils/utils/utils';
import {
  K8sResourceCommon,
  K8sVerb,
  TableColumn,
  useAccessReview,
} from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';
import { VMIMapper } from '@virtualmachines/utils/mappers';

import { sortByCPUUsage, sortByMemoryUsage, sortByNetworkUsage, sortByNode } from './sortColumns';

const useVirtualMachineColumns = (
  namespace: string,
  pagination: { [key: string]: any },
  data: V1VirtualMachine[],
  vmiMapper: VMIMapper,
): [TableColumn<K8sResourceCommon>[], TableColumn<K8sResourceCommon>[], boolean] => {
  const { t } = useKubevirtTranslation();

  const supportsMulticluster = useSupportsMulticluster();

  const [canGetNode] = useAccessReview({
    namespace: namespace,
    resource: NodeModel.plural,
    verb: 'get' as K8sVerb,
  });

  const sorting = useCallback(
    (direction, path) => columnSorting(data, direction, pagination, path),
    [data, pagination],
  );

  const sortingUsingFunction = useCallback(
    (direction, compareFunction) => compareFunction(data, direction, pagination),
    [data, pagination],
  );

  const sortingUsingFunctionWithMapper = useCallback(
    (direction, compareFunction) => compareFunction(data, direction, pagination, vmiMapper),
    [data, pagination, vmiMapper],
  );

  const columns: TableColumn<K8sResourceCommon>[] = useMemo(
    () => [
      {
        id: 'name',
        props: { className: 'pf-m-width-20' },
        sort: (_, direction) => sorting(direction, 'metadata.name'),
        title: t('Name'),
        transforms: [sortable],
      },
      ...(!namespace
        ? [
            {
              id: 'namespace',
              sort: (_, direction) => sorting(direction, 'metadata.namespace'),
              title: t('Namespace'),
              transforms: [sortable],
            },
          ]
        : []),
      ...(supportsMulticluster
        ? [
            {
              id: 'cluster',
              sort: (_, direction) => sorting(direction, 'cluster'),
              title: t('Cluster'),
              transforms: [sortable],
            },
          ]
        : []),
      {
        id: 'status',
        sort: (_, direction) => sorting(direction, 'status.printableStatus'),
        title: t('Status'),
        transforms: [sortable],
      },
      ...(supportsMulticluster
        ? []
        : [
            {
              id: 'conditions',
              title: t('Conditions'),
            },
          ]),
      ...(canGetNode
        ? [
            {
              id: 'node',
              sort: (_, direction) => sortingUsingFunctionWithMapper(direction, sortByNode),
              title: t('Node'),
              transforms: [sortable],
            },
          ]
        : []),
      {
        additional: true,
        id: 'created',
        sort: (_, direction) => sorting(direction, 'metadata.creationTimestamp'),
        title: t('Created'),
        transforms: [sortable],
      },
      {
        id: 'ip-address',
        title: t('IP address'),
      },
      ...(supportsMulticluster
        ? []
        : [
            {
              additional: true,
              id: 'memory-usage',
              sort: (_, direction) => sortingUsingFunctionWithMapper(direction, sortByMemoryUsage),
              title: t('Memory'),
              transforms: [sortable],
            },
            {
              additional: true,
              id: 'cpu-usage',
              sort: (_, direction) => sortingUsingFunction(direction, sortByCPUUsage),
              title: t('CPU'),
              transforms: [sortable],
            },
            {
              additional: true,
              id: 'network-usage',
              sort: (_, direction) => sortingUsingFunction(direction, sortByNetworkUsage),
              title: t('Network'),
              transforms: [sortable],
            },
          ]),
      {
        id: '',
        props: { className: 'dropdown-kebab-pf pf-v5-c-table__action' },
        title: '',
      },
    ],
    [
      canGetNode,
      namespace,
      sorting,
      sortingUsingFunction,
      sortingUsingFunctionWithMapper,
      supportsMulticluster,
      t,
    ],
  );

  const [activeColumns, , loaded] = useKubevirtUserSettingsTableColumns<K8sResourceCommon>({
    columnManagementID: VirtualMachineModelRef,
    columns: canGetNode ? columns : columns.filter((column) => column.id !== 'node'),
  });

  return [columns, activeColumns, loaded];
};

export default useVirtualMachineColumns;
