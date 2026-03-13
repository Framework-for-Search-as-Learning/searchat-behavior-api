<p align="center">
  <img src="docs/assets/logo.png" alt="Searchat Behavior Banner" width="50%">
</p>
<p align="center">
A standardized framework for capturing authentic human behavior in search and AI-chat experiments.
</p>
<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-004b8d" alt="Version">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-2fb594" alt="License"></a>
  <img src="https://img.shields.io/badge/Research-Tool-orange" alt="Tool">
</p>

## 📖 Description

This repository contains the backend service for **Searchat Behavior**. It provides the API server that handles experiment
management, business logic, authentication, and data persistence for
both search-based and chat-based experimental tasks.

Built with **NestJS**, this API interacts with the database to manage
configurations and experimental data.

> **⚠️ Note:** If you want to run the full stack (Frontend + Backend +
> Database) together, please refer to the [Searchat Behavior Parent
> Repository](https://github.com/lapic-ufjf/searchat-behavior).
> The instructions below are strictly for running the backend
> **independently** for isolated development or testing.

---

## 🛠️ Prerequisites

The required tools depend on how you plan to run the application:

### 🐳 Option A: Running with Docker (Recommended for quick start)

You only need:

- **Docker** and **Docker Compose**

### 💻 Option B: Running Locally

If you want to run the NestJS application directly on your machine, you
need:

- **Node.js** (v18+ recommended)
- **pnpm** (Or any equivalent package magager such as `npm` or `yarn`)
- **PostgreSQL**

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/lapic-ufjf/searchat-behavior-api.git
cd searchat-behavior-api
```

---

## 2️⃣ Configure Environment Variables

The backend needs environment variables to connect to the database and
manage authentication.

- `DB_USER` -- PostgreSQL user (default: `postgres`)
- `DB_PASSWORD` -- PostgreSQL password (default: `postgres`)
- `DB_NAME` -- Database name (default: `sal`)
- `DB_HOST` -- Database host, if running via Docker, use the service name (postgres-api).If running locally, use localhost (default: `localhost`)
- `SECRET` -- You need to configure yours manually.

### ✅ Alternative A: Using a `.env` file (Recommended for custom setups)

Linux/macOS:

```bash
cp .env.example .env
```

Windows:

```bash
copy .env.example .env
```

Edit the `.env` file with the values above.

### 💻 Alternative B: Using the Command Line (CLI)

You can skip creating a `.env` file and pass the variables directly via
CLI when starting the containers (shown below).

---

## 3️⃣ Run the Application

### 🐳 Method A: Docker

**Using `.env` file (All OS):**

```bash
docker compose up --build
```

**Via CLI (Linux/macOS):**

```bash
DB_USER=postgres DB_PASSWORD=postgres DB_NAME=sal SECRET=your_jwt_secret docker compose up --build
```

**Via CLI (Windows PowerShell):**

```powershell
$env:DB_USER="postgres";
$env:DB_PASSWORD="postgres";
$env:DB_NAME="sal";
$env:SECRET="your_jwt_secret";
docker compose up --build
```

### 💻 Method B: Local Development

1.  Start PostgreSQL.
2.  Install dependencies:

```bash
pnpm install
```

3.  Start development server:

```bash
pnpm start:dev
```

---

## 4️⃣ Accessing the Services

- Backend API: http://localhost:3000/api
- PostgreSQL: localhost:5432

---

## 5️⃣ Stopping the Application

```bash
docker compose down
```

To wipe database volumes:

```bash
docker compose down -v
```

---

## 📄 License

Released under the [MIT license](./LICENSE).
