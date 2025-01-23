import { useContext } from 'react';

import KubevirtPluginContext from '@kubevirt-utils/contexts/KubevirtPluginContext';

export const useSupportsMulticluster = () => {
  const { supportsMulticluster } = useContext(KubevirtPluginContext);
  return supportsMulticluster;
};
