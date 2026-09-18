-- Run once against your local PostgreSQL (psql -U postgres -f scripts/init-db.sql)
CREATE USER makemeviral WITH PASSWORD 'makemeviral' CREATEDB;
CREATE DATABASE makemeviral OWNER makemeviral;
GRANT ALL PRIVILEGES ON DATABASE makemeviral TO makemeviral;
