FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:20

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
