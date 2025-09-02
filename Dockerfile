# PostgreSQL database for local development
FROM postgres:15-alpine

# Default development credentials
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=trae

EXPOSE 5432
