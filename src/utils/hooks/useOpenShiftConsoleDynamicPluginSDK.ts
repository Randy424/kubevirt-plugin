import { useContext } from 'react';

import KubevirtPluginContext from '@kubevirt-utils/contexts/KubevirtPluginContext';

export const useOpenShiftConsoleDynamicPluginSDK = () => {
  const newContext = useContext(KubevirtPluginContext);
  return newContext.dynamicPluginSDK;
};
