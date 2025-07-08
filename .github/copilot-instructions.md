This is a platform for in-class interactive cognitive psychology experiments built with React and deployed on Cloudflare Pages with serverless Functions for data collection.

## Project Structure

```
src/
├── components/
│   ├── ui/              # Unified, configurable UI components
│   │   ├── TaskSetup.jsx
│   │   ├── PracticeComplete.jsx
│   │   ├── TaskComplete.jsx
│   │   └── taskConfigs.js
│   ├── SessionManager.jsx  # Instructor session creation interface
│   ├── flanker/         # Flanker-specific stimulus display
│   ├── stroop/          # Stroop-specific stimulus display  
│   ├── visual-search/   # Visual search stimulus display
│   ├── nback/           # N-Back task stimulus display
│   └── results/         # Results dashboard components
├── demos/
│   ├── Flanker.jsx      # Flanker task using unified framework
│   ├── Stroop.jsx       # Stroop task using unified framework
│   ├── NBack.jsx        # N-Back task using unified framework
│   └── VisualSearch.jsx # Visual search task using unified framework
├── hooks/
│   └── useTrialManager.js # Unified trial management framework
├── entities/
│   ├── FlankerResult.js    # Flanker data model and API
│   ├── StroopResult.js     # Stroop data model and API
│   ├── NBackResult.js      # N-Back data model and API
│   └── VisualSearchResult.js # Visual search data model and API
├── pages/
│   ├── Home.jsx         # Landing page with demo links
│   ├── Results.jsx      # Instructor results dashboard
│   ├── SessionJoin.jsx  # Student session join page
│   └── *Instructions.jsx # Task-specific instruction pages
├── utils/
│   └── sessionContext.js  # Session management utility
└── utils.js            # General utility functions

functions/
└── api/
    ├── record.js        # Cloudflare Pages Functions API for result storage
    ├── session.js       # API for session creation and listing
    └── session/
        └── [sessionId].js # API for session-specific operations
```

## Key Guidelines
1. When possible, use high-level abstractions that are reusable across tasks. 
   - For example, use the `TaskSetup` and `TaskComplete` components for task setup and completion.
   - Use the `useTrialManager` hook for trial management across tasks.
   - Refine existing high-level components if needed, rather than creating new ones.
2. For task-specific components, ensure they are modular and can be easily integrated with the unified framework.
3. UI should remain consistent across tasks.
4. KV storage should be optimized for use with Cloudflare Pages free tier limits:
    - 100,000 reads per day
    - 1,000 writes per day to different keys
    - 1 write per second to same key
    - 1000 operations/Worker invocations
    - 1000 namespaces
    - 1 GB storage/account
    - 1 GB storage/namespace
    - Unlimited keys/namespace
    - Key size: 512 bytes
    - Key metadata: 1024 bytes
    - Value size: 25 MiB
    - Minimum cacheTtl: 60 seconds
    
    **STORAGE OPTIMIZATION STRATEGY:**
    - Use student-level aggregation: Store all trials for one student in a single KV key
    - Key format: `session_{sessionId}_student_{studentId}` 
    - This reduces writes from ~2,000 per classroom to ~40 per classroom
    - Use `StudentResult` entity for collecting and submitting trial data as batches
    - Legacy individual trial storage is maintained for backward compatibility