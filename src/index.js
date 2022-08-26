const { fetchJSON } = require('./apiHelpers');

let restaurants;
let users;
let reservations = [];

const usersList = document.querySelector('#users-list');
const restaurantsList = document.querySelector('#restaurants-list');
const reservationsList = document.querySelector('#reservations-list');

const renderUsers = () => {
	const id = window.location.hash.slice(1);
	const html = users
		.map((user) => {
			return `<li class=${id * 1 === user.id ? 'selected' : ''}>
            <a href='#${user.id}'>
            ${user.name}
            </a>
            </li>`;
		})
		.join('');
	usersList.innerHTML = html;
};

const renderRestaurants = () => {
	const html = restaurants
		.map((restaurant) => {
			const count = (reservations || []).filter((reservation) => {
				return reservation.restaurantId === restaurant.id;
			}).length;
			return `<li data-id='${restaurant.id}'>${restaurant.name}(${count})</li>`;
		})
		.join('');
	restaurantsList.innerHTML = html;
};

const renderReservations = () => {
	const html = reservations
		.map((reservation) => {
			const restaurant = restaurants.find(
				(restaurant) => restaurant.id === reservation.restaurantId
			);
			return `<li>${restaurant.name} ${reservation.restaurantId}</li>`;
		})
		.join('');
	reservationsList.innerHTML = html;
};

const setup = async () => {
	console.log('starting');
	users = await fetchJSON('/api/users');
	restaurants = await fetchJSON('/api/restaurants');
	renderUsers();
	const id = window.location.hash.slice(1);
	renderRestaurants();
	if (id) {
		reservations = await fetchJSON(`/api/users/${id}/reservations`);
		renderReservations();
	}
};

setup();

restaurantsList.addEventListener('click', async (ev) => {
	const id = window.location.hash.slice(1);
	if (!id) {
		return;
	}
	if (ev.target.tagName === 'LI') {
		const restaurantId = ev.target.getAttribute('data-id');
		const response = await fetch(`/api/users/${id}/reservations`, {
			method: 'POST',
			body: JSON.stringify({ restaurantId }),
			headers: {
				'Content-Type': 'application/json',
			},
		});
		const reservation = await response.json();
		reservations.push(reservation);
		renderRestaurants();
		renderReservations();
	}
});

window.addEventListener('hashchange', async () => {
	renderUsers();
	const id = window.location.hash.slice(1);
	if (id) {
		reservations = await fetchJSON(`/api/users/${id}/reservations`);
	} else {
		reservations = [];
	}
	renderRestaurants();
	renderReservations();
});
