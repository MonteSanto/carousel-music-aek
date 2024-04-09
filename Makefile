stop:
	docker stop aek-music

delete-container:
	docker rm aek-music

delete-image:
	docker rmi aek-music

build:
	docker build -t aek-music . || (echo "Error: Docker build failed."; exit 1)

run:
	docker run -d --name aek-music -p 3000:3000 -v music:assets/music/ -e FB_BASEURL=/music aek-music

deploy:
	git fetch --all
	git pull
	stop
	delete-container
	make build
	make run
