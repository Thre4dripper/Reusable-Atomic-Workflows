import { glob } from 'glob';
import { readFile } from 'fs/promises';
import { parse } from 'yaml';
import path from 'path';

/**
 * Interface representing a GitHub Actions workflow
 */
export interface Workflow {
  name: string;
  description: string;
  filePath: string;
  fileName: string;
  inputs?: Record<string, WorkflowInput>;
  secrets?: Record<string, WorkflowSecret>;
  outputs?: Record<string, WorkflowOutput>;
  isReusable: boolean;
}

export type WorkflowInput =
  | {
      description: string;
      required: boolean;
      type: 'string';
      default?: string;
      options?: string[];
    }
  | {
      description: string;
      required: boolean;
      type: 'number';
      default?: number;
      options?: number[];
    }
  | {
      description: string;
      required: boolean;
      type: 'boolean';
      default?: boolean;
      options?: boolean[];
    }
  | {
      description: string;
      required: boolean;
      type: 'choice';
      default?: string;
      options?: string[];
    };

export interface WorkflowSecret {
  description: string;
  required: boolean;
}

export interface WorkflowOutput {
  description: string;
  value: string;
}

/**
 * description key is not allowed in workflow files,
 * so we need to extract it from comments if present,
 * the first line of the file is considered the description.
 */

function getWorkflowDescription(rawWorkflow: string): string {
  const lines = rawWorkflow.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      break; // Stop at the first non-comment line
    }
    if (trimmed.startsWith('#')) {
      const comment = trimmed.slice(1).trim();
      if (comment) {
        return comment;
      }
    }
  }
  return 'No description provided.';
}

/**
 * Scans the .github/workflows directory for workflow files
 */
export async function scanWorkflows(): Promise<Workflow[]> {
  const workflowFiles = await glob('.github/workflows/*.{yml,yaml}', {
    cwd: process.cwd(),
  });

  const workflows: Workflow[] = [];

  for (const filePath of workflowFiles) {
    try {
      const content = await readFile(filePath, 'utf-8');
      const workflow = parse(content);

      const workflowInfo: Workflow = {
        name:
          workflow.name.replace(/Reusable[ .]/i, '') ||
          path.basename(filePath, path.extname(filePath)),
        description: getWorkflowDescription(content),
        filePath,
        fileName: path.basename(filePath),
        inputs: workflow.on?.workflow_call?.inputs,
        secrets: workflow.on?.workflow_call?.secrets,
        outputs: workflow.on?.workflow_call?.outputs,
        isReusable: workflow.on && 'workflow_call' in workflow.on,
      };

      workflows.push(workflowInfo);
    } catch (error) {
      console.warn(`⚠️  Failed to parse workflow file ${filePath}:`, error);
    }
  }

  return workflows;
}
