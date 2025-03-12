import React, { FC, useRef } from 'react';

import CreateResourceDefaultPage from '@kubevirt-utils/components/CreateResourceDefaultPage/CreateResourceDefaultPage';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { useSignals } from '@preact/signals-react/runtime';
import VirtualMachineNavPage from '@virtualmachines/details/VirtualMachineNavPage';
import VirtualMachinesList from '@virtualmachines/list/VirtualMachinesList';
import { useTreeViewData } from '@virtualmachines/tree/hooks/useTreeViewData';
import VirtualMachineTreeView from '@virtualmachines/tree/VirtualMachineTreeView';

import { defaultVMYamlTemplate } from '../../../templates';

import { useNavigatorLocationParams } from './hooks/useNavigatorLocationParams';

const VirtualMachineNavigator: FC = () => {
  useSignals();
  const { t } = useKubevirtTranslation();
  const childRef = useRef<{ onFilterChange: OnFilterChange } | null>(null);
  const { cluster, isList, namespace, newVM, vmName } = useNavigatorLocationParams();

  const treeProps = useTreeViewData();

  const onFilterChange: OnFilterChange = (type, value) => {
    if (childRef.current) {
      childRef.current.onFilterChange(type, value);
    }
  };

  if (newVM) {
    return (
      <CreateResourceDefaultPage
        header={t('Create VirtualMachine')}
        initialResource={defaultVMYamlTemplate}
      />
    );
  }

  return (
    <VirtualMachineTreeView onFilterChange={onFilterChange} {...treeProps}>
      {isList ? (
        <VirtualMachinesList
          cluster={cluster}
          kind={VirtualMachineModelRef}
          namespace={namespace}
          ref={childRef}
        />
      ) : (
        <VirtualMachineNavPage kind={VirtualMachineModelRef} name={vmName} namespace={namespace} />
      )}
    </VirtualMachineTreeView>
  );
};

export default VirtualMachineNavigator;
