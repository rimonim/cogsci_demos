# Cognitive Science Demonstrations Platform

A unified, robust platform for cognitive psychology experiments built with React and deployed on Cloudflare Pages with serverless Functions for data collection.

## Features

### Experiments
- **Flanker Task**: Attention and response inhibition
- **Stroop Task**: Color-word interference  
- **Visual Search Task**: Target detection in visual arrays with pop-out and conjunction searches
- **N-Back Task**: Working memory with 2-back paradigm
- **Posner Cueing Task**: Spatial attention and covert orienting with endogenous and exogenous cues, and variable SOA
- **Mental Rotation Task**: Spatial cognition and mental transformation of 2D shapes with mirror images
- **Change Detection Task**: Visual working memory assessment with Cowan's K

### Platform Features
- **Session Management**: Instructor-created sessions with unique codes
- **Instructor Authentication**: Password-protected access for session creation and management
- **Results Dashboard**: Real-time participant data visualization
- **Data Export**: Standardized CSV downloads with camel_case field names
- **Responsive Design**: Modern UI with Tailwind CSS and unified components
- **Serverless Backend**: Cloudflare KV for data storage
- **Race Condition Prevention**: Robust timing and state management
- **Privacy Controls**: Session-based data isolation

## Session-Based System

The platform includes a comprehensive session-based system for classroom data collection:

### For Instructors:
1. **Login**: Access instructor features at `/login` using the configured password
2. **Create Sessions**: Use the Session Manager at `/sessions` to create new data collection sessions
3. **Share Links**: Provide the generated session link to students  
4. **Monitor Results**: View real-time data at `/results` and download CSV exports
5. **Session Management**: Bulk operations, cleanup, and storage monitoring

### For Students:
1. Join a session via the instructor-provided link
2. Enter name, student ID, and privacy preferences
3. Complete the assigned cognitive task
4. Results are automatically associated with the session

### Key Benefits:
- **Organized Data Collection**: Results grouped by session
- **Streamlined Experience**: Direct task assignment for students
- **Privacy Controls**: Students control data sharing
- **Session-Specific Analysis**: Analyze results by class session
- **Easy CSV Export**: Download session-specific data

## Architecture

### Unified Framework
All experiments use the standardized `useTrialManager` hook for:
- **Prevents race conditions** and timing bugs through careful state management
- **Accurate trial/response alignment** - responses recorded against correct stimulus
- **Standardized sequencing** across all experiments with consistent timing
- **Automatic cleanup** and memory management preventing crashes
- **Configurable parameters** for timeouts, delays, and stimulus duration
- **Manual response control** for complex timing scenarios (e.g., Posner cueing with SOA delays)
- **Flexible timing management** supporting both simple and multi-phase experimental designs

### Multi-Phase Trial Manager
The `useMultiPhaseTrialManager` hook extends the unified framework to support:
- **Multi-phase experimental designs**: Seamlessly manage tasks with multiple phases, such as practice and test phases.
- **Dynamic phase transitions**: Automatically transition between phases based on task-specific criteria.
- **Enhanced timing control**: Configure phase-specific timing parameters for precise experimental control.

### Unified UI Components
Consistent user experience through standardized components:
- **TaskSetup**: Configurable participant setup with task-specific branding
- **PracticeComplete**: Practice feedback with accurate performance statistics
- **TaskComplete**: Results display with detailed analytics and standardized CSV downloads
- **Standardized CSV exports**: All downloads use camel_case field names with proper data mapping

## Project Structure

