import { createContext } from 'react';

import { getResourceUrl } from '@kubevirt-utils/utils/getResourceUrl';
import * as OpenshiftDynamicPluginSDK from '@openshift-console/dynamic-plugin-sdk';

type KubevirtPluginData = {
  dynamicPluginSDK: typeof OpenshiftDynamicPluginSDK;
  getResourceUrl: typeof getResourceUrl;
};

const defaultContext: KubevirtPluginData = {
  dynamicPluginSDK: OpenshiftDynamicPluginSDK,
  getResourceUrl,
};

const KubevirtPluginContext = createContext<KubevirtPluginData>(defaultContext);

export default KubevirtPluginContext;
