# Settings Component

A modular, well-organized Settings component for the Codex Desktop application.

## Structure

```
Settings/
├── README.md              # This documentation file
├── index.ts              # Main exports
├── types.ts              # TypeScript interfaces and types
├── constants.ts          # Static data and configuration
├── utils.ts              # Utility functions
├── hooks.ts              # Custom React hooks
├── Settings.tsx          # Main Settings component
├── SettingsSidebar.tsx   # Sidebar navigation component
└── ConfirmationModal.tsx # Reusable confirmation modal
```

## Key Improvements

### 1. **Separation of Concerns**
- **Types**: All TypeScript interfaces centralized in `types.ts`
- **Constants**: Static data and configuration in `constants.ts`
- **Utils**: Pure utility functions in `utils.ts`
- **Hooks**: Custom React hooks for state management in `hooks.ts`
- **Components**: Reusable UI components separated into their own files

### 2. **Code Reusability**
- `ConfirmationModal`: Reusable modal component for both "Clear Data" and "Kill Processes" actions
- `SettingsSidebar`: Extracted sidebar for better modularity
- Custom hooks for modal state management reduce code duplication

### 3. **Better Organization**
- Related functionality grouped together
- Clear file naming conventions
- Proper TypeScript typing throughout
- JSDoc comments for utility functions

### 4. **Maintainability**
- Single responsibility principle applied to each module
- Easy to locate and modify specific functionality
- Consistent code style and patterns
- Proper error handling and validation

## Usage

The Settings component can be imported normally:

```tsx
import Settings from './components/pages/Settings';

// or

import { Settings } from './components/pages/Settings';
```

## Components

### Settings (Main Component)
The main Settings component that orchestrates all functionality.

### SettingsSidebar
Navigation sidebar with category selection.

**Props:**
- `activeCategory`: Currently selected category
- `onCategoryChange`: Callback for category changes

### ConfirmationModal
Reusable confirmation modal with text input validation.

**Props:**
- `isOpen`: Modal visibility state
- `title`: Modal title
- `description`: Main description text
- `warningMessage`: Optional warning message
- `confirmationText`: Current confirmation input value
- `onConfirmationTextChange`: Callback for text changes
- `onConfirm`: Callback for confirmation action
- `onCancel`: Callback for cancel action
- `confirmButtonText`: Text for confirm button
- `icon`: Icon to display in header
- `destructiveItems`: Optional list of items to be deleted

## Hooks

### useClearDataModal
Manages state and logic for the clear data confirmation modal.

### useKillCodexModal
Manages state and logic for the kill Codex processes confirmation modal.

## Constants

### SETTINGS_CATEGORIES
Array of available settings categories with icons.

### STORAGE_PRESETS
Predefined storage quota options.

### CLEAR_DATA_ITEMS
List of items that will be cleared when resetting app data.

## Utilities

### formatBytes
Converts bytes to human-readable format (e.g., "1.5 GB").

### parseStorageInput
Parses human-readable storage input to bytes.

### isPresetSelected
Checks if a storage preset is currently selected.

### isCustomValue
Determines if the current storage value is custom (not a preset).

## Future Enhancements

This modular structure makes it easy to:
- Add new settings categories
- Create additional reusable components
- Implement new utility functions
- Add more sophisticated state management
- Write unit tests for individual modules 