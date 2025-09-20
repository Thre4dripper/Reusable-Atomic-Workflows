# 🔄 Reusable GitHub Actions Workflows

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![GitHub stars](https://img.shields.io/github/stars/Thre4dripper/Reusable-Atomic-Workflows?style=social)](https://github.com/Thre4dripper/Reusable-Atomic-Workflows/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Thre4dripper/Reusable-Atomic-Workflows?style=social)](https://github.com/Thre4dripper/Reusable-Atomic-Workflows/network/members)

A comprehensive collection of reusable GitHub Actions workflows designed to
streamline CI/CD processes across projects. These workflows are built with best
practices in mind and can be easily integrated into any repository.

## 📋 Table of Contents

- [About](#about)
- [Available Workflows](#available-workflows)
- [Quick Start](#quick-start)
- [Folder Structure](#folder-structure)
- [Usage Examples](#usage-examples)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)
- [Support](#support)

## 🚀 About

This repository contains a curated collection of reusable GitHub Actions
workflows that can help you:

- ⚡ **Speed up development** with pre-built CI/CD pipelines
- 🔒 **Enhance security** with automated security checks
- 📊 **Improve code quality** with automated testing and linting
- 🚀 **Streamline deployments** with reliable deployment workflows
- 🔧 **Standardize processes** across multiple repositories

All workflows are designed to be:

- **Modular**: Easy to customize for specific needs
- **Secure**: Following security best practices
- **Efficient**: Optimized for performance and cost
- **Well-documented**: Clear usage instructions and examples

<!-- BEGIN: Available Workflows Section -->
## 📦 Available Workflows

<!-- AUTO-GENERATED CONTENT - DO NOT EDIT MANUALLY -->
<!-- This section is automatically updated by the documentation generator -->

> ⚡ **Auto-Generated** ⚡
> 
> This section is automatically updated whenever workflows are added, modified, or removed.
> The documentation reflects the current state of all reusable workflows in this repository.

### 🧪 Testing

| Workflow Name | Description | Inputs | Outputs | Secrets |
|:-------------|:------------|:-------|:--------|:--------|
| **[Unit Tests Worker](./.github/workflows/test-unit.yml)** | *No description provided* | `package-manager`<br>`test-command`<br>`coverage-command` | *None* | `workflow-token` |

### 🔧 Code Quality

| Workflow Name | Description | Inputs | Outputs | Secrets |
|:-------------|:------------|:-------|:--------|:--------|
| **[TypeScript Type Checker](./.github/workflows/quality-typecheck.yml)** | *No description provided* | `package-manager` | *None* | *None* |
| **[Lint Checker](./.github/workflows/quality-lint.yml)** | *No description provided* | `package-manager`<br>`lint-check-command` | *None* | `workflow-token` |
| **[Code Formatter](./.github/workflows/quality-format.yml)** | This workflow checks and applies code formatting<br>using a specified package manager and commands. | `package-manager`<br>`format-check-command`<br>`format-fix-command` | *None* | `workflow-token` |

<!-- END: Available Workflows Section -->

<!-- BEGIN: Workflows Folder Structure Section -->
## 🏗️ Workflows Folder Structure

<!-- AUTO-GENERATED CONTENT - DO NOT EDIT MANUALLY -->
<!-- This section is automatically updated by the documentation generator -->

> ⚡ **Auto-Generated** ⚡
> 
> This folder structure is automatically scanned and updated to reflect the current repository layout.
> It shows all workflows and actions with their types (reusable/internal).

```
.github/
├── workflows/          # GitHub Actions Workflows
│   ├── # ⚙️ Internal
│   ├── _format.yml (internal)
│   │
│   ├── # 🔧 Code Quality
│   ├── quality-format.yml (reusable)
│   ├── quality-lint.yml (reusable)
│   ├── quality-typecheck.yml (reusable)
│   │
│   ├── # 🧪 Testing
│   ├── test-unit.yml (reusable)
└── actions/            # Custom Composite Actions
    └── web-dependencies-setup/
        └── action.yml
```
<!-- END: Workflows Folder Structure Section -->
























## ⚡ Quick Start

### Using a Reusable Workflow

1. **Create a workflow file** in your repository at `.github/workflows/`
2. **Reference the reusable workflow** using the following syntax:

```yaml
name: CI Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
  uses: Thre4dripper/Reusable-Atomic-Workflows/.github/workflows/build-test-lint.yml@main
    with:
      node-version: '18'
      run-tests: true
      run-lint: true
    secrets:
      token: ${{ secrets.GITHUB_TOKEN }}
```

### Workflow Input Parameters

Each workflow accepts various input parameters to customize behavior:

```yaml
# Example with all common parameters
jobs:
  my-job:
  uses: Thre4dripper/Reusable-Atomic-Workflows/.github/workflows/[workflow-name].yml@main
    with:
      # Environment settings
      environment: 'production'

      # Language/Framework specific
      node-version: '18'
      python-version: '3.9'
      java-version: '11'

      # Feature flags
      run-tests: true
      run-lint: true
      generate-coverage: true

      # Deployment settings
      deploy-environment: 'staging'
      docker-registry: 'ghcr.io'
```

## 📖 Usage Examples

### Example 1: Node.js Application CI/CD

```yaml
name: Node.js CI/CD
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-and-build:
  uses: Thre4dripper/Reusable-Atomic-Workflows/.github/workflows/build-test-lint.yml@main
    with:
      node-version: '18'
      package-manager: 'npm'
      run-tests: true
      run-lint: true
      generate-coverage: true
    secrets:
      token: ${{ secrets.GITHUB_TOKEN }}
      codecov-token: ${{ secrets.CODECOV_TOKEN }}
```

### Example 2: Docker Multi-Platform Build

```yaml
name: Docker Build and Publish
on:
  release:
    types: [published]

jobs:
  docker-build:
  uses: Thre4dripper/Reusable-Atomic-Workflows/.github/workflows/docker-publish.yml@main
    with:
      image-name: 'my-app'
      platforms: 'linux/amd64,linux/arm64'
      push-to-registry: true
    secrets:
      registry-username: ${{ secrets.DOCKER_USERNAME }}
      registry-password: ${{ secrets.DOCKER_PASSWORD }}
```

### Example 3: Security Scanning

```yaml
name: Security Scan
on:
  schedule:
    - cron: '0 2 * * 1' # Weekly on Monday at 2 AM
  push:
    branches: [main]

jobs:
  security-check:
  uses: Thre4dripper/Reusable-Atomic-Workflows/.github/workflows/security-scan.yml@main
    with:
      scan-type: 'full'
      fail-on-severity: 'high'
    secrets:
      github-token: ${{ secrets.GITHUB_TOKEN }}
      snyk-token: ${{ secrets.SNYK_TOKEN }}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md)
for details on how to:

- 🐛 Report bugs
- 💡 Suggest new workflows
- 🔧 Submit improvements
- 📝 Improve documentation

### Quick Contribution Steps

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/new-workflow`
3. **Make your changes** following our coding standards
4. **Test your workflow** thoroughly
5. **Submit a pull request** with a clear description

## 🔒 Security

Security is a top priority. If you discover a security vulnerability, please see
our [Security Policy](SECURITY.md) for responsible disclosure guidelines.

### Security Features

- 🔐 **Secret scanning** in all workflows
- 🛡️ **Dependency vulnerability checking**
- 📋 **Security-first defaults**
- 🔍 **Regular security audits**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## 🆘 Support

- 📖 **Documentation**: Check our workflow-specific README files
- 🐛 **Issues**:
  [Report bugs or request features](https://github.com/Thre4dripper/Reusable-Atomic-Workflows/issues)
- 💬 **Discussions**:
  [Join community discussions](https://github.com/Thre4dripper/Reusable-Atomic-Workflows/discussions)
- ⭐ **Star the repo** if you find it useful!

## 🙏 Acknowledgments

- GitHub Actions team for the amazing platform
- Open source community for inspiration and best practices
- Contributors who help improve these workflows

---

<div align="center">

**[⬆ Back to Top](#-reusable-github-actions-workflows)**

Made with ❤️ by [Ijlal Ahmad](https://github.com/Thre4dripper)

</div>
