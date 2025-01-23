import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { Split } from '@patternfly/react-core';
import ActionIconButton from '@virtualmachines/actions/components/VMActionsIconBar/components/ActionIconButton';
import { useVMActionIconsDetails } from '@virtualmachines/actions/components/VMActionsIconBar/utils/utils';

type VMActionsIconBarProps = {
  vm: V1VirtualMachine;
};

const VMActionsIconBar: FC<VMActionsIconBarProps> = ({ vm }) => {
  return (
    <Split className="vm-actions-icon-bar">
      {useVMActionIconsDetails(vm).map((actionDetails) => (
        <ActionIconButton {...actionDetails} key={actionDetails?.action?.id} />
      ))}
    </Split>
  );
};

export default VMActionsIconBar;
