FROM 172.30.10.185:15000/common/nginx:1.16.0

RUN groupadd -r www && useradd -r -g www www
#USER www

ENV DEPLOY_DIR /dianyi/app/innovation/
ENV CONF_DIR /etc/nginx/

WORKDIR $DEPLOY_DIR

COPY deploy/nginx.conf $CONF_DIR
COPY ./ $DEPLOY_DIR
COPY deploy/start.sh /docker/
RUN chmod 755 /docker/start.sh
CMD ["bash", "-c", "/docker/start.sh" ]
