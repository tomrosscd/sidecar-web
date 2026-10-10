# Build locally first (see RELEASE.md): `pnpm release` does it. Upload only the compiled site, never source.
FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY --chown=node:node out ./out
COPY --chown=node:node server/static-server.mjs ./server/static-server.mjs
USER node
EXPOSE 8080
CMD ["node", "server/static-server.mjs"]
