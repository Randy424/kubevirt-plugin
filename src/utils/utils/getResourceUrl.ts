import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { K8sModel, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type ResourceUrlProps = {
  activeNamespace?: string;
  model: K8sModel;
  resource?: K8sResourceCommon;
};

export type GetResourceUrl = (urlProps: ResourceUrlProps) => string;

/**
 * function for getting a resource URL
 * @param {ResourceUrlProps} urlProps - object with model, resource to get the URL from (optional) and active namespace/project name (optional)
 * @returns {string} the URL for the resource
 */

export const getResourceUrl: GetResourceUrl = (urlProps) => {
  const { activeNamespace, model, resource } = urlProps;

  if (!model) return null;
  const { crd, namespaced, plural } = model;

  const namespace =
    resource?.metadata?.namespace ||
    (activeNamespace !== ALL_NAMESPACES_SESSION_KEY && activeNamespace);
  const namespaceUrl = namespace ? `ns/${namespace}` : 'all-namespaces';

  const ref = crd ? `${model.apiGroup || 'core'}~${model.apiVersion}~${model.kind}` : plural || '';
  const name = resource?.metadata?.name || '';

  return `/k8s/${namespaced ? namespaceUrl : 'cluster'}/${ref}/${name}`;
};
