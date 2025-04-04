import React from 'react';
import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { MulticlusterResource } from '@kubevirt-utils/contexts/KubevirtPluginContext';
import {
  ALL_CLUSTERS,
  ALL_CLUSTERS_SESSION_KEY,
  ALL_NAMESPACES_SESSION_KEY,
  ALL_PROJECTS,
} from '@kubevirt-utils/hooks/constants';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { GetResourceUrl } from '@kubevirt-utils/utils/getResourceUrl';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { TreeViewDataItem } from '@patternfly/react-core';
import {
  ClusterIcon,
  FolderIcon,
  FolderOpenIcon,
  ProjectDiagramIcon,
} from '@patternfly/react-icons';
import { signal } from '@preact/signals-react';

import { statusIcon } from '../icons/utils';

import {
  FOLDER_SELECTOR_PREFIX,
  PROJECT_SELECTOR_PREFIX,
  SYSTEM_NAMESPACES,
  SYSTEM_NAMESPACES_PREFIX,
  VM_FOLDER_LABEL,
} from './constants';

export const treeDataMap = signal<Record<string, TreeViewDataItemWithHref>>(null);
export interface TreeViewDataItemWithHref extends TreeViewDataItem {
  href?: string;
}

const groupByCluster = (resources: MulticlusterResource<any>[]) =>
  resources.reduce((acc, resource) => {
    acc[resource.cluster] = acc[resource.cluster] || [];
    acc[resource.cluster].push(resource);
    return acc;
  }, {});

const buildProjectMap = (
  getResourceUrl: GetResourceUrl,
  vms: MulticlusterResource<V1VirtualMachine>[],
  currentPageVMName: string,
  currentVMTab: string,
  treeViewDataMap: Record<string, TreeViewDataItemWithHref>,
  foldersEnabled: boolean,
) => {
  const projectMap: Record<
    string,
    {
      count: number;
      folders: Record<string, TreeViewDataItemWithHref[]>;
      ungrouped: TreeViewDataItemWithHref[];
    }
  > = {};

  vms.forEach((vm) => {
    const cluster = (vm as MulticlusterResource<V1VirtualMachine>)?.cluster;
    const vmNamespace = getNamespace(vm);
    const vmName = getName(vm);
    const projectMapIndex = cluster ? `${cluster}/${vmNamespace}` : vmNamespace;
    const folder = foldersEnabled ? getLabel(vm, VM_FOLDER_LABEL) : null;
    const vmTreeItemID = `${vmNamespace}/${vmName}`;
    const VMStatusIcon = statusIcon[vm?.status?.printableStatus];

    const vmTreeItem: TreeViewDataItemWithHref = {
      defaultExpanded: currentPageVMName && currentPageVMName === vmName,
      href: `${getResourceUrl({
        activeNamespace: vmNamespace,
        model: VirtualMachineModel,
        resource: { metadata: { name: vmName, namespace: vmNamespace } },
      })}${currentVMTab ? `/${currentVMTab}` : ''}`,
      icon: <VMStatusIcon />,
      id: vmTreeItemID,
      name: vmName,
    };

    if (!treeViewDataMap[vmTreeItemID]) {
      treeViewDataMap[vmTreeItemID] = vmTreeItem;
    }

    if (!projectMap[projectMapIndex]) {
      projectMap[projectMapIndex] = { count: 0, folders: {}, ungrouped: [] };
    }

    projectMap[projectMapIndex].count++;
    if (folder) {
      if (!projectMap[projectMapIndex].folders[folder]) {
        projectMap[projectMapIndex].folders[folder] = [];
      }
      return projectMap[projectMapIndex].folders[folder].push(vmTreeItem);
    }

    projectMap[projectMapIndex].ungrouped.push(vmTreeItem);
  });

  return projectMap;
};

const createFolderTreeItems = (
  getResourceUrl: GetResourceUrl,
  folders: Record<string, TreeViewDataItemWithHref[]>,
  project: string,
  currentPageVMName: string,
  treeViewDataMap: Record<string, TreeViewDataItemWithHref>,
): TreeViewDataItemWithHref[] =>
  Object.entries(folders).map(([folder, vmItems]) => {
    const folderTreeItemID = `${FOLDER_SELECTOR_PREFIX}/${project}/${folder}`;
    const folderExpanded =
      currentPageVMName && vmItems.some((item) => (item.name as string) === currentPageVMName);

    const folderTreeItem: TreeViewDataItemWithHref = {
      children: vmItems,
      defaultExpanded: folderExpanded,
      expandedIcon: <FolderOpenIcon />,
      href: getResourceUrl({
        activeNamespace: project,
        model: VirtualMachineModel,
      }),
      icon: <FolderIcon />,
      id: folderTreeItemID,
      name: folder,
    };

    if (!treeViewDataMap[folderTreeItemID]) {
      treeViewDataMap[folderTreeItemID] = folderTreeItem;
    }

    return folderTreeItem;
  });

