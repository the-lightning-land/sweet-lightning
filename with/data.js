import React from 'react'
import PropTypes from 'prop-types'
import { ApolloProvider, getDataFromTree } from 'react-apollo'
import Head from 'next/head'
import getConfig from 'next/config'
import initApollo from '../init/apollo'

function getComponentDisplayName(Component) {
  return Component.displayName || Component.name || 'Unknown'
}

export default ComposedComponent => {
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()

  return class WithData extends React.Component {
    static displayName = `WithData(${getComponentDisplayName(ComposedComponent)})`

    static propTypes = {
      serverState: PropTypes.object.isRequired,
    }

    static async getInitialProps(ctx) {
      let serverState = {
        apollo: {
          data: {},
        },
      }

      let composedInitialProps = {}

      if (ComposedComponent.getInitialProps) {
        composedInitialProps = await ComposedComponent.getInitialProps(ctx)
      }

      const apollo = initApollo({
        graphqlUri: process.browser ? publicRuntimeConfig.graphqlUri : serverRuntimeConfig.graphqlUri,
        subscriptionUri: process.browser ? publicRuntimeConfig.subscriptionUri : null,
      })

      try {
        await getDataFromTree(
          <ApolloProvider client={apollo}>
            <ComposedComponent {...composedInitialProps} />
          </ApolloProvider>,
          {
            router: {
              asPath: ctx.asPath,
              pathname: ctx.pathname,
              query: ctx.query,
            }
          }
        )
      } catch (error) {
        // Prevent Apollo Client GraphQL errors from crashing SSR.
        // Handle them in components via the data.error prop:
        // http://dev.apollodata.com/react/api-queries.html#graphql-query-data-error
      }

      if (!process.browser) {
        // getDataFromTree does not call componentWillUnmount
        // head side effect therefore need to be cleared manually
        Head.rewind()
      }

      serverState = {
        apollo: {
          data: apollo.cache.extract()
        }
      }

      return {
        serverState,
        ...composedInitialProps
      }
    }

    constructor(props) {
      super(props)
      this.apollo = initApollo({
        graphqlUri: process.browser ? publicRuntimeConfig.graphqlUri : serverRuntimeConfig.graphqlUri,
        subscriptionUri: process.browser ? publicRuntimeConfig.subscriptionUri : null,
      }, this.props.serverState.apollo.data)
    }

    render() {
      return (
        <ApolloProvider client={this.apollo}>
          <ComposedComponent {...this.props} />
        </ApolloProvider>
      )
    }
  }
}
