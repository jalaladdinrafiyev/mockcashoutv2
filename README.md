# MockCashoutV2

A simple Express.js mock withdrawal API with structured codebase, logging, and automated tests.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **(Optional) Create a .env file:**
   - You can set environment variables like `PORT` and `WITHDRAWALS_FILE`.

## Usage

- **Start the server:**
  ```bash
  npm start
  ```
  The server will run on `http://localhost:3000` by default.

## API Endpoints

### Health Check
- **GET** `/health`
  - Returns `{ status: 'ok' }` if the server is running.

### Reserve Withdrawal
- **POST** `/api/withdrawals/reserve`
  - **Request Body:**
    ```json
    {
      "wallet_id": "string",
      "amount": number
    }
    ```
  - **Response:**
    ```json
    {
      "withdrawal_id": number,
      "status": "reserved",
      "reserved_amount": number,
      "sentOTP": "56565"
    }
    ```
  - **Validation:**
    - `wallet_id` and `amount` are required.
    - `amount` must be a positive number.

### Process Withdrawal
- **POST** `/api/withdrawals/process`
  - **Request Body:**
    ```json
    {
      "withdrawal_id": number,
      "amount": number
    }
    ```
  - **Response:**
    ```json
    { "status": "pending" }
    ```
  - **Validation:**
    - `withdrawal_id` and `amount` are required.
    - `withdrawal_id` must exist.
    - `amount` must be a positive number.

### Finalize Withdrawal
- **POST** `/api/withdrawals/finalize`
  - **Request Body:**
    ```json
    {
      "withdrawal_id": number,
      "withdrawal_status": "full" | "partial" | "released",
      "amount": number
    }
    ```
  - **Response:**
    ```json
    { "status": "completed" }
    ```
  - **Validation & Business Rules:**
    - `withdrawal_id`, `withdrawal_status`, and `amount` are required.
    - `withdrawal_id` must exist.
    - `withdrawal_status` must be one of:
      - `"full"`: `amount` must equal the reserved amount.
      - `"partial"`: `amount` must be greater than 0 and less than the reserved amount.
      - `"released"`: `amount` must be 0.
    - `amount` must be a non-negative number.

## Error Handling
- All validation errors return HTTP 400 with a descriptive error message.
- Malformed JSON returns HTTP 400 with `{ "error": "Malformed JSON" }`.
- Unhandled errors return HTTP 500 with `{ "error": "Internal server error" }`.

## Logging
- All requests and responses are logged to the console and to `logs/access.log`.
- Errors are logged to `logs/error.log`.
- Each log entry includes a unique request ID for traceability.

## Testing

- **Run all tests (server will be started automatically):**
  ```bash
  npm test
  ```
  This will:
  - Start the server
  - Wait for readiness
  - Run all endpoint tests (valid and invalid cases, including business rules)
  - Shut down the server

## Project Structure

```
mockcashoutv2/
  app.js
  server.js
  controllers/
    withdrawalsController.js
  services/
    withdrawalService.js
  middlewares/
    logger.js
    errorHandler.js
    requestId.js
  utils/
    validation.js
  routes/
    withdrawals.js
  logs/
    access.log
    error.log
  test/
    test.js
  withdrawals.json
  package.json
  package-lock.json
  Dockerfile
  README.md
```

## Environment Variables
- `PORT`: Port to run the server (default: 3000)
- `WITHDRAWALS_FILE`: Path to the withdrawals data file (default: `withdrawals.json`)

## License
MIT 
