# Scriptorium: A Full-Stack Monolith with Code Execution & Blogging

> Developed as part of a team project for the **Programming on the Web** course.

## Overview

**Scriptorium** is a monolithic web application designed with **Next.js** and **React** to enable users and visitors to write, execute, and share code. The platform also supports blogging functionality, including blog creation, commenting, and rating. In its current state, the app uses **SQLite** for data persistence and employs **Docker** to process and run user-submitted code securely and reliably.

Although the project is not fully deployed yet, the code base and Dockerization are set up to make future deployments straightforward. Below, you can find details about the features, tech stack, and how to get started with the project.

---

## Table of Contents

1. [Key Features](#key-features)  
2. [Tech Stack](#tech-stack)  
3. [Architecture](#architecture)  
4. [Running the Project](#running-the-project)  
5. [Core User Stories](#core-user-stories)  
6. [Future Plans](#future-plans)  
7. [Contributing](#contributing)  
8. [License](#license)

---

## Key Features

1. **Code Writing & Execution**  
   - Visitors can write code in various programming languages (C, C++, Java, Python, JavaScript, etc.) and execute it to view real-time results.  
   - Syntax highlighting and real-time output provide a comfortable coding experience.

2. **Docker-based Isolation**  
   - Code execution is handled within secure Docker containers to protect the host system from malicious code.  
   - Ensures time and memory constraints are enforced for all user-submitted programs.

3. **Blog Platform**  
   - Authenticated users can create, edit, or delete blog posts.  
   - Visitors can browse, search, and read blog posts and leave ratings/comments.

4. **Code Templates**  
   - Authenticated users can save their work as templates, with titles, explanations, and tags.  
   - Templates can be forked, reused, and modified by other users.

5. **User Authentication & Profile**  
   - JWT-based authentication for secure logins, signups, and profile edits.  
   - Admin role for managing reports and handling inappropriate content.

6. **Responsive UI**  
   - Built with TailwindCSS (Part 2) for a clean, responsive, and intuitive user interface.  
   - Supports light and dark themes for comfortable coding sessions.

---

## Tech Stack

- **Frontend/SSR**:  
  - [Next.js](https://nextjs.org/) (React-based framework)  
  - [React](https://reactjs.org/)  
  - [TailwindCSS](https://tailwindcss.com/) (Part 2)

- **Backend**:  
  - [Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)  
  - [Prisma](https://www.prisma.io/) as the ORM  
  - [REST](https://en.wikipedia.org/wiki/Representational_state_transfer) for all API endpoints

- **Database**:  
  - [SQLite](https://www.sqlite.org/index.html) in the current setup (for local development/testing)

- **Docker**:  
  - Utilized for code execution and isolation  
  - Plans to host multiple compilers securely inside separate containers

- **Authentication**:  
  - JWT (JSON Web Tokens) for handling sign-up, login, and authorization

---

## Architecture

1. **Monolithic Structure**  
   - All backend logic (REST endpoints, code-execution logic, blog and template management) lives within the Next.js server.  
   - React pages (and eventually a single-page app approach) are integrated into the same repository for a smooth developer experience.

2. **Data Layer**  
   - Prisma serves as an abstraction over the SQLite database.  
   - Migrations are done automatically via Prisma’s CLI for easy schema evolution.

3. **Docker Containers**  
   - Container(s) spin up to compile and execute user-submitted code.  
   - Each container enforces resource constraints (CPU, memory, execution time).

4. **Deployment-Ready**  
   - Even though currently not deployed, the codebase and Docker images are structured to be pushed onto cloud services with minimal changes.

---

## Running the Project

> **Prerequisites**: Node.js (v20+ recommended), npm or yarn, and Docker installed.

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/myk0laUA/Scriptorium-CSC309.git
   cd Scriptorium-CSC309
   ```
2	**Install Dependencies** 
    ```bash
    npm install
 # or
    yarn install
  ```
3  **Database Setup**
    * By default, the project is configured to use SQLite. Prisma migrations are provided to set up the schema.
   ```bash
       npx prisma migrate dev
    ```
4  **Run Development Server**
  ``` bash
   npm run dev
   # or
  yarn dev
  # or
  pnpm dev
  ```
5 **   Open http://localhost:3000 to view the application.**
 
 **Docker-based Code Execution**
    * Ensure Docker is running.
    * Scripts and Dockerfiles in the docker-code-execution folder demonstrate how each language environment is set up for safe, isolated execution.
    * Modify the environment variables to match your local Docker environment.

## Core User Stories
1. **Accounts & Profiles**
    * As a user, sign up/log in/log out, manage profile info (name, email, phone number, avatar).
2. **Code Editor & Execution**
    * As a visitor, write code in a variety of languages (C, C++, C#, Java, Python, JavaScript, Ruby, Go, R, PHP, Swift).
    * Syntax highlighting and real-time output.
    * Ability to provide stdin inputs.
3. **Templates**
    * As an authenticated user, save code snippets as templates, tag them, search them, and fork others’ templates.
4. **Blog Posts & Comments**
    * As an authenticated user, create, edit, or remove blog posts.
    * As a visitor, view and search templates and blogposts, execute code.
    * As an authenitcated user, engage in discussions via comments and replies.
5. **Reporting & Administration**
    * As a user, report inappropriate content.
    * As an admin, review and manage reported blog posts or comments, hide content if necessary.

## Future Plans
* Enhanced Deployment: Transition from local SQLite to a production-grade DB (e.g., PostgreSQL) and deploy on a cloud provider (e.g., AWS, GCP, or Vercel).
* TypeScript Migration: Move the entire codebase to TypeScript for robust type safety.
* UI/UX Enhancements: Continue refining TailwindCSS front-end, adding animations, better error handling, and offline capabilities.


License
This project is licensed under the MIT License. Feel free to use and adapt the code for your own projects.

Project Maintainers:
* Mykola Zhuk
* Daniel Kaloshi
* Parth Vats
