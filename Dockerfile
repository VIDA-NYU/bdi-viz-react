FROM nikolaik/python-nodejs:python3.9-nodejs20 as base

ADD . /home/bdi-viz-react/
WORKDIR /home/bdi-viz-react/

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
WORKDIR /home/bdi-viz-react/

# Install dependencies based on the preferred package manager
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm i; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base AS builder
WORKDIR /home/bdi-viz-react/

COPY --from=deps /home/bdi-viz-react/node_modules ./node_modules
COPY . .

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /home/bdi-viz-react/
RUN npm install concurrently

ENV NODE_ENV=development

COPY --from=builder /home/bdi-viz-react/public ./public
RUN chmod -R 777 /home/bdi-viz-react/

RUN groupadd --gid 1001 nextjs
RUN useradd --uid 1001 --gid 1001 -m nextjs

USER nextjs

ENV PATH="${PATH}:/home/nextjs/.local/bin"
ENV PYTHONPATH="${PYTHONPATH}:/home/nextjs/.local/bin"

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "run", "dev"]