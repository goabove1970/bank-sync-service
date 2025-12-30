# Bank Sync Service

A TypeScript-based microservice for managing bank connections and synchronizing bank account transactions. This service provides REST APIs for adding, updating, removing, and synchronizing bank connections, as well as managing associated accounts.

## Features

- **Bank Connection Management**: Add, update, remove, and retrieve bank connections
- **Account Synchronization**: Sync transactions from connected bank accounts
- **Transaction Processing**: Import and process bank transactions
- **OFX Support**: Integration with banks via OFX protocol
- **Scheduled Sync**: Automatic periodic synchronization of bank accounts
- **PostgreSQL Integration**: Persistent storage for bank connections and accounts

## Prerequisites

- Node.js (v12 or higher recommended)
- npm or yarn
- PostgreSQL database
- TypeScript 4.9+
- **Account Service** (external dependency) - This service requires an account management service to be running. See [Service Dependencies](#service-dependencies) below.

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bank-sync-service
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
   
   The service requires a PostgreSQL database. Set up the database schema using one of the following methods:
   
   **Option 1: Using the Node.js setup script (Recommended)**
   ```bash
   npm run db:setup
   ```
   
   Or directly:
   ```bash
   node database/setup.js
   ```
   
   The script uses the database configuration from `app.config.ts` (LOCAL_CONFIG for development). You can override with environment variables:
   ```bash
   DB_HOST=localhost DB_PORT=5432 DB_NAME=postgres DB_USER=postgres DB_PASSWORD=yourpassword npm run db:setup
   ```
   
   **Option 2: Using the shell setup script (requires psql)**
   ```bash
   cd database
   chmod +x setup.sh
   ./setup.sh
   ```
   
   **Option 3: Manual setup with psql**
   ```bash
   psql -h localhost -U postgres -d postgres -f database/schema.sql
   ```
   
   See `database/README.md` for detailed database setup instructions and troubleshooting.

4. Configure the application by editing `app.config.ts`:
   - Update database connection settings (host, port, login, password, database) to match your database setup
   - Configure API service settings (url, port) - this should point to your Account Service
   - **Important**: The Account Service must be running for sync operations to work

5. Start the Account Service (if available):
   - This service requires an external Account Service to be running
   - Ensure the Account Service is accessible at the URL/port specified in `ApiServiceConfig`
   - Without the Account Service, only read/update/delete bank connection operations will work
   - See [Service Dependencies](#service-dependencies) for more details

6. Build the project:
```bash
npm run build
```

## Configuration

The application uses `app.config.ts` for configuration. Two configuration modes are available:

- **Production**: Default configuration (connects to production database)
- **Development**: Activated when `NODE_ENV=development` (uses local database settings)

### Environment Variables

- `NODE_ENV`: Set to `development` for local development mode
- `PORT`: Server port (default: 9300)

## Running the Application

### Prerequisites Before Starting

**Important**: Before starting the service, ensure:
1. PostgreSQL database is running and the schema is set up (`npm run db:setup`)
2. Account Service is running (required for sync operations)
3. Database and Account Service connection details are correct in `app.config.ts`

### Development Mode

```bash
npm run start-local
```

This sets `NODE_ENV=development` and starts the server on port 9300.

**Note**: If you get `ECONNREFUSED` errors when using sync operations, check that the Account Service is running at the configured URL/port.

### Production Mode

```bash
npm start
```

The server will start on port 9300 (or the port specified in the `PORT` environment variable).

## API Endpoints

### Bank Connections

All bank connection operations are available at `/bank-connections`

**POST /bank-connections** - Process bank connection requests

Request body format:
```json
{
  "action": "add-bank-connection" | "remove-bank-connection" | "update-bank-connection" | "get-bank-connections" | "sync",
  "args": {
    "userId": "string",
    "connectionId": "string (optional)",
    "bankName": "string",
    "login": "string",
    "password": "string",
    "suspend": "boolean (optional)"
  }
}
```

**Available Actions:**

1. **add-bank-connection**: Add a new bank connection
2. **remove-bank-connection**: Remove an existing bank connection
3. **update-bank-connection**: Update bank connection credentials or status
4. **get-bank-connections**: Retrieve bank connections for a user
5. **sync**: Synchronize transactions from a bank connection

## Development

### Project Structure

```
bank-sync-service/
├── src/
│   ├── controllers/        # Business logic controllers
│   │   ├── account-controller/
│   │   ├── bank-controller/
│   │   ├── sync-controller/
│   │   ├── scheduler/
│   │   └── transaction-processor-controller/
│   ├── models/             # Data models and types
│   ├── routes/             # Express route handlers
│   ├── utils/              # Utility functions
│   └── test/               # Test files
├── database/               # SQL schema files
├── bin/                    # Application entry point
├── dist/                   # Compiled JavaScript (generated)
└── app.ts                  # Express app setup
```

### Building

```bash
npm run build
```

This compiles TypeScript files to JavaScript in the `dist/` directory.

### Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:jest
```

### Code Formatting

Check code formatting:
```bash
npm run prettier:check
```

Format code:
```bash
npm run prettier:write
```

## Testing

The project uses Jest for testing. Test files are located in `src/test/` and follow the naming pattern `*.test.ts`.

### Test Coverage

Current test coverage includes:
- Account Controller
- Bank Controller
- Sync Controller
- Utility functions (accountUtils, generateGuid, ChaseParseHelper)
- Route utilities

## Dependencies

### Main Dependencies

- **express**: Web framework
- **ts-postgres**: PostgreSQL client
- **moment**: Date/time manipulation
- **winston**: Logging
- **body-parser**: Request body parsing
- **cors**: Cross-origin resource sharing

### Development Dependencies

- **typescript**: TypeScript compiler
- **jest**: Testing framework
- **ts-jest**: TypeScript preprocessor for Jest
- **prettier**: Code formatter
- **@types/node**: TypeScript definitions for Node.js
- **@types/jest**: TypeScript definitions for Jest

## Scripts

- `npm start` - Start the production server
- `npm run start-local` - Start the development server
- `npm run build` - Build the project
- `npm run compile` - Compile TypeScript
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:jest` - Run tests with coverage
- `npm run prettier:check` - Check code formatting
- `npm run prettier:write` - Format code

## Version Management

The project includes scripts for version bumping:

- `npm run patch` - Bump patch version (e.g., 4.0.0 → 4.0.1)
- `npm run minor` - Bump minor version (e.g., 4.0.0 → 4.1.0)
- `npm run major` - Bump major version (e.g., 4.0.0 → 5.0.0)
- `npm run db:setup` - Set up the database schema (creates tables and indexes)

## Database Schema

The service requires a PostgreSQL database with the `bank_connections` table. The database schema is defined in `database/schema.sql`.

### Required Table

- **bank_connections**: Stores bank connection credentials and synchronization status

The schema includes:
- Table definition with all required columns
- Indexes for optimal query performance
- Column comments for documentation

For detailed database setup instructions, troubleshooting, and schema documentation, see `database/README.md`.

**Note**: This service manages the `bank_connections` table directly. Account and transaction data are managed by a separate account service (configured via `ApiServiceConfig` in `app.config.ts`).

## Logging

The application uses Winston for logging. Logs are configured in `src/logger.ts`.

## Error Handling

The application includes error handling middleware and custom error types defined in `src/models/errors/`.

## Service Dependencies

This service has dependencies on external services that must be running:

### Account Service (Required)

The Bank Sync Service depends on an external **Account Service** that manages user accounts and transactions. This service must be running and accessible for sync operations to work.

**Configuration:**
- Default location: `127.0.0.1:9000` (configured in `app.config.ts` via `ApiServiceConfig`)
- Endpoints used:
  - `GET /accounts` - Read accounts
  - `POST /accounts` - Create accounts
  - `POST /accounts` (action: assign-user) - Assign users to accounts

**When the account service is not available:**
- Operations that require account data (sync, add-bank-connection) will fail with `ECONNREFUSED` errors
- Bank connection read/update/delete operations will still work (they only use the local database)

**To use without the account service:**
- You can only perform operations that don't require account data:
  - `get-bank-connections` - Read bank connections
  - `remove-bank-connection` - Delete a bank connection
  - `update-bank-connection` - Update connection credentials (if not validating)
- Sync operations and account creation require the account service

### Transaction Service (Optional)

Transaction import operations also require an external service at `/transactions` endpoint, but this is typically part of the same account service.

## Security Considerations

- Database credentials are stored in `app.config.ts` - ensure this file is not committed to version control in production
- Consider using environment variables for sensitive configuration
- Passwords are stored but should be encrypted in production
- The service uses CORS - configure appropriately for your environment
- External service credentials and endpoints should be secured appropriately

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure tests pass (`npm test`)
4. Format code (`npm run prettier:write`)
5. Submit a pull request

## License

[Add your license information here]

## Support

[Add support information here]

