# Sweet Lightning

> ⚡️ Pay for your candy with Bitcoin over Lightning

Try it on [the.lightning.land/candy](https://the.lightning.land/candy).

## Run it locally

```
yarn # install dependencies

yarn build # build the app

# run it
yarn start \
  --lnd.adminmacaroonpath admin.macaroon \
  --lnd.rpccert lnd_rpc.crt \
  --lnd.rpcserver localhost:10009 \
  --externalurl http://localhost:3000 \
  --listen 0.0.0.0:3000

# use it
open http://localhost:3000
```

## Run in development mode

```
yarn # install dependencies

# run it
yarn dev \
  --lnd.adminmacaroonpath admin.macaroon \
  --lnd.rpccert lnd_rpc.crt \
  --lnd.rpcserver localhost:10009 \
  --externalurl http://localhost:3000 \
  --listen 0.0.0.0:3000

# preview it
open http://localhost:3000
```
