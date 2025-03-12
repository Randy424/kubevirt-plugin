/* eslint-disable @typescript-eslint/no-unused-vars */

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui/kubevirt-api/console';
import { MulticlusterResource } from '@kubevirt-utils/contexts/KubevirtPluginContext';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';

import useKubevirtWatchResource from './useKubevirtWatchResource';

type MultiClusterNamespaces = () => [MulticlusterResource<K8sResourceCommon[]>, boolean, any];

const useMultiClusterNamespaces: MultiClusterNamespaces = () => {
  const [namespaceData, loaded, error] = useKubevirtWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(NamespaceModel),
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
  });
  return [namespaceData, loaded, error];
};

export default useMultiClusterNamespaces;
