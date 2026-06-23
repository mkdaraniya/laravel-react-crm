FROM php:8.4-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    unzip git curl libzip-dev zip default-mysql-client \
    && docker-php-ext-install pdo pdo_mysql zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# copy application files
COPY . /var/www/

# Install Laravel dependencies
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT [ "docker-entrypoint.sh" ]
CMD [ "php-fpm", "-F" ]
