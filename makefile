version = v1.0
docker-build:
	docker build . -t daisydomergue/streamr-exporter:$(version)
docker-run:
	docker run --name streamr-exporter -p 9099:9099 -d daisydomergue/streamr-exporter:$(version)
docker-inspect-image:
	docker run -it -p 9099:9099 daisydomergue/streamr-exporter:$(version) '/bin/sh'
docker-push:
	docker push daisydomergue/streamr-exporter:$(version)