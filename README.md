# Veltrix Finance

Veltrix Finance is a **role-based banking management web application** built with React and Firebase.

The system provides separate workflows for **Customers, Employees, and Managers**, allowing each role to access only the actions and information relevant to their responsibilities.

## Key Features

### Customer Portal

Customers can:

- Access their account through authenticated login
- View personal banking information
- Submit financial requests
- Track request status
- Review transaction and account-related history
- Use password reset functionality when required

### Employee Portal

Employees can:

- Access employee-specific functionality
- Manage customer-related operations
- Review and process banking requests
- Handle standard transaction workflows
- Review loan-related requests
- Work with customer account information

### Manager Portal

Managers have additional administrative capabilities, including:

- Managing employee-related operations
- Reviewing high-value loan requests
- Approving or managing higher-level banking actions
- Reviewing reports
- Monitoring relevant system and audit activity

## Role-Based Access

Veltrix Finance uses role-based authorization to separate system functionality between:

- Customer
- Employee
- Manager

Each role receives access only to the routes and features assigned to that role.

This provides a more structured application architecture and prevents standard users from accessing administrative functionality.

## Tech Stack

### Frontend

- React
- JavaScript
- Vite

### Authentication

- Firebase Authentication

### Database

- Firebase Realtime Database

### Hosting

- Firebase Hosting

### Development Tools

- npm
- Git
- GitHub

## Authentication

Firebase Authentication is used to manage user access.

The authentication workflow includes:

- User login
- Authenticated sessions
- Password reset functionality
- Role-based access to application areas

Authorization is handled according to the role assigned to each account.

## Database

Firebase Realtime Database is used to store and manage application data.

The application uses structured data to support:

- User information
- Customer data
- Employee-related information
- Banking requests
- Loan-related workflows
- Transaction-related records
- Role information

Firebase security rules are used to control database access.

## Application Architecture

The application separates functionality according to user roles and responsibilities.

```text
Veltrix Finance
│
├── Customer Portal
│   ├── Account Information
│   ├── Requests
│   └── History
│
├── Employee Portal
│   ├── Customer Management
│   ├── Transactions
│   └── Loan Requests
│
└── Manager Portal
    ├── Employee Management
    ├── High-Value Loan Approval
    ├── Reports
    └── Audit Activity
```

This structure keeps the application easier to maintain and makes permissions clearer across the system.

## Project Setup

### 1. Clone the repository

```bash
git clone https://github.com/Muhammad-Dani-yal/Veltrix-Finance.git
```

### 2. Open the project directory

```bash
cd Veltrix-Finance
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure Firebase

Create the required environment configuration and add your Firebase web application credentials.

Do not commit private credentials or populated environment files to GitHub.

### 5. Start the development server

```bash
npm run dev
```

The application will start using the local Vite development server.

## Validation and Testing

Run linting with:

```bash
npm run lint
```

If tests are configured in the project, they can be executed through the project's available npm test command.

## Production Build

Create a production build using:

```bash
npm run build
```

The optimized production files will be generated for deployment.

## Deployment

Veltrix Finance can be deployed using Firebase Hosting.

Before deployment:

- Verify Firebase configuration
- Verify database security rules
- Confirm role assignments
- Run the production build
- Test authentication and protected routes

## Security Considerations

The application uses authentication and role-based access to separate functionality.

Administrative roles such as Employee or Manager should only be assigned through trusted application or Firebase administration workflows.

Sensitive credentials, private Firebase configuration files, and service-account credentials should never be committed to the repository.

## What I Practiced

Through this project, I worked with:

- React application development
- Role-based access control
- Firebase Authentication
- Firebase Realtime Database
- Protected application routes
- Multi-role application architecture
- Banking workflow implementation
- CRUD-based data handling
- Authentication state management
- Firebase security rules
- Production builds
- Deployment workflow
- Git and GitHub version control

## Future Improvements

Possible future improvements include:

- Improved dashboard analytics
- Advanced transaction filtering
- More detailed financial reports
- Notification functionality
- Stronger form validation
- Enhanced audit logging
- Better responsive design
- Improved accessibility
- More detailed account activity tracking
- Automated testing coverage

## Author

**Muhammad Daniyal**

Junior Software Developer focused on web, mobile, and backend development.

GitHub:  
https://github.com/Muhammad-Dani-yal

## Disclaimer

Veltrix Finance is a development and portfolio project created to demonstrate full-stack application concepts, authentication, database integration, and role-based banking workflows. It is not intended for use as a real financial institution or production banking platform.
