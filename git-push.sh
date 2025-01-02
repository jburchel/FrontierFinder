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

# Generate commit message based on changed files
CHANGED_FILES=$(git diff --cached --name-only)
COMMIT_MSG="Updated:"

# Process each changed file
for file in $CHANGED_FILES; do
    # Get the type of change (modified, added, deleted)
    if [ -f "$file" ]; then
        if git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
            CHANGE_TYPE="Modified"
        else
            CHANGE_TYPE="Added"
        fi
    else
        CHANGE_TYPE="Deleted"
    fi
    
    # Add to commit message
    COMMIT_MSG="$COMMIT_MSG\n- $CHANGE_TYPE $file"
done

# Show the generated message and ask for confirmation
echo -e "\n${YELLOW}Generated commit message:${NC}"
echo -e "$COMMIT_MSG"
echo -e "\n${YELLOW}Press Enter to use this message or type a new one:${NC}"
read user_message

# Use user message if provided, otherwise use generated message
if [ -z "$user_message" ]; then
    git commit -m "$COMMIT_MSG"
else
    git commit -m "$user_message"
fi

# Push to remote
echo -e "\n${YELLOW}Pushing to remote...${NC}"
git push origin $BRANCH

echo -e "\n${GREEN}Done!${NC}" 