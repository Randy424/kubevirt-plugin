import React, { FC, useState } from 'react';

import {
  V1beta1VirtualMachineSnapshot,
  V1VirtualMachine,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import RestoreModal from '@kubevirt-utils/components/SnapshotModal/RestoreModal';
import { timestampFor } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DescriptionList,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Dropdown,
  DropdownItem,
  DropdownList,
  Popover,
  PopoverPosition,
} from '@patternfly/react-core';

import { printableVMStatus } from '../../../../../utils';
import IndicationLabelList from '../../../snapshots/components/IndicationLabel/IndicationLabelList';

import SnapshotDeleteModal from './component/SnapshotDeleteModal';
import { icon } from './utils/snapshotStatus';

import './virtual-machines-overview-tab-snapshots.scss';

type VirtualMachinesOverviewTabSnapshotsRowProps = {
  snapshot: V1beta1VirtualMachineSnapshot;
  vm: V1VirtualMachine;
};

const VirtualMachinesOverviewTabSnapshotsRow: FC<VirtualMachinesOverviewTabSnapshotsRowProps> = ({
  snapshot,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const [isKebabOpen, setIsKebabOpen] = useState(false);
  const { createModal } = useModal();

  const timestamp = timestampFor(
    new Date(snapshot?.metadata?.creationTimestamp),
    new Date(Date.now()),
    false,
  );

  const Icon = icon[snapshot?.status?.phase];

  const onToggle = () => setIsKebabOpen((prevIsOpen) => !prevIsOpen);

  return (
    <div className="VirtualMachinesOverviewTabSnapshotsRow--main">
      <div className="name">
        <Icon />
        <DescriptionListTermHelpText>
          <Popover
            bodyContent={
              <DescriptionList isHorizontal>
                <VirtualMachineDescriptionItem
                  descriptionData={
                    <>
                      <Icon />
                      <span className="icon-spacer">{snapshot?.status?.phase}</span>
                    </>
                  }
                  descriptionHeader={t('Status')}
                />
                <VirtualMachineDescriptionItem
                  descriptionData={timestamp}
                  descriptionHeader={t('Created')}
                />
                <VirtualMachineDescriptionItem
                  descriptionData={<IndicationLabelList snapshot={snapshot} />}
                  descriptionHeader={t('Indications')}
                />
              </DescriptionList>
            }
            headerContent={snapshot?.metadata?.name}
            position={PopoverPosition.left}
          >
            <DescriptionListTermHelpTextButton className="icon-spacer__offset">
              {snapshot?.metadata?.name}
            </DescriptionListTermHelpTextButton>
          </Popover>
        </DescriptionListTermHelpText>
        <span className="pf-v6-u-text-color-subtle timestamp">{`(${timestamp})`}</span>
      </div>
      <Dropdown
        isOpen={isKebabOpen}
        onOpenChange={setIsKebabOpen}
        onSelect={() => setIsKebabOpen(false)}
        popperProps={{ position: 'right' }}
        toggle={KebabToggle({ isExpanded: isKebabOpen, onClick: onToggle })}
      >
        <DropdownList>
          <DropdownItem
            isDisabled={vm?.status?.printableStatus !== printableVMStatus.Stopped}
            key="restore"
            onClick={() => createModal((props) => <RestoreModal snapshot={snapshot} {...props} />)}
          >
            {t('Restore')}
          </DropdownItem>
          <DropdownItem
            onClick={() =>
              createModal((props) => <SnapshotDeleteModal snapshot={snapshot} {...props} />)
            }
            key="delete"
          >
            {t('Delete')}
          </DropdownItem>
        </DropdownList>
      </Dropdown>
    </div>
  );
};

export default VirtualMachinesOverviewTabSnapshotsRow;
