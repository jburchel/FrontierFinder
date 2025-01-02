#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the current branch name
BRANCH=$(git symbolic-ref --short HEAD)

# Get current timestamp for the commit message
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

echo -e "${YELLOW}Current branch: ${GREEN}$BRANCH${NC}"

# Stage all changes
git add .

# Show status
echo -e "\n${YELLOW}Current status:${NC}"
git status

# Prompt for commit message
echo -e "\n${YELLOW}Enter commit message (press enter to use timestamp as message):${NC}"
read commit_message

# If no message provided, use timestamp
if [ -z "$commit_message" ]; then
    commit_message="Update $TIMESTAMP"
fi

# Commit changes
git commit -m "$commit_message"

# Push to remote
echo -e "\n${YELLOW}Pushing to remote...${NC}"
git push origin $BRANCH

echo -e "\n${GREEN}Done!${NC}" 