```
src/
├── components/
│   ├── ui/              # Unified, configurable UI components
│   │   ├── TaskSetup.jsx
│   │   ├── PracticeComplete.jsx
│   │   ├── TaskComplete.jsx
│   │   └── taskConfigs.js
│   ├── SessionManagement.jsx  # Session management operations
│   ├── SessionManager.jsx     # Instructor session creation interface
│   ├── TaskSwitchDialog.jsx   # Task switching UI component
│   ├── Thumbnails.jsx         # Task preview thumbnails
│   ├── UniversityLogo.jsx     # Logo component
│   ├── change-detection/ # Change detection-specific stimulus display
│   │   ├── StimulusDisplay.jsx
│   ├── flanker/         # Flanker-specific stimulus display
│   ├── stroop/          # Stroop-specific stimulus display  
│   ├── visual-search/   # Visual search stimulus display
│   ├── nback/           # N-Back task stimulus display
│   ├── posner/          # Posner cueing task stimulus display
│   ├── mental-rotation/ # Mental rotation task stimulus display
│   └── results/         # Results dashboard components
├── demos/
│   ├── ChangeDetection.jsx # Change detection task using unified framework
│   ├── Flanker.jsx      # Flanker task using unified framework
│   ├── Stroop.jsx       # Stroop task using unified framework
│   ├── NBack.jsx        # N-Back task using unified framework
│   ├── Posner.jsx       # Posner cueing task using unified framework
│   ├── MentalRotation.jsx # Mental rotation task using unified framework
│   └── VisualSearch.jsx # Visual search task using unified framework
├── hooks/
│   ├── useTrialManager.js # Unified trial management framework
│   ├── useMultiPhaseTrialManager.js # Multi-phase trial management framework
├── entities/
│   ├── ChangeDetectionResult.js # Change detection data model and API
│   ├── FlankerResult.js    # Flanker data model and API
│   ├── StroopResult.js     # Stroop data model and API
│   ├── NBackResult.js      # N-Back data model and API
│   ├── PosnerResult.js     # Posner cueing data model and API
│   ├── MentalRotationResult.js # Mental rotation data model and API
│   ├── VisualSearchResult.js # Visual search data model and API
│   └── StudentResult.js    # Optimized batch data collection
├── pages/
│   ├── Home.jsx         # Landing page with demo links
│   ├── Results.jsx      # Instructor results dashboard
│   ├── SessionJoin.jsx  # Student session join page
│   ├── InstructorLogin.jsx # Instructor authentication page
│   ├── ChangeDetectionInstructions.jsx # Change detection task instructions
│   ├── FlankerInstructions.jsx # Flanker task instructions
│   ├── StroopInstructions.jsx  # Stroop task instructions
│   ├── VisualSearchInstructions.jsx # Visual search instructions
│   ├── NBackInstructions.jsx   # N-Back task instructions
│   ├── PosnerInstructions.jsx  # Posner cueing instructions
│   └── MentalRotationInstructions.jsx # Mental rotation instructions
├── utils/
│   ├── sessionContext.js  # Session management utility
│   ├── instructorAuth.js  # Authentication utilities
│   └── kvQuotaManager.js  # KV storage optimization
└── utils.js            # General utility functions

functions/
└── api/
    ├── auth.js          # Authentication API endpoint
    ├── record.js        # Cloudflare Pages Functions API for result storage
    ├── session.js       # API for session creation and listing
    ├── session-management.js # Advanced session operations
    └── session/
        └── [sessionId].js # API for session-specific operations
```

## Development

### Prerequisites
- **Node.js 20+** (required for Wrangler/Cloudflare Functions)
  - macOS: `brew install node@20`
  - See [LOCAL_TESTING.md](LOCAL_TESTING.md) for detailed installation instructions
- npm

### Local Development
```bash
npm install

# Set up environment variables (optional for basic testing)
cp .env.example .env

npm run dev
```

**Alternative (using Node.js version management):**
```bash
# For automatic Node.js version management
./start-dev.sh
```

### Building
```bash
npm run build
```

### Local Testing with Functions
```bash
npm run build
npx wrangler pages dev dist
```

**Alternative (using Node.js version management):**
```bash
# For automatic Node.js version management  
./start-wrangler.sh
```

