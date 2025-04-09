/* eslint-disable @typescript-eslint/no-unused-vars */

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui/kubevirt-api/console';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';

import useKubevirtWatchResource from './useKubevirtWatchResource';

const useMultiClusterNamespaces = () =>
  useKubevirtWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(NamespaceModel),
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
  });

export default useMultiClusterNamespaces;
