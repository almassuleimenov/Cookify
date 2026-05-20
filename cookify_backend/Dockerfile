# Используем официальный легковесный образ Python
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN addgroup --system appgroup && adduser --system --group appuser

WORKDIR /app

# Копируем requirements.txt с указанием правильного пути из корня монорепозитория
COPY cookify_backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код бэкенда в рабочую директорию контейнера
COPY cookify_backend/ .

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]