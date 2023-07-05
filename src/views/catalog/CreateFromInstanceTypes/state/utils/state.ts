import { initialSSHCredentials } from '@kubevirt-utils/components/SSHSecretSection/utils/constants';

import {
  InstanceTypeVMState,
  InstanceTypeVMStoreState,
  UseBootableVolumesValues,
  UseInstanceTypeAndPreferencesValues,
} from './types';

const instanceTypeVMInitialState: InstanceTypeVMState = {
  isDynamicSSHInjection: false,
  pvcSource: null,
  selectedBootableVolume: null,
  selectedInstanceType: '',
  sshSecretCredentials: initialSSHCredentials,
  vmName: '',
};

export const instanceTypeVMStoreInitialState: InstanceTypeVMStoreState = {
  activeNamespace: '',
  bootableVolumesData: {} as UseBootableVolumesValues,
  instanceTypesAndPreferencesData: {} as UseInstanceTypeAndPreferencesValues,
  instanceTypeVMState: instanceTypeVMInitialState,
  vmNamespaceTarget: '',
};
