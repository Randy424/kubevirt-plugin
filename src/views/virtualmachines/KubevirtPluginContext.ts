import { createContext } from 'react';

import * as kubevirtDynamicPluginSDK from '@openshift-console/dynamic-plugin-sdk';

type KubevirtPluginData = {
  dynamicPluginSDK: typeof kubevirtDynamicPluginSDK;
  dynamicPluginSharedComponents: {
    SearchDetailsNamespaceLink?: React.ReactNode;
  };
};

const defaultContext: KubevirtPluginData = {
  dynamicPluginSDK: kubevirtDynamicPluginSDK,
  dynamicPluginSharedComponents: {},
};

const KubevirtPluginContext = createContext<KubevirtPluginData>(defaultContext);

export default KubevirtPluginContext;