> **Important:** The session-based system requires Cloudflare KV storage to function correctly. Local development with `npm run dev` is suitable for UI testing only. For full functionality testing (sessions, data storage), use either:
> - `npx wrangler pages dev dist` for local simulation with KV
> - Deploy to Cloudflare Pages for complete testing

> **Note:** If you see the error "Wrangler requires at least Node.js v20.0.0", update your Node.js version.

## Deployment

Deploy your own copy of this cognitive psychology experiment platform to Cloudflare Pages. This process sets up a live website that can collect and store experimental data from students.

### Quick Start (Recommended for Most Users)

**1. Get a Free Cloudflare Account**
- Go to [cloudflare.com](https://cloudflare.com) and sign up for a free account
- No credit card required - the free tier is sufficient for most classroom use

**2. Fork This Repository**
- Click "Fork" at the top of this GitHub page to create your own copy
- This allows you to customize the experiments and deploy automatically

**3. Set Up Automatic Deployment**
This creates a live website that updates automatically when you make changes:

a) **Get your Cloudflare credentials:**
   - Log into Cloudflare dashboard
   - Go to "My Profile" → "API Tokens" → "Create Token"
   - Use "Custom Token" and set:
     - **Permissions**: `Cloudflare Pages:Edit`
     - **Account Resources**: Include your account
   - Copy the generated token
   - From your Cloudflare dashboard main page, copy your **Account ID** (on the right sidebar)
  - If you don’t see your Account ID in the dashboard, you can use the Wrangler CLI to retrieve it:
    ```bash
    npm install -g wrangler    # if Wrangler is not installed
    wrangler login             # to authenticate
    wrangler whoami            # shows your account ID in the output
    ```

b) **Configure GitHub to deploy automatically:**
   - In your forked repository, go to "Settings" → "Secrets and variables" → "Actions"
   - Click "New repository secret" and add:
     - **Name**: `CLOUDFLARE_API_TOKEN`
     - **Value**: The API token from step 3a
   - Add another secret:
     - **Name**: `CLOUDFLARE_ACCOUNT_ID` 
     - **Value**: Your Account ID from step 3a

c) **Deploy:**
   - Go to Cloudflare dashboard → Workers & Pages → Pages → "Create application"
   - Choose "Connect to Git" → select your forked repository
   - Configure the build settings:
     - **Project name**: `cogsci-demos`
     - **Build command**: `npm run build`
     - **Build output directory**: `dist`
     - **Root directory**: `/` (leave blank)
   - Click "Save and Deploy"
   - After the project exists, GitHub will automatically deploy on every push to `main`

**4. Set Up Data Storage**
The platform needs a place to store experimental data:

a) **Install Wrangler CLI** (this is Cloudflare's command-line tool):
   ```bash
   npm install -g wrangler
   ```

b) **Login and create storage:**
   ```bash
   # Login to Cloudflare
   wrangler login
   
   # Create the data storage namespace
   wrangler kv namespace create RT_DB
   ```

c) **Configure storage in your project:**
   - The command above will output something like:
     ```
     [[kv_namespaces]]
     binding = "RT_DB"
     id = "abc123def456"
     ```
   - Copy the `id` value
   - Edit `wrangler.toml` in your repository and update the `id` field with your value
   - Commit and push this change to trigger a new deployment

**5. Set Your Instructor Password**
This password protects access to session management and results:

- In Cloudflare dashboard, go to Pages → your project → Settings → Variables and Secrets
- Add a new variable:
  - **Name**: `INSTRUCTOR_PASSWORD`
  - **Value**: Choose a secure password (this is what instructors will use to log in)
  - **Environment**: Production

**6. Test Your Deployment**
- Visit your site URL
- Go to `/login` and use your instructor password
- Create a test session at `/sessions`
- Try running an experiment
- Check results at `/results`

### Alternative: Manual Deployment

If you prefer not to use GitHub automatic deployment:

