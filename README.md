# Files Manager

This project is a simple file management API built with Node.js, Express, MongoDB, and Redis.

## Setup

1. Ensure you have Node.js (v12.x.x) installed.
2. Clone this repository.
3. Run `npm install` to install dependencies.
4. Ensure Redis is installed and running on your machine.
5. Start the server with `npm run start-server`.
6. Start the worker with `npm run start-worker`.

## Available Scripts

- `npm run lint`: Run ESLint
- `npm run check-lint`: Check JavaScript files with ESLint
- `npm run start-server`: Start the Express server
- `npm run start-worker`: Start the background worker
- `npm run dev`: Start the server in development mode
- `npm test`: Run the test suite

## API Endpoints

(To be implemented in future tasks)

## File Structure

- `server.js`: Main Express server file
- `worker.js`: Background worker for processing jobs
- `utils/redis.js`: Redis utility functions
- `tests/`: Test files

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the ISC License.