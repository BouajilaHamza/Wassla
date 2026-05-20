FROM python:3.12.7-slim

WORKDIR /backend

RUN pip install uv
COPY pyproject.toml pyproject.toml

RUN uv sync

COPY . .

EXPOSE 8080
CMD ["uv", "run", "gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "app.main:app", "--bind", "0.0.0.0:8080", "--timeout", "120"]

