#!/bin/bash

# Exit on error
set -e

echo "Starting deployment setup for MWB Tracker..."

# 1. Update and install dependencies
echo "Installing system dependencies..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx python3-pip python3-venv git curl

# 2. Install Node.js and PM2
echo "Installing Node.js and PM2..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
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
python3 -m venv venv
source venv/bin/activate
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
sudo cat > /etc/nginx/sites-available/mwb << EOF
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

sudo ln -sf /etc/nginx/sites-available/mwb /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 7. Final instructions
echo "--------------------------------------------------------"
echo "Deployment successful!"
echo "Your application should now be accessible via the server's public IP."
echo "--------------------------------------------------------"
echo "To ensure PM2 starts on reboot, run the following command and follow its instructions:"
echo "pm2 startup"
