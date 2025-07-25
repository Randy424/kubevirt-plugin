import React, { FC, useEffect, useState } from 'react';

import SelectInstanceTypeSection from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/SelectInstanceTypeSection';
import VMDetailsSection from '@catalog/CreateFromInstanceTypes/components/VMDetailsSection/VMDetailsSection';
import { CREATE_VM_TAB } from '@catalog/CreateVMHorizontalNav/constants';
import GuidedTour from '@kubevirt-utils/components/GuidedTour/GuidedTour';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_NAMESPACES_SESSION_KEY, ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import useUserPreferences from '@kubevirt-utils/hooks/useUserPreferences';
import useBootableVolumes from '@kubevirt-utils/resources/bootableresources/hooks/useBootableVolumes';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Card, Divider, Grid, GridItem, List, PageSection } from '@patternfly/react-core';

import AddBootableVolumeButton from './components/AddBootableVolumeButton/AddBootableVolumeButton';
import BootableVolumeList from './components/BootableVolumeList/BootableVolumeList';
import CreateFromInstanceTypeTitle from './components/CreateFromInstanceTypeTitle/CreateFromInstanceTypeTitle';
import CreateVMFooter from './components/CreateVMFooter/CreateVMFooter';
import SectionListItem from './components/SectionListItem/SectionListItem';
import useInstanceTypesAndPreferences from './state/hooks/useInstanceTypesAndPreferences';
import { useInstanceTypeVMStore } from './state/useInstanceTypeVMStore';
import { INSTANCE_TYPES_SECTIONS } from './utils/constants';

import './CreateFromInstanceType.scss';

type CreateFromInstanceTypeProps = { currentTab: CREATE_VM_TAB };

const CreateFromInstanceType: FC<CreateFromInstanceTypeProps> = ({ currentTab }) => {
  const { t } = useKubevirtTranslation();
  const sectionState = useState<INSTANCE_TYPES_SECTIONS>(INSTANCE_TYPES_SECTIONS.SELECT_VOLUME);

  const { resetInstanceTypeVMState, setVMNamespaceTarget, volumeListNamespace } =
    useInstanceTypeVMStore();
  const bootableVolumesData = useBootableVolumes(volumeListNamespace);
  const instanceTypesAndPreferencesData = useInstanceTypesAndPreferences();
  const [userPreferences, userPreferencesLoaded, userPreferencesError] = useUserPreferences(
    volumeListNamespace === ALL_PROJECTS ? ALL_NAMESPACES_SESSION_KEY : volumeListNamespace,
  );
  const [activeNamespace] = useActiveNamespace();
  const [authorizedSSHKeys, , loaded] = useKubevirtUserSettings('ssh');

  useEffect(() => {
    resetInstanceTypeVMState();
  }, [resetInstanceTypeVMState]);

  useEffect(() => {
    const targetNS =
      activeNamespace === ALL_NAMESPACES_SESSION_KEY ? DEFAULT_NAMESPACE : activeNamespace;
    setVMNamespaceTarget(authorizedSSHKeys?.[targetNS], targetNS);
  }, [activeNamespace, authorizedSSHKeys, setVMNamespaceTarget]);

  const [favorites = [], updaterFavorites, loadedFavorites] =
    useKubevirtUserSettings('favoriteBootableVolumes');

  if (
    !instanceTypesAndPreferencesData?.loaded ||
    !loaded ||
    !userPreferencesLoaded ||
    !loadedFavorites ||
    !favorites
  ) {
    return (
      <Bullseye className="create-vm-instance-type-section__page-loader">
        <Loading size="lg" />
      </Bullseye>
    );
  }

  return (
    <>
      <GuidedTour />
      <PageSection>
        <Grid>
          <GridItem>
            <Card>
              <List className="create-vm-instance-type-section__list" isPlain>
                <SectionListItem
                  headerAction={
                    <AddBootableVolumeButton
                      loadError={instanceTypesAndPreferencesData.loadError || userPreferencesError}
                    />
                  }
                  headerText={
                    <CreateFromInstanceTypeTitle
                      instanceTypesAndPreferencesData={instanceTypesAndPreferencesData}
                    />
                  }
                  sectionKey={INSTANCE_TYPES_SECTIONS.SELECT_VOLUME}
                  sectionState={sectionState}
                >
                  <BootableVolumeList
                    bootableVolumesData={bootableVolumesData}
                    currentTab={currentTab}
                    displayShowAllButton
                    favorites={[favorites as [], updaterFavorites]}
                    preferencesData={instanceTypesAndPreferencesData.preferences}
                    userPreferencesData={userPreferences}
                  />
                </SectionListItem>

                <Divider />

                <SectionListItem
                  headerText={t('Select InstanceType')}
                  sectionKey={INSTANCE_TYPES_SECTIONS.SELECT_INSTANCE_TYPE}
                  sectionState={sectionState}
                >
                  <SelectInstanceTypeSection
                    instanceTypesAndPreferencesData={instanceTypesAndPreferencesData}
                  />
                </SectionListItem>

                <Divider />

                <SectionListItem
                  headerText={t('VirtualMachine details')}
                  sectionKey={INSTANCE_TYPES_SECTIONS.VM_DETAILS}
                  sectionState={sectionState}
                >
                  <VMDetailsSection
                    instanceTypesAndPreferencesData={instanceTypesAndPreferencesData}
                    userPreferencesData={userPreferences}
                  />
                </SectionListItem>
              </List>
            </Card>
          </GridItem>
        </Grid>
        <CreateVMFooter />
      </PageSection>
    </>
  );
};

export default CreateFromInstanceType;
