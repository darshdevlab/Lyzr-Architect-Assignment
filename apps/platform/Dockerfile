FROM node:24-alpine AS build
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/platform/package.json ./apps/platform/package.json
COPY apps/assignment/package.json ./apps/assignment/package.json
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate && pnpm install --frozen-lockfile
COPY apps/platform ./apps/platform
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_EDITION=4
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY VITE_EDITION=$VITE_EDITION
RUN pnpm --filter @architect/platform build
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8080
COPY --from=build /repo/apps/platform/dist ./dist
COPY apps/platform/api ./api
COPY apps/platform/package.json ./
COPY apps/platform/scripts/serve.mjs ./serve.mjs
USER node
EXPOSE 8080
CMD ["node","serve.mjs"]
