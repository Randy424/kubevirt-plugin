import { useMemo } from 'react';

import VirtualMachineInstanceMigrationModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceMigrationModel';
import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import {
  V1AddVolumeOptions,
  V1RemoveVolumeOptions,
  V1StopOptions,
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  KubevirtPluginData,
  MulticlusterResource,
} from '@kubevirt-utils/contexts/KubevirtPluginContext';
import { useClusterScope } from '@kubevirt-utils/hooks/useClusterScope';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getUpdateStrategy } from '@kubevirt-utils/resources/vm';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import {
  k8sCreate,
  k8sDelete,
  K8sModel,
  k8sPatch,
  Patch,
} from '@openshift-console/dynamic-plugin-sdk';

import { createRollbackPatchData, deleteUnusedDataVolumes } from './utils';

const generateRandomString = () => Math.random().toString(36).substring(2, 7);

export enum VMActionType {
  AddVolume = 'addvolume',
  Pause = 'pause',
  RemoveVolume = 'removevolume',
  Restart = 'restart',
  Start = 'start',
  Stop = 'stop',
  Unpause = 'unpause',
}

export const VMActionRequest = async (
  withCluster: KubevirtPluginData['clusterScope']['withCluster'],
  vm: MulticlusterResource<V1VirtualMachine>,
  action: VMActionType,
  model: K8sModel,
  body?: V1AddVolumeOptions | V1RemoveVolumeOptions | V1StopOptions,
) => {
  const {
    cluster,
    metadata: { name, namespace },
  } = vm;

  try {
    // TODO: when this bz resolves https://bugzilla.redhat.com/show_bug.cgi?id=2056656
    // we can do the call to k8sUpdate instead of consoleFetch

    // const promise = await k8sUpdate({
    //   model: { ...VirtualMachineModel, apiGroup: `subresources.${VirtualMachineModel.apiGroup}` },
    //   data: vm,
    //   ns: namespace,
    //   name,
    //   path: action,
    // });
    // Promise.resolve(promise);
    const url = `/api/kubernetes/apis/subresources.${model.apiGroup}/${model.apiVersion}/namespaces/${namespace}/${model.plural}/${name}/${action}`;

    const response = await withCluster(cluster).consoleFetch(url, {
      body: body ? JSON.stringify(body) : undefined,
      method: 'PUT',
    });

    return response.text();
  } catch (error) {
    kubevirtConsole.error(error);
    return;
  }
};

export const useVMActions = () => {
  const { withCluster } = useClusterScope();
  return useMemo(
    () => ({
      addPersistentVolume: async (vm: V1VirtualMachine, body: V1AddVolumeOptions) =>
        VMActionRequest(withCluster, vm, VMActionType.AddVolume, VirtualMachineModel, body),
      cancelMigration: async (vmim: V1VirtualMachineInstanceMigration) => {
        await k8sDelete({
          model: VirtualMachineInstanceMigrationModel,
          resource: vmim,
        });
      },
      deleteVM: async (vm: V1VirtualMachine) => {
        await k8sDelete({
          model: VirtualMachineModel,
          resource: vm,
        });
      },
      migrateVM: async (vm: V1VirtualMachine) => {
        const { name, namespace } = vm?.metadata;
        const migrationData: V1VirtualMachineInstanceMigration = {
          apiVersion: 'kubevirt.io/v1',
          kind: 'VirtualMachineInstanceMigration',
          metadata: {
            name: `${name}-migration-${generateRandomString()}`,
          },
          spec: {
            vmiName: name,
          },
        };
        await k8sCreate({
          data: migrationData,
          model: VirtualMachineInstanceMigrationModel,
          ns: namespace,
        });
      },
      pauseVM: async (vm: V1VirtualMachine) =>
        VMActionRequest(withCluster, vm, VMActionType.Pause, VirtualMachineInstanceModel),
      removeVolume: async (vm: V1VirtualMachine, body: V1RemoveVolumeOptions) =>
        VMActionRequest(withCluster, vm, VMActionType.RemoveVolume, VirtualMachineModel, body),
      restartVM: async (vm: V1VirtualMachine) =>
        VMActionRequest(withCluster, vm, VMActionType.Restart, VirtualMachineModel),
      rollbackStorageMigration: async (vm: V1VirtualMachine) => {
        if (isEmpty(getUpdateStrategy(vm))) return;

        const patchData: Patch[] = createRollbackPatchData(vm);

        patchData.push({
          op: 'remove',
          path: '/spec/updateVolumesStrategy',
        });

        await k8sPatch<V1VirtualMachine>({
          data: patchData,
          model: VirtualMachineModel,
          resource: vm,
        });

        deleteUnusedDataVolumes(vm, getNamespace(vm));
      },

      startVM: async (vm: V1VirtualMachine) =>
        VMActionRequest(withCluster, vm, VMActionType.Start, VirtualMachineModel),

      stopVM: async (vm: V1VirtualMachine, body?: V1StopOptions) =>
        VMActionRequest(withCluster, vm, VMActionType.Stop, VirtualMachineModel, body),

      unpauseVM: async (vm: V1VirtualMachine) =>
        VMActionRequest(withCluster, vm, VMActionType.Unpause, VirtualMachineInstanceModel),
    }),
    [withCluster],
  );
};
