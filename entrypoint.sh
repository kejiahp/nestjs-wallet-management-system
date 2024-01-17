#!/bin/sh

#Run your migrations
npx prisma migrate deploy

# Run the main container command
exec "$@"