import { ModuleMetadata, ModuleOutput, ModuleParameter, ModuleResource } from './types';

/**
 * Shared Ansible module parser. Works on file contents regardless of whether
 * they came from local disk (Electron) or the GitHub API (browser). Extracts
 * module arguments from YAML documentation blocks and task usage, plus
 * registered outputs.
 */
export class AnsibleModuleParser {
  parse(fileName: string, content: string, sourcePath: string): ModuleMetadata {
    return {
      moduleName: fileName.replace(/\.(ya?ml)$/i, ''),
      moduleSource: sourcePath,
      modulePath: sourcePath,
      description: this.extractDescription(content),
      parameters: this.extractParameters(content),
      outputs: this.extractOutputs(content),
      resources: this.extractResources(content),
      lastUpdated: new Date().toISOString(),
    };
  }

  private extractDescription(content: string): string | undefined {
    const match = /(^|\n)#\s?(.+)/.exec(content);
    return match ? match[2].trim() : undefined;
  }

  /**
   * Extracts module arguments from a documentation block:
   *   - name: storage_account_name (required parameter description)
   * or from `module:` usage options.
   */
  private extractParameters(content: string): ModuleParameter[] {
    const parameters: ModuleParameter[] = [];
    const seen = new Set<string>();

    // DOCUMENTATION block style: "    param_name: description"
    const docRegex = /(?:^|\n)([a-z_]+):\s+(.+?)(?=\n[a-z_]|\n\S|$)/g;
    let match: RegExpExecArray | null;
    while ((match = docRegex.exec(content)) !== null) {
      const name = match[1];
      if (['name', 'hosts', 'become', 'tasks', 'vars', 'module', 'gather_facts'].includes(name)) {
        continue;
      }
      if (seen.has(name)) {
        continue;
      }
      seen.add(name);
      const description = match[2].trim().replace(/^["']|["']$/g, '');
      const required = /required/i.test(description);
      parameters.push({
        name,
        type: 'string',
        required,
        description,
      });
    }
    return parameters;
  }

  /**
   * Extracts registered outputs: `register: some_var`.
   */
  private extractOutputs(content: string): ModuleOutput[] {
    const outputs: ModuleOutput[] = [];
    const regex = /register:\s*([A-Za-z_][\w]*)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      outputs.push({
        name: match[1],
        type: 'any',
        value: match[1],
      });
    }
    return outputs;
  }

  /**
   * Extracts task module usages: `- name: ... \n  module_name:`.
   */
  private extractResources(content: string): ModuleResource[] {
    const resources: ModuleResource[] = [];
    const regex = /\n\s{2,}([a-z_][\w.]*):\s/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      const candidate = match[1];
      if (
        ['name', 'hosts', 'become', 'vars', 'when', 'loop', 'register', 'args'].includes(candidate)
      ) {
        continue;
      }
      if (!resources.some(r => r.type === candidate)) {
        resources.push({
          type: candidate,
          apiVersion: '',
          name: candidate,
        });
      }
    }
    return resources;
  }
}
