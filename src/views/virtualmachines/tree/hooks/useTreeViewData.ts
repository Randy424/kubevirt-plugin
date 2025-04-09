import { useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import {
  VirtualMachineInstanceMigrationModelGroupVersionKind,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import KubevirtPluginContext from '@kubevirt-utils/contexts/KubevirtPluginContext';
import { TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource';
import useMultiClusterNamespaces from '@kubevirt-utils/hooks/useMultiClusterNamespaces';
import { useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { TreeViewDataItem } from '@patternfly/react-core';
import { getLatestMigrationForEachVM, OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';

import { vmimMapperSignal, vmsSignal } from '../utils/signals';
import { createTreeViewData, isSystemNamespace } from '../utils/utils';

export type UseTreeViewData = {
  isSwitchDisabled: boolean;
  loaded: boolean;
  loadError: any;
  treeData: TreeViewDataItem[];
};

export const useTreeViewData = (): UseTreeViewData => {
  const isAdmin = useIsAdmin();
  const location = useLocation();

  const { featureEnabled: treeViewFoldersEnabled } = useFeatures(TREE_VIEW_FOLDERS);
  const [namespaceNamesByCluster, namespaceNamesLoaded, namespaceNamesError] =
    useMultiClusterNamespaces();
  const { getResourceUrlOverride, supportsMulticluster } = useContext(KubevirtPluginContext);

  const [allVMs, allVMsLoaded] = useKubevirtWatchResource<V1VirtualMachine[]>({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
  });
  debugger;
  // when using multicluster we don't have to worry about this because search api will return all namespaces
  // user has limited access, so we can only get vms from allowed namespaces
  const allowedResources = useK8sWatchResources<{ [key: string]: V1VirtualMachine[] }>(
    Object.fromEntries(
      namespaceNamesLoaded && !isAdmin && !supportsMulticluster
        ? (namespaceNamesByCluster || []).map((namespace) => [
            namespace.metadata.name,
            {
              groupVersionKind: VirtualMachineModelGroupVersionKind,
              isList: true,
              namespace: namespace.metadata.name,
            },
          ])
        : [],
    ),
  );

  const [allVMIM] = useKubevirtWatchResource<V1VirtualMachineInstanceMigration[]>({
    groupVersionKind: VirtualMachineInstanceMigrationModelGroupVersionKind,
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
    namespaced: true,
  });

  // if multicluster, we should have access to all VMIM resources
  const allowedVMIMResources = useK8sWatchResources<{
    [key: string]: V1VirtualMachineInstanceMigration[];
  }>(
    Object.fromEntries(
      namespaceNamesLoaded && !isAdmin && !supportsMulticluster
        ? (namespaceNamesByCluster || []).map((namespace) => [
            namespace.metadata.name,
            {
              groupVersionKind: VirtualMachineInstanceMigrationModelGroupVersionKind,
              isList: true,
              namespace: namespace.metadata.name,
            },
          ])
        : [],
    ),
  );

  const memoizedVMIMs = useMemo(
    () =>
      getLatestMigrationForEachVM(
        isAdmin || supportsMulticluster
          ? allVMIM
          : Object.values(allowedVMIMResources).flatMap((resource) => resource.data),
      ),
    [allVMIM, allowedVMIMResources, isAdmin, supportsMulticluster],
  );

  vmimMapperSignal.value = memoizedVMIMs;

  const memoizedVMs = useMemo(
    () =>
      isAdmin || supportsMulticluster
        ? allVMs
        : Object.values(allowedResources).flatMap((resource) => resource.data),
    [allVMs, allowedResources, isAdmin, supportsMulticluster],
  );
  vmsSignal.value = memoizedVMs;
  const loaded = useMemo(() => {
    if (!namespaceNamesLoaded) return false;

    if (isAdmin || supportsMulticluster) {
      return allVMsLoaded;
    }
    return Object.values(allowedResources).some((resource) => resource.loaded);
  }, [namespaceNamesLoaded, isAdmin, supportsMulticluster, allVMsLoaded, allowedResources]);

  const treeData = useMemo(
    () =>
      loaded
        ? createTreeViewData(
            getResourceUrlOverride,
            isAdmin,
            location.pathname,
            treeViewFoldersEnabled,
            namespaceNamesByCluster,
            memoizedVMs,
            supportsMulticluster,
          )
        : [],
    [
      loaded,
      getResourceUrlOverride,
      isAdmin,
      location.pathname,
      treeViewFoldersEnabled,
      namespaceNamesByCluster,
      memoizedVMs,
      supportsMulticluster,
    ],
  );

  const allNamespaces = namespaceNamesByCluster.map((namespace) => namespace.metadata.name);
  const isSwitchDisabled = useMemo(() => allNamespaces?.every(isSystemNamespace), [allNamespaces]);

  return {
    isSwitchDisabled,
    loaded,
    loadError: namespaceNamesError,
    treeData,
  };
};