const createProjectTreeItem = (
  getResourceUrl: GetResourceUrl,
  project: string,
  projectMap: Record<string, any>,
  currentPageVMName: string,
  currentPageNamespace: string,
  treeViewDataMap: Record<string, TreeViewDataItemWithHref>,
  clusterName?: string,
): TreeViewDataItemWithHref => {
  const projectFolders = createFolderTreeItems(
    getResourceUrl,
    projectMap[project]?.folders || {},
    project,
    currentPageVMName,
    treeViewDataMap,
  );

  const projectChildren = [...projectFolders, ...(projectMap[project]?.ungrouped || [])];
  const projectTreeItemID = clusterName
    ? `${PROJECT_SELECTOR_PREFIX}/${clusterName}/${project}`
    : `${PROJECT_SELECTOR_PREFIX}/${project}`;
  const projectTreeItem: TreeViewDataItemWithHref = {
    children: projectChildren,
    customBadgeContent: projectMap[project]?.count || 0,
    defaultExpanded: currentPageNamespace === project,
    href: getResourceUrl({
      activeNamespace: project,
      model: VirtualMachineModel,
    }),
    icon: <ProjectDiagramIcon />,
    id: projectTreeItemID,
    name: project,
  };

  if (!treeViewDataMap[projectTreeItemID]) {
    treeViewDataMap[projectTreeItemID] = projectTreeItem;
  }

  return projectTreeItem;
};

const createClusterLevelTreeItem = (
  getResourceUrl: GetResourceUrl,
  treeViewData: TreeViewDataItemWithHref[],
  treeViewDataMap: Record<string, TreeViewDataItemWithHref>,
  projectMap: Record<string, any>,
  clusterName?: string,
): TreeViewDataItemWithHref => {
  const allVMsCount = Object.keys(projectMap).reduce((acc, ns) => {
    acc += projectMap[ns]?.count;
    return acc;
  }, 0);
  const href = `${getResourceUrl({ model: VirtualMachineModel })}/${clusterName}`;

  // organize the VM data for react component consumption
  const allNamespacesTreeItem: TreeViewDataItemWithHref = {
    children: treeViewData,
    customBadgeContent: allVMsCount || 0,
    defaultExpanded: true,
    href: href,
    icon: <ClusterIcon />,
    id: clusterName,
    name: clusterName,
  };
  if (!treeViewDataMap[clusterName]) {
    treeViewDataMap[clusterName] = allNamespacesTreeItem;
  }
  treeDataMap.value = treeViewDataMap;
  return allNamespacesTreeItem;
};

const createAllNodesTreeItem = (
  getResourceUrl: GetResourceUrl,
  treeViewData: TreeViewDataItemWithHref[],
  treeViewDataMap: Record<string, TreeViewDataItemWithHref>,
  projectMap: Record<string, any>,
  supportMulticluster?: boolean,
): TreeViewDataItemWithHref => {
  const allVMsCount = Object.keys(projectMap).reduce((acc, ns) => {
    acc += projectMap[ns]?.count;
    return acc;
  }, 0);
  const id = supportMulticluster ? ALL_CLUSTERS_SESSION_KEY : ALL_NAMESPACES_SESSION_KEY;
  const name = supportMulticluster ? ALL_CLUSTERS : ALL_PROJECTS;
  const icon = supportMulticluster ? <ClusterIcon /> : <ProjectDiagramIcon />;

  const allNamespacesTreeItem: TreeViewDataItemWithHref = {
    children: treeViewData,
    customBadgeContent: allVMsCount || 0,
    defaultExpanded: true,
    href: getResourceUrl({
      model: VirtualMachineModel,
    }),
    icon: icon,
    id: id,
    name: name,
  };
  if (!treeViewDataMap[ALL_NAMESPACES_SESSION_KEY]) {
    treeViewDataMap[ALL_NAMESPACES_SESSION_KEY] = allNamespacesTreeItem;
  }
  treeDataMap.value = treeViewDataMap;
  return allNamespacesTreeItem;
};

const getVMInfoFromPathname = (pathname: string) => {
  const splitPathname = pathname.split('/');
  const currentVMTab = splitPathname?.[6] || '';
  const vmName = splitPathname?.[5];
  const vmNamespace = splitPathname?.[3];

  return { currentVMTab, vmName, vmNamespace };
};

const createClusterTreeViewData = (
  getResourceUrl: GetResourceUrl,
  projectNames: string[],
  vms: V1VirtualMachine[],
  isAdmin: boolean,
  pathname: string,
  treeViewDataMap: Record<string, TreeViewDataItem> = {},
  clusterProjectMap: Record<string, any> = {},
  clusterName?: string,
): TreeViewDataItem[] => {
  const { vmName, vmNamespace } = getVMInfoFromPathname(pathname);

  const projectMap = {};

  // assumes cluster name will always be unique
  Object.keys(clusterProjectMap).forEach((key) => {
    if (!clusterName) {
      const mappedProjectName = key;
      projectMap[mappedProjectName] = clusterProjectMap[key];
    } else {
      const [mappedClusterName, mappedProjectName] = key.split('/');
      if (clusterName == mappedClusterName) {
        projectMap[mappedProjectName] = clusterProjectMap[key];
      }
    }
  });

  const treeViewData = projectNames.map((project) =>
    createProjectTreeItem(
      getResourceUrl,
      project,
      projectMap,
      vmName,
      vmNamespace,
      treeViewDataMap,
      clusterName,
    ),
  );

  if (clusterName) {
    return [
      createClusterLevelTreeItem(
        getResourceUrl,
        treeViewData,
        treeViewDataMap,
        projectMap,
        clusterName,
      ),
    ];
  } else {
    const allNamespacesTreeItem = isAdmin
      ? createAllNodesTreeItem(getResourceUrl, treeViewData, treeViewDataMap, projectMap)
      : null;

    treeDataMap.value = treeViewDataMap;

    const tree = allNamespacesTreeItem ? [allNamespacesTreeItem] : treeViewData;

    return tree;
  }
};

