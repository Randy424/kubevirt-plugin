import { useContext } from 'react';

import KubevirtPluginContext from '@kubevirt-utils/contexts/KubevirtPluginContext';

export const useGetResourceUrl = () => {
  const { getResourceUrl } = useContext(KubevirtPluginContext);
  return getResourceUrl;
};
