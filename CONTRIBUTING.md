# Contributing to Nimbus

Thank you for your interest in contributing to Nimbus! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository** (if applicable)
2. **Clone your fork**
   ```bash
   git clone <your-fork-url>
   cd nimbus
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Code Style

- Use TypeScript strict mode
- Follow existing code patterns
- Use async/await (not promises)
- Add error handling
- Add loading/empty states

### Making Changes

1. **Make your changes**
   - Write clean, readable code
   - Add comments for complex logic
   - Follow existing patterns

2. **Test your changes**
   ```bash
   npm run build  # Check for TypeScript errors
   npm run lint   # Check for linting errors
   npm run dev    # Test locally
   ```

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

### Code Review Checklist

Before submitting:

- [ ] Code follows TypeScript best practices
- [ ] All API routes have error handling
- [ ] Input validation is in place
- [ ] No SQL injection vulnerabilities
- [ ] Loading states are implemented
- [ ] Empty states are handled
- [ ] Error messages are user-friendly
- [ ] TypeScript compiles without errors
- [ ] No linting errors

## Adding New Features

### Adding an API Route

1. Create route file: `app/api/[name]/route.ts`
2. Add Zod validation schema
3. Use query helpers from `lib/queries.ts`
4. Add error handling
5. Export `runtime = 'nodejs'`
6. Document in README.md

### Adding a New Page

1. Create page file: `app/[name]/page.tsx`
2. Add to navigation (if needed)
3. Add loading states
4. Add error handling
5. Add empty states

### Adding a Component

1. Create component file in `components/`
2. Use TypeScript types
3. Add props interface
4. Follow existing component patterns
5. Add to component exports if reusable

## Testing

### Manual Testing

Test these areas:
- [ ] All pages load correctly
- [ ] API routes return expected data
- [ ] Filters work correctly
- [ ] Error handling works
- [ ] Loading states display
- [ ] Empty states display

### Type Checking

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Documentation

When adding features:

- [ ] Update README.md if needed
- [ ] Add to CHANGELOG.md
- [ ] Update DEVELOPER_QUICK_REFERENCE.md if applicable
- [ ] Add code comments for complex logic

## Security

- Never commit secrets or API keys
- Use environment variables
- Validate all inputs
- Use parameterized queries
- Follow security best practices (see SECURITY.md)

## Pull Request Process

1. **Update your branch**
   ```bash
   git pull origin main
   ```

2. **Push your changes**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request**
   - Provide clear description
   - Reference related issues
   - Include screenshots if UI changes

## Code of Conduct

- Be respectful
- Provide constructive feedback
- Help others learn
- Follow best practices

## Questions?

- Check existing documentation
- Review code examples
- Ask in discussions/issues

---

Thank you for contributing to Nimbus! 🎉

