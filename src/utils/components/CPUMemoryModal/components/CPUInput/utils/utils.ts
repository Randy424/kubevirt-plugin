import { V1CPU } from '@kubevirt-ui/kubevirt-api/kubevirt';

export enum CPUInputType {
  editTopologyManually = 'editTopologyManually',
  editVCPU = 'editVCPU',
}

export enum CPUComponent {
  cores = 'cores',
  sockets = 'sockets',
  threads = 'threads',
}

export const getUpdatedCPU = (cpu: V1CPU, newValue: number, fieldChanged: CPUComponent): V1CPU => {
  return { ...cpu, [fieldChanged]: newValue > 0 ? newValue : cpu?.[fieldChanged] };
};

export const convertTopologyToVCPUs = (cpu: V1CPU): number =>
  // VMs migrated from vSphere may not have spec.template.spec.domain.cpu.threads set
  cpu?.cores * cpu?.sockets * (cpu?.threads || 1);

export const formatVCPUsAsSockets = (cpu: V1CPU): V1CPU => {
  const numVCPUs = convertTopologyToVCPUs(cpu);
  return { ...cpu, ...{ cores: 1, sockets: numVCPUs, threads: 1 } };
};
