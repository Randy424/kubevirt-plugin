import { createContext, FC, PropsWithChildren } from 'react';
import React from 'react';

import { getResourceUrl } from '@kubevirt-utils/utils/getResourceUrl';
import { getStandaloneVMConsoleUrl } from '@kubevirt-utils/utils/getStandaloneVMConsoleUrl';
import { withCluster } from '@kubevirt-utils/utils/withCluster';
import * as OpenshiftDynamicPluginSDK from '@openshift-console/dynamic-plugin-sdk';
import { K8sResourceCommon, WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';

const ClusterScope = ({ children }: PropsWithChildren<ClusterScope>) => {
  return <>{children}</>;
};
type ClusterScope = {
  cluster?: string;
  localHubOverride?: boolean;
};

export type MulticlusterResource<T> = { cluster?: string } & T;
type SearchResult<R extends K8sResourceCommon | K8sResourceCommon[]> = R extends (infer T)[]
  ? MulticlusterResource<T>[]
  : MulticlusterResource<R>;

export type KubevirtPluginData = {
  clusterScope: {
    ClusterScope: FC<ClusterScope>;
    withCluster: (cluster?: string) => typeof OpenshiftDynamicPluginSDK;
  };
  currentCluster?: string;
  currentNamespace?: string;
  dynamicPluginSDK: typeof OpenshiftDynamicPluginSDK;
  getResourceUrl: typeof getResourceUrl;
  getStandaloneVMConsoleUrl: typeof getStandaloneVMConsoleUrl;
  k8sAPIPath: string;
  supportsMulticluster: boolean;
  useMulticlusterSearchWatch: <T extends K8sResourceCommon | K8sResourceCommon[]>(
    watchOptions: WatchK8sResource,
  ) => [SearchResult<T>, boolean, Error | undefined];
};

const defaultContext: KubevirtPluginData = {
  clusterScope: { ClusterScope, withCluster },
  dynamicPluginSDK: OpenshiftDynamicPluginSDK,
  getResourceUrl,
  getStandaloneVMConsoleUrl,
  k8sAPIPath: '/api/kubernetes',
  supportsMulticluster: false,
  useMulticlusterSearchWatch: () => [undefined, false, undefined],
};

const KubevirtPluginContext = createContext<KubevirtPluginData>(defaultContext);

export default KubevirtPluginContext;