```bash
# Clone the repository
git clone https://github.com/yourusername/cogsci_demos.git
cd cogsci_demos

# Install dependencies
npm install

# Build the application
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages project create dist --project-name=cogsci-demos  # run once to create the Pages project if it doesn't exist
npx wrangler pages deploy dist --project-name=cogsci-demos  # deploy
```

### Customization

**Change Experiment Parameters:**
- Edit files in `src/demos/` to modify trial counts, timing, stimuli
- Update task configurations in `src/components/ui/taskConfigs.js`

**Add New Experiments:**
- Follow the patterns in existing demos
- Use the `useTrialManager` hook for consistency
- Add new result entities in `src/entities/`

**Modify Styling:**
- Edit Tailwind CSS classes throughout the components
- Update the logo in `src/components/UniversityLogo.jsx`

### Verification & Testing

After deployment, verify everything works:
1. **Basic functionality**: Visit your site and navigate around
2. **Instructor access**: Go to `/login` and use your password
3. **Session creation**: Create a test session at `/sessions`
4. **Experiment flow**: Complete a cognitive task end-to-end
5. **Data collection**: Check that results appear at `/results`
6. **CSV export**: Download session data to verify format

### Going Live for Classes

**For Instructors Using the Platform:**
1. **Create sessions** at `your-site.pages.dev/sessions`
2. **Share the session link** with students (each session gets a unique URL)
3. **Monitor progress** in real-time at `/results`
4. **Download data** as CSV files for analysis
5. **Manage sessions** using the built-in tools for cleanup and organization

**For Students:**
- Students simply visit the session link provided by their instructor
- No account creation required - just enter name and student ID
- Complete the assigned experiment
- Data automatically saved to the session

### Troubleshooting Common Issues

**"KV namespace not found" error:**
- Ensure your KV namespace ID is correctly set in `wrangler.toml`
- Verify the namespace exists: `wrangler kv:namespace list`
- Make sure you've pushed the updated `wrangler.toml` to trigger a new deployment

**"Wrangler requires Node.js v20+" error:**
- Update Node.js to version 20 or higher
- macOS: `brew install node@20` 
- Windows/Linux: Download from [nodejs.org](https://nodejs.org)

**Instructor login shows "500 Internal Server Error":**
- Check that `INSTRUCTOR_PASSWORD` environment variable is set in Cloudflare Pages
- For local development, the system uses a fallback password `demo123`
- Ensure the password doesn't contain special characters that might cause issues

**Build fails in GitHub Actions:**
- Check that `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets are set correctly
- Verify the API token has `Cloudflare Pages:Edit` permissions
- Look at the Actions tab in GitHub for detailed error messages

**Deployment succeeds but site doesn't work:**
- Check Cloudflare Pages dashboard → Functions tab for error logs
- Ensure KV namespace binding is properly configured in `wrangler.toml`
- Verify environment variables are set in Cloudflare (especially `INSTRUCTOR_PASSWORD`)

**Students can't access sessions:**
- Ensure the session link includes the full URL (e.g., `https://your-site.pages.dev/session/abc123`)
- Check that the session was created successfully in the results dashboard
- Verify KV storage is working by testing data collection yourself

**Data not saving properly:**
- Check browser console for JavaScript errors
- Verify internet connection is stable
- Ensure students are completing all required fields (name, student ID)
- Check KV storage quota in Cloudflare dashboard

**Site shows blank page with MIME type errors:**
- This happens when build assets aren't served correctly
- Go to Cloudflare Pages dashboard → your project → Settings → Builds & deployments
- Verify these settings:
  - **Build command**: `npm run build`
  - **Build output directory**: `dist`
  - **Root directory**: `/` (or leave blank)
- If settings are wrong, update them and trigger a new deployment
- Check that your `wrangler.toml` has `pages_build_output_dir = "dist"`

**Need help?**
- Check Cloudflare Pages documentation: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages/)
- Review GitHub Actions logs for deployment issues
- Consult the detailed setup guides in this repository: `SETUP.md`, `LOCAL_TESTING.md`

## API Endpoints

