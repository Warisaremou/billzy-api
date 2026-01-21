# Installation Guide

This guide provides step-by-step instructions for installing and setting up the Invoice API project.

## Prerequisites

- Node.js (v20 or higher)
- Docker and Docker Compose
- npm or pnpm package manager

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Warisaremou/billzy-api.git billzy-api
cd billzy-api
```

### 2. Set Up Environment Variables

Copy the example environment file to create your local configuration:

```bash
cp env-example .env
```

Edit the `.env` file with your configuration:

```env
# APP
NODE_ENV=development
APP_PORT=5050
APP_NAME="Billzy"
API_PREFIX=api
API_VERSION=1.0.0
APP_FALLBACK_LANGUAGE=en
FRONTEND_DOMAIN=http://localhost:4200

# DATABASE (for running outside Docker)
DATABASE_TYPE=mariadb
DATABASE_HOST=localhost
DATABASE_PORT=3309
DATABASE_USERNAME=root
DATABASE_PASSWORD=rootpassword
DATABASE_NAME=my_invoice

# AUTH
AUTH_JWT_SECRET=<generate-secret-here>
```

**Generate a JWT secret** for authentication:

```bash
openssl rand -hex 64
```

Copy the output and paste it as the value for `AUTH_JWT_SECRET` in your `.env` file.

> **Note:** When running outside Docker, use `DATABASE_HOST=localhost` and `DATABASE_PORT=3309`. When running inside Docker containers, use `DATABASE_HOST=dbms` and `DATABASE_PORT=3306`.

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the services with docker compose

```bash
docker compose up -d
```
Wait a few seconds for the services to fully initialize, then verify they are running:

```bash
docker ps
```

### 5. Run Database Migrations

Create the database schema by running migrations:

```bash
npm run migration:run
```

### 6. Seed the Database

Populate the database with initial data:

```bash
npm run seed:run
```

This will create:
- Default roles (super_admin, admin, user)
- 6 sample companies
- 2 sample super_admin users

## Running the Application

### Development Mode

Run the application with hot-reload enabled:

```bash
npm run api:dev
```

## Verify Installation

Once the application is running, you can verify the installation by accessing:

- API Info: `http://localhost:5050/api/info`
- API Documentation (Swagger): `http://localhost:5050/api/docs`

## Database utils

To generate a new migration

```bash
npm run migration:generate -- src/database/migrations/<DescriptionOfMigration>
```
Ex: npm run migration:generate -- src/database/migrations/FirstMigration

Run migration

```bash
npm run migration:run
```

Revert migration

```bash
npm run migration:revert
```

Drop all tables in database

```bash
npm run schema:drop
```

Run seed

```bash
npm run seed:run
```

## Troubleshooting

### Database Connection Issues

If you encounter `ENOTFOUND dbms` error when running outside Docker:
- Ensure your `.env` file has `DATABASE_HOST=localhost` and `DATABASE_PORT=3309`
- Verify the database container is running: `docker ps`

### Port Already in Use

If port 5050 is already in use:
- Change `APP_PORT` in your `.env` file
- Or stop the conflicting service

**You can also create database manually using a database client of your  by connecting to the MariaDB instance.**

## Additional Commands

### Code Quality

Lint and fix code:
```bash
npm run lint
```

Format code with Prettier:
```bash
npm run format
```

### Testing

#### Unit tests

Run tests:
```bash
npm run test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:cov
```

#### Integration tests

Run integration tests:
```bash
npm run test:integration
```

Run integration tests in watch mode:
```bash
npm run test:integration:watch
```

Run integration tests with coverage:
```bash
npm run test:integration:cov
```

#### E2E tests

Run e2e tests:
```bash
npm run test:e2e
```


