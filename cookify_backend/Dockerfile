# Используем официальный легковесный образ Python
FROM python:3.11-slim

# Настраиваем переменные окружения
# PYTHONDONTWRITEBYTECODE - запрещает Python писать .pyc файлы на диск
# PYTHONUNBUFFERED - отключает буферизацию stdout/stderr, логи идут сразу в консоль
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Создаем системную группу и пользователя (non-root) для безопасности
RUN addgroup --system appgroup && adduser --system --group appuser

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем сначала файлы зависимостей
# Это максимизирует использование кэша Docker слоев: pip install запустится снова 
# только если requirements.txt был изменен.
COPY requirements.txt .

# Устанавливаем зависимости (без кэша самого pip, чтобы уменьшить вес образа)
RUN pip install --no-cache-dir -r requirements.txt

# Копируем остальной исходный код проекта
COPY . .

# Меняем владельца файлов на созданного пользователя
RUN chown -R appuser:appgroup /app

# Переключаемся на непривилегированного пользователя
USER appuser

# Открываем порт, на котором будет работать приложение
EXPOSE 8000

# Запуск сервера
# Обязательно указываем хост 0.0.0.0, чтобы uvicorn принимал запросы извне контейнера
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]