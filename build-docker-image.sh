# input the domain name
read -p "Enter the host name (include http or https, and port also): " host_name

cd frontend
echo -e "VITE_APP_NAME=App001\nVITE_MOCK_API_ON=false\nVITE_BACKEND_SERVER=$host_name\nVITE_API_BASE_URL=" > .env.production
npm run build
cd ../backend
rm -rf ./public
cp -r ../frontend/dist ./public
docker build -t app001:latest .

# check image contents:
# docker run --rm -it app001:latest sh