### Authentication
- `POST /api/auth` - Instructor login (returns session token)

### Record Endpoints  
- `POST /api/record` - Save experiment data to KV storage
- `GET /api/record` - Export all data as CSV

### Session Endpoints (Require Authentication)
- `POST /api/session` - Create a new session
- `GET /api/session` - List all sessions  
- `POST /api/session-management` - Advanced session operations (cleanup, bulk delete, monitoring)

### Public Session Endpoints
- `GET /api/session/{sessionId}` - Get session data
- `GET /api/session/{sessionId}?format=csv` - Export session-specific data as CSV

> **Note:** Session creation and management endpoints require instructor authentication. Individual session data access is public to allow result sharing.

## Documentation

- **[Trial Framework](TRIAL_FRAMEWORK.md)** - Complete guide to the `useTrialManager` hook
- **[Unified Components](UNIFIED_COMPONENTS.md)** - Documentation for standardized UI components
- **[Setup Guide](SETUP.md)** - Development environment setup
- **[Local Testing](LOCAL_TESTING.md)** - Local development and testing instructions
- **[Local Development](START_LOCAL_DEV.md)** - Quick start guide for local development

## Contributing

### Development Guidelines
1. **Follow unified framework patterns** - use `useTrialManager` and standardized components
2. **Maintain consistent styling** - use existing Tailwind classes and component patterns  
3. **Ensure proper trial alignment** - always pass trial data to `handleResponse`
4. **Test thoroughly** - verify accuracy calculations and display consistency
5. **Update documentation** for any new features or changes

### For Instructors
1. Create a session at `/sessions`
2. Share the session link with students
3. Navigate to `/results` to view session data
4. Select a specific session to view session-specific results
5. Click "Download Session Data" for CSV export
6. Use individual participant download buttons for detailed data

## Data Format

### Standardized CSV Exports
All tasks export data with consistent camel_case field names:

**Flanker Task:**
- `student_name`, `student_id`, `trial_number`, `stimulus_type`, `stimulus_display`
- `correct_response`, `participant_response`, `reaction_time`, `is_correct`, `session_start_time`

**Stroop Task:**
- `student_name`, `student_id`, `trial_number`, `stimulus_color`, `stimulus_word`, `stimulus_type`
- `correct_response`, `participant_response`, `reaction_time`, `is_correct`, `session_start_time`

**Visual Search Task:**
- `student_name`, `student_id`, `trial_number`, `search_type`, `set_size`, `target_present`
- `correct_response`, `participant_response`, `reaction_time`, `is_correct`, `session_start_time`

**N-Back Task:**
- `student_name`, `student_id`, `trial_number`, `stimulus_letter`, `is_target`, `n_back_level`
- `correct_response`, `participant_response`, `reaction_time`, `is_correct`, `session_start_time`

**Posner Cueing Task:**
- `student_name`, `student_id`, `trial_number`, `cue_type`, `cue_validity`, `target_location`, `soa`
- `target_present`, `correct_response`, `participant_response`, `reaction_time`, `is_correct`, `session_start_time`

**Mental Rotation Task:**
- `student_name`, `student_id`, `trial_number`, `shape_type`, `left_rotation`, `right_rotation`, `trial_type`
- `correct_response`, `participant_response`, `reaction_time`, `is_correct`, `session_start_time`

### Performance Metrics
- **Flanker**: Congruent vs. incongruent accuracy/RT, flanker effect
- **Stroop**: Congruent vs. incongruent accuracy/RT, Stroop effect  
- **Visual Search**: Color popout, orientation popout, and conjunction search performance
- **N-Back**: Hit rate, false alarm rate, signal detection metrics
- **Posner Cueing**: Valid vs. invalid cue effects, alerting effects, endogenous vs. exogenous attention
- **Mental Rotation**: Same vs. different accuracy/RT, rotation angle effects, mirror image discrimination, spatial transformation ability

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge
- Mobile responsive design

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
