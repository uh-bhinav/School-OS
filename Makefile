# ----------------------------------------
# Makefile for local Supabase test setup
# ----------------------------------------

DB_URL=postgres://postgres:postgres@localhost:54322/postgres

# 1️⃣ Restore only schema (structure)
restore-schema:
	psql $(DB_URL) -f ./supabase/schema.sql

# 2️⃣ Restore both schema + data (recommended for testing)
restore-local:
	psql $(DB_URL) -f ./supabase/schema.sql
	psql $(DB_URL) -f ./supabase/schema_with_data.sql

# 3️⃣ Start local Supabase if not already running
start-supabase:
	supabase start

# 4️⃣ Run test suite
test: restore-local
	poetry run pytest -v --disable-warnings
