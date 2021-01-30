const { ApolloServer, gql } = require('apollo-server');
const DeepDataLoader = require('..');
const db = require('./db');

const context = () => ({
	dataloader: {
		user: new DeepDataLoader((keys, props) => db.user.find(keys, props)),
		event: new DeepDataLoader((keys, props) => db.event.find(keys, props))
	}
})

const typeDefs = gql`
type User {
	id: ID!
	name: String!
	age: Int!
	attendedEvents: [Event!]!
}

type Event {
	id: ID!
	title: String!
	description: String!
	price: Float!
	attendees: [User!]!
}

input EventInput {
	title: String!
	description: String!
	price: Float!
	date: String!
}

type Query {
	userById(id: ID!): User!
	userByIds(ids: [ID!]!): [User!]!
}

type Mutation {
	createEvent(data: EventInput!): Event!
}
`;

const resolvers = {
	Query: {
		userById: (root, args, ctx, info) => ({id: args.id}),
		userByIds: (root, args, ctx, info) => args.ids.map((id) => ({id})),
	},
	Mutation: {
		createEvent: (root, args, ctx, info) => {
			const event = {
				_id: Math.random().toString(),
				...args.data
			};
			database.events.push(event);
			return event;
		}
	},
	User: {
		id: (root, args, ctx, info) => root.id,/*{
			console.log('User.id');
			return ctx.dataloader.user.load(root.id, 'id')
				// .then((user) => {console.log({user}); return user})
				// .then((user) => user.id);
			// return db.user.findOne(root.id, ['id'])
			// 	.then((user) => user.id);
		},*/
		name: (root, args, ctx, info) => {
			// console.log('User.name');
			// return db.user.findOne(root.id, ['name'])
			return ctx.dataloader.user.load(root.id, 'name')
				// .then((user) => user.name);
		},
		age: (root, args, ctx, info) => {
			// console.log('User.age');
			return ctx.dataloader.user.load(root.id, 'age')
				// .then((user) => user.age);
		},
		attendedEvents: (root, args, ctx, info) => {
			// console.log('User.attendedEvents');
			return ctx.dataloader.user.load(root.id, 'attendedEvents')
				.then((ids) => ids.map((id) => ({id})));
		}
	},
	Event: {
		id: (root, args, ctx, info) => root.id,/*{
			console.log('Event.id');
			return db.event.findOne(root.id, ['id'])
				// .then((event) => event.id);
		},*/
		title: (root, args, ctx, info) => {
			// console.log('Event.title');
			return ctx.dataloader.event.load(root.id, 'title')
				// .then((event) => event.title);
		},
		description: (root, args, ctx, info) => {
			// console.log('Event.description');
			return ctx.dataloader.event.load(root.id, 'description')
				// .then((event) => event.description);
		},
		price: (root, args, ctx, info) => {
			// console.log('Event.price');
			return ctx.dataloader.event.load(root.id, 'price')
				// .then((event) => event.price);
		},
		attendees: (root, args, ctx, info) => {
			// console.log('Event.attendees');
			return ctx.dataloader.event.load(root.id, 'attendees')
				.then((ids) => ids.map((id) => ({id})));
		}
	}
}


const server = new ApolloServer({ typeDefs, resolvers, context });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
