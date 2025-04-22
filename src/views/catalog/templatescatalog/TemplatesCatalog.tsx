import React, { FC, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { CREATE_VM_TAB } from '@catalog/CreateVMHorizontalNav/constants';
import useHideDeprecatedTemplateTiles from '@catalog/templatescatalog/hooks/useHideDeprecatedTemplateTiles';
import { clearSessionStorageVM } from '@catalog/utils/WizardVMContext';
import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { logTemplateFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import { TEMPLATE_SELECTED } from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { Card, Flex, FlexItem, PageSection, Stack } from '@patternfly/react-core';

import { TemplatesCatalogDrawer } from './components/TemplatesCatalogDrawer/TemplatesCatalogDrawer';
import { TemplatesCatalogEmptyState } from './components/TemplatesCatalogEmptyState';
import { TemplatesCatalogFilters } from './components/TemplatesCatalogFilters/TemplatesCatalogFilters';
import { TemplatesCatalogHeader } from './components/TemplatesCatalogHeader';
import { TemplatesCatalogItems } from './components/TemplatesCatalogItems';
import { skeletonCatalog } from './components/TemplatesCatalogSkeleton';
import { useTemplatesWithAvailableSource } from './hooks/useTemplatesWithAvailableSource';
import { useTemplatesFilters } from './hooks/useVmTemplatesFilters';
import { filterTemplates } from './utils/helpers';

import './TemplatesCatalog.scss';

type TemplatesCatalogProps = { currentTab: CREATE_VM_TAB };

const TemplatesCatalog: FC<TemplatesCatalogProps> = ({ currentTab }) => {
  const { ns: namespace } = useParams<{ ns: string }>();
  const [selectedTemplate, setSelectedTemplate] = useState<undefined | V1Template>(undefined);

  const [filters, onFilterChange, clearAll] = useTemplatesFilters();
  const { availableDatasources, availableTemplatesUID, bootSourcesLoaded, loaded, templates } =
    useTemplatesWithAvailableSource({
      namespace: filters.namespace,
      onlyAvailable: filters.onlyAvailable,
      onlyDefault: filters.onlyDefault,
    });

  const filteredTemplates = useMemo(
    () => filterTemplates(templates, filters),
    [templates, filters],
  );

  useHideDeprecatedTemplateTiles(currentTab, onFilterChange);

  return (
    <PageSection className="vm-catalog">
      {loaded ? (
        <Card className="pf-v6-u-pt-md">
          <Flex flexWrap={{ default: 'nowrap' }}>
            <TemplatesCatalogFilters filters={filters} onFilterChange={onFilterChange} />
            <FlexItem grow={{ default: 'grow' }}>
              <Stack className="co-catalog-page__content">
                <TemplatesCatalogHeader
                  filters={filters}
                  itemCount={filteredTemplates.length}
                  onFilterChange={onFilterChange}
                />
                {filteredTemplates?.length > 0 ? (
                  <TemplatesCatalogItems
                    onTemplateClick={(template) => {
                      clearSessionStorageVM();
                      setSelectedTemplate(template);
                      logTemplateFlowEvent(TEMPLATE_SELECTED, template);
                    }}
                    availableDatasources={availableDatasources}
                    availableTemplatesUID={availableTemplatesUID}
                    bootSourcesLoaded={bootSourcesLoaded}
                    filters={filters}
                    loaded={loaded}
                    templates={filteredTemplates}
                  />
                ) : (
                  <TemplatesCatalogEmptyState
                    bootSourcesLoaded={bootSourcesLoaded}
                    onClearFilters={clearAll}
                  />
                )}
              </Stack>
            </FlexItem>
          </Flex>
        </Card>
      ) : (
        skeletonCatalog
      )}
      <TemplatesCatalogDrawer
        isOpen={!!selectedTemplate}
        namespace={namespace ?? DEFAULT_NAMESPACE}
        onClose={() => setSelectedTemplate(undefined)}
        template={selectedTemplate}
      />
    </PageSection>
  );
};

export default TemplatesCatalog;
