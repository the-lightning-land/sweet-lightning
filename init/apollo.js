import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import fetch from 'isomorphic-unfetch';
import { split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

let apolloClient = null

if (!process.browser) {
  global.fetch = fetch
}

function isSubscriptionQuery({ query }) {
  const { kind, operation } = getMainDefinition(query)
  return kind === 'OperationDefinition' && operation === 'subscription'
}

function create({ graphqlUri, subscriptionUri }, initialState = {}) {
  let link = null
  let httpLink = new HttpLink({ uri: graphqlUri })
  let webSocketLink = null

  if (subscriptionUri) {
    webSocketLink = new WebSocketLink({
      uri: subscriptionUri,
      options: {
        reconnect: true,
      },
    })
  }

  if (!webSocketLink) {
    link = httpLink
  } else {
    link = split(isSubscriptionQuery, webSocketLink, httpLink)
  }

  return new ApolloClient({
    link,
    connectToDevTools: process.browser,
    ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    cache: new InMemoryCache({
      dataIdFromObject: obj => obj.__typename === 'Invoice' ? obj.r_hash : obj.id,
    }).restore(initialState),
  })
}

export default function initApollo(config, initialState = {}) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return create(config, initialState)
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(config, initialState)
  }

  return apolloClient
}