export const createTreeViewData = (
  getResourceUrlMultiClusterOverride: (cluster?: string) => GetResourceUrl,
  isAdmin: boolean,
  pathname: string,
  foldersEnabled: boolean,
  projectNames?: MulticlusterResource<K8sResourceCommon>[] | string[],
  vms?: MulticlusterResource<V1VirtualMachine>[] | V1VirtualMachine[],
  supportsMulticluster?: boolean,
): TreeViewDataItem[] => {
  const { currentVMTab, vmName } = getVMInfoFromPathname(pathname);
  const treeViewDataMap: Record<string, TreeViewDataItem> = {};

  // Build the project map
  const projectMap = buildProjectMap(
    getResourceUrlMultiClusterOverride(),
    vms,
    vmName,
    currentVMTab,
    treeViewDataMap,
    foldersEnabled,
  );

  if (supportsMulticluster) {
    return createMultiClusterTreeViewData(
      getResourceUrlMultiClusterOverride,
      projectNames as MulticlusterResource<K8sResourceCommon>[],
      vms as MulticlusterResource<V1VirtualMachine>[],
      isAdmin,
      pathname,
      treeViewDataMap,
      projectMap,
    );
  }

  return createClusterTreeViewData(
    getResourceUrlMultiClusterOverride(),
    projectNames as string[],
    vms as V1VirtualMachine[],
    isAdmin,
    pathname,
    treeViewDataMap,
    projectMap,
  );
};

const createMultiClusterTreeViewData = (
  getResourceUrlMultiClusterOverride: (cluster?: string) => GetResourceUrl,
  projectNames: MulticlusterResource<K8sResourceCommon>[],
  vms: MulticlusterResource<V1VirtualMachine>[],
  isAdmin: boolean,
  pathname: string,
  treeViewDataMap: Record<string, TreeViewDataItem>,
  projectMap: Record<string, any>,
): TreeViewDataItem[] => {
  const clusterTreeItems: TreeViewDataItem[] = [];
  const multiclusterVmsRecord = groupByCluster(vms);
  const namespaceNameByClusterRecord = groupByCluster(projectNames);

  Object.keys(multiclusterVmsRecord).forEach((clusterName) => {
    const namespaceNames = namespaceNameByClusterRecord[clusterName].map(getName);
    const clusterVms = multiclusterVmsRecord[clusterName];

    clusterTreeItems.push(
      ...createClusterTreeViewData(
        getResourceUrlMultiClusterOverride(clusterName),
        namespaceNames,
        clusterVms,
        isAdmin,
        pathname,
        treeViewDataMap,
        projectMap,
        clusterName,
      ),
    );
  });

  return [
    createAllNodesTreeItem(
      getResourceUrlMultiClusterOverride(),
      clusterTreeItems,
      treeViewDataMap,
      projectMap,
      true,
    ),
  ];
};

export const filterItems = (item: TreeViewDataItem, input: string) => {
  if ((item.name as string).toLowerCase().includes(input.toLowerCase())) {
    return true;
  }
  if (item.children) {
    return (
      (item.children = item.children
        .map((opt) => Object.assign({}, opt))
        .filter((child) => filterItems(child, input))).length > 0
    );
  }
};

// Show projects that has VMs all the time.
// Show / hide projects that has no VMs depending on a flag
// hide system namespaces unless they contain VMs
export const filterNamespaceItems = (item: TreeViewDataItem, showEmptyProjects: boolean) => {
  const hasVMs = item.id !== ALL_NAMESPACES_SESSION_KEY && item.children.length > 0;
  const projectName = item.name as string;

  if (item.id.startsWith(PROJECT_SELECTOR_PREFIX)) {
    // if (hasVMs) return true;
    if ((showEmptyProjects && !isSystemNamespace(projectName)) || hasVMs) return true;
  }
  if (item.children) {
    return (
      (item.children = item.children
        .map((opt) => Object.assign({}, opt))
        .filter((child) => filterNamespaceItems(child, showEmptyProjects))).length > 0
    );
  }
};

export const isSystemNamespace = (projectName: string) => {
  const startsWithNamespace = SYSTEM_NAMESPACES_PREFIX.some((ns) => projectName.startsWith(ns));
  const isNamespace = SYSTEM_NAMESPACES.includes(projectName);

  return startsWithNamespace || isNamespace;
};
