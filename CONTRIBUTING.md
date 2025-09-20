# Contributing to Reusable Atomic Workflows

Thank you for your interest in contributing to this project! 🎉 We welcome
contributions from everyone, whether you're fixing bugs, adding new workflows,
improving documentation, or suggesting enhancements.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Workflow Development Guidelines](#workflow-development-guidelines)
- [Submission Guidelines](#submission-guidelines)
- [Review Process](#review-process)
- [Community](#community)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our
[Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to
uphold this code. Please report unacceptable behavior to
[your-email@example.com].

## 🤝 How Can I Contribute?

### 🐛 Reporting Bugs

- Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md)
- Check if the issue already exists in our
  [Issues](https://github.com/Thre4dripper/Reusable-Atomic-Workflows/issues)
- Provide clear steps to reproduce the issue
- Include relevant logs, screenshots, or error messages

### 💡 Suggesting Enhancements

- Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md)
- Explain the use case and potential benefits
- Consider if the enhancement fits the project's scope

### 🔧 Contributing Code

- Fix bugs or implement new features
- Improve existing workflows
- Add new reusable atomic workflows
- Enhance documentation

### 📝 Improving Documentation

- Fix typos or clarify instructions
- Add examples and use cases
- Update outdated information
- Translate documentation

## 🚀 Getting Started

### Prerequisites

- GitHub account
- Basic understanding of GitHub Actions
- Familiarity with YAML syntax
- Understanding of CI/CD concepts

### Development Setup

1. **Fork the repository**

   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/Reusable-Atomic-Workflows.git
   cd Reusable-Atomic-Workflows
   ```

3. **Create a branch**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-number
   ```

4. **Make your changes**
   - Follow our [coding standards](#workflow-development-guidelines)
   - Test your changes thoroughly

5. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add new deployment workflow"
   # Follow conventional commit format
   ```

6. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Use our
     [PR template](.github/PULL_REQUEST_TEMPLATE/pull_request_template.md)
   - Link related issues
   - Provide clear description of changes

## 🛠️ Workflow Development Guidelines

### File Structure

```
workflows/
├── category/
│   ├── workflow-name.yml      # Main workflow file
│   ├── README.md             # Workflow documentation
│   └── examples/             # Usage examples
│       └── example-usage.yml
```

### Workflow Naming Convention

- Use kebab-case: `deploy-to-cloud.yml`
- Be descriptive but concise
- Include the main purpose in the name

### Workflow Best Practices

#### 1. **Input Parameters**

```yaml
on:
  workflow_call:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        type: string
      version:
        description: 'Version to deploy'
        required: false
        type: string
        default: 'latest'
    secrets:
      deploy-token:
        description: 'Token for deployment'
        required: true
```

#### 2. **Documentation**

- Add clear descriptions for all inputs and secrets
- Include usage examples
- Document expected outputs

#### 3. **Error Handling**

```yaml
- name: Deploy with error handling
  run: |
    if ! deploy.sh; then
      echo "Deployment failed"
      exit 1
    fi
```

#### 4. **Security Considerations**

- Never log secrets
- Use least privilege principle
- Validate inputs
- Use official actions when possible

#### 5. **Performance**

- Cache dependencies when possible
- Use matrix builds for parallel execution
- Optimize for speed and resource usage

### Example Workflow Template

```yaml
name: 'Workflow Name'
description: 'Brief description of what this workflow does'

on:
  workflow_call:
    inputs:
      required-input:
        description: 'Description of required input'
        required: true
        type: string
      optional-input:
        description: 'Description of optional input'
        required: false
        type: string
        default: 'default-value'
    secrets:
      required-secret:
        description: 'Description of required secret'
        required: true
    outputs:
      result:
        description: 'Description of output'
        value: ${{ jobs.job-name.outputs.result }}

jobs:
  job-name:
    runs-on: ubuntu-latest
    outputs:
      result: ${{ steps.step-id.outputs.result }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Main step
        id: step-id
        run: |
          echo "Performing main action"
          echo "result=success" >> $GITHUB_OUTPUT
```

## 📥 Submission Guidelines

### Pull Request Guidelines

#### Before Submitting

- [ ] Test your workflow in a real repository
- [ ] Update documentation if needed
- [ ] Add examples if creating new workflows
- [ ] Follow commit message conventions
- [ ] Ensure no breaking changes (or clearly document them)

#### PR Title Format

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

- `feat: add new security scanning workflow`
- `fix: resolve issue with docker build workflow`
- `docs: update README with new examples`
- `refactor: improve error handling in deployment workflow`

#### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New workflow
- [ ] Enhancement
- [ ] Documentation update
- [ ] Breaking change

## Testing

- [ ] Tested in development environment
- [ ] Added/updated tests
- [ ] Tested edge cases

## Checklist

- [ ] Code follows project guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/)
specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New features or workflows
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(ci): add Node.js testing workflow
fix(deploy): resolve environment variable issue
docs: update README with usage examples
```

## 🔍 Review Process

### What We Look For

1. **Functionality**: Does it work as intended?
2. **Security**: Are there any security concerns?
3. **Performance**: Is it optimized for GitHub Actions?
4. **Documentation**: Is it well documented?
5. **Reusability**: Can others easily use this workflow?
6. **Best Practices**: Does it follow GitHub Actions best practices?

### Review Timeline

- Initial response: Within 48 hours
- Full review: Within 1 week
- Complex changes may take longer

### Addressing Feedback

- Respond to comments promptly
- Make requested changes
- Ask for clarification if needed
- Update your PR description if scope changes

## 🌟 Recognition

Contributors will be:

- Listed in our Contributors section
- Mentioned in release notes for significant contributions
- Given credit in workflow documentation

## 💬 Community

### Getting Help

- 🐛 [Issues](https://github.com/Thre4dripper/Reusable-Workflows/issues) - Bug
  reports and feature requests
- 💬
  [Discussions](https://github.com/Thre4dripper/Reusable-Workflows/discussions) -
  General questions and community chat
- 📧 Email: [your-email@example.com] - Private matters

### Stay Updated

- ⭐ Star the repository
- 👀 Watch for notifications
- 🐦 Follow [@YourTwitter] for updates

## 📄 License

By contributing, you agree that your contributions will be licensed under the
same [MIT License](LICENSE) that covers the project.

---

Thank you for contributing to Reusable Workflows! 🚀

<div align="center">

**Questions? Feel free to ask in
[Discussions](https://github.com/Thre4dripper/Reusable-Workflows/discussions)!**

</div>
