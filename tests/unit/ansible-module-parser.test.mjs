import test from 'node:test';
import assert from 'node:assert/strict';
import { AnsibleModuleParser } from '../../dist-test/ansible-module-parser.js';

const SAMPLE = `# Storage account playbook for testing
---
- name: Storage account playbook
  hosts: all
  gather_facts: false
  tasks:
    - name: Manage storage account
      azure.azcollection.azure_rm_storageaccount:
        name: "{{ storage_account_name }}"
        location: westeurope
        account_type: Standard_LRS
      register: storage_result
`;

test('derives module name from yaml file name', () => {
  const parser = new AnsibleModuleParser();
  const meta = parser.parse('main.yml', SAMPLE, 'owner/repo/playbooks/main.yml');
  assert.equal(meta.moduleName, 'main');
});

test('extracts leading comment as description', () => {
  const parser = new AnsibleModuleParser();
  const meta = parser.parse('main.yml', SAMPLE, 'src');
  assert.equal(meta.description, 'Storage account playbook for testing');
});

test('extracts registered outputs', () => {
  const parser = new AnsibleModuleParser();
  const meta = parser.parse('main.yml', SAMPLE, 'src');
  assert.equal(meta.outputs.length, 1);
  assert.equal(meta.outputs[0].name, 'storage_result');
});

test('extracts module usages as resources', () => {
  const parser = new AnsibleModuleParser();
  const meta = parser.parse('main.yml', SAMPLE, 'src');
  assert.ok(meta.resources.length >= 1);
  assert.ok(meta.resources.some(r => r.type === 'azure.azcollection.azure_rm_storageaccount'));
});

test('skips structural yaml keys when extracting parameters', () => {
  const parser = new AnsibleModuleParser();
  const meta = parser.parse('main.yml', SAMPLE, 'src');
  for (const param of meta.parameters) {
    assert.notEqual(param.name, 'hosts');
    assert.notEqual(param.name, 'tasks');
    assert.notEqual(param.name, 'name');
  }
});
