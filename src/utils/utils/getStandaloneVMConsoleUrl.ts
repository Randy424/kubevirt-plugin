type StandaloneVMConsoleUrlProps = {
  name: string;
  namespace: string;
};

export type GetStandaloneVMConsoleUrl = (urlProps: StandaloneVMConsoleUrlProps) => string;

/**
 * function for getting the standalone VM console URL
 * @param {StandaloneVMConsoleUrlProps} urlProps
 * @returns {string} the URL for the console
 */

export const getStandaloneVMConsoleUrl: GetStandaloneVMConsoleUrl = (urlProps) => {
  const { name, namespace } = urlProps;

  return `/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine/${name}/console/standalone`;
};
