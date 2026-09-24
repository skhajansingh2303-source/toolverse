#!/bin/bash
set -e

echo "=========================================================="
echo " Starting Handwritten Notes Converter Studio "
echo "=========================================================="

# Check python3
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is required but not installed."
    exit 1
fi

echo "[*] Launching Web Studio on http://localhost:8000 ..."
python3 app.py
