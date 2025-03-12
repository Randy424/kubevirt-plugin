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
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { useK8sWatchResource, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
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
  const [projectNames, projectNamesLoaded, projectNamesError] = useProjects();
  const [namespaceNamesByCluster, namespaceNamesLoaded, namespaceNamesError] =
    useMultiClusterNamespaces();
  const { getResourceUrlOverride, supportsMulticluster } = useContext(KubevirtPluginContext);

  const [allVMs, allVMsLoaded] = useK8sWatchResource<V1VirtualMachine[]>({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
  });

  const [multiclusterVms, multiclusterVmLoaded] = useKubevirtWatchResource<V1VirtualMachine[]>({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
    namespace: undefined,
    namespaced: true,
  });

  // when using multicluster we don't have to worry about this because search api will return all namespaces
  // user has limited access, so we can only get vms from allowed namespaces
  const allowedResources = useK8sWatchResources<{ [key: string]: V1VirtualMachine[] }>(
    Object.fromEntries(
      projectNamesLoaded && !isAdmin && !supportsMulticluster
        ? (projectNames || []).map((namespace) => [
            namespace,
            {
              groupVersionKind: VirtualMachineModelGroupVersionKind,
              isList: true,
              namespace,
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
      projectNamesLoaded && !isAdmin && !supportsMulticluster
        ? (projectNames || []).map((namespace) => [
            namespace,
            {
              groupVersionKind: VirtualMachineInstanceMigrationModelGroupVersionKind,
              isList: true,
              namespace,
            },
          ])
        : [],
    ),
  );

  const memoizedVMIMs = useMemo(
    () =>
      getLatestMigrationForEachVM(
        // is the || really necessary here?
        isAdmin || supportsMulticluster
          ? allVMIM
          : Object.values(allowedVMIMResources).flatMap((resource) => resource.data),
      ),
    [allVMIM, allowedVMIMResources, isAdmin, supportsMulticluster],
  );

  vmimMapperSignal.value = memoizedVMIMs;

  const memoizedVMs = useMemo(
    () =>
      // is the || really necessary here?
      isAdmin || supportsMulticluster
        ? allVMs
        : Object.values(allowedResources).flatMap((resource) => resource.data),
    [allVMs, allowedResources, isAdmin, supportsMulticluster],
  );
  vmsSignal.value = memoizedVMs;

  const loaded =
    projectNamesLoaded &&
    (isAdmin ? allVMsLoaded : Object.values(allowedResources).some((resource) => resource.loaded));
  const loadedMulticluster = multiclusterVmLoaded && namespaceNamesLoaded;

  const memoizedtreeData = useMemo(() => {
    const aggrigateClusterTreeData = [];
    const activeProjectList = supportsMulticluster ? namespaceNamesByCluster : projectNames;
    const activeVMsList = supportsMulticluster ? multiclusterVms : memoizedVMs;
    if ((loaded && !supportsMulticluster) || loadedMulticluster) {
      aggrigateClusterTreeData.push(
        ...createTreeViewData(
          getResourceUrlOverride,
          isAdmin,
          location.pathname,
          treeViewFoldersEnabled,
          activeProjectList,
          activeVMsList,
          supportsMulticluster,
        ),
      );
    }
    return aggrigateClusterTreeData;
  }, [
    supportsMulticluster,
    namespaceNamesByCluster,
    projectNames,
    multiclusterVms,
    memoizedVMs,
    loaded,
    loadedMulticluster,
    getResourceUrlOverride,
    isAdmin,
    location.pathname,
    treeViewFoldersEnabled,
  ]);
  const allNamespaces = namespaceNamesByCluster.map((namespace) => namespace.metadata.name);
  const isSwitchDisabled = useMemo(() => allNamespaces?.every(isSystemNamespace), [allNamespaces]);
  const treeData = [...memoizedtreeData] as TreeViewDataItem[];

  return {
    isSwitchDisabled,
    loaded,
    loadError: projectNamesError || namespaceNamesError,
    treeData,
  };
};
