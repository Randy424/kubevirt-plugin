import { useMemo } from 'react';

import { K8sResourceCommon, WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';
import { AdvancedSearchFilter } from '@stolostron/multicluster-sdk/lib/types';

import { KUBEVIRT_APISERVER_PROXY } from '../useFeatures/constants';
import { useFeatures } from '../useFeatures/useFeatures';
import useKubevirtDataPodHealth from '../useKubevirtDataPod/hooks/useKubevirtDataPodHealth';

import useRedirectWatchHooks from './useRedirectWatchHooks';

export type Result<R extends K8sResourceCommon | K8sResourceCommon[]> = [R, boolean, Error];

type UseKubevirtWatchResource = <T extends K8sResourceCommon | K8sResourceCommon[]>(
  watchOptions: WatchK8sResource & { cluster?: string },
  filterOptions?: { [key: string]: string },
  searchQueries?: AdvancedSearchFilter,
) => Result<T>;

const useKubevirtWatchResource: UseKubevirtWatchResource = <T>(
  watchOptions,
  filterOptions,
  searchQueries,
) => {
  const isProxyPodAlive = useKubevirtDataPodHealth();
  const { featureEnabled, loading } = useFeatures(KUBEVIRT_APISERVER_PROXY);

  const shouldUseProxyPod = useMemo(() => {
    if (watchOptions?.cluster) return false;
    if (!featureEnabled && !loading) return false;
    if (featureEnabled && !loading && isProxyPodAlive !== null) return isProxyPodAlive;
    return null;
  }, [featureEnabled, loading, isProxyPodAlive, watchOptions?.cluster]);

  // Ensure the return type is always Result<T> (tuple of 3 elements)
  const result = useRedirectWatchHooks<T>(
    watchOptions,
    filterOptions,
    searchQueries,
    shouldUseProxyPod,
  );

  // If result is an array of length 4 (FleetPollingResult), drop the 4th element
  if (Array.isArray(result) && result.length === 4) {
    const [data, loaded, error] = result;
    return [data, loaded, error] as Result<T>;
  }

  // Otherwise, assume it's already Result<T>
  return result as Result<T>;
};

export default useKubevirtWatchResource;
