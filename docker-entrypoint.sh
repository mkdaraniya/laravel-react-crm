#!/bin/bash
set -e

echo "Fixing permissions..."

chown -R www-data:www-data storage bootstrap/cache || true
chmod -R 755 storage bootstrap/cache || true
chmod 1777 /tmp || true

echo "Running migrations..."

php artisan migrate --force || true

echo "PHPFPM ready to serve requests."

exec "$@"
