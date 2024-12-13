import { useContext } from 'react';
import KubevirtPluginContext from 'src/views/virtualmachines/KubevirtPluginContext';

export const useDynamicPluginSharedComponents = () => {
  const newContext = useContext(KubevirtPluginContext);
  return newContext.dynamicPluginSharedComponents;
};
