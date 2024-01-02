# Use the official postgresql image with postgis extension
FROM postgis/postgis:latest

# Install pgvector extension from source
RUN apt-get update && apt-get install -y git make gcc postgresql-server-dev-15
RUN cd /tmp && git clone --branch v0.4.2 https://github.com/pgvector/pgvector.git && cd pgvector && make && make install

# Enable pgvector extension in the database
RUN echo "CREATE EXTENSION vector;" >> /docker-entrypoint-initdb.d/init.sql
