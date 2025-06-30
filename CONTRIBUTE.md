# Contributing to Codex Desktop

Thank you for your interest in contributing to Codex Desktop! This guide will help you get started with development and contributing to the project.

## 🎯 Table of Contents

- [Getting Started](#-getting-started)
- [Development Environment](#-development-environment)
- [Architecture Overview](#-architecture-overview)
- [Code Style & Standards](#-code-style--standards)
- [Development Workflow](#-development-workflow)
- [Testing Guidelines](#-testing-guidelines)
- [Pull Request Process](#-pull-request-process)
- [Issue Reporting](#-issue-reporting)
- [Code of Conduct](#-code-of-conduct)

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: 18.0.0 or higher
- **Rust**: Latest stable version
- **Git**: Latest version
- **Tauri CLI**: Install with `cargo install tauri-cli`

### Recommended IDE Setup

- **Visual Studio Code** with the following extensions:
  - [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
  - [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
  - [ES7+ React/Redux/React-Native snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

## 🛠️ Development Environment

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/codex-desktop.git
cd codex-desktop

# Add the upstream repository
git remote add upstream https://github.com/hackyguru/codex-desktop.git
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Rust dependencies (handled automatically by Tauri)
```

### 3. Start Development Server

```bash
# Start the development server with hot reload
npm run tauri dev

# Alternative: Start only the web frontend (for UI development)
npm run dev
```

### 4. Build for Production

```bash
# Build the entire application
npm run tauri build

# Build only the web assets
npm run build
```

## 🏗️ Architecture Overview

### Frontend (React + TypeScript)

```
src/
├── components/          # Reusable UI components
│   ├── pages/          # Page-level components
│   ├── layout/         # Layout components (sidebar, navigation)
│   └── index.ts        # Component exports
├── hooks/              # Custom React hooks
│   ├── useCodexConfig.ts
│   ├── useNodeFiles.ts
│   └── index.ts
├── utils/              # Utility functions
│   ├── apiClient.ts    # API communication layer
│   ├── storage.ts      # Local storage utilities
│   └── validation.ts   # Input validation
├── services/           # External service integrations
├── types/              # TypeScript type definitions
├── constants/          # Application constants
└── styles/             # Global styles and Tailwind config
```

### Backend (Tauri + Rust)

```
src-tauri/
├── src/
│   ├── main.rs         # Entry point
│   └── lib.rs          # Tauri commands and logic
├── binaries/           # Codex executable binaries
├── capabilities/       # Tauri permissions
└── icons/              # Application icons
```

### Key Technologies

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Tauri 2.0, Rust
- **Build**: Vite, PostCSS
- **State Management**: React Hooks (useState, useEffect, custom hooks)
- **HTTP Client**: Fetch API + Tauri HTTP plugin for CORS handling

## 📋 Code Style & Standards

### TypeScript/React Guidelines

1. **Use TypeScript** for all new code with strict type checking
2. **Functional Components** with hooks (no class components)
3. **Custom Hooks** for reusable logic
4. **Props Interfaces** clearly defined with JSDoc comments
5. **Error Boundaries** for production-ready error handling

```typescript
// ✅ Good: Well-typed component with clear interface
interface FileCardProps {
  fileName: string;
  fileSize: number;
  onDownload?: () => void;
  uploadState?: 'pending' | 'uploading' | 'success' | 'error';
}

const FileCard: React.FC<FileCardProps> = ({ 
  fileName, 
  fileSize, 
  onDownload,
  uploadState 
}) => {
  // Component implementation
};

// ❌ Avoid: Untyped props and any types
const FileCard = (props: any) => {
  // Implementation
};
```

### Styling Guidelines

1. **Tailwind CSS** for all styling (no custom CSS unless absolutely necessary)
2. **Responsive Design** using Tailwind's responsive prefixes
3. **Dark Theme** primary with consistent color palette
4. **Accessibility** using proper ARIA labels and semantic HTML

```tsx
// ✅ Good: Tailwind classes with responsive design and accessibility
<button 
  className="w-9 h-9 bg-[#6BE4A8] hover:bg-[#5DD49A] transition-colors clip-path-hexagon flex items-center justify-center"
  aria-label="Download file"
  disabled={isLoading}
>
  <FiDownload size={14} />
</button>

// ❌ Avoid: Inline styles or custom CSS classes
<button style={{ backgroundColor: '#6BE4A8', width: '36px' }}>
  Download
</button>
```

### Rust Guidelines

1. **Follow Rust conventions** (snake_case, proper error handling)
2. **Use `serde`** for JSON serialization/deserialization
3. **Proper Error Types** with descriptive messages
4. **Async/await** for I/O operations

```rust
// ✅ Good: Proper error handling and types
#[tauri::command]
async fn upload_file(
    url: String,
    file_data: Vec<u8>,
    headers: Option<HashMap<String, String>>,
) -> Result<serde_json::Value, String> {
    // Implementation with proper error handling
}

// ❌ Avoid: Unwrapping without error handling
let result = some_operation().unwrap(); // Could panic!
```

### Git Commit Guidelines

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): description

feat(upload): add cancel functionality for file uploads
fix(auth): resolve authentication headers for remote nodes
docs(readme): update installation instructions
style(ui): improve button hover states
refactor(api): simplify error handling logic
test(upload): add unit tests for cancel functionality
```

## 🔄 Development Workflow

### 1. Create a Feature Branch

```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write code following the style guidelines
- Test your changes thoroughly
- Update documentation if needed
- Ensure no TypeScript errors or warnings

### 3. Commit Your Changes

```bash
# Stage and commit your changes
git add .
git commit -m "feat(scope): add your feature description"

# Push to your fork
git push origin feature/your-feature-name
```

### 4. Create Pull Request

- Open a pull request from your fork to the main repository
- Fill out the pull request template
- Link any related issues
- Request review from maintainers

## 🧪 Testing Guidelines

### Manual Testing

1. **Cross-Platform Testing**: Test on multiple operating systems
2. **Network Modes**: Test both local and remote node configurations
3. **File Operations**: Test upload, download, cancel, and seed operations
4. **Error Scenarios**: Test network failures, authentication errors, etc.

### Testing Checklist

Before submitting a PR, ensure:

- [ ] Application builds without errors (`npm run build`)
- [ ] TypeScript compilation passes (`npm run type-check`)
- [ ] All existing functionality still works
- [ ] New features work in both local and remote modes
- [ ] UI is responsive on different screen sizes
- [ ] Console shows no errors or warnings
- [ ] Accessibility features work (keyboard navigation, screen readers)

### Debug Tools

Use the built-in debug utilities:

```javascript
// Test API configuration
window.codexApi.debugConfig('8080')

// Test all API methods
window.testAllApiMethods('8080')
```

## 📝 Pull Request Process

### 1. PR Requirements

Your pull request should include:

- **Clear description** of what the PR does
- **Screenshots** for UI changes
- **Testing instructions** for reviewers
- **Breaking changes** clearly marked
- **Updated documentation** if applicable

### 2. PR Template

```markdown
## Description
Brief description of your changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] I have tested this change locally
- [ ] I have tested in both local and remote modes
- [ ] I have tested the cancel functionality (if applicable)

## Screenshots
Include screenshots for UI changes

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review of my code
- [ ] My changes generate no new warnings
- [ ] I have updated the documentation accordingly
```

### 3. Review Process

1. **Automated Checks**: PRs must pass all automated checks
2. **Code Review**: At least one maintainer review required
3. **Testing**: Manual testing by reviewers when needed
4. **Approval**: PR approved by maintainer(s)
5. **Merge**: Squash and merge to main branch

## 🐛 Issue Reporting

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check the troubleshooting guide** in the README
3. **Test with the latest version** of the application

### Creating a Good Issue

Include the following information:

```markdown
## Environment
- OS: [e.g., macOS 14.0, Windows 11, Ubuntu 22.04]
- App Version: [e.g., 1.0.0]
- Node Mode: [Local/Remote]

## Description
Clear description of the issue

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Screenshots
If applicable, add screenshots

## Console Logs
Include relevant console output or error messages

## Additional Context
Any other context about the problem
```

### Issue Labels

We use the following labels:

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements or additions to documentation
- `good-first-issue`: Good for newcomers
- `help-wanted`: Extra attention is needed
- `question`: Further information is requested

## 📚 Learning Resources

### Tauri Development
- [Tauri Documentation](https://tauri.app/v1/guides/)
- [Tauri API Reference](https://tauri.app/v1/api/js/)

### React + TypeScript
- [React Documentation](https://reactjs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React + TypeScript Cheatsheet](https://github.com/typescript-cheatsheets/react)

### Tailwind CSS
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)

### Codex Network
- [Codex Documentation](https://codex.storage/)
- [Codex API Reference](https://github.com/codex-storage/nim-codex)

## 🤝 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socioeconomic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to a positive environment:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior:

- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the project maintainers. All complaints will be reviewed and investigated promptly and fairly.

## 🎉 Recognition

Contributors who make significant contributions to the project will be:

- Added to the contributors list in the README
- Mentioned in release notes
- Invited to join the core contributor team (for ongoing contributors)

## 📞 Getting Help

If you need help with development or have questions:

1. **Check the documentation** in this file and the README
2. **Search existing issues** for similar questions
3. **Create a new issue** with the `question` label
4. **Join our community discussions** (if available)

Thank you for contributing to Codex Desktop! 🚀 