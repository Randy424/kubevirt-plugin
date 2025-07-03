import { ConfigMapModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { DEFAULT_OPERATOR_NAMESPACE } from '@kubevirt-utils/utils/utils';
import {
  getGroupVersionKindForModel,
  useK8sWatchResource,
  WatchK8sResult,
} from '@openshift-console/dynamic-plugin-sdk';

import { useIsAdmin } from '../useIsAdmin';

import { FEATURES_CONFIG_MAP_NAME } from './constants';

type UseFeaturesConfigMap = (enableQuery?: boolean) => {
  featuresConfigMapData: WatchK8sResult<IoK8sApiCoreV1ConfigMap>;
  isAdmin: boolean;
};

const useFeaturesConfigMap: UseFeaturesConfigMap = (enableQuery: boolean = true) => {
  const isAdmin = useIsAdmin();

  const featuresConfigMapData = useK8sWatchResource<IoK8sApiCoreV1ConfigMap>(
    enableQuery && {
      groupVersionKind: getGroupVersionKindForModel(ConfigMapModel),
      isList: false,
      name: FEATURES_CONFIG_MAP_NAME,
      namespace: DEFAULT_OPERATOR_NAMESPACE,
    },
  );
  return { featuresConfigMapData: [...featuresConfigMapData], isAdmin };
};

export default useFeaturesConfigMap;
