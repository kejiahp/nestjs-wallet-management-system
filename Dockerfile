### I USED A MULTI STAGE BUILD TO MAKE THINGS SMALLER

###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:20.10.0-alpine As development

# Create app directory
WORKDIR /home/wallet-management

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY --chown=node:node package*.json ./

# Install app dependencies using the `npm ci` command instead of `npm install`
RUN npm ci

# Bundle app source
COPY --chown=node:node . .

# Use the node user from the image (instead of the root user)
USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:20.10.0-alpine As build

WORKDIR /home/wallet-management

COPY --chown=node:node package*.json ./

# In order to run `npm run build` we need access to the Nest CLI which is a dev dependency. In the previous development stage we ran `npm ci` which installed all dependencies, so we can copy over the node_modules directory from the development image
COPY --chown=node:node --from=development /home/wallet-management/node_modules ./node_modules

COPY --chown=node:node . .

# Init prisma client
RUN npx prisma generate


# Run the build command which creates the production bundle
RUN npm run build

# Set NODE_ENV environment variable
ENV NODE_ENV production

# Running `npm ci` removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed. This ensures that the node_modules directory is as optimized as possible
RUN npm ci --only=production && npm cache clean --force

USER node

###################
# PRODUCTION
###################

FROM node:20.10.0-alpine As production

WORKDIR /home/wallet-management

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /home/wallet-management/node_modules ./node_modules
COPY --chown=node:node --from=build /home/wallet-management/dist ./dist
COPY --chown=node:node --from=build /home/wallet-management/package*.json ./
COPY --chown=node:node --from=build /home/wallet-management/ecosystem.config.js ./
COPY --chown=node:node --from=build /home/wallet-management/prisma ./prisma
# COPY --chown=node:node --from=build /home/wallet-management/.env ./
# COPY --chown=node:node --from=build /home/wallet-management/entrypoint.sh ./

#This is basically a script that runs before the container is started
#this isn't necessary here, just left it here for reference
# ENTRYPOINT ["./entrypoint.sh"]

#This isn't all that necessary
# RUN chmod +x /entrypoint.sh

# Start the server using the production build
CMD [ "npm", "run", "start:pm2" ]