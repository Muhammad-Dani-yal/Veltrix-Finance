# Veltrix Finance

A simple React starter with Firebase Authentication and Realtime Database.

## Included

- Simple navbar and responsive sidebar
- Firebase email/password login and signup
- Firebase authentication state and protected routes
- Per-user Realtime Database CRUD
- Responsive dashboard and items page
- Toast success and error messages

## Start

```bash
npm install
npm run dev
```

Enable Email/Password under Firebase Console → Authentication → Sign-in method.

## Firebase setup

The project configuration is stored locally in `.env`. This file is ignored by
Git. `.env.example` documents the required variable names.

Deploy secure per-user Realtime Database rules with:

```bash
firebase.cmd login
firebase.cmd use --add
firebase.cmd deploy --only database
```

## Checks

```bash
npm run lint
npm run build
```
