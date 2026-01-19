#!/bin/bash

# Script to clear TypeScript cache and restart language server

echo "🔄 Clearing TypeScript cache..."

# Remove node_modules/.cache if it exists
if [ -d "node_modules/.cache" ]; then
  rm -rf node_modules/.cache
  echo "✅ Cleared node_modules/.cache"
fi

# Touch all the student detail component files to force re-check
echo "🔄 Touching student detail component files..."
touch src/app/routes/academics/students/StudentDetailPage.tsx
touch src/app/routes/academics/students/components/*.tsx

echo "✅ Done! Now restart VS Code's TypeScript server:"
echo "   1. Press Cmd+Shift+P"
echo "   2. Type: 'TypeScript: Restart TS Server'"
echo "   3. Press Enter"
echo ""
echo "Or just reload the VS Code window:"
echo "   1. Press Cmd+Shift+P"
echo "   2. Type: 'Developer: Reload Window'"
echo "   3. Press Enter"
