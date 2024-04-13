stop-container:
	-docker stop aek-music

delete-container:
	-docker rm aek-music

delete-image:
	docker rmi aek-music

build:
	docker build -t aek-music . || (echo "Error: Docker build failed."; exit 1)

run:
	docker run -d --restart unless-stopped --name aek-music -p $(PORT) aek-music

deploy:
	git fetch --all
	git pull
	make stop-container
	make delete-container
	make build
	make run PORT=$(PORT)