// CI helper: validates that the test Ansible playbook can be parsed for
// tasks, modules, and registered outputs (mirrors the GitModuleAnalyzer domain).
const fs = require('fs');

const content = fs.readFileSync('/tmp/test-ansible-repo/playbook.yml', 'utf8');
console.log('Successfully read Ansible playbook content');

const taskRegex = /- name:\s*(.+)/g;
const tasks = [];
let match;
while ((match = taskRegex.exec(content)) !== null) {
  tasks.push({ name: match[1] });
}
console.log('Successfully extracted tasks:', tasks.length);
if (tasks.length < 1) {
  throw new Error('Expected at least 1 task, got ' + tasks.length);
}

const moduleRegex = /\n\s+(azure\.azcollection\.[\w]+|ansible\.builtin\.[\w]+|[\w.]+):/g;
const modules = [];
while ((match = moduleRegex.exec(content)) !== null) {
  modules.push({ module: match[1] });
}
console.log('Successfully extracted modules:', modules.length);
if (modules.length < 1) {
  throw new Error('Expected at least 1 module, got ' + modules.length);
}

const registerRegex = /register:\s*([A-Za-z_][\w]*)/g;
const registers = [];
while ((match = registerRegex.exec(content)) !== null) {
  registers.push({ name: match[1] });
}
console.log('Successfully extracted registered outputs:', registers.length);
if (registers.length !== 1) {
  throw new Error('Expected 1 registered output, got ' + registers.length);
}

console.log('Ansible repository toolbox parsing test completed successfully');
