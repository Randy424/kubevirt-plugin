import { useContext } from 'react';
import KubevirtPluginContext from 'src/views/virtualmachines/KubevirtPluginContext';

export const useOpenShiftConsoleDynamicPluginSDK = () => {
  const newContext = useContext(KubevirtPluginContext);
  return newContext.dynamicPluginSDK;
};
