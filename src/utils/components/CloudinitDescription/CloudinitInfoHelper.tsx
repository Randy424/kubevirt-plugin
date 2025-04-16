import React from 'react';

import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Stack, StackItem } from '@patternfly/react-core';
import { ExternalLinkSquareAltIcon } from '@patternfly/react-icons';

const CloudInitInfoHelper = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Stack className="kv-cloudinit-info-helper--main">
      <StackItem>
        {t(
          'You can use cloud-init to initialize the operating system with a specific configuration when the VirtualMachine is started.',
        )}
      </StackItem>
      <StackItem>
        <div className="pf-v6-u-text-color-subtle">
          {t('The cloud-init service is enabled by default in Fedora and RHEL images.')}{' '}
          <Button
            icon={<ExternalLinkSquareAltIcon />}
            iconPosition="right"
            isInline
            size="sm"
            variant={ButtonVariant.link}
          >
            <a href={documentationURL.CLOUDINIT_INFO} rel="noopener noreferrer" target="_blank">
              {t('Learn more')}
            </a>
          </Button>
        </div>
      </StackItem>
    </Stack>
  );
};

export default CloudInitInfoHelper;
