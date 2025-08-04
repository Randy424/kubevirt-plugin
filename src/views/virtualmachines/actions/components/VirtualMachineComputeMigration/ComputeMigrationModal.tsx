import React, { FC, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import {
  Button,
  ButtonVariant,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Stack,
  StackItem,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import { migrateVM } from '@virtualmachines/actions/actions';
import MigrationOptionRadioGroup from '@virtualmachines/actions/components/VirtualMachineComputeMigration/components/MigrationOptionRadioGroup';
import NodesTable from '@virtualmachines/actions/components/VirtualMachineComputeMigration/components/NodesTable/NodesTable';
import { MigrationOptions } from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/types';

import './ComputeMigrationModal.scss';

type ComputeMigrationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  vm: V1VirtualMachine;
};

const ComputeMigrationModal: FC<ComputeMigrationModalProps> = ({ isOpen, onClose, vm }) => {
  const { t } = useKubevirtTranslation();

  const [migrationOption, setMigrationOption] = useState<MigrationOptions>(
    MigrationOptions.AUTOMATIC,
  );

  const [selectedNode, setSelectedNode] = useState<string>('');

  const handleNodeSelection = (changedNode: string) => {
    changedNode === selectedNode ? setSelectedNode('') : setSelectedNode(changedNode);
  };

  const initiateMigration = () => {
    migrateVM(vm).catch((err) => kubevirtConsole.error(err));
    onClose();
  };

  return (
    <Modal
      className="compute-migration-modal"
      height="650px"
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.large}
    >
      <ModalHeader>
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h1">{t('Migrate VirtualMachine to a different Node')}</Title>
          </StackItem>
          <StackItem>
            <Title headingLevel="h2" size={TitleSizes.md}>
              {t('Select the target Node to migrate your VirtualMachine to.')}
            </Title>
          </StackItem>
        </Stack>
      </ModalHeader>
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            <MigrationOptionRadioGroup
              migrationOption={migrationOption}
              setMigrationOption={setMigrationOption}
            />
          </StackItem>
          <StackItem className="compute-migration-modal__table-container">
            {migrationOption === MigrationOptions.MANUAL ? (
              <NodesTable
                handleNodeSelection={handleNodeSelection}
                selectedNode={selectedNode}
                vm={vm}
              />
            ) : (
              <div className="compute-migration-modal__placeholder" />
            )}
          </StackItem>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button onClick={() => initiateMigration()}>{t('Migrate VirtualMachine')}</Button>
        <Button onClick={onClose} size="sm" variant={ButtonVariant.link}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ComputeMigrationModal;
