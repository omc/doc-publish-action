FROM alpine:3.10

RUN apk add --update \
    curl \
    && rm -rf /var/cache/apk/*

RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip
RUN ./aws/install && echo "AWS: $(aws --version)"

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
