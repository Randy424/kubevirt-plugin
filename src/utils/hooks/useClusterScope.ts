import { useContext } from 'react';

import KubevirtPluginContext from '@kubevirt-utils/contexts/KubevirtPluginContext';

export const useClusterScope = () => {
  const { clusterScope } = useContext(KubevirtPluginContext);
  return clusterScope;
};
