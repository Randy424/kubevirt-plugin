import { useContext } from 'react';

import KubevirtPluginContext from '@kubevirt-utils/contexts/KubevirtPluginContext';

export const useGetStandaloneVMConsoleUrl = () => {
  const { getStandaloneVMConsoleUrl } = useContext(KubevirtPluginContext);
  return getStandaloneVMConsoleUrl;
};
