import { writeFile, readFile } from 'fs/promises';
import { glob } from 'glob';
import path from 'path';
import type { Workflow } from './workflow-scanner.js';

/**
 * Wrap text to a maximum length, then newline at the last space before the limit <br>
 */
function wrapText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const lastSpaceIndex = text.lastIndexOf(' ', maxLength - 1);

  if (lastSpaceIndex === -1) {
    return (
      text.substring(0, maxLength) +
      '<br>' +
      wrapText(text.substring(maxLength), maxLength)
    );
  }

  return (
    text.substring(0, lastSpaceIndex) +
    '<br>' +
    wrapText(text.substring(lastSpaceIndex + 1), maxLength)
  );
}

/**
 * Format workflow inputs, outputs, and secrets in stacked format for compact display
 */
function formatStackedWorkflowDetails(
  columns: Record<string, unknown> | undefined
): string {
  if (!columns || Object.keys(columns).length === 0) return '*None*';

  const keys = Object.keys(columns);
  return keys.map((key) => `\`${key}\``).join('<br>');
}

/**
 * Category mappings based on file prefixes
 */
const CATEGORY_MAPPINGS = [
  { prefixes: ['_'], category: 'Internal', icon: '⚙️' },
  { prefixes: ['test-'], category: 'Testing', icon: '🧪' },
  { prefixes: ['quality-'], category: 'Code Quality', icon: '🔧' },
  {
    prefixes: ['deploy-', 'build-', 'publish-', 'release-'],
    category: 'Deployment',
    icon: '🚀',
  },
  {
    prefixes: ['security-', 'scan-', 'audit-'],
    category: 'Security',
    icon: '🔒',
  },
  {
    prefixes: ['util-', 'setup-', 'tool-', 'maintenance-'],
    category: 'Utilities',
    icon: '🛠️',
  },
  {
    prefixes: ['doc-', 'docs-', 'generate-'],
    category: 'Documentation',
    icon: '📚',
  },
  { prefixes: ['notify-', 'alert-'], category: 'Notifications', icon: '🔔' },
  {
    prefixes: ['monitor-', 'check-', 'health-'],
    category: 'Monitoring',
    icon: '�',
  },
] as const;

/**
 * Get category and icon based on filename
 */
function getCategoryByFilename(filename: string): {
  category: string;
  icon: string;
} {
  for (const mapping of CATEGORY_MAPPINGS) {
    if (mapping.prefixes.some((prefix) => filename.startsWith(prefix))) {
      return { category: mapping.category, icon: mapping.icon };
    }
  }
  return { category: 'Miscellaneous', icon: '🔍' };
}

/**
 * Categorize workflows based on their file prefix
 */
function categorizeWorkflow(workflow: Workflow): {
  category: string;
  icon: string;
} {
  // Extract filename without path and extension (handle both forward and back slashes)
  const filename =
    workflow.filePath
      .split(/[/\\]/)
      .pop()
      ?.replace('.yml', '')
      .replace('.yaml', '') || '';
  return getCategoryByFilename(filename);
}

/**
 * Generate folder structure documentation
 */
async function generateFolderStructure(): Promise<string> {
  const workflowFiles = await glob('.github/workflows/*.{yml,yaml}', {
    cwd: process.cwd(),
  });

  const actionDirs = await glob('.github/actions/*/', {
    cwd: process.cwd(),
  });

  let structure = '```\n.github/\n';

  // Workflows section
  if (workflowFiles.length > 0) {
    structure += '├── workflows/          # GitHub Actions Workflows\n';

    // Sort workflow files by filename (natural ASCII order)
    const sortedWorkflowFiles = workflowFiles
      .map((filePath) => ({ filePath, fileName: path.basename(filePath) }))
      .sort((a, b) => a.fileName.localeCompare(b.fileName));

    // Group files by category for comment placement
    let lastCategory = '';

    for (let i = 0; i < sortedWorkflowFiles.length; i++) {
      const workflowFile = sortedWorkflowFiles[i];
      if (!workflowFile) continue;

      const { filePath, fileName } = workflowFile;

      // Determine category for this file using centralized logic
      const { category, icon } = getCategoryByFilename(fileName);

      // Add category comment when category changes
      if (category !== lastCategory) {
        // Add line gap before category (except first one)
        if (i > 0) {
          structure += '│   │\n';
        }

        const hasMoreFiles =
          i < sortedWorkflowFiles.length - 1 || actionDirs.length > 0;
        structure += `│   ${hasMoreFiles ? '├──' : '└──'} # ${icon} ${category}\n`;
        lastCategory = category;
      }

      const isLastFile =
        i === sortedWorkflowFiles.length - 1 && actionDirs.length === 0;
      let prefix = '├──';
      if (isLastFile) {
        prefix = '└──';
      }

      // Determine if it's reusable or internal
      let type = '';
      try {
        const content = await readFile(filePath, 'utf-8');
        const isReusable = content.includes('workflow_call');
        type = isReusable ? ' (reusable)' : ' (internal)';
      } catch {
        type = '';
      }

      structure += `│   ${prefix} ${fileName}${type}\n`;
    }
  }

  // Actions section
  if (actionDirs.length > 0) {
    structure += '└── actions/            # Custom Composite Actions\n';

    for (let i = 0; i < actionDirs.length; i++) {
      const actionDir = actionDirs[i];
      if (!actionDir) continue;

      const actionName = path.basename(actionDir);
      const isLast = i === actionDirs.length - 1;
      const prefix = isLast ? '└──' : '├──';

      structure += `    ${prefix} ${actionName}/\n`;
      structure += `    ${isLast ? ' ' : '│'}   └── action.yml\n`;
    }
  }

  structure += '```';
  return structure;
}

