import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1DataVolumeTemplateSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';

export const getStorageClassName = (
  dataVolume: V1beta1DataVolume | V1DataVolumeTemplateSpec,
): string => dataVolume?.spec?.storage?.storageClassName;
