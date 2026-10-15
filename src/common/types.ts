// Common types and interfaces for the Ansible Blockly Editor

/**
 * Repository configuration interface
 */
export interface RepositoryConfig {
  id: string;
  name: string;
  url: string;
  branch: string;
  auth: {
    type: 'none' | 'pat' | 'ssh';
    token?: string;
    keyPath?: string;
  };
  paths: string[];
  refresh: {
    type: 'manual' | 'scheduled';
    intervalMinutes?: number;
  };
}

/**
 * Ansible module parameter interface (module arguments)
 */
export interface ModuleParameter {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
  allowedValues?: string[];
  constraints?: {
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
  };
}

/**
 * Ansible task/module output interface (register variables)
 */
export interface ModuleOutput {
  name: string;
  type: string;
  description?: string;
  value: string;
}

/**
 * Ansible module metadata resource interface
 */
export interface ModuleResource {
  type: string;
  apiVersion: string;
  name?: string;
}

/**
 * Ansible module metadata interface
 */
export interface ModuleMetadata {
  moduleName: string;
  moduleSource: string;
  modulePath: string;
  description?: string;
  parameters: ModuleParameter[];
  outputs: ModuleOutput[];
  resources: ModuleResource[];
  version?: string;
  lastUpdated: string;
}

/**
 * Feature flag interface
 */
export interface FeatureFlag {
  name: string;
  type: 'boolean' | 'string' | 'number' | 'object';
  value: unknown;
  description?: string;
}

/**
 * Environment configuration interface
 */
export interface EnvironmentConfig {
  name: string;
  featureFlags: FeatureFlag[];
}

/**
 * Block definition for an Ansible module
 */
export interface AnsibleModuleBlockDefinition {
  type: string;
  message0: string;
  args0: unknown[];
  output?: string;
  outputConnections?: {
    name: string;
    type: string;
  }[];
  colour: number;
  tooltip?: string;
  helpUrl?: string;
}

/**
 * Ansible code generation options
 */
export interface AnsibleCodeGenerationOptions {
  environment: string;
  indentation: string;
  includeComments: boolean;
}
