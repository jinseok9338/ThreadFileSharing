# Quickstart: Frontend Setup and Validation

**Feature**: 003-frontend-setup  
**Date**: 2025-09-30  
**Status**: Ready for Implementation

## Overview

This quickstart guide demonstrates how to set up and validate a React 19 frontend project with modern tooling (React Router, TanStack Query, Zod, React Hook Form, shadcn/ui, Tailwind CSS 4). The user will create the project themselves, and the AI assistant will provide step-by-step validation.

## Prerequisites

- Node.js 18+ installed
- pnpm package manager installed
- Git repository initialized
- Backend API running (for integration testing)

## Setup Steps

### 1. Create React 19 Project with Vite

```bash
# Create React project with Vite
npm create vite@latest frontend -- --template react-ts
cd frontend

# Install pnpm if not already installed
npm install -g pnpm

# Install dependencies
pnpm install
```

**Validation Checkpoint 1**: Verify project structure

- [ ] `src/` directory exists
- [ ] `package.json` has React 19 dependencies
- [ ] `vite.config.ts` exists
- [ ] `tsconfig.json` exists
- [ ] `index.html` exists

### 2. Install Required Dependencies

```bash
# Core dependencies
pnpm add react@^19.0.0 react-dom@^19.0.0

# Routing
pnpm add react-router-dom@^6.0.0
pnpm add -D @types/react-router-dom@^5.0.0

# State management
pnpm add @tanstack/react-query@^5.0.0
pnpm add -D @tanstack/react-query-devtools@^5.0.0

# Forms and validation
pnpm add react-hook-form@^7.0.0
pnpm add zod@^3.22.0
pnpm add @hookform/resolvers@^3.0.0

# UI and styling
pnpm add tailwindcss@^4.0.0
pnpm add @tailwindcss/typography@^0.5.0
pnpm add @tailwindcss/forms@^0.5.0
pnpm add class-variance-authority@^0.7.0
pnpm add clsx@^2.0.0
pnpm add tailwind-merge@^2.0.0

# Development tools
pnpm add -D @types/react@^18.0.0
pnpm add -D @types/react-dom@^18.0.0
pnpm add -D @vitejs/plugin-react@^4.0.0
pnpm add -D eslint@^8.0.0
pnpm add -D @typescript-eslint/parser@^6.0.0
pnpm add -D @typescript-eslint/eslint-plugin@^6.0.0
pnpm add -D prettier@^3.0.0
```

**Validation Checkpoint 2**: Verify dependencies

- [ ] All packages installed successfully
- [ ] No version conflicts
- [ ] Peer dependencies satisfied
- [ ] No security vulnerabilities

### 3. Configure TypeScript

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Validation Checkpoint 3**: Verify TypeScript configuration

- [ ] TypeScript compilation passes
- [ ] Strict mode enabled
- [ ] No type errors
- [ ] Proper module resolution

### 4. Configure Tailwind CSS 4

Initialize Tailwind CSS:

```bash
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```javascript
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

Update `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Validation Checkpoint 4**: Verify Tailwind CSS configuration

- [ ] Tailwind CSS properly configured
- [ ] Theme variables defined
- [ ] Dark mode support enabled
- [ ] CSS classes working

### 5. Initialize shadcn/ui

Install shadcn/ui CLI:

```bash
npx shadcn-ui@latest init
```

Follow the prompts:

- Would you like to use TypeScript? Yes
- Which style would you like to use? Default
- Which color would you like to use as base color? Slate
- Where is your global CSS file? src/index.css
- Would you like to use CSS variables for colors? Yes
- Where is your tailwind.config.js located? tailwind.config.js
- Configure the import alias for components? src/components
- Configure the import alias for utils? src/lib/utils
- Are you using React Server Components? No
- Write configuration to components.json? Yes

Install some basic components:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
```

**Validation Checkpoint 5**: Verify shadcn/ui setup

- [ ] shadcn/ui initialized
- [ ] Components installed
- [ ] Import aliases configured
- [ ] Components rendering correctly

### 6. Set up React Router

Create `src/App.tsx`:

```tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Home from "./pages/Home";
import About from "./pages/About";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
```

Create `src/pages/Home.tsx`:

```tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to ThreadFileSharing</CardTitle>
          <CardDescription>
            A modern React 19 application with all the latest tooling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Get Started</Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

Create `src/pages/About.tsx`:

```tsx
export default function About() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold">About</h1>
      <p className="mt-4">This is the about page.</p>
    </div>
  );
}
```

**Validation Checkpoint 6**: Verify React Router setup

- [ ] Routing working correctly
- [ ] Navigation between pages
- [ ] TanStack Query integrated
- [ ] DevTools working

### 7. Set up Form Handling with React Hook Form and Zod

Create `src/lib/validations.ts`:

```typescript
import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "Must be at least 18 years old"),
});

