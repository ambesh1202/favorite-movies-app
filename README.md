# Favorite Movies & TV Shows App (Backend)

## 📌 Project Summary
A production-ready backend to manage favorite Movies & TV Shows.  
Includes:
- JWT authentication (Admin & User roles)  
- CRUD for movies/TV shows  
- Admin approval workflow  
- File uploads (S3/MinIO)  
- Advanced search, filters, sorting, infinite scroll (via pagination)  
- Swagger API docs  

---

## ⚙️ Tech Stack
- Node.js (Express)  
- MySQL + Prisma ORM  
- Docker & docker-compose  
- Zod / Joi validation  
- Jest + Supertest (backend tests)  

---

## 🚀 Quick Start (Docker)

```bash
git clone https://github.com/ambesh1202/favorite-movies-app.git
cd favorite-movies-app

# Copy env file
cp server/.env.example server/.env

# Start services
docker-compose up --build -d

# First-time setup inside backend container
docker-compose exec backend sh
npm install
npx prisma migrate deploy --schema=./prisma/schema.prisma
node prisma/seed.js
exit
