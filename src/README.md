# Codex Desktop - Source Code Organization

This document describes the organized file structure of the Codex Desktop application.

## Directory Structure

```
src/
├── components/           # React components
│   ├── Header.tsx       # Application header component
│   ├── ConfigurationCard.tsx # Main configuration wrapper
│   ├── DataDirectorySection.tsx # Directory selection component
│   ├── PortConfigurationSection.tsx # Port configuration inputs
│   ├── StatusIndicator.tsx # Process status display
│   ├── ControlButtons.tsx # Start/Kill buttons
│   ├── StatusLog.tsx    # Status output display
│   └── index.ts         # Component exports
├── hooks/               # Custom React hooks
│   ├── useCodexProcess.ts # Codex process management hook
│   ├── useCodexConfig.ts # Configuration management hook
│   └── index.ts         # Hook exports
├── services/            # External service integrations
│   └── codexService.ts  # Codex process service
├── utils/               # Utility functions
│   ├── storage.ts       # LocalStorage utilities
│   └── validation.ts    # Input validation utilities
├── types/               # TypeScript type definitions
│   └── index.ts         # Application types and interfaces
├── constants/           # Application constants
│   └── index.ts         # Configuration constants
├── assets/              # Static assets
│   └── react.svg        # React logo
├── App.tsx              # Main application component
├── App.css              # Application styles
├── main.tsx             # Application entry point
├── vite-env.d.ts        # Vite environment types
└── README.md            # This file
```

## Component Architecture

### Main Components

- **App.tsx**: The main application component that orchestrates all other components
- **Header.tsx**: Displays the application title and description
- **ConfigurationCard.tsx**: Wrapper component for all configuration sections
- **DataDirectorySection.tsx**: Handles directory selection and display
- **PortConfigurationSection.tsx**: Manages port configuration inputs
- **StatusIndicator.tsx**: Shows current Codex process status
- **ControlButtons.tsx**: Contains start and kill Codex buttons
- **StatusLog.tsx**: Displays status output and logs

### Custom Hooks

- **useCodexProcess.ts**: Manages Codex process state and operations
- **useCodexConfig.ts**: Handles configuration state and localStorage persistence

### Services

- **codexService.ts**: Contains all Codex process management logic including:
  - Process killing
  - Process starting
  - Status checking
  - Process monitoring

### Utilities

- **storage.ts**: LocalStorage management utilities
- **validation.ts**: Input validation utilities for ports and other inputs

### Types

- **index.ts**: TypeScript interfaces for:
  - CodexConfig
  - CodexProcess
  - PortConfig
  - DirectoryConfig

### Constants

- **index.ts**: Application constants including:
  - Default ports
  - LocalStorage keys
  - Process check intervals
  - Bootstrap node configuration

## Benefits of This Organization

1. **Separation of Concerns**: Each file has a single responsibility
2. **Reusability**: Components and hooks can be easily reused
3. **Maintainability**: Code is easier to maintain and debug
4. **Testability**: Individual components and functions can be tested in isolation
5. **Scalability**: New features can be added without affecting existing code
6. **Type Safety**: Strong TypeScript typing throughout the application

## Best Practices Followed

- **DRY Principle**: No code duplication
- **Single Responsibility**: Each component/hook has one clear purpose
- **Custom Hooks**: Business logic extracted into reusable hooks
- **Type Safety**: Full TypeScript coverage
- **Clean Imports**: Index files for clean import statements
- **Consistent Naming**: Descriptive and consistent naming conventions 