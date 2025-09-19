/**
 * Main entry point for the reusable atomic workflows documentation generator
 */

import { generateDocumentation } from './lib/doc-generator.js';
import { scanWorkflows } from './lib/workflow-scanner.js';

(async (): Promise<void> => {
  try {
    console.log('🔍 Scanning for workflow files...');
    const workflows = await scanWorkflows();

    console.log(`📋 Found ${workflows.length} workflow(s)`);

    console.log('📝 Generating documentation...');
    await generateDocumentation(workflows);

    console.log('✅ Documentation generated successfully!');
  } catch (error) {
    console.error('❌ Error generating documentation:', error);
    process.exit(1);
  }
})();