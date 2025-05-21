import React, { FC, Suspense, useState } from 'react';
import { dump } from 'js-yaml';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Modal, ModalBody, ModalHeader, ModalVariant, Tab, Tabs } from '@patternfly/react-core';

import YamlAndCLIEditor from '../YamlAndCLIEditor/YamlAndCLIEditor';

import { TAB } from './utils/constants';
import { getCreateVMVirtctlCommand } from './utils/utils';

import './YamlAndCLIViewerModal.scss';

type YamlAndCLIViewerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  vm: V1VirtualMachine;
};

const YamlAndCLIViewerModal: FC<YamlAndCLIViewerModalProps> = ({ isOpen, onClose, vm }) => {
  const { t } = useKubevirtTranslation();

  const [activeTabKey, setActiveTabKey] = useState<TAB>(TAB.YAML);

  const { instanceTypeVMState } = useInstanceTypeVMStore();
  const { selectedBootableVolume, sshSecretCredentials, vmName } = instanceTypeVMState;

  const handleTabClick = (_, tabIndex: TAB) => {
    setActiveTabKey(tabIndex);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant={ModalVariant.large}>
      <ModalHeader title={`${activeTabKey} for ${vmName}`} />
      <ModalBody className="yaml-cli-viewer-modal-body">
        <Suspense fallback={<Loading />}>
          <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
            <Tab eventKey={TAB.YAML} title={t('YAML')}>
              <YamlAndCLIEditor code={dump(vm || '')} minHeight="350px" />
            </Tab>
            <Tab eventKey={TAB.CLI} title={t('CLI')}>
              <YamlAndCLIEditor
                code={getCreateVMVirtctlCommand(
                  vm,
                  selectedBootableVolume,
                  sshSecretCredentials?.sshPubKey,
                )}
                minHeight="150px"
              />
            </Tab>
          </Tabs>
        </Suspense>
      </ModalBody>
    </Modal>
  );
};

export default YamlAndCLIViewerModal;
