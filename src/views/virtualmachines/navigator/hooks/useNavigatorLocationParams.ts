import { useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import KubevirtPluginContext from '@kubevirt-utils/contexts/KubevirtPluginContext';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useSupportsMulticluster } from '@kubevirt-utils/hooks/useSupportsMulticluster';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

export const useNavigatorLocationParams = () => {
  const supportsMulticluster = useSupportsMulticluster();
  const { currentCluster, currentNamespace } = useContext(KubevirtPluginContext);
  const location = useLocation();
  const [activeNamespace] = useActiveNamespace();
  const namespace = activeNamespace === ALL_NAMESPACES_SESSION_KEY ? null : activeNamespace;
  const vmName = location.pathname.split('/')?.[5];
  const newVM = location.pathname.endsWith(`${VirtualMachineModelRef}/~new`);
  return useMemo(() => {
    return supportsMulticluster
      ? { cluster: currentCluster, isList: true, namespace: currentNamespace, newVM: false }
      : { isList: !(newVM || vmName), namespace, newVM, vmName };
  }, [currentCluster, currentNamespace, namespace, newVM, supportsMulticluster, vmName]);
};
