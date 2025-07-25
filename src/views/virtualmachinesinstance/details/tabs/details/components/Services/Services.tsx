import * as React from 'react';

import { modelToGroupVersionKind, ServiceModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getServicesForVmi } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { ServicesList } from '@openshift-console/dynamic-plugin-sdk-internal';
import { Icon, Title } from '@patternfly/react-core';
import { LinkIcon } from '@patternfly/react-icons';

const Services = ({ pathname, vmi }) => {
  const { t } = useKubevirtTranslation();

  const [services, loaded] = useK8sWatchResource<IoK8sApiCoreV1Service[]>({
    groupVersionKind: modelToGroupVersionKind(ServiceModel),
    isList: true,
    namespace: vmi?.metadata?.namespace,
  });

  const data = getServicesForVmi(services, vmi);

  return (
    <div>
      <a className="link-icon" href={`${pathname}#services`}>
        <Icon size="sm">
          <LinkIcon />
        </Icon>
      </a>
      <Title className="co-section-heading" headingLevel="h2">
        {t('Services')}
      </Title>
      {!isEmpty(ServicesList) && <ServicesList data={data} loaded={loaded} />}
    </div>
  );
};

export default Services;
