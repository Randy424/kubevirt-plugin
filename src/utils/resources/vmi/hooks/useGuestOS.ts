import { useEffect, useState } from 'react';

import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import {
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useOpenShiftConsoleDynamicPluginSDK } from '@kubevirt-utils/hooks/useOpenShiftConsoleDynamicPluginSDK';

type UseGuestOS = (
  vmi?: V1VirtualMachineInstance,
) => [V1VirtualMachineInstanceGuestAgentInfo, boolean, Error];

export const useGuestOS: UseGuestOS = (vmi) => {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<V1VirtualMachineInstanceGuestAgentInfo>({});
  const [error, setError] = useState(null);
  const { consoleFetch } = useOpenShiftConsoleDynamicPluginSDK();

  useEffect(() => {
    const guestOS = vmi?.status?.guestOSInfo?.id;
    setError(null);
    if (guestOS) {
      (async () => {
        const response = await consoleFetch(
          `api/kubernetes/apis/subresources.${VirtualMachineInstanceModel.apiGroup}/${VirtualMachineInstanceModel.apiVersion}/namespaces/${vmi?.metadata?.namespace}/${VirtualMachineInstanceModel.plural}/${vmi?.metadata?.name}/guestosinfo`,
        );
        const jsonData = await response.json();
        setData(jsonData);
        setLoaded(true);
      })().catch((err) => {
        setError(err);
        setLoaded(true);
      });
    }
    (!vmi || (!guestOS && vmi?.metadata)) && setLoaded(true);
  }, [loaded, vmi, consoleFetch]);

  return [data, loaded, error];
};
