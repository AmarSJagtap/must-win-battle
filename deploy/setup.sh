#!/bin/bash

# Exit on error
set -e

install_nodejs() {
    if command -v apt &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt install -y nodejs
    elif command -v yum &> /dev/null; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
        sudo yum install -y nodejs
    fi
}

echo "Starting deployment setup for MWB Tracker..."

# 1. Update and install dependencies
echo "Installing system dependencies..."
if command -v apt &> /dev/null; then
    sudo apt update && sudo apt upgrade -y
    sudo apt install -y nginx python3 python3-dev python3-venv python3-pip build-essential pkg-config rustc cargo git curl
elif command -v yum &> /dev/null; then
    sudo yum update -y
    sudo yum install -y nginx python3.11 python3.11-devel python3.11-pip gcc gcc-c++ rust cargo git curl
else
    echo "Unsupported package manager. Please use Ubuntu (apt) or Amazon Linux (yum)."
    exit 1
fi

# 2. Install Node.js and PM2
echo "Installing Node.js and PM2..."
install_nodejs
sudo npm install -g pm2

# Detect correct home directory whether running as ubuntu or root
if [ "$EUID" -eq 0 ] && [ -n "$SUDO_USER" ]; then
    USER_HOME=$(getent passwd "$SUDO_USER" | cut -d: -f6)
elif [ "$EUID" -eq 0 ]; then
    USER_HOME="/root"
else
    USER_HOME=$HOME
fi

# 3. Clone or Pull Repository
if [ ! -d "$USER_HOME/must-win-battle" ]; then
    echo "Cloning repository..."
    cd $USER_HOME
    git clone https://github.com/AmarSJagtap/must-win-battle.git
else
    echo "Repository already exists. Pulling latest changes..."
    cd $USER_HOME/must-win-battle
    git pull
fi

cd $USER_HOME/must-win-battle

# 4. Setup Backend
echo "Setting up backend..."
cd backend

# Use a stable python version to avoid compiling Rust packages from source
if command -v python3.11 &> /dev/null; then
    PYTHON_CMD="python3.11"
elif command -v python3.12 &> /dev/null; then
    PYTHON_CMD="python3.12"
elif command -v python3.10 &> /dev/null; then
    PYTHON_CMD="python3.10"
else
    PYTHON_CMD="python3"
fi

echo "Using Python version: $PYTHON_CMD"
# Remove any broken virtual environment
rm -rf venv
$PYTHON_CMD -m venv venv
source venv/bin/activate

# Upgrade pip, setuptools, and wheel to ensure we download pre-built binaries (no Rust compiling needed)
pip install --upgrade pip setuptools wheel

pip install -r requirements.txt

# Copy environment variables if provided
if [ -f "$USER_HOME/mwb-env" ]; then
    cp $USER_HOME/mwb-env .env
    echo "Environment variables copied."
else
    echo "Warning: No mwb-env file found. Make sure to set your Azure OpenAI credentials in backend/.env"
fi

# Start backend with PM2
echo "Starting backend process..."
pm2 start "uvicorn main:app --host 127.0.0.1 --port 8000" --name "mwb-backend"
pm2 save

# 5. Setup Frontend
echo "Setting up frontend..."
cd ../frontend
npm install
npm run build

# 6. Configure Nginx
echo "Configuring Nginx..."

# Check if using Ubuntu structure (sites-available) or Amazon Linux structure (conf.d)
if [ -d "/etc/nginx/sites-available" ]; then
    NGINX_CONF_FILE="/etc/nginx/sites-available/mwb"
    NGINX_LINK_FILE="/etc/nginx/sites-enabled/mwb"
    sudo rm -f /etc/nginx/sites-enabled/default
else
    NGINX_CONF_FILE="/etc/nginx/conf.d/mwb.conf"
    NGINX_LINK_FILE=""
fi

sudo cat > $NGINX_CONF_FILE << EOF
server {
    listen 80;
    server_name _;

    root $USER_HOME/must-win-battle/frontend/dist;
    index index.html;

    # Frontend Routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

if [ -n "$NGINX_LINK_FILE" ]; then
    sudo ln -sf $NGINX_CONF_FILE $NGINX_LINK_FILE
fi

sudo nginx -t
sudo systemctl restart nginx

# 7. Final instructions
echo "--------------------------------------------------------"
echo "Deployment successful!"
echo "Your application should now be accessible via the server's public IP."
echo "--------------------------------------------------------"
echo "To ensure PM2 starts on reboot, run the following command and follow its instructions:"
echo "pm2 startup"
