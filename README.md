# Veltrix Finance

Role-based Enterprise Banking Management System built with React, Vite, Firebase Authentication, Realtime Database and Firebase Hosting.

## Portals and roles

- Customer: view account and approved ledger balance, submit financial requests, view history, manage password and contact support.
- Employee: create customer access, review customers, process standard loans/transactions and support requests.
- Manager: manage employees, initiate employee password resets, approve high-value loans, review reports and audit activity.

Customers and employees cannot self-register. Authorized bank staff issue their accounts. Customer passwords can be changed after reauthentication or reset through the registered email. Employee password resets are initiated by a Manager and completed through Firebase's verified email link.

## Local setup

```bash
npm install
copy .env.example .env
npm run dev
```

Fill every `VITE_FIREBASE_*` value and `VITE_MANAGER_EMAIL` in `.env`. Enable Email/Password authentication in Firebase Console.

## Checks

```bash
npm run lint
npm test
npm run build
```

## Deployment

```bash
npx firebase login
npx firebase deploy --only database
npx firebase deploy --only hosting
```

The active Spark-plan workflow uses immutable approved request records to calculate balances; clients do not directly edit stored balances. The `functions/` directory is retained as a future trusted-backend implementation but is not part of the free-plan deployment.

## Security notes

- `.env`, build output, Firebase cache and logs must never be committed.
- Realtime Database Rules enforce customer isolation and role-specific request decisions.
- Employee password values are never shown to Managers. Managers send verified reset links to registered employee emails.
- For production banking, move financial decisions and account provisioning to a trusted Admin SDK backend before handling real funds.
