import { createContext } from 'react';

import * as kubevirtDynamicPluginSDK from '@openshift-console/dynamic-plugin-sdk';

type KubevirtPluginData = {
  dynamicPluginSDK: typeof kubevirtDynamicPluginSDK;
};

const defaultContext: KubevirtPluginData = {
  dynamicPluginSDK: kubevirtDynamicPluginSDK,
};

const KubevirtPluginContext = createContext<KubevirtPluginData>(defaultContext);

export default KubevirtPluginContext;
