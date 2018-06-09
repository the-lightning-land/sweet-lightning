# Sweet Lightning

> ⚡️ Pay for your candy with Bitcoin over Lightning

Try it on:

* [the.lightning.land/candy](https://the.lightning.land/candy).
* [the.testnet.lightning.land/candy](https://the.testnet.lightning.land/candy).

![Sweet Lightning Demo](https://user-images.githubusercontent.com/198988/41189385-58fe4d7e-6bcd-11e8-9461-cf4ad5d4625f.gif)

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
