import { useContext } from 'react';

import KubevirtPluginContext from '@kubevirt-utils/contexts/KubevirtPluginContext';

export const useK8sAPIPath = () => {
  const { k8sAPIPath } = useContext(KubevirtPluginContext);
  return k8sAPIPath;
};
