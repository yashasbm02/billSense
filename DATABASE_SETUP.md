# Database Setup Instructions

## Prerequisites

You need PostgreSQL installed and running on your system.

### Install PostgreSQL (if not already installed)

**On macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**On Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**On Windows:**
Download and install from https://www.postgresql.org/download/windows/

## Setup Database

1. **Create the database:**
   ```bash
   createdb billsense
   ```

2. **Run the schema:**
   ```bash
   psql -d billsense -f database/schema.sql
   ```

3. **Verify the setup:**
   ```bash
   psql -d billsense -c "\dt"
   ```

   You should see tables like:
   - bills
   - bill_items
   - bill_participants
   - item_assignments
   - bill_splits
   - users

## Alternative: SQLite Setup (for quick testing)

If you prefer to use SQLite for development, you can modify the backend to use SQLite instead:

1. **Install SQLite dependencies:**
   ```bash
   cd backend
   npm install sqlite3
   ```

2. **Update the database connection** in `backend/src/database/connection.ts` to use SQLite.

## Configuration

Update the database credentials in `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=billsense
DB_USER=your_username
DB_PASSWORD=your_password
```

## Troubleshooting

### Connection Issues
- Check if PostgreSQL is running: `pg_isready`
- Verify credentials: `psql -d billsense -U your_username`
- Check port availability: `lsof -i :5432`

### Permission Issues
- Create a PostgreSQL user: `createuser -s your_username`
- Grant permissions: `GRANT ALL PRIVILEGES ON DATABASE billsense TO your_username;`

### Schema Issues
- Drop and recreate: `dropdb billsense && createdb billsense`
- Re-run schema: `psql -d billsense -f database/schema.sql`
