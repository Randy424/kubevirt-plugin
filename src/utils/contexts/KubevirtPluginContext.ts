import { createContext } from 'react';

import * as OpenshiftDynamicPluginSDK from '@openshift-console/dynamic-plugin-sdk';

type KubevirtPluginData = {
  dynamicPluginSDK: typeof OpenshiftDynamicPluginSDK;
};

const defaultContext: KubevirtPluginData = {
  dynamicPluginSDK: OpenshiftDynamicPluginSDK,
};

const KubevirtPluginContext = createContext<KubevirtPluginData>(defaultContext);

export default KubevirtPluginContext;
