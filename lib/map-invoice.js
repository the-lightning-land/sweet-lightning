module.exports = function mapInvoice(invoice) {
  return {
    memo: invoice.memo,
    receipt: invoice.receipt.toString('hex'),
    r_preimage: invoice.r_preimage.toString('hex'),
    r_hash: invoice.r_hash.toString('hex'),
    value: parseInt(invoice.value),
    settled: invoice.settled,
    creation_date: new Date(parseInt(invoice.creation_date) * 1000).toISOString(),
    settle_date: new Date(parseInt(invoice.settle_date) * 1000).toISOString(),
    payment_request: invoice.payment_request,
    description_hash: invoice.description_hash.toString('hex'),
    expiry: invoice.expiry,
    fallback_addr: invoice.fallback_addr,
    cltv_expiry: parseInt(invoice.cltv_expiry),
  }
}
