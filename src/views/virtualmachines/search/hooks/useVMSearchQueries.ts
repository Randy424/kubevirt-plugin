import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom-v5-compat';

import { STATIC_SEARCH_FILTERS } from '@kubevirt-utils/components/ListPageFilter/constants';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export type VMSearchQueries = {
  vmiQueries: { property: string; values: string[] }[];
  vmQueries: { property: string; values: string[] }[];
};

const useVMSearchQueries = (): VMSearchQueries => {
  const [searchParams] = useSearchParams();

  const vmName = searchParams.get(STATIC_SEARCH_FILTERS.name);

  const ip = searchParams.get(VirtualMachineRowFilterType.IP);
  const project = searchParams.get(VirtualMachineRowFilterType.Project);
  const createdFrom = searchParams.get(VirtualMachineRowFilterType.DateCreatedFrom);
  const createdTo = searchParams.get(VirtualMachineRowFilterType.DateCreatedTo);

  return useMemo(() => {
    const queries: VMSearchQueries = {
      vmiQueries: [],
      vmQueries: [],
    };

    if (createdFrom) {
      queries.vmQueries.push({ property: 'created', values: [`>=${createdFrom}`] });
    }
    if (createdTo) {
      queries.vmQueries.push({ property: 'created', values: [`<=${createdTo}`] });
    }

    if (vmName) {
      queries.vmQueries.push({ property: 'name', values: [`*${vmName}*`] });
      queries.vmiQueries.push({ property: 'name', values: [`*${vmName}*`] });
    }

    if (ip) queries.vmiQueries.push({ property: 'ipaddress', values: [`*${ip}*`] });

    if (project) {
      queries.vmQueries.push({ property: 'namespace', values: project.split(',') });
      queries.vmiQueries.push({ property: 'namespace', values: project.split(',') });
    }

    return queries;
  }, [createdFrom, createdTo, vmName, ip, project]);
};

export default useVMSearchQueries;
