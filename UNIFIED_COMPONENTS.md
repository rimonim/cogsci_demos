# Unified UI Components

This document describes the unified UI component system for cognitive science experiments, providing standardized, configurable components for consistent user experience across all tasks.

## Overview

The unified component system provides three main components:
- **TaskSetup**: Participant information collection and task introduction
- **PracticeComplete**: Practice phase completion with optional performance feedback
- **TaskComplete**: Main experiment completion with detailed results and downloads

All components are fully configurable through task-specific configuration objects, enabling consistent branding and functionality while maintaining flexibility for task-specific requirements.

## Components

### TaskSetup

**Location**: `src/components/ui/TaskSetup.jsx`

Unified component for collecting participant information and starting experiments.

#### Features
- Participant name and student ID collection
- Data sharing consent with detailed privacy information
- Task-specific branding (colors, icons, gradients)
- Optional instruction display with key bindings
- Responsive design with backdrop blur effects

#### Props
| Prop | Type | Description |
|------|------|-------------|
| `onStart` | Function | Callback for Flanker-style start (name, studentId, shareData) |
| `onComplete` | Function | Callback for Stroop/VisualSearch-style complete ({name, id, shareData}) |
| `config` | Object | Task configuration object |

#### Configuration Options
```javascript
{
  taskName: "Task Name Setup",     // Display title
  theme: "blue",                   // Color theme: 'blue', 'purple', 'green'
  icon: <Icon className="w-6 h-6" />, // Icon component
  description: "Description text", // Subtitle description
  instructions: ["instruction 1"], // Array of instruction strings
  keyBindings: [{key: "J", description: "action"}], // Key binding hints
  buttonText: "Begin Task",        // Start button text
  showInstructions: false,         // Whether to show instructions section
  gradientFrom: "from-slate-50",   // Background gradient start
  gradientTo: "to-blue-50"         // Background gradient end
}
```

### PracticeComplete

**Location**: `src/components/ui/PracticeComplete.jsx`

Unified component for practice phase completion with performance feedback.

#### Features
- Optional performance statistics (accuracy, reaction time)
- Task-specific reminders and key binding hints
- Low accuracy warnings with custom thresholds
- Themed styling matching task branding
- Support for both simple and detailed feedback modes

#### Props
| Prop | Type | Description |
|------|------|-------------|
| `results` | Array | Practice trial results (optional) |
| `onContinue` | Function | Callback for continuing to main task |
| `onStartExperiment` | Function | Alternative callback (backward compatibility) |
| `config` | Object | Task configuration object |

#### Configuration Options
```javascript
{
  taskName: "Task Name",
  theme: "blue",                   // Color theme
  title: "Practice Complete!",     // Title text
  description: "Description",      // Description text
  buttonText: "Continue",          // Button text
  showStats: true,                 // Show performance statistics
  reminders: ["reminder text"],    // Array of reminder strings
  keyBindings: [{key: "B", description: "Blue"}], // Key reminders
  gradientFrom: "from-slate-50",   // Background gradient
  gradientTo: "to-blue-50",
  accuracyWarningThreshold: 70,    // Threshold for low accuracy warning
  lowAccuracyMessage: "Custom warning message"
}
```

### TaskComplete

**Location**: `src/components/ui/TaskComplete.jsx`

Unified component for main experiment completion with detailed results.

#### Features
- Performance summary (accuracy, reaction time, trial count)
- Task-specific detailed statistics
- CSV download functionality
- Navigation back to home
- Configurable statistics calculation

#### Props
| Prop | Type | Description |
|------|------|-------------|
| `results` | Array | Main experiment results |
| `studentInfo` | Object | Student information |
| `config` | Object | Task configuration object |

#### Configuration Options
```javascript
{
  taskName: "Task Name",
  theme: "blue",                   // Color theme
  title: "Task Complete!",         // Title text
  description: "Thank you!",       // Description text
  calculateCustomStats: (results) => ({}), // Custom statistics function
  downloadFields: ["field1"],      // CSV download fields
  gradientFrom: "from-slate-50",   // Background gradient
  gradientTo: "to-blue-50",
  showDetailedStats: true          // Show detailed analysis section
}
```

## Task Configurations

**Location**: `src/components/ui/taskConfigs.js`

Pre-configured settings for all cognitive science tasks.

### Available Configurations

#### Flanker Task
- `FLANKER_CONFIG` - TaskSetup configuration
- `FLANKER_PRACTICE_CONFIG` - PracticeComplete configuration  
- `FLANKER_COMPLETE_CONFIG` - TaskComplete configuration

#### Stroop Task
- `STROOP_CONFIG` - TaskSetup configuration
- `STROOP_PRACTICE_CONFIG` - PracticeComplete configuration
- `STROOP_COMPLETE_CONFIG` - TaskComplete configuration

#### Visual Search Task
- `VISUAL_SEARCH_CONFIG` - TaskSetup configuration
- `VISUAL_SEARCH_PRACTICE_CONFIG` - PracticeComplete configuration
- `VISUAL_SEARCH_COMPLETE_CONFIG` - TaskComplete configuration

