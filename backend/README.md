# Wassla Backend

## Overview

Wassla is a backend service designed to provide comprehensive API functionalities for the Wassla application. This service is built using FastAPI, a modern, fast (high-performance), web framework for building APIs with Python 3.7+ based on standard Python type hints.

## Features

- FastAPI for high-performance API endpoints
- Asynchronous programming for efficient handling of requests
- Modular architecture with routers for different API versions
- Configuration management using environment variables

## Requirements

- Python 3.7+
- FastAPI
- Other dependencies listed in `uv` configuration

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/wassla-backend.git
    cd wassla-backend
    ```

2. Install `uv` if you haven't already:
    ```bash
    pip install uv
    ```

3. Use `uv` to set up the environment and install dependencies:
    ```bash
    uv setup
    ```

## Configuration

Configuration settings are managed through environment variables. You can set these variables directly in your environment or use a `.env` file.

## Running the Application

To run the application, use the following command:
```bash
uvicorn app.main:app --reload
```

The application will be available at `http://127.0.0.1:8000`.

## API Documentation

FastAPI automatically generates interactive API documentation. You can access it at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.