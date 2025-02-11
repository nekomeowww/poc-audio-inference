FROM ghcr.io/prefix-dev/pixi:latest AS build

WORKDIR /app

COPY ./services/inference-server/ .

RUN --mount=type=cache,target=/root/.cache/rattler/cache,sharing=private pixi install
RUN printf '#!/bin/sh\n%s\nexec "$@"' "$(pixi shell-hook)" > /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8082
ENTRYPOINT ["/entrypoint.sh"]
CMD ["pixi", "run", "start"]
