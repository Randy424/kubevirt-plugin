import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useLastNamespacePath } from '@kubevirt-utils/hooks/useLastNamespacePath';

import { deletePreferenceLabel } from '../../utils/utils';

type DeleteBootableVolumesModalProps = {
  dataSource: V1beta1DataSource;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteBootableVolumesModal: FC<DeleteBootableVolumesModalProps> = ({
  dataSource,
  isOpen,
  onClose,
}) => {
  const { t } = useKubevirtTranslation();
  const lastNamespacePath = useLastNamespacePath();

  return (
    <DeleteModal
      obj={dataSource}
      isOpen={isOpen}
      onClose={onClose}
      headerText={t('Delete label?')}
      onDeleteSubmit={deletePreferenceLabel(dataSource)}
      bodyText={
        <Trans t={t}>
          Please note that only the label data will be deleted and that the bootable volume will
          remain. Are you sure you want to delete the label for bootable volume{' '}
          <strong>{dataSource?.metadata?.name}</strong>?
        </Trans>
      }
      redirectUrl={`/k8s/${lastNamespacePath}/bootablevolumes`}
    />
  );
};

export default DeleteBootableVolumesModal;