<h1 align="center">
  Scriptorium
  <br/>
  <sub>A full-stack platform for writing, executing & sharing code + blogging</sub>
</h1>

<p align="center">
  <a href="http://3.17.227.214/" target="_blank">
    <img src="https://img.shields.io/badge/Live-Demo-blue?logo=amazon-aws&style=for-the-badge" alt="live demo"/>
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/Myk0laUA/Scriptorium-CSC309?style=for-the-badge" />
  </a>
</p>

> Built for **CSC309 – Programming on the Web** (University of Toronto).  
> Deployed on AWS EC2 with Docker.

---

## 🗺️ Table of Contents

1. [Key Features](#key-features)  
2. [Tech Stack](#tech-stack)  
3. [Architecture](#architecture)  
4. [Running Locally](#running-locally)  
5. [Core User Stories](#core-user-stories)  
6. [Roadmap](#roadmap)  

---

## 🚀 Key Features(#key-features)

| Domain              | Highlights                                                                                                                                     |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| **Code Execution**  | Real-time editor with syntax highlighting, stdin support, and Docker-isolated runners for **10+ languages** (C, C++, Java, Python, JS, Go, etc.) |
| **Templates**       | Save, tag, fork, and search reusable code snippets.                                                                                            |
| **Blog Engine**     | Create, comment, and rate posts. Visitors can browse without logging in.                                                                       |
| **Auth & Roles**    | JWT-based auth (guest/user/admin) with secure profile management and content moderation.                                                        |
| **Responsive UI**   | React + TailwindCSS with automatic light/dark themes.                                                                                          |
| **Security**        | Docker resource limits (CPU, RAM, exec time) and input sanitization.                                                                           |

---

## 🛠️ Tech Stack(#tech-stack)

| Layer           | Technology                                                  |
|-----------------|-------------------------------------------------------------|
| **Frontend**    | Next.js 14, React 18, TailwindCSS                           |
| **Backend APIs**| Next.js API Routes (REST)                                   |
| **Database**    | Prisma ORM → SQLite (local) / PostgreSQL (production-ready) |
| **Code Runner** | Docker containers spawned per request                       |
| **Auth**        | JWT                                                         |
| **Infra**       | AWS EC2, Nginx                                              |

---

## 🧩 Architecture(#architecture) 

```text
┌─────────┐   REST    ┌────────────────────┐
│ React   │◄────────►│ Next.js API Routes │
└─────────┘           └─────────┬──────────┘
                                │
                                ▼
                         ┌────────────┐
                         │ Prisma ORM │
                         └────┬───────┘
                              ▼
                    ┌───────────────────┐
                    │ SQLite / Postgres │
                    └───────────────────┘

           ┌───────────────────────┐
           │ Docker Runner Pool    │
           │  (code isolation)     │
           └───────────────────────┘

```
* Each execution request spins/borrows a language-specific container.  
* Resource limits set via Docker flags (`--cpus`, `--memory`, `--timeout`).  
* Swap `DATABASE_URL` to move from SQLite to Postgres.



## 🏃‍♂️ Running Locally (Docker)

> **Prerequisites:** Docker & Docker Compose

```bash
# Clone & build all services, then launch
git clone https://github.com/Myk0laUA/Scriptorium-CSC309.git
cd Scriptorium-CSC309
./startup.sh --build-only
docker compose up --build
```
Once containers spin up, visit http://localhost:3000

## 📚 Core User Stories

<details> <summary>Click to expand</summary>
Accounts & Profiles – sign-up, log-in, edit profile, upload avatar.

Code Editor & Execution – write, run, and fork snippets; custom stdin.

Templates – save snippets, tag, search, fork others’ templates.

Blog & Comments – create, edit, delete posts; threaded comments & ratings.

Reporting & Admin – users report content; admins moderate.

</details>

## 🛣️ Roadmap

Full TypeScript migration

Kubernetes runner pool for horizontal scaling

OAuth 2.0 log-in (GitHub, Google)

Markdown WYSIWYG editor for posts
