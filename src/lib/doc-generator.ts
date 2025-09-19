import { writeFile, readFile } from 'fs/promises';
import { glob } from 'glob';
import path from 'path';
import type { Workflow } from './workflow-scanner.js';

/**
 * Truncate text to specified length with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format workflow inputs for table display
 */
function formatInputsForTable(inputs: Record<string, unknown> | undefined, maxLength: number = 40): string {
  if (!inputs || Object.keys(inputs).length === 0) return '*None*';
  
  const inputKeys = Object.keys(inputs);
  if (inputKeys.length === 1) {
    return `\`${inputKeys[0]}\``;
  }
  if (inputKeys.length === 2) {
    const formatted = inputKeys.map(key => `\`${key}\``).join(', ');
    return formatted.length <= maxLength ? formatted : `\`${inputKeys[0]}\`, +1 more`;
  }
  
  return `\`${inputKeys[0]}\`, \`${inputKeys[1]}\`, +${inputKeys.length - 2} more`;
}

/**
 * Categorize workflows based on their name and purpose
 */
function categorizeWorkflow(workflow: Workflow): string {
  const name = workflow.name.toLowerCase();
  
  if (name.includes('test') || name.includes('unit') || name.includes('integration') || name.includes('e2e') || name.includes('spec')) {
    return 'Testing';
  }
  if (name.includes('format') || name.includes('lint') || name.includes('type') || name.includes('quality') || name.includes('prettier') || name.includes('eslint')) {
    return 'Code Quality';
  }
  if (name.includes('deploy') || name.includes('build') || name.includes('publish') || name.includes('release') || name.includes('dist')) {
    return 'Deployment';
  }
  if (name.includes('security') || name.includes('scan') || name.includes('audit') || name.includes('vulnerability') || name.includes('cve')) {
    return 'Security';
  }
  if (name.includes('util') || name.includes('helper') || name.includes('setup') || name.includes('config') || name.includes('tool') || name.includes('assign') || name.includes('label') || name.includes('stale') || name.includes('cleanup') || name.includes('maintenance')) {
    return 'Utilities';
  }
  if (name.includes('doc') || name.includes('readme') || name.includes('changelog') || name.includes('generate') || name.includes('wiki')) {
    return 'Documentation';
  }
  if (name.includes('notify') || name.includes('slack') || name.includes('discord') || name.includes('email') || name.includes('webhook') || name.includes('alert')) {
    return 'Notifications';
  }
  if (name.includes('monitor') || name.includes('health') || name.includes('check') || name.includes('status') || name.includes('ping') || name.includes('uptime')) {
    return 'Monitoring';
  }
  
  return 'Miscellaneous';
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
    
    for (let i = 0; i < workflowFiles.length; i++) {
      const filePath = workflowFiles[i];
      if (!filePath) continue;
      
      const fileName = path.basename(filePath);
      const isLast = i === workflowFiles.length - 1 && actionDirs.length === 0;
      const prefix = isLast ? '└──' : '├──';
      
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
export async function generateDocumentation(workflows: Workflow[]): Promise<void> {
  // Read existing README to preserve content
  let existingContent = '';
  try {
    existingContent = await readFile('README.md', 'utf-8');
  } catch {
    // File doesn't exist, start fresh
  }

  const reusableWorkflows = workflows.filter((w) => w.isReusable);
  
  // Group workflows by category
  const categories = new Map<string, Workflow[]>();
  for (const workflow of reusableWorkflows) {
    const category = categorizeWorkflow(workflow);
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(workflow);
  }

  // Generate Available Workflows section
  let workflowsSection = '';
  
  // Add auto-generation notice
  workflowsSection += '<!-- AUTO-GENERATED CONTENT - DO NOT EDIT MANUALLY -->\n';
  workflowsSection += '<!-- This section is automatically updated by the documentation generator -->\n\n';
  
  // Add visible markdown notice
  workflowsSection += '> ⚡ **Auto-Generated** ⚡\n';
  workflowsSection += '> \n';
  workflowsSection += '> This section is automatically updated whenever workflows are added, modified, or removed.\n';
  workflowsSection += '> The documentation reflects the current state of all reusable workflows in this repository.\n\n';
  
  if (categories.size === 0) {
    workflowsSection = 'No reusable workflows found.\n';
  } else {
    // Category icons mapping
    const categoryIcons: Record<string, string> = {
      'Code Quality': '🔧',
      'Testing': '🧪',
      'Deployment': '🚀',
      'Security': '🔒',
      'Miscellaneous': '�'
    };

    for (const [category, categoryWorkflows] of categories) {
      const icon = categoryIcons[category] || '📋';
      workflowsSection += `### ${icon} ${category}\n\n`;
      
      // GitHub-optimized table with column width hints in separators
      workflowsSection += '| Workflow Name | Description | Key Inputs | Outputs |\n';
      workflowsSection += '|:-------------|:------------|:-----------|:--------|\n';
      
      for (const workflow of categoryWorkflows) {
        // Workflow name - keep it moderate length
        const workflowName = truncateText(workflow.name, 25);
          
        // Description - this will get the most space naturally
        const description = workflow.description && workflow.description !== 'No description provided.' 
          ? truncateText(workflow.description, 50)
          : '*No description provided*';
        
        // Inputs - moderate length
        const inputs = formatInputsForTable(workflow.inputs, 30);
          
        // Outputs - keep short
        const outputs = workflow.outputs 
          ? Object.keys(workflow.outputs).length > 0
            ? Object.keys(workflow.outputs).length === 1
              ? `\`${truncateText(Object.keys(workflow.outputs)[0] || '', 10)}\``
              : `${Object.keys(workflow.outputs).length} outputs`
            : '*None*'
          : '*None*';
        
        workflowsSection += `| **${workflowName}** | ${description} | ${inputs} | ${outputs} |\n`;
      }
      
      workflowsSection += '\n';
    }
  }

  // Generate folder structure with auto-generation notice
  let folderStructureSection = '';
  folderStructureSection += '<!-- AUTO-GENERATED CONTENT - DO NOT EDIT MANUALLY -->\n';
  folderStructureSection += '<!-- This section is automatically updated by the documentation generator -->\n\n';
  
  // Add visible markdown notice
  folderStructureSection += '> ⚡ **Auto-Generated** ⚡\n';
  folderStructureSection += '> \n';
  folderStructureSection += '> This folder structure is automatically scanned and updated to reflect the current repository layout.\n';
  folderStructureSection += '> It shows all workflows and actions with their types (reusable/internal).\n\n';
  
  const folderStructure = await generateFolderStructure();
  folderStructureSection += folderStructure;

  // Find and replace the Available Workflows section
  const availableWorkflowsStart = existingContent.indexOf('## 📦 Available Workflows');
  const folderStructureStart = existingContent.indexOf('## 🏗️ Folder Structure');
  
  if (availableWorkflowsStart === -1 || folderStructureStart === -1) {
    console.warn('⚠️  Could not find existing sections in README.md. Please ensure the sections exist.');
    return;
  }

  // Replace the Available Workflows section
  const beforeWorkflows = existingContent.substring(0, availableWorkflowsStart);
  const afterFolderStructureHeader = folderStructureStart + '## 🏗️ Folder Structure\n\n'.length;
  
  // Find the end of folder structure section (next ## or end of file)
  const nextSectionMatch = existingContent.substring(afterFolderStructureHeader).match(/\n## /);
  const folderStructureEnd = nextSectionMatch 
    ? afterFolderStructureHeader + nextSectionMatch.index!
    : existingContent.length;
    
  const afterFolderStructure = existingContent.substring(folderStructureEnd);

  // Reconstruct the README
  const newContent = beforeWorkflows + 
    '## 📦 Available Workflows\n\n' + 
    workflowsSection +
    '## 🏗️ Folder Structure\n\n' +
    folderStructureSection + '\n\n' +
    afterFolderStructure;

  await writeFile('README.md', newContent, 'utf-8');
  console.log('✅ README.md updated with workflow documentation and folder structure');
}
