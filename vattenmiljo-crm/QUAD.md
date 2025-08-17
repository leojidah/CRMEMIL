# Vattenmiljö CRM - Quick Commands Reference

## Project Overview
Next.js 15.1.3 application with TypeScript, Supabase, and Tailwind CSS for customer relationship management in the water treatment industry.

## Prerequisites
- Node.js (v18 or higher)
- npm (package manager)
- Supabase account and project setup

## Development Commands

### Package Management
```bash
# Install dependencies
npm install

# Install a new package
npm install <package-name>

# Install dev dependency
npm install --save-dev <package-name>

# Check installed packages
npm ls

# Update dependencies
npm update
```

### Development Server
```bash
# Start development server (http://localhost:3000)
npm run dev

# Start development server on different port
PORT=3001 npm run dev
```

### Build & Production
```bash
# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Lint and fix automatically
npm run lint -- --fix
```

### Database (Supabase)
```bash
# Run database migrations (if using Supabase CLI)
npx supabase db push

# Generate TypeScript types from Supabase
npx supabase gen types typescript --project-id <your-project-id> > lib/database.types.ts
```

### Testing
```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Git Commands
```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "descriptive message"

# Push to remote
git push origin <branch-name>
```

## Key Dependencies

### Runtime Dependencies
- **Next.js 15.1.3** - React framework
- **React 19.0.0** - UI library
- **@supabase/supabase-js** - Database and auth client
- **@dnd-kit/core** - Drag and drop functionality
- **lucide-react** - Icon components
- **uuid** - Generate unique identifiers (required for file uploads)
- **bcryptjs** - Password hashing
- **react-hook-form** - Form handling
- **zod** - Schema validation

### Development Dependencies
- **TypeScript** - Type safety
- **@types/uuid** - TypeScript types for uuid
- **ESLint** - Code linting
- **Tailwind CSS** - Styling framework
- **Autoprefixer** - CSS vendor prefixes

## Environment Variables
Create `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Project Structure
```
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   └── dashboard/      # Dashboard pages
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   ├── customer/      # Customer-specific components
│   └── kanban/        # Kanban board components
├── lib/               # Utility functions and configurations
├── types/             # TypeScript type definitions
└── public/            # Static assets
```

## Common Issues & Solutions

### UUID Module Not Found
If you encounter "Module not found: Can't resolve 'uuid'":
```bash
npm install uuid
npm install --save-dev @types/uuid
```

### Supabase Connection Issues
1. Check environment variables in `.env.local`
2. Verify Supabase project settings
3. Ensure API keys are correctly configured

### Build Errors
1. Run `npm run lint` to check for code issues
2. Fix TypeScript errors in the terminal output
3. Ensure all dependencies are installed with `npm install`

## Performance Tips
- Use `npm run build` to check for production build issues
- Monitor bundle size with build output
- Use Next.js Image component for optimized images
- Implement proper error boundaries for production

## Support
- Next.js documentation: https://nextjs.org/docs
- Supabase documentation: https://supabase.com/docs
- TypeScript documentation: https://www.typescriptlang.org/docs