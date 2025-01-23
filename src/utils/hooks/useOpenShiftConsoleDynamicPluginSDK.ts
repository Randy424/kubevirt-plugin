import { useContext } from 'react';

import KubevirtPluginContext from '@kubevirt-utils/contexts/KubevirtPluginContext';

export const useOpenShiftConsoleDynamicPluginSDK = () => {
  const { dynamicPluginSDK } = useContext(KubevirtPluginContext);
  return dynamicPluginSDK;
};
