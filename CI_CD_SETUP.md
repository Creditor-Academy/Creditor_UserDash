# CI/CD Setup Guide

This document outlines the comprehensive CI/CD pipeline setup for the Creditor UserDash application.

## 🚀 Overview

The CI/CD pipeline includes:

- **Automated Testing** with Vitest and React Testing Library
- **Code Quality Checks** with ESLint and Prettier
- **Pre-commit Hooks** with Husky and lint-staged
- **GitHub Actions** for continuous integration and deployment
- **Multi-environment Deployment** (staging and production)

## 📋 Prerequisites

Before running the CI/CD pipeline, ensure you have:

- Node.js 18.x or 20.x installed
- Git repository initialized
- GitHub repository set up (for GitHub Actions)

## 🛠️ Installation

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Initialize Husky (Git Hooks)**
   ```bash
   npm run prepare
   ```

## 🧪 Testing

### Available Test Commands

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm run test:watch
```

### Test Structure

```
src/
├── components/
│   ├── __tests__/
│   │   └── ErrorBoundary.test.jsx
│   └── ui/
│       └── __tests__/
│           └── button.test.jsx
├── services/
│   └── __tests__/
│       └── enhancedAIService.test.js
├── utils/
│   └── __tests__/
│       └── helpers.test.js
└── test/
    └── setup.ts
```

### Test Configuration

- **Framework**: Vitest
- **Testing Library**: React Testing Library
- **Environment**: jsdom
- **Coverage**: V8 provider
- **Setup**: Global test utilities and mocks

## 🔍 Code Quality

### Linting

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npx eslint . --fix
```

### Formatting

```bash
# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

## 🪝 Pre-commit Hooks

Pre-commit hooks automatically run on every commit:

1. **ESLint** - Fixes linting issues
2. **Prettier** - Formats code
3. **Vitest** - Runs tests for changed files

### Configuration

The pre-commit hooks are configured in `package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "vitest related --run"
    ],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```

## 🔄 GitHub Actions CI/CD

### Workflow Overview

The GitHub Actions workflow (`.github/workflows/ci.yml`) includes:

1. **Test Job**
   - Runs on Node.js 18.x and 20.x
   - Installs dependencies
   - Runs linting
   - Executes tests
   - Generates coverage reports

2. **Build Job**
   - Builds the application
   - Uploads build artifacts

3. **Deploy Staging** (on `develop` branch)
   - Deploys to Netlify staging environment

4. **Deploy Production** (on `main` branch)
   - Deploys to Netlify production environment

### Required Secrets

Set these secrets in your GitHub repository:

```
NETLIFY_AUTH_TOKEN=your_netlify_auth_token
NETLIFY_SITE_ID=your_netlify_site_id
```

### Branch Strategy

- **`main`** - Production deployments
- **`develop`** - Staging deployments
- **Feature branches** - Run tests only

## 🚀 Deployment

### Netlify Configuration

The project includes `netlify.toml` for deployment configuration:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Environment Variables

Configure environment variables in:

- `.env` - Default values
- `.env.development` - Development environment
- `.env.production` - Production environment

## 📊 Coverage Reports

Test coverage is automatically generated and can be uploaded to Codecov:

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory.

## 🔧 Configuration Files

### Key Configuration Files

- `vitest.config.ts` - Vitest configuration
- `.prettierrc` - Prettier formatting rules
- `.prettierignore` - Files to ignore for formatting
- `eslint.config.js` - ESLint configuration
- `.husky/pre-commit` - Pre-commit hook script
- `.github/workflows/ci.yml` - GitHub Actions workflow

## 🐛 Troubleshooting

### Common Issues

1. **Vitest not found**

   ```bash
   npm install vitest @vitest/ui @testing-library/react @testing-library/jest-dom
   ```

2. **Husky hooks not working**

   ```bash
   npm run prepare
   chmod +x .husky/pre-commit
   ```

3. **ESLint errors**
   ```bash
   npm run lint -- --fix
   ```

### Development Tips

- Run tests in watch mode during development: `npm run test`
- Use the test UI for better debugging: `npm run test:ui`
- Check coverage regularly: `npm run test:coverage`
- Format code before committing: `npm run format`

## 📈 Metrics and Monitoring

The CI/CD pipeline tracks:

- Test coverage percentage
- Build success/failure rates
- Deployment status
- Code quality metrics

## 🤝 Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Ensure tests pass: `npm run test:run`
4. Ensure linting passes: `npm run lint`
5. Commit changes (pre-commit hooks will run)
6. Push and create a pull request

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Netlify Deployment](https://docs.netlify.com/)
- [Husky Git Hooks](https://typicode.github.io/husky/)
