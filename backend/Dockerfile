# Dockerfile
FROM python:3.11-slim as builder
WORKDIR /app
RUN pip install poetry
COPY poetry.lock pyproject.toml ./
RUN poetry config virtualenvs.create false && poetry install --no-dev --no-interaction --no-ansi

FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /app/ /app/
COPY ./app /app/app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