/**
 * Generates documentation for the reusable atomic workflows
 */
export async function generateDocumentation(
  workflows: Workflow[]
): Promise<void> {
  // Read existing README to preserve content
  let existingContent = '';
  try {
    existingContent = await readFile('README.md', 'utf-8');
  } catch {
    // File doesn't exist, start fresh
  }

  const reusableWorkflows = workflows.filter((w) => w.isReusable);

  // Group workflows by category
  const categoriesMap = new Map<
    string,
    { icon: string; workflows: Workflow[] }
  >();
  for (const workflow of reusableWorkflows) {
    const category = categorizeWorkflow(workflow);
    const existing = categoriesMap.get(category.category);
    if (existing) {
      existing.workflows.push(workflow);
    } else {
      categoriesMap.set(category.category, {
        icon: category.icon,
        workflows: [workflow],
      });
    }
  }

  // Generate Available Workflows section
  let workflowsSection = '';

  // Add auto-generation notice
  workflowsSection +=
    '<!-- AUTO-GENERATED CONTENT - DO NOT EDIT MANUALLY -->\n';
  workflowsSection +=
    '<!-- This section is automatically updated by the documentation generator -->\n\n';

  // Add visible markdown notice
  workflowsSection += '> ⚡ **Auto-Generated** ⚡\n';
  workflowsSection += '> \n';
  workflowsSection +=
    '> This section is automatically updated whenever workflows are added, modified, or removed.\n';
  workflowsSection +=
    '> The documentation reflects the current state of all reusable workflows in this repository.\n\n';

  if (categoriesMap.size === 0) {
    workflowsSection = 'No reusable workflows found.\n';
  } else {
    for (const [category, { icon, workflows }] of categoriesMap) {
      workflowsSection += `### ${icon} ${category}\n\n`;

      // Table with stacked inputs/outputs/secrets in narrow columns (10% each)
      workflowsSection +=
        '| Workflow Name | Description | Inputs | Outputs | Secrets |\n';
      workflowsSection +=
        '|:-------------|:------------|:-------|:--------|:--------|\n';

      for (const workflow of workflows) {
        // Workflow name - keep it moderate length
        const workflowName = wrapText(workflow.name, 25);

        const description =
          workflow.description &&
          workflow.description !== 'No description provided.'
            ? wrapText(workflow.description, 50)
            : '*No description provided*';

        const inputs = formatStackedWorkflowDetails(workflow.inputs);
        const outputs = formatStackedWorkflowDetails(workflow.outputs);
        const secrets = formatStackedWorkflowDetails(workflow.secrets);

        const workflowLink = `[${workflowName}](./${workflow.filePath.replace(/\\/g, '/')})`;

        workflowsSection += `| **${workflowLink}** | ${description} | ${inputs} | ${outputs} | ${secrets} |\n`;
      }

      workflowsSection += '\n';
    }
  }

  // Generate folder structure with auto-generation notice
  let folderStructureSection = '';
  folderStructureSection +=
    '<!-- AUTO-GENERATED CONTENT - DO NOT EDIT MANUALLY -->\n';
  folderStructureSection +=
    '<!-- This section is automatically updated by the documentation generator -->\n\n';

  // Add visible markdown notice
  folderStructureSection += '> ⚡ **Auto-Generated** ⚡\n';
  folderStructureSection += '> \n';
  folderStructureSection +=
    '> This folder structure is automatically scanned and updated to reflect the current repository layout.\n';
  folderStructureSection +=
    '> It shows all workflows and actions with their types (reusable/internal).\n\n';

  const folderStructure = await generateFolderStructure();
  folderStructureSection += folderStructure;

  // Find sections using delimiter comments
  const availableWorkflowsStart = existingContent.indexOf(
    '<!-- BEGIN: Available Workflows Section -->'
  );
  const folderStructureEnd = existingContent.indexOf(
    '<!-- END: Workflows Folder Structure Section -->'
  );

  const beforeWorkflows = existingContent.substring(0, availableWorkflowsStart);
  const afterFolderStructureEnd =
    folderStructureEnd +
    '<!-- END: Workflows Folder Structure Section -->'.length;
  const afterFolderStructure = existingContent.substring(
    afterFolderStructureEnd
  );

  // Reconstruct the README
  const newContent =
    beforeWorkflows +
    '<!-- BEGIN: Available Workflows Section -->\n' +
    '## 📦 Available Workflows\n\n' +
    workflowsSection +
    '<!-- END: Available Workflows Section -->\n\n' +
    '<!-- BEGIN: Workflows Folder Structure Section -->\n' +
    '## 🏗️ Workflows Folder Structure\n\n' +
    folderStructureSection +
    '\n' +
    '<!-- END: Workflows Folder Structure Section -->\n\n' +
    afterFolderStructure;

  await writeFile('README.md', newContent, 'utf-8');
  console.log(
    '✅ README.md updated with workflow documentation and folder structure'
  );
}
