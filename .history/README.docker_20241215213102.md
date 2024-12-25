# Docker Deployment Guide

## Prerequisites
- Docker
- Docker Compose
- Environment variables file (.env)

## Environment Variables
Create a `.env` file in the project root with the following variables:
```
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
JWT_SECRET=your_jwt_secret_key
```

## Deployment Steps

1. Ensure you have Docker and Docker Compose installed

2. Build and start the application:
```bash
docker-compose up --build
```

3. To run in detached mode:
```bash
docker-compose up -d --build
```

4. To stop the application:
```bash
docker-compose down
```

## Accessing the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432

## Troubleshooting
- Check logs: `docker-compose logs`
- Inspect specific service: `docker-compose logs [service_name]`

## Database Migrations
Before first run, you may need to run database migrations:
```bash
docker-compose exec backend npm run migrate
```

## Environment Considerations
- Ensure all sensitive information is stored in the `.env` file
- Never commit `.env` to version control
- Adjust ports and configurations as needed for your specific environment
