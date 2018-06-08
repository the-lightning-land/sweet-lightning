import React, { Component } from 'react'
import Head from 'next/head'
import { graphql, compose, withApollo } from 'react-apollo'
import gql from 'graphql-tag'
import Router from 'next/router'
import QRCode from 'qrcode.react'
import getConfig from 'next/config'
import withData from '../with/data'
import Candy from '../components/candy'
import Check from '../components/check'

const min = (value, min) => value < min ? min : value
const max = (value, max) => value > max ? max : value

class IndexPage extends Component {
  unsubscribe = null
  state = {
    size: 4,
  }

  static getInitialProps({ query }) {
    return {
      rHash: query.rHash,
    };
  }

  componentDidMount() {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.data.loading) {
      if (this.unsubscribe) {
        if (this.props.rHash !== nextProps.rHash) {
          this.unsubscribe()
        } else {
          return
        }
      }

      if (nextProps.data?.invoice) {
        this.unsubscribe = nextProps.data.subscribeToMore({
          document: gql`
            subscription InvoicePaid($rHash: String!) {
              invoicePaid(r_hash: $rHash) {
                payment_request
                settled
                value
              }
            }
          `,
          variables: {
            rHash: nextProps.rHash,
          },
          updateQuery: (previousResult, { subscriptionData }) => ({
            ...previousResult,
            invoice: subscriptionData.data.invoicePaid,
          }),
        })
      }
    }
  }

  onLess = () => this.setState({ size: min(this.state.size - 1, 1) })
  onMore = () => this.setState({ size: max(this.state.size + 1, 6) })

  onCreateInvoice = async (e) => {
    e.preventDefault()

    const { data } = await this.props.client.mutate({
      mutation: gql`
        mutation AddInvoice($amount: Int!) {
          addInvoice(amount: $amount) {
            r_hash
            payment_request
          }
        }
      `,
      variables: {
        amount: this.state.size * 650,
      },
    })

    const { publicRuntimeConfig } = getConfig()
    Router.push(
      `/index?rHash=${data.addInvoice.r_hash}`,
      `${publicRuntimeConfig.basePath}/?rHash=${data.addInvoice.r_hash}`,
      { shallow: false },
    )
  }

  render() {
    const { publicRuntimeConfig } = getConfig()

    return (
      <div className="section">
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="initial-scale=1.0, width=device-width, maximum-scale=1.0, user-scalable=no" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="apple-mobile-web-app-title" content="Sweet ⚡️" />
          <title>Lightning Candy Dispenser</title>
          <meta name="description" content="Pay for your candy with Bitcoin over Lightning" />
          <meta name="MobileOptimized" content="320" />
          <meta name="theme-color" content="#ffffff" />
          <link rel="icon" href={`${publicRuntimeConfig.basePath}/static/favicon.ico`} type="image/x-icon" />
          <meta name="twitter:title" content="Lightning Candy Dispenser" />
          <meta name="twitter:description" content="Pay for your candy with Bitcoin over Lightning" />
          {/* <meta name="twitter:image" content={imageUrl} /> */}
          {/* <meta name="twitter:card" content="summary_large_image" /> */}
          <meta name="twitter:card" content="summary" />
          <meta property="og:title" content="Lightning Candy Dispenser" />
          <meta property="og:description" content="Pay for your candy with Bitcoin over Lightning" />
          {/* <meta name="og:image" content={imageUrl} /> */}
        </Head>
        {/* Generate invoice */}
        {!this.props.data?.invoice ? (
          <div className="title">
            Candy Dispenser
          </div>
        ) : null}
        {!this.props.data?.invoice ? (
          <div className="description">
            Please choose the amount of candy that you'd like to buy.
          </div>
        ) : null}
        {!this.props.data?.invoice ? (
          <div className="candy">
            <Candy size={this.state.size} />
          </div>
        ) : null}
        {!this.props.data?.invoice ? (
          <div className="amount">
            <button className="less" onClick={this.onLess} disabled={this.state.size <= 1}>
              <svg viewBox="0 0 96 96">
                <path fill="currentColor" d="M48 92c24.3 0 44-19.7 44-44S72.3 4 48 4 4 23.7 4 48s19.7 44 44 44zm0 4C21.49 96 0 74.51 0 48S21.49 0 48 0s48 21.49 48 48-21.49 48-48 48z" />
                <path fill="currentColor" d="M24 46h48v4H24z" />
              </svg>
              <span>Less candy</span>
            </button>
            <div className="value">
              <div className="sat">{this.state.size * 650} sat</div>
              <div className="usd">
                <span>$</span>
                {(this.state.size * 0.05).toFixed(2)}
              </div>
            </div>
            <button className="more" onClick={this.onMore} disabled={this.state.size >= 6}>
              <svg viewBox="0 0 96 96">
                <path fill="currentColor" d="M48 92c24.3 0 44-19.7 44-44S72.3 4 48 4 4 23.7 4 48s19.7 44 44 44zm0 4C21.49 96 0 74.51 0 48S21.49 0 48 0s48 21.49 48 48-21.49 48-48 48z" />
                <path fill="currentColor" d="M24 46h48v4H24z" />
                <path fill="currentColor" d="M50 24v48h-4V24z" />
              </svg>
              <span>More candy</span>
            </button>
          </div>
        ) : null}
        {!this.props.data?.invoice ? (
          <div className="action">
            <button className="buy" onClick={this.onCreateInvoice}>Pay with Bitcoin ⚡️</button>
          </div>
        ) : null}
        {/* Invoice */}
        {this.props.data?.invoice && !this.props.data.invoice.settled ? (
          <div className="title">
            Your invoice
          </div>
        ) : null}
        {this.props.data?.invoice && !this.props.data.invoice.settled ? (
          <div className="description">
            Please use the invoice below in order to dispense your candy.
          </div>
        ) : null}
        {this.props.data?.invoice && !this.props.data.invoice.settled ? (
          <div className="qr">
            <div className="code">
              <QRCode
                style={{ width: '100%', height: '100%' }}
                size={256}
                renderAs="svg"
                value={this.props.data.invoice.payment_request}
              />
            </div>
          </div>
        ) : null}
        {this.props.data?.invoice && !this.props.data.invoice.settled ? (
          <div className="payreq">
            <pre>
              <code>
                {this.props.data.invoice.payment_request}
              </code>
            </pre>
          </div>
        ) : null}
        {/* Successfully paid */}
        {this.props.data?.invoice && this.props.data.invoice.settled ? (
          <div className="title">
            Paid!
          </div>
        ) : null}
        {this.props.data?.invoice && this.props.data.invoice.settled ? (
          <div className="description">
            Your candy is on the way.
          </div>
        ) : null}
        {this.props.data?.invoice && this.props.data.invoice.settled ? (
          <Check />
        ) : null}
        <div className="footer">
          <a href="https://the.lightning.land">the.lightning.land</a>
        </div>
        <style jsx>{`
          * {
            box-sizing: border-box;
            font-family: sans-serif;
          }

          .section {
            background: white;
            box-shadow: 0 0 99px rgba(0,0,0,0.3);
            padding: 15px;
            border-radius: 6px;
            margin: 100px auto;
            max-width: 480px;
          }

          .title {
            font-size: 34px;
            font-weight: 100;
            text-align: center;
            padding-top: 20px;
          }

          .description {
            font-size: 18px;
            font-weight: 100;
            text-align: center;
            padding-top: 20px;
            color: #333;
          }

          .candy {
            text-align: center;
            padding-top: 26px;
          }

          .amount {
            display: flex;
            padding-top: 40px;
            justify-content: center;
          }

          .less, .more {
            border: none;
            font-size: inherit;
            background: none;
            margin: 0;
            padding: 0;
            color: inherit;
            flex: 0 0 74px;
            width: 74px;
            height: 74px;
            color: green;
          }

          .less:disabled, .more:disabled {
            color: gray;
            cursor: not-allowed;
          }

          .less span, .more span {
            display: none;
          }

          .value {
            flex: 0 auto;
            padding: 0 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            overflow: hidden;
          }

          .sat {
            font-size: 18px;
          }

          .usd {
            font-size: 32px;
          }

          .sat, .usd {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: center;
          }

          .action {
            padding-top: 40px;
            text-align: center;
          }

          .buy {
            border: none;
            font: inherit;
            display: inline-block;
            margin: 0;
            padding: 15px;
            background: green;
            width: 100%;
            color: white;
            height: 70px;
            border-radius: 6px;
            font-size: 28px;
            font-weight: 100;
            max-width: 350px;
          }

          .footer {
            text-align: center;
            padding-top: 20px;
          }

          .footer a {
            color: #333;
          }

          .qr {
            text-align: center;
            padding-top: 40px;
          }

          .code {
            display: inline-block;
            width: 350px;
            height: auto;
            padding: 25px;
            box-shadow: 0 0 40px rgba(0,0,0,0.3);
          }

          .payreq {
            padding-top: 20px;
          }

          pre {
            font-size: 24px;
            word-wrap: break-word;
            white-space: normal;
            padding: 15px;
            border-radius: 10px;
            cursor: copy;
            transition: background .3s ease;
            margin: 0 auto;
            max-width: 350px;
          }
        `}</style>
      </div>
    )
  }
}

export default compose(
  withData,
  withApollo,
  graphql(gql`
    query IndexPageQuery($rHash: String!) {
      info {
        identity_pubkey
      }
      invoice(r_hash: $rHash) {
        payment_request
        settled
        value
      }
    }
  `, {
    options: ({ rHash }) => ({
      variables: {
        rHash: rHash || '',
      },
    }),
  }),
)(IndexPage)
