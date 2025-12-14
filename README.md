# Sweet Shop Management System   
**Click on:-** [Deployed](https://sweet-shop-managemen-hkhi.bolt.host)
- A full-stack web application for managing a sweet shop inventory with user authentication, role-based access control, and comprehensive inventory management features.

## Project Overview

This TDD Kata project demonstrates modern web development practices including Test-Driven Development, secure authentication, database management, and a responsive user interface. The application allows users to browse and purchase sweets, while administrators can manage the inventory through a comprehensive admin interface.

### Key Features

- **User Authentication**: Secure registration and login system using Supabase Authentication
- **Role-Based Access Control**: Separate user and admin roles with different permissions
- **Inventory Management**: Full CRUD operations for sweet products (admin only)
- **Purchase System**: Users can purchase sweets with inventory updates synchronized via Supabase
- **Restock Functionality**: Admins can restock inventory with quantity management
- **Search & Filter**: Advanced search and filtering by name, category, and price range
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Real-time Updates**: Inventory updates synchronized via Supabase client

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Testing Library** for component testing

### Backend & Database
- **Supabase** for PostgreSQL database and authentication
- **Row Level Security (RLS)** for data access control
- **Supabase Client** for real-time data synchronization

### Testing
- **Vitest** for unit and integration testing
- **@testing-library/react** for component testing
- **jsdom** for DOM simulation

## Architecture

### Database Schema

#### `user_profiles` Table
- `id` (uuid): Primary key, references auth.users
- `role` (text): User role (user/admin)
- `created_at` (timestamptz): Account creation timestamp

#### `sweets` Table
- `id` (uuid): Primary key
- `name` (text): Sweet name (unique)
- `category` (text): Sweet category
- `price` (numeric): Price per unit
- `quantity` (integer): Stock quantity
- `description` (text): Product description
- `created_by` (uuid): Reference to creator
- `created_at` (timestamptz): Creation timestamp
- `updated_at` (timestamptz): Last update timestamp

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Authenticated-only access** for all sweet operations
- **Admin-only permissions** for create, update, delete, and restock operations
- **Authentication and authorization** handled via Supabase Auth and Row Level Security
- **SQL injection protection** through Supabase client parameterized queries
- **Password hashing** handled by Supabase Auth

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Git
- A Supabase account (free tier works)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sweet-shop-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create a .env file and configure your Supabase credentials as shown below:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**

   The database schema is already applied. The migration includes:
   - User profiles table with role management
   - Sweets inventory table
   - Row Level Security policies
   - Sample data for testing

5. **Create an Admin Account**

   To create an admin account:
   - Register a new account through the UI
   - In your Supabase dashboard, go to Authentication > Users
   - Find your user and note their ID
   - Go to Table Editor > user_profiles
   - Update the role field for your user from 'user' to 'admin'
   -Admin role can be assigned manually via the Supabase dashboard.


6. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## Live Demo
**Deployed application link:**
[Deployment](https://sweet-shop-managemen-hkhi.bolt.host)


### Screenshots

![Login Page](screenshots/Screenshot%2025-12-14%164314.png)

![Create Account](screenshots/Screenshot%2025-12-14%164321.png)

![Dashboard](screenshots/Screenshot%2025-12-14%164449.png)

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

### Type Checking

```bash
npm run typecheck
```

## Usage Guide

### For Regular Users

1. **Registration**: Create an account using your email and password
2. **Browse Sweets**: View all available sweets with details, pricing, and stock levels
3. **Search & Filter**: Use the search bar and filters to find specific sweets
4. **Purchase**: Click the "Purchase" button to buy a sweet (decreases quantity by 1)
5. **Stock Status**: See real-time stock levels with color-coded indicators:
   - Green: Good stock (20+)
   - Yellow: Low stock (1-19)
   - Red: Out of stock (0)

### For Administrators

All user features, plus:

1. **Add Sweets**: Click "Add Sweet" to create new inventory items
2. **Edit Sweets**: Click the edit icon on any sweet card to modify details
3. **Delete Sweets**: Remove sweets from inventory (with confirmation)
4. **Restock**: Click the restock button to add quantity to existing sweets

## API Endpoints

While this application uses Supabase's built-in REST API through the JavaScript client, the logical endpoints are:

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/signin` - Login user
- `POST /auth/signout` - Logout user

### Sweets (Protected)
- `GET /sweets` - List all sweets
- `POST /sweets` - Add new sweet (Admin only)
- `PUT /sweets/:id` - Update sweet (Admin only)
- `DELETE /sweets/:id` - Delete sweet (Admin only)
- `PATCH /sweets/:id/purchase` - Purchase sweet (decrements quantity)
- `PATCH /sweets/:id/restock` - Restock sweet (Admin only)

## Testing Strategy

This project follows Test-Driven Development (TDD) principles:

### Test Coverage

- **Authentication Context Tests**: User registration, login, logout, and admin role detection
- **Component Tests**: AuthForm, SweetCard, and other UI components
- **Integration Tests**: End-to-end user flows
- **Unit Tests**: Individual function and utility testing

### Test Reports

Run `npm run test:coverage` to generate a detailed coverage report in the `coverage` directory.

## Project Structure

```
sweet-shop-management/
├── src/
│   ├── components/          # React components
│   │   ├── AuthForm.tsx    # Login/Registration form
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── SweetCard.tsx   # Sweet display card
│   │   ├── SweetForm.tsx   # Add/Edit sweet form
│   │   └── RestockForm.tsx # Restock modal
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication state management
│   ├── lib/                # Utilities and configurations
│   │   └── supabase.ts    # Supabase client setup
│   ├── types/              # TypeScript type definitions
│   │   └── database.ts    # Database schema types
│   └── test/               # Test files and utilities
│       ├── setup.ts       # Test configuration
│       └── mocks/         # Mock data and utilities
├── supabase/
│   └── migrations/         # Database migration files
├── dist/                   # Production build output
└── public/                 # Static assets
```

## Development Workflow

This project follows Test-Driven Development (TDD) principles:
- Tests written before implementation
- Incremental development and refactoring
- Automated test coverage for core features

## My AI Usage

### AI Tools Used

I utilized **Claude 3.5 Sonnet** (Anthropic's AI assistant) through the Bolt.new platform to build this project.

### How AI Was Used

1. **Project Setup & Architecture**
   - Used AI to scaffold the initial project structure
   - Generated boilerplate code for React components, context providers, and TypeScript types
   - Designed the database schema with AI assistance for optimal normalization and security

2. **Database Migrations**
   - AI helped write comprehensive SQL migrations with proper RLS policies
   - Generated seed data for testing purposes
   - Ensured proper foreign key relationships and constraints

3. **Component Development**
   - AI generated initial component structures following React best practices
   - Created responsive Tailwind CSS styling with modern design patterns
   - Implemented form validation and error handling logic

4. **Testing Suite**
   - AI helped structure the testing framework with Vitest and React Testing Library
   - Generated initial test cases for components and contexts
   - Created mock data and testing utilities

5. **Authentication & Security**
   - AI provided guidance on Supabase Auth integration patterns
   - Helped implement secure RLS policies
   - Ensured JWT token handling and session management best practices

6. **Code Refactoring**
   - Used AI to identify and fix code smells
   - Improved type safety and TypeScript usage
   - Enhanced error handling and user feedback mechanisms


### What I Did Manually

- **Business Logic Decisions**: Chose to implement purchase as a simple quantity decrement rather than a full order system
- **UX/UI Refinements**: Adjusted colors, spacing, and interactions for better user experience
- **Security Reviews**: Manually verified all RLS policies and ensured no data leaks
- **Integration Testing**: Manually tested the full user flow from registration to purchase
- **Error Handling**: Added specific error messages and user feedback for edge cases
- **Code Organization**: Structured files and folders for maintainability and scalability


## Future Enhancements

Potential features for future iterations:

- Shopping cart with multiple item support
- Order history and tracking
- Payment integration (Stripe)
- Email notifications
- Advanced analytics dashboard for admins
- Image uploads for sweet products
- Review and rating system
- Export functionality for inventory reports
- Multi-language support

## License

This project is created as a coding kata for educational and demonstration purposes.

## Contact & Support

For questions or issues, please open an issue in the GitHub repository.

---

**Built with modern web technologies and AI assistance to demonstrate TDD and full-stack development best practices.**
