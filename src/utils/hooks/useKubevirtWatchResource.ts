import { useContext, useEffect, useMemo, useState } from 'react';

import KubevirtPluginContext, {
  MulticlusterResource,
} from '@kubevirt-utils/contexts/KubevirtPluginContext';
import {
  K8sResourceCommon,
  useK8sWatchResource,
  WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';

import { KUBEVIRT_APISERVER_PROXY } from './useFeatures/constants';
import { useFeatures } from './useFeatures/useFeatures';
import useKubevirtDataPodHealth from './useKubevirtDataPod/hooks/useKubevirtDataPodHealth';
import useKubevirtDataPod from './useKubevirtDataPod/useKubevirtDataPod';
import { useSupportsMulticluster } from './useSupportsMulticluster';
type Result<R extends K8sResourceCommon | K8sResourceCommon[]> = [
  R extends (infer T)[] ? MulticlusterResource<T>[] : MulticlusterResource<R>,
  boolean,
  Error,
];

type UseKubevirtWatchResource = <T extends K8sResourceCommon | K8sResourceCommon[]>(
  watchOptions: WatchK8sResource,
  filterOptions?: { [key: string]: string },
) => Result<T>;
const useKubevirtWatchResource: UseKubevirtWatchResource = <T>(watchOptions, filterOptions) => {
  const [data, setData] = useState<T>((<unknown>[]) as T);
  const [loadedData, setLoadedData] = useState<boolean>(false);
  const [loadErrorData, setLoadErrorData] = useState<Error>();
  const supportsMulticluster = useSupportsMulticluster();
  const { useMulticlusterSearchWatch } = useContext(KubevirtPluginContext);
  const isProxyPodAlive = useKubevirtDataPodHealth();
  const { featureEnabled, loading } = useFeatures(KUBEVIRT_APISERVER_PROXY);
  const shouldUseProxyPod = useMemo(() => {
    if (!featureEnabled && !loading) return false;
    if (featureEnabled && !loading && isProxyPodAlive !== null) return isProxyPodAlive;
    return null;
  }, [featureEnabled, loading, isProxyPodAlive]);
  const [resourceSearchWatch, loadedSearchWatch, loadErrorSearchWatch] =
    useMulticlusterSearchWatch<T>(watchOptions);
  const [resourceK8sWatch, loadedK8sWatch, loadErrorK8sWatch] = useK8sWatchResource<T>(
    shouldUseProxyPod === false && watchOptions,
  );
  const [resourceKubevirtDataPod, loadedKubevirtDataPod, loadErrorKubevirtDataPod] =
    useKubevirtDataPod<T>(shouldUseProxyPod ? watchOptions : {}, filterOptions);

  useEffect(() => {
    if (shouldUseProxyPod !== null) {
      const singleClusterResult = shouldUseProxyPod
        ? [resourceKubevirtDataPod, loadedKubevirtDataPod, loadErrorKubevirtDataPod]
        : [resourceK8sWatch, loadedK8sWatch, loadErrorK8sWatch];
      const [resource, loaded, loadError] = supportsMulticluster
        ? [resourceSearchWatch, loadedSearchWatch, loadErrorSearchWatch]
        : singleClusterResult;
      setLoadedData(loaded);

      if (loadError) {
        setLoadErrorData(loadError);
        setLoadedData(true);
      }
      if (resource && loaded) {
        const isList = typeof resource?.[0] === 'string';
        setData((isList && resource?.[1]) || (<T & { items?: T[] }>resource)?.items || resource);
        setLoadedData(loaded);
        setLoadErrorData(null);
      }
    }
  }, [
    resourceKubevirtDataPod,
    loadedKubevirtDataPod,
    loadErrorKubevirtDataPod,
    resourceK8sWatch,
    loadedK8sWatch,
    loadErrorK8sWatch,
    isProxyPodAlive,
    shouldUseProxyPod,
    supportsMulticluster,
    resourceSearchWatch,
    loadedSearchWatch,
    loadErrorSearchWatch,
  ]);
  return [data, loadedData, loadErrorData];
};

export default useKubevirtWatchResource;
