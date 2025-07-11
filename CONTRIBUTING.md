# Contributing to Swagger Documentation for Confluence

Thank you for your interest in contributing! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork**: `git clone https://github.com/yourusername/swagger-confluence.git`
3. **Install dependencies**: `npm install`
4. **Start development**: `npm run dev`
5. **Make your changes** and test them
6. **Submit a pull request**

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ and npm 8+
- A Confluence Cloud instance (for testing)
- Git

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/swagger-confluence.git
cd swagger-confluence

# Install dependencies
npm install

# Start the development server
npm run dev

# In another terminal, you can run type checking
npm run type-check

# Or run linting
npm run lint
```

The app will be available at `http://localhost:5173`

### Testing Your Changes

1. **Local Testing**: Use the standalone mode at `http://localhost:5173`
2. **Confluence Testing**: Deploy to a test environment and install in Confluence
3. **API Testing**: Test with various OpenAPI specifications

## 📝 Code Standards

### Code Style

- Use TypeScript for all new code
- Follow the existing code style (Prettier configuration included)
- Use meaningful variable and function names
- Add comments for complex logic

### Formatting

```bash
# Format your code
npm run format

# Check formatting
npm run format:check
```

### Linting

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🎯 How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Use the bug report template** if available
3. **Include steps to reproduce** the bug
4. **Provide example OpenAPI URLs** when relevant
5. **Specify Confluence version** and browser details

### Suggesting Features

1. **Check existing feature requests** first
2. **Describe the use case** clearly
3. **Explain why this would benefit users**
4. **Consider implementation complexity**

### Pull Requests

1. **Create a feature branch**: `git checkout -b feature/amazing-feature`
2. **Make focused commits** with clear messages
3. **Update documentation** if needed
4. **Test your changes** thoroughly
5. **Update CHANGELOG.md** if applicable

#### Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Write clear commit messages
- Include tests if adding new functionality
- Update README.md if adding new features
- Ensure all CI checks pass

## 🏗️ Project Structure

```
swagger-confluence/
├── public/                  # Static files
│   ├── atlassian-connect.json
│   └── embed.html
├── src/
│   ├── components/          # React components
│   ├── types/              # TypeScript definitions
│   ├── data/               # Sample data
│   └── utils/              # Utility functions
├── netlify/functions/       # Serverless functions
└── ...
```

### Key Components

- **`ConfluenceMacroEditor`** - Configuration interface
- **`ConfluenceMacroRenderer`** - Displays documentation in Confluence
- **`SwaggerRenderer`** - Core OpenAPI rendering component
- **`EndpointCard`** - Individual API endpoint display

## 🧪 Testing Guidelines

### Manual Testing Checklist

- [ ] Load various OpenAPI specifications
- [ ] Test all filter types (all, tag, endpoint)
- [ ] Verify mobile responsiveness
- [ ] Test in different browsers
- [ ] Test Confluence integration

### OpenAPI Test URLs

Use these for testing:
- Swagger Petstore: `https://petstore3.swagger.io/api/v3/openapi.json`
- GitHub API: `https://api.github.com/openapi.json`

## 🔒 Security Considerations

### Important Security Rules

1. **Never log sensitive data** in production code
2. **Validate all user inputs** properly
3. **Use HTTPS URLs only** for OpenAPI specs
4. **Follow CORS best practices**
5. **Sanitize display content** to prevent XSS

### Code Review Focus Areas

- Input validation and sanitization
- Error handling and user feedback
- Performance implications
- Security implications
- Accessibility considerations

## 📚 Resources

### Documentation

- [Atlassian Connect Documentation](https://developer.atlassian.com/cloud/confluence/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Development Tools

- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide React](https://lucide.dev/) - Icons

## 🤝 Community Guidelines

### Be Respectful

- Use welcoming and inclusive language
- Respect different viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community

### Get Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and community chat
- **Documentation**: Check README.md and code comments

## 📋 Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

### Release Checklist

- [ ] Update version in package.json
- [ ] Update CHANGELOG.md
- [ ] Create release notes
- [ ] Tag the release
- [ ] Deploy to production

## 🙏 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes
- README.md acknowledgments

Thank you for contributing to making API documentation better for everyone! 🎉

## 📞 Contact

If you have questions about contributing, please:
- Open a GitHub Issue
- Start a GitHub Discussion
- Contact the maintainers

---

**Happy Contributing!** 🚀 