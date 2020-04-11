const {
  ApolloServer,
  PubSub,
  AuthenticationError,
  UserInputError,
  ApolloError,
  SchemaDirectiveVisitor
} = require('apollo-server')
const {defaultFieldResolver, GraphQLString} =require('graphql')
const gql = require('graphql-tag')

const pubSub = new PubSub()
const NEW_ITEM = 'NEW_ITEM'

class LogDirective extends SchemaDirectiveVisitor{
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver

    field.args.push({
      type: GraphQLString,
      name: 'message'
    })

    field.resolve = (root, { message, ...rest }, ctx, info) => {
      const { message: schemaMessage } = this.args
      
      console.log('🤖 Hello ', message || schemaMessage) 
      return resolver.call(this, root, rest, ctx, info)
    }
    }
} 

const typeDefs = gql`
  directive @log(message: String = "my message") on FIELD_DEFINITION

    type User {
        id: ID! @log(message: "id right here")
        error: String! 
        username: String!
        createdAt: String!
    }

    type Settings {
        user: User!
        theme: String!
    }

    input NewSettingsInput {
        user: ID!
        theme: String!
    }

    type Item {
      task: String!
    }

    type Query {
        me: User!
        settings(user: ID!): Settings!
    }

    type Mutation {
        settings(input: NewSettingsInput!): Settings!
        createItem(task: String!): Item
    }

    type Subscription {
      newItem: Item
    }

    
`

const resolvers = {
  Query: {
    me(){
      return {
        id: 1,
        username: 'code4road',
        createdAt: 123123123
        }
    },
    settings(_, { user }) {
      return {
        user,
        theme: 'Light'
      }
    }
  },
  Mutation: {
    settings(_, { input }) {
      return input
    },
    createItem(_, {task}) {
      const item = {task}
      pubSub.publish(NEW_ITEM, { newItem: item })
      return item
    }
  },
  Subscription: {
    newItem: {
      subscribe: () => pubSub.asyncIterator(NEW_ITEM)
    }
  },
  Settings: {
    user() {
      return {
        id: 1,
        username: 'code4road',
        createdAt: 1123332223112
      }
    }
  },
  User: {
    error() {
      throw new AuthenticationError("No auth")
    }
  }
}

server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    log: LogDirective
  },
  formatError(e) {
    console.log(e)  /** Captura los errores por consola */
    return e 
  },
  context({ connection }) {
    if (connection) {
      return { ...connection.context }
    }
  },
  subscriptions: {
    onConnet(params) { /* The same as headers */
      
    }
  }
})

server.listen().then(({url}) => console.log(`server at ${url}`))