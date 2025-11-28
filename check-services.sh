#!/bin/bash

echo "=== Checking Services ==="
echo "Frontend (port 3001):"
curl -I http://localhost:3001 2>/dev/null || echo "❌ Frontend not responding on port 3001"

echo -e "\nBackend (port 3000):"
curl -I http://localhost:3000 2>/dev/null || echo "❌ Backend not responding on port 3000"

echo -e "\n=== Port Status ==="
netstat -tlnp | grep -E ':(3000|3001)'

echo -e "\n=== PM2 Status ==="
pm2 list

echo -e "\n=== Nginx Status ==="
sudo systemctl status nginx --no-pager -l