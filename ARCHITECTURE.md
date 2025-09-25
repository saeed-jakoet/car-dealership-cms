# Car Dealership CMS - Clean Architecture

This is a Next.js application for managing a car dealership with a clean, organized folder structure.

## 📁 Project Structure

```
car-dealer-ship-cms/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard routes
│   ├── auth/              # Authentication pages
│   ├── (public)/          # Public routes
│   ├── layout.js          # Root layout with providers
│   └── globals.css        # Global styles
├── src/                   # Source code (new organized structure)
│   ├── components/        # All React components
│   │   ├── ui/           # Reusable UI components
│   │   │   ├── Button.js
│   │   │   ├── Toast.js
│   │   │   ├── ConfirmModal.js
│   │   │   └── icons.js
│   │   ├── layout/       # Layout components
│   │   │   └── AdminSidebar.js
│   │   ├── features/     # Feature-specific components
│   │   │   ├── vehicles/
│   │   │   │   ├── CarForm.js
│   │   │   │   ├── CarsTable.js
│   │   │   │   └── ImageSlider.js
│   │   │   ├── reviews/
│   │   │   │   ├── ReviewsTable.js
│   │   │   │   └── NewReviewModal.js
│   │   │   ├── auth/     # Auth-specific components
│   │   │   └── dashboard/ # Dashboard components
│   │   ├── providers/    # Context providers
│   │   │   ├── TokenProvider.js
│   │   │   └── Providers.js
│   │   └── index.js      # Component exports
│   ├── hooks/            # Custom React hooks
│   │   ├── useToken.js   # Token management hook
│   │   └── index.js      # Hook exports
│   └── lib/              # Utilities and configurations
│       ├── useAuthFetcher.js # API client hooks
│       └── index.js      # Lib exports
├── public/               # Static assets
└── package.json
```

## 🎯 Design Principles

### 1. **Feature-Based Organization**
- Components are organized by feature (vehicles, reviews, auth)
- Each feature has its own folder under `src/components/features/`
- Shared components are in `src/components/ui/`

### 2. **Clear Separation of Concerns**
- **UI Components**: Reusable, styling-focused components
- **Layout Components**: Page structure and navigation
- **Feature Components**: Business logic and feature-specific functionality
- **Hooks**: Stateful logic and side effects
- **Lib**: Utilities, API clients, and configurations

### 3. **Consistent Import Patterns**
```javascript
// ✅ Good - Import from organized structure
import { Button, Toast } from '@/src/components';
import { useToken } from '@/src/hooks';
import { useAuthFetcher } from '@/src/lib';

// ❌ Bad - Direct file imports
import Button from '@/components/ui/Button';
import useAuthFetcher from '@/utils/useAuthFetcher';
```

### 4. **Scalable Architecture**
- Easy to add new features by creating new folders
- Components can be easily moved and refactored
- Clear dependencies and relationships

## 🚀 Getting Started

### Installation
```bash
npm install
# or
yarn install
```

### Development
```bash
npm run dev
# or
yarn dev
```

### Building
```bash
npm run build
# or
yarn build
```

## 📝 Component Guidelines

### Adding New Components

1. **UI Components** (buttons, inputs, modals):
   ```
   src/components/ui/NewComponent.js
   ```

2. **Feature Components** (specific to vehicles, reviews, etc.):
   ```
   src/components/features/[feature]/ComponentName.js
   ```

3. **Layout Components** (sidebars, headers, footers):
   ```
   src/components/layout/ComponentName.js
   ```

### Naming Conventions
- **Components**: PascalCase (e.g., `CarForm.js`, `AdminSidebar.js`)
- **Hooks**: camelCase starting with "use" (e.g., `useToken.js`, `useAuthFetcher.js`)
- **Files**: Match component names exactly

### Export Pattern
Always add new components to the appropriate index.js file:

```javascript
// src/components/index.js
export { default as NewComponent } from './ui/NewComponent';

// src/hooks/index.js
export { useNewHook } from './useNewHook';

// src/lib/index.js
export { newUtility } from './newUtility';
```

## 🔧 Key Features

### Authentication System
- JWT token management with cookies
- Protected routes and API calls
- Token context provider for global state

### Vehicle Management
- CRUD operations for vehicles
- Image upload to Cloudinary
- Dynamic image URL generation
- Image reordering functionality

### Review System
- Customer review management
- Rating system with stars
- Modal-based review creation

### Admin Dashboard
- Sidebar navigation
- Vehicle listings with visibility toggle
- Customer message inbox
- Review management interface

## 📚 API Integration

The app integrates with a backend API for:
- Vehicle CRUD operations
- User authentication
- Review management
- Message handling
- Image upload to Cloudinary

## 🎨 Styling

- **Tailwind CSS** for utility-first styling
- **React Icons** for consistent iconography
- **React Hot Toast** for notifications
- Responsive design with mobile-first approach

## 🔄 Migration Guide

If you're migrating from the old structure:

1. **Components**: All moved from `/components/` to `/src/components/`
2. **Utils**: Moved from `/utils/` to `/src/lib/`
3. **Imports**: Update all imports to use new paths
4. **Exports**: Use barrel exports from index files

### Before
```javascript
import CarForm from '@/components/cars/CarForm';
import { useAuthFetcher } from '@/utils/useAuthFetcher';
```

### After
```javascript
import { CarForm } from '@/src/components';
import { useAuthFetcher } from '@/src/lib';
```

## 🐛 Troubleshooting

### Common Issues

1. **Import Errors**: Make sure you're using the new import paths
2. **Missing Exports**: Check that components are exported in index.js files
3. **Token Issues**: Verify TokenProvider is properly configured in layout.js

### Development Tips

- Use the barrel exports (index.js) for cleaner imports
- Keep components focused on single responsibilities
- Use TypeScript-style prop validation when possible
- Follow the established naming conventions

## 📈 Future Improvements

- Add TypeScript support
- Implement comprehensive error boundaries
- Add unit tests for components
- Create Storybook documentation
- Add internationalization (i18n)
- Implement caching strategies

---

This clean architecture makes the codebase more maintainable, scalable, and developer-friendly. Each component has a clear purpose and location, making it easy to find and modify code as the application grows.