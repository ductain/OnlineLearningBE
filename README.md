# Simple Express.js API

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   node index.js
   ```

3. For development with automatic restarts, use:
   ```bash
   npm run dev
   ```

4. Visit [http://localhost:3000](http://localhost:3000) in your browser to see the welcome message. 

## Project Structure

- `index.js` - Entry point, sets up the server and middleware.
- `config/default.js` - Configuration (e.g., port number).
- `routes/` - Route definitions.
- `controllers/` - Controller logic for endpoints.
- `services/` - Business logic and reusable service functions.

## Principles Used

- **DRY (Don't Repeat Yourself):** Logic is separated into controllers and routes to avoid duplication.
- **SOLID:**
  - **Single Responsibility:** Each file/module has one responsibility (routing, controller logic, config).
  - **Open/Closed:** Easily add new routes/controllers without modifying existing code.
  - **Liskov Substitution & Interface Segregation:** Controllers can be extended or replaced without affecting route usage.
  - **Dependency Inversion:** Routes depend on controller abstractions, not implementations. 