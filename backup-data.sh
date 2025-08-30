#!/bin/bash

echo "💾 Creating database backup..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Create backups directory if it doesn't exist
mkdir -p backups

# Create timestamp for backup filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backups/database_backup_${TIMESTAMP}.sqlite"

# Check if database exists
if [ -f "backend/database.sqlite" ]; then
    print_status "Creating backup of database..."
    cp backend/database.sqlite "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        print_success "Database backed up to: $BACKUP_FILE"
        
        # Show backup size
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        print_status "Backup size: $BACKUP_SIZE"
        
        # List recent backups
        echo ""
        print_status "Recent backups:"
        ls -la backups/database_backup_*.sqlite 2>/dev/null | tail -5 || echo "No previous backups found"
        
    else
        print_warning "Failed to create backup"
        exit 1
    fi
else
    print_warning "Database file not found at backend/database.sqlite"
    exit 1
fi

echo ""
print_success "✅ Backup completed successfully!"
echo ""
echo "📁 Backup location: $BACKUP_FILE"
echo "💡 To restore: cp $BACKUP_FILE backend/database.sqlite"
echo ""
