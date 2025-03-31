# Wassla Backend

## Overview

This backend project is built using FastAPI and SQLModel for PostgreSQL, and Neomodel for Neo4j. It provides APIs for managing users, posts, comments, and likes.

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
    ```sh
    git clone <repository_url>
    cd backend
    ```

2. Create a virtual environment and activate it:
    ```sh
    python -m venv .venv
    source .venv/bin/activate  # On Windows use `.venv\Scripts\activate`
    ```

3. Install the dependencies:
    ```sh
    pip install -r requirements.txt
    ```

4. Set up the environment variables in a `.env` file:
    ```sh
    DATABASE_URL=postgresql://user:password@localhost/dbname
    NEOMODEL_URL=bolt://neo4j:password@localhost:7687
    ```

5. Run the database migrations:
    ```sh
    alembic upgrade head
    ```

## Configuration

Configuration settings are managed through environment variables. You can set these variables directly in your environment or use a `.env` file.

## Running the Application

To start the FastAPI application, run:
```sh
uvicorn backend.app.main:app --reload
```

The application will be available at `http://127.0.0.1:8000`.

## API Documentation

The API documentation is available at `/docs` when the application is running.

## API Endpoints

### Authentication

- **POST /auth/signup/**: Create a new user.
- **POST /auth/login/**: Authenticate a user and get a token.

### Users

- **GET /users/get/{user_id}/**: Get a user by ID.
- **GET /users/list/**: List all users.
- **PUT /users/update/{user_id}/**: Update a user by ID.
- **DELETE /users/delete/{user_id}/**: Delete a user by ID.

### Posts

- **POST /posts/create/**: Create a new post.
- **GET /posts/get/{post_id}/**: Get a post by ID.
- **GET /posts/get/{user_id}**: List posts by user ID.
- **PUT /posts/update/{post_id}/**: Update a post by ID.
- **DELETE /posts/delete/{post_id}/**: Delete a post by ID.
- **GET /posts/feed/**: Get the feed of all posts.

### Comments

- **POST /comments/create/**: Create a new comment.
- **GET /comments/get/{comment_id}/**: Get a comment by ID.
- **GET /comments/list/**: List all comments.
- **PUT /comments/update/{comment_id}/**: Update a comment by ID.
- **DELETE /comments/delete/{comment_id}/**: Delete a comment by ID.

### Likes

- **POST /likes/create/**: Create a new like.
- **GET /likes/get/{like_id}/**: Get a like by ID.
- **GET /likes/list/**: List all likes.
- **PUT /likes/update/{like_id}/**: Update a like by ID.
- **DELETE /likes/delete/{like_id}/**: Delete a like by ID.

## Models

### User

- **id**: UUID
- **username**: str
- **email**: EmailStr
- **password**: str
- **full_name**: Optional[str]

### Post

- **id**: UUID
- **user_id**: UUID
- **content**: str
- **created_at**: datetime

### Comment

- **id**: UUID
- **post_id**: UUID
- **user_id**: UUID
- **content**: str
- **created_at**: datetime

### Like

- **id**: UUID
- **post_id**: UUID
- **user_id**: UUID
- **created_at**: datetime

## Schemas

### UserCreate

- **id**: Optional[UUID]
- **username**: str
- **email**: EmailStr
- **password**: str
- **full_name**: Optional[str]

### UserResponse

- **id**: UUID
- **username**: str
- **email**: EmailStr
- **full_name**: Optional[str]

### PostCreate

- **post_id**: Optional[UUID]
- **user_id**: UUID
- **content**: str
- **bus_number**: Optional[str]
- **issue_type**: IssueType
- **location**: Optional[Location]
- **severity_level**: SeverityLevel
- **delay_duration**: Optional[int]
- **expected_arrival**: Optional[datetime]
- **created_at**: Optional[datetime]
- **status**: IssueStatus

### PostResponse

- **post_id**: UUID
- **content**: str
- **created_at**: Optional[datetime]
- **user_id**: UUID

### CommentCreate

- **comment_id**: Optional[UUID]
- **post_id**: UUID
- **user_id**: UUID
- **content**: str
- **created_at**: Optional[datetime]

### CommentResponse

- **id**: UUID
- **post_id**: UUID
- **user_id**: UUID
- **content**: str
- **created_at**: Optional[datetime]

### LikeCreate

- **like_id**: Optional[UUID]
- **post_id**: UUID
- **user_id**: UUID
- **created_at**: Optional[datetime]

### LikeResponse

- **id**: UUID
- **post_id**: UUID
- **user_id**: UUID
- **created_at**: Optional[datetime]

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
