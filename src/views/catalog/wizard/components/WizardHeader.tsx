import React, { FC, memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { useWizardVMContext } from '@catalog/utils/WizardVMContext';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { getCatalogURL } from '@multicluster/urls';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonVariant,
  Content,
  ContentVariants,
  Split,
  Title,
} from '@patternfly/react-core';

export const WizardHeader: FC<{ namespace: string }> = memo(({ namespace }) => {
  const { t } = useKubevirtTranslation();
  const { tabsData } = useWizardVMContext();
  const navigate = useNavigate();
  const location = useLocation();
  const cluster = useClusterParam();

  const templateName = tabsData?.overview?.templateMetadata?.name;
  const templateDisplayName = tabsData?.overview?.templateMetadata?.displayName || templateName;

  const onBreadcrumbClick = (url: string) =>
    confirm(t('Are you sure you want to leave this page?')) && navigate(url);

  const isSidebarEditorDisplayed = !location.pathname.includes(
    `/catalog/template/review/${VirtualMachineDetailsTab.YAML}`,
  );

  return (
    <div className="pf-v6-c-page__main-breadcrumb wizard-header">
      <Breadcrumb className="pf-v6-c-breadcrumb co-breadcrumb">
        <BreadcrumbItem>
          <Button
            onClick={() =>
              onBreadcrumbClick(
                `${getCatalogURL(cluster, namespace || DEFAULT_NAMESPACE)}/template`,
              )
            }
            isInline
            variant={ButtonVariant.link}
          >
            {t('Catalog')}
          </Button>
        </BreadcrumbItem>
      </Breadcrumb>
      <Split hasGutter>
        <Title headingLevel="h1">{t('Customize and create VirtualMachine')}</Title>
        {isSidebarEditorDisplayed && <SidebarEditorSwitch />}
      </Split>
      <Content component={ContentVariants.small} data-test="wizard title help">
        {t('Template: {{templateDisplayName}}', { templateDisplayName })}
      </Content>
    </div>
  );
});
WizardHeader.displayName = 'WizardHeader';
