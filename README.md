# Favorite Movies & TV Shows — Backend

> Production-ready backend for **Favorite Movies & TV Shows** — Node.js + Express API with MySQL (Prisma ORM), Dockerized for local development.

## 🔎 Project summary
This project implements a full-featured backend for managing users' favorite movies and TV shows with:
- User authentication & authorization (JWT)
- Admin approval workflow for new entries
- CRUD for movies / TV shows with role-based restrictions
- File uploads (posters) to S3-compatible storage (MinIO)
- Advanced filtering, search, multi-column sorting, cursor pagination
- Swagger API documentation (`/api-docs`)
- Dockerized (backend, MySQL, MinIO) + Prisma migrations & seed script

---

## 🧰 Technology stack
- Node.js + Express
- Prisma ORM (MySQL)
- Docker, docker-compose
- MinIO (S3-compatible) for uploads
- Zod / Joi (request validation)
- Swagger/OpenAPI for docs
- Jest / Supertest for tests

---

## 🚀 Quick start (recommended: Docker)
> Works on Windows / macOS / Linux with Docker Engine (Docker Desktop).

1. Clone repo:
```bash
git clone https://github.com/<your-username>/favorite-movies-app.git
cd favorite-movies-app