export type User = z.infer<typeof userSchema>;
```

Create `src/components/UserForm.tsx`:

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, type User } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UserForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<User>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = (data: User) => {
    console.log("Form data:", data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Form</CardTitle>
        <CardDescription>
          Form with React Hook Form and Zod validation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <Input id="name" {...register("name")} className="mt-1" />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className="mt-1"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium">
              Age
            </label>
            <Input
              id="age"
              type="number"
              {...register("age", { valueAsNumber: true })}
              className="mt-1"
            />
            {errors.age && (
              <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
            )}
          </div>

          <Button type="submit">Submit</Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

Update `src/pages/Home.tsx` to include the form:

```tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserForm from "@/components/UserForm";

export default function Home() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to ThreadFileSharing</CardTitle>
          <CardDescription>
            A modern React 19 application with all the latest tooling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Get Started</Button>
        </CardContent>
      </Card>

      <UserForm />
    </div>
  );
}
```

**Validation Checkpoint 7**: Verify form handling

- [ ] React Hook Form working
- [ ] Zod validation working
- [ ] Form submission handling
- [ ] Error display working

### 8. Set up TanStack Query for Data Fetching

Create `src/services/api.ts`:

```typescript
export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export const fetchPosts = async (): Promise<Post[]> => {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }
  return response.json();
};

export const fetchPost = async (id: number): Promise<Post> => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch post");
  }
  return response.json();
};
```

Create `src/hooks/usePosts.ts`:

```typescript
import { useQuery } from "@tanstack/react-query";
import { fetchPosts } from "@/services/api";

export const usePosts = () => {
  return useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });
};
```

Create `src/components/PostsList.tsx`:

```tsx
import { usePosts } from "@/hooks/usePosts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PostsList() {
  const { data: posts, isLoading, error } = usePosts();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Posts</h2>
      {posts?.map((post) => (
        <Card key={post.id}>
          <CardHeader>
            <CardTitle>{post.title}</CardTitle>
            <CardDescription>Post ID: {post.id}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{post.body}</p>
            <Button className="mt-4">Read More</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

Update `src/pages/Home.tsx` to include the posts list:

```tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserForm from "@/components/UserForm";
import PostsList from "@/components/PostsList";

export default function Home() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to ThreadFileSharing</CardTitle>
          <CardDescription>
            A modern React 19 application with all the latest tooling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Get Started</Button>
        </CardContent>
      </Card>

      <UserForm />
      <PostsList />
    </div>
  );
}
```

**Validation Checkpoint 8**: Verify TanStack Query setup

- [ ] Data fetching working
- [ ] Loading states handled
- [ ] Error handling working
- [ ] Caching working

### 9. Configure Development Tools

Create `.eslintrc.js`:

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.js"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh"],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
  },
};
```

Create `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

Update `package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  }
}
```

**Validation Checkpoint 9**: Verify development tools

- [ ] ESLint working
- [ ] Prettier working
- [ ] TypeScript compilation
- [ ] Build process working

## Validation Steps

### 1. Start Development Server

```bash
pnpm dev
```

**Expected Result**:

- Development server starts on http://localhost:5173
- No console errors
- Hot reloading works
- All components render correctly

### 2. Test Build Process

```bash
pnpm build
```

**Expected Result**:

- Build completes successfully
- No TypeScript errors
- Optimized bundle created
- No build warnings

### 3. Test All Features

1. **Navigation**: Click between Home and About pages
2. **Form Validation**: Submit form with invalid data
3. **Data Fetching**: Verify posts load from API
4. **Styling**: Check Tailwind CSS classes work
5. **Components**: Verify shadcn/ui components render

**Expected Result**:

- All features working correctly
- No runtime errors
- Smooth user experience
- Responsive design

### 4. Final Validation

```bash
# Run linting
pnpm lint

# Check TypeScript
pnpm build

# Start dev server
pnpm dev
```

**Expected Result**:

- No linting errors
- TypeScript compilation passes
- Development server starts quickly
- All integrations working

## Success Criteria

- [ ] React 19 project created successfully
- [ ] All dependencies installed and compatible
- [ ] TypeScript configuration working
- [ ] Tailwind CSS 4 properly configured
- [ ] shadcn/ui components working
- [ ] React Router routing functional
- [ ] TanStack Query data fetching working
- [ ] React Hook Form with Zod validation working
- [ ] Development server starts without errors
- [ ] Build process completes successfully
- [ ] All validation checkpoints passed

## Troubleshooting

### Common Issues

1. **Dependency Conflicts**: Check package versions and peer dependencies
2. **TypeScript Errors**: Verify tsconfig.json and type definitions
3. **Build Failures**: Check Vite configuration and imports
4. **Styling Issues**: Verify Tailwind CSS configuration
5. **Component Errors**: Check shadcn/ui setup and imports

### Debug Commands

```bash
# Check dependencies
pnpm list

# Check TypeScript
npx tsc --noEmit

# Check build
pnpm build

# Check linting
pnpm lint
```

## Next Steps

1. **Backend Integration**: Connect to NestJS backend API
2. **Authentication**: Implement JWT authentication
3. **Real-time Features**: Add WebSocket integration
4. **File Upload**: Implement file upload functionality
5. **Testing**: Add unit and integration tests
6. **Deployment**: Set up production deployment


