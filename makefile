docker-build:
	docker build . -t daisydomergue/streamr-exporter:latest
docker-run:
	docker run --name streamr-exporter -p 9099:9099 -d daisydomergue/streamr-exporter
docker-inspect-image:
	docker run -it -p 9099:9099 daisydomergue/streamr-exporter '/bin/sh'
docker-push:
	docker push daisydomergue/streamr-exporter:latest