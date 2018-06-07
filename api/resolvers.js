const util = require('util')
const { withFilter } = require('graphql-subscriptions')
const grpc = require('grpc')
const mapInvoice = require('../lib/map-invoice')

module.exports = ({ pubsub, lightning }) => ({
  Query: {
    info: async (parent, args, { macaroon }) => {
      const meta = new grpc.Metadata()
      meta.add('macaroon', macaroon)
      const getInfo = util.promisify(lightning.getInfo.bind(lightning))
      const {
        identity_pubkey,
        alias,
      } = await getInfo({}, meta)
      return {
        identity_pubkey,
        alias,
      }
    },
    invoice: async (parent, { r_hash }, { macaroon }) => {
      if (!r_hash) {
        return null
      }

      const meta = new grpc.Metadata()
      meta.add('macaroon', macaroon)

      const lookupInvoice = util.promisify(lightning.lookupInvoice.bind(lightning))
      const invoice = await lookupInvoice({ r_hash_str: r_hash }, meta)

      return invoice ? mapInvoice(invoice) : null
    },
  },
  Subscription: {
    invoicePaid: {
      resolve: (payload) => mapInvoice(payload.invoice),
      subscribe: withFilter(
        () => pubsub.asyncIterator('invoicePaid'),
        (payload, { r_hash }) => payload && payload.invoice.r_hash.toString('hex') === r_hash
      ),
    },
    invoicesPaid: {
      resolve: (payload) => mapInvoice(payload.invoice),
      subscribe: pubsub.asyncIterator('invoicePaid'),
    },
  },
  Mutation: {
    addInvoice: async (root, { amount }, { macaroon, headers }) => {
      const meta = new grpc.Metadata()
      meta.add('macaroon', macaroon)
      const addInvoice = util.promisify(lightning.addInvoice.bind(lightning))
      const response = await addInvoice({ value: amount }, meta)
      return {
        r_hash: response.r_hash.toString('hex'),
        payment_request: response.payment_request,
      }
    },
  },
})
