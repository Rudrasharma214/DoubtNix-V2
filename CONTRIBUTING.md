# Contributing to DoubtNix

Thank you for your interest in contributing to DoubtNix! We welcome contributions from the community and appreciate your effort to help improve this project.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues list to avoid duplicates. When reporting a bug, please include:

- A clear, descriptive title
- A description of the exact steps to reproduce the problem
- Specific examples to demonstrate the steps
- A description of the behavior you observed after following the steps
- An explanation of the expected behavior and why
- Screenshots or animated GIFs if possible
- Your environment details (OS, Node.js version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- A clear, descriptive title
- A step-by-step description of the suggested enhancement
- Specific examples to demonstrate the steps
- A description of the current behavior and why it needs to be improved
- Your environment details

### Pull Requests

- Fill in the required PR template
- Follow the JavaScript/React coding style
- Include appropriate test cases
- Update documentation as needed
- End all files with a newline

## Development Setup

1. Fork the repository and clone it locally
2. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Install dependencies:
   ```bash
   # Backend
   cd Backend
   npm install
   
   # Frontend
   cd Frontend
   npm install
   ```

4. Create a `.env` file in the Backend directory with the required environment variables

5. Start the development servers:
   ```bash
   # Terminal 1: Backend
   cd Backend
   npm run dev
   
   # Terminal 2: Frontend
   cd Frontend
   npm run dev
   ```

## Coding Standards

### JavaScript/Node.js

- Use ES6+ syntax
- Use meaningful variable and function names
- Add comments for complex logic
- Use async/await instead of callbacks
- Follow the existing code style

### React

- Use functional components and hooks
- Use meaningful component and prop names
- Keep components focused and reusable
- Add PropTypes or TypeScript for type safety
- Avoid prop drilling; use Context API or state management when needed

### General

- Write clean, readable code
- Add comments for non-obvious logic
- Keep functions small and focused
- Use consistent naming conventions
- Follow the project's existing patterns

## Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Example:
```
Add user profile page

- Implement profile component
- Add profile routes
- Update navigation

Closes #123
```

## Testing

- Write tests for new features
- Ensure all tests pass before submitting a PR
- Maintain or improve code coverage
- Test your changes manually before submitting

## Documentation

- Update README.md if you add new features
- Add inline comments for complex logic
- Update API documentation if you modify endpoints
- Keep documentation up-to-date with your changes

## Review Process

1. At least one maintainer will review your PR
2. We may request changes or ask questions
3. Once approved, your PR will be merged
4. Your contribution will be acknowledged in the project

## Code of Conduct

This project adheres to the Contributor Covenant Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Questions?

Feel free to open an issue for any questions or reach out to the project maintainers. We're here to help!

## License

By contributing to DoubtNix, you agree that your contributions will be licensed under its MIT License.

Thank you for contributing to DoubtNix!