## Usage Examples

### Basic Implementation

```jsx
import TaskSetup from "@/components/ui/TaskSetup";
import PracticeComplete from "@/components/ui/PracticeComplete";
import TaskComplete from "@/components/ui/TaskComplete";
import { 
  FLANKER_CONFIG, 
  FLANKER_PRACTICE_CONFIG, 
  FLANKER_COMPLETE_CONFIG 
} from "@/components/ui/taskConfigs";

function FlankerExperiment() {
  const [phase, setPhase] = useState("setup");
  const [results, setResults] = useState([]);
  const [practiceResults, setPracticeResults] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);

  const handleSetupComplete = (name, studentId, shareData) => {
    setStudentInfo({ name, id: studentId, shareData });
    setPhase("practice");
  };

  const handlePracticeComplete = () => {
    setPhase("main");
  };

  if (phase === "setup") {
    return (
      <TaskSetup 
        onStart={handleSetupComplete} 
        config={FLANKER_CONFIG} 
      />
    );
  }

  if (phase === "practice_complete") {
    return (
      <PracticeComplete 
        results={practiceResults}
        onStartExperiment={handlePracticeComplete}
        config={FLANKER_PRACTICE_CONFIG} 
      />
    );
  }

  if (phase === "complete") {
    return (
      <TaskComplete 
        results={results}
        studentInfo={studentInfo}
        config={FLANKER_COMPLETE_CONFIG} 
      />
    );
  }

  // ... experiment logic
}
```

### Custom Configuration

```jsx
// Custom task configuration
const CUSTOM_CONFIG = {
  taskName: "Memory Task Setup",
  theme: "green",
  icon: <Brain className="w-6 h-6" />,
  description: "Test your memory capabilities",
  instructions: [
    "Remember the sequence of items",
    "Reproduce the sequence in order",
    "Try to be as accurate as possible"
  ],
  keyBindings: [
    { key: "1-9", description: "select items" },
    { key: "Enter", description: "confirm sequence" }
  ],
  buttonText: "Start Memory Test",
  showInstructions: true,
  gradientFrom: "from-slate-50",
  gradientTo: "to-green-50"
};

<TaskSetup onStart={handleStart} config={CUSTOM_CONFIG} />
```

## Theme System

The component system supports multiple color themes:

### Available Themes
- **blue**: Primary blue color scheme (default)
- **purple**: Purple color scheme  
- **green**: Green color scheme
- **emerald**: Emerald green color scheme

### Theme Configuration
Each theme defines:
- Primary button colors
- Accent text colors
- Card background colors
- Icon colors
- Focus states

Themes are automatically applied to all interactive elements within components.

## Migration Guide

### From Individual Components

1. **Replace imports**:
   ```jsx
   // Before
   import TaskSetup from "@/components/flanker/TaskSetup";
   
   // After
   import TaskSetup from "@/components/ui/TaskSetup";
   import { FLANKER_CONFIG } from "@/components/ui/taskConfigs";
   ```

2. **Add configuration**:
   ```jsx
   // Before
   <TaskSetup onStart={handleStart} />
   
   // After
   <TaskSetup onStart={handleStart} config={FLANKER_CONFIG} />
   ```

3. **Update callback signatures** (if needed):
   ```jsx
   // Both styles supported for backward compatibility
   onStart(name, studentId, shareData)        // Flanker style
   onComplete({name, id, shareData})          // Stroop/VisualSearch style
   ```

### Customizing Existing Tasks

To customize an existing task's appearance:

1. **Create custom configuration**:
   ```jsx
   const CUSTOM_FLANKER_CONFIG = {
     ...FLANKER_CONFIG,
     theme: "green",
     description: "Modified description",
     showInstructions: true,
     instructions: ["Custom instruction 1", "Custom instruction 2"]
   };
   ```

2. **Use custom configuration**:
   ```jsx
   <TaskSetup onStart={handleStart} config={CUSTOM_FLANKER_CONFIG} />
   ```

## Benefits

### Consistency
- Unified visual design across all experiments
- Standardized user interactions and flows
- Consistent data collection and privacy handling

### Maintainability  
- Single source of truth for UI components
- Centralized configuration management
- Easier updates and bug fixes

### Flexibility
- Configurable theming and branding
- Task-specific customizations
- Backward compatibility with existing code

### Developer Experience
- Clear, documented API
- Pre-configured options for common tasks
- Easy migration path from individual components

## Best Practices

1. **Use pre-configured settings** when possible to maintain consistency
2. **Create custom configurations** for new tasks by extending existing ones
3. **Test all phases** when updating configurations
4. **Maintain backward compatibility** when adding new features
5. **Document custom configurations** for team members

## Future Enhancements

Potential improvements to consider:
- Additional color themes
- Animation and transition options
- Accessibility enhancements
- Internationalization support
- Advanced statistics visualization
