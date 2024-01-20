#!/bin/sh

#Run your migrations
# for mongodb collections `npx prisma migrate status` won't work besides why use prisma with mongodb 🤷‍♀️
MIGRATION_STATUS=$(npx prisma migrate status)

if echo "$MIGRATION_STATUS" | grep -q "Database schema is up to date"; then
    echo "No migrations needed."
else
    echo "Running migrations..."
    npx prisma migrate deploy
fi

# Run the main container command
exec "$@"