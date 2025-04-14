import { useEffect, useState } from 'react';

import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

import { PROXY_KUBEVIRT_URL, PROXY_KUBEVIRT_URL_HEALTH_PATH } from '../utils/constants';

const useKubevirtDataPodHealth = (): boolean | null => {
  const [alive, setAlive] = useState<boolean>(null);
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await consoleFetch(`${PROXY_KUBEVIRT_URL}${PROXY_KUBEVIRT_URL_HEALTH_PATH}`);
        setAlive(res.ok);
      } catch {
        setAlive(false);
      }
    };

    alive === null && fetch();
  }, [alive]);

  return alive;
};
export default useKubevirtDataPodHealth;
