import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import {
  ResourceActionProvider,
  RoutePage,
  StandaloneRoutePage,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  KubevirtPluginContext: './utils/contexts/KubevirtPluginContext.ts',
  LogsStandAlone:
    './views/virtualmachines/details/tabs/diagnostic/VirtualMachineLogViewer/VirtualMachineLogViewerStandAlone/VirtualMachineLogViewerStandAlone.tsx',
  Navigator: './views/virtualmachines/navigator/VirtualMachineNavigator.tsx',
  useVirtualMachineActionsProvider:
    './views/virtualmachines/actions/hooks/useVirtualMachineActionsProvider.ts',
  VirtualMachinesOverviewTab:
    './views/virtualmachines/details/tabs/overview/VirtualMachinesOverviewTab.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      component: { $codeRef: 'LogsStandAlone' },
      exact: false,
      path: ['/k8s/ns/:ns/kubevirt.io~v1~VirtualMachine/:name/diagnostics/logs/standalone'],
    },
    type: 'console.page/route/standalone',
  } as EncodedExtension<StandaloneRoutePage>,

  {
    properties: {
      model: {
        group: 'kubevirt.io',
        kind: 'VirtualMachine',
        version: 'v1',
      },
      provider: {
        $codeRef: 'useVirtualMachineActionsProvider',
      },
    },
    type: 'console.action/resource-provider',
  } as EncodedExtension<ResourceActionProvider>,

  {
    properties: {
      component: { $codeRef: 'VirtualMachinesOverviewTab' },
    },
    type: 'acm.search/details',
  },
  {
    properties: {
      context: { $codeRef: 'KubevirtPluginContext' },
    },
    type: 'acm.kubevirt-context',
  },
  {
    properties: {
      component: {
        $codeRef: 'Navigator',
      },
      path: [
        '/k8s/ns/:ns/kubevirt.io~v1~VirtualMachine/:name',
        '/k8s/ns/:ns/kubevirt.io~v1~VirtualMachine',
        '/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine',
      ],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
];
