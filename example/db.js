const data = {
	users: [
		{id: '1', name: 'Tim', age: 45, attendedEvents: ['11', '13', '15']},
		{id: '2', name: 'Tom', age: 64, attendedEvents: ['11', '12', '14']},
		{id: '3', name: 'Jen', age: 25, attendedEvents: ['13', '14', '15']},
		{id: '4', name: 'Jack', age: 27, attendedEvents: ['12', '13', '15']},
		{id: '5', name: 'Jane', age: 36, attendedEvents: ['11', '12', '14']},
	],
	events: [
		{id: '11', title: 'Sewing', description: 'handmade clothing', price: 59.99, attendees: ['1', '2', '5']},
		{id: '12', title: 'Cooking', description: 'delicious meals', price: 79.99, attendees: ['2', '4', '5']},
		{id: '13', title: 'Tooling', description: 'make anything', price: 19.45, attendees: ['1', '3', '4']},
		{id: '14', title: 'Cleaning', description: 'spottless house', price: 159.99, attendees: ['2', '3', '5']},
		{id: '15', title: 'Writing', description: 'your own book', price: 529.99, attendees: ['1', '3', '4']},
	]
};

const db = {
	user: {
		findOne: (id, props) => delayPromise()
			.then(() => {
				console.log(`user.findOne()`, {id, props});
				return;
			})
			.then(() => data.users.filter((user) => user.id === id)[0])
			.then((user) => reduceToProps(user, props)),
		find: (ids, props) => delayPromise()
			.then(() => {
				console.log(`user.find()`, {ids, props});
				return;
			})
			.then(() => data.users.filter((user) => ids.includes(user.id)))
			.then((users) => sortArrByIds(users, ids))
			.then((users) => users.map((user) => reduceToProps(user, props))),
	},
	event: {
		findOne: (id, props) => delayPromise()
			.then(() => {
				console.log(`event.findOne()`, {id, props});
				return;
			})
			.then(() => data.events.filter((event) => event.id === id)[0])
			.then((event) => reduceToProps(event, props)),
		find: (ids, props) => delayPromise()
			.then(() => {
				console.log(`event.find()`, {ids, props});
				return;
			})
			.then(() => data.events.filter((event) => ids.includes(event.id)))
			.then((events) => sortArrByIds(events, ids))
			.then((events) => events.map((event) => reduceToProps(event, props))),
	}
}

module.exports = db;

function delayPromise(...args) {
	const delay = Math.random() * 1000 + 1000;
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(...args);
		}, delay);
	})
}

function reduceToProps(obj, keys) {
	// console.log({obj, keys})
	if (!keys || !keys.length) return obj;
	return Object.keys(obj).reduce((acc, key) => {
		if (!keys.includes(key)) return acc;
		return {...acc, [key]: obj[key]};
	}, {});
}

function sortArrByIds(arr, ids) {
	return ids.map((id) => arr.filter((obj) => obj.id === id)[0]);
}