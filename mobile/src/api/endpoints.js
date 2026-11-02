import { apiRequest } from './client';

export const authApi = {
  login: async (email, password) => {
    return apiRequest('login.php', {
      method: 'POST',
      body: { email, password },
    });
  },

  register: async (fullName, email, password) => {
    return apiRequest('register.php', {
      method: 'POST',
      body: { full_name: fullName, email, password },
    });
  },

  resetPassword: async (email, password) => {
    return apiRequest('reset_password.php', {
      method: 'POST',
      body: { email, password },
    });
  },
};

export const tripsApi = {
  getTrips: async (email) => {
    return apiRequest(`get_trips.php?email=${encodeURIComponent(email)}`);
  },

  addTrip: async (email, destination, imageRes = 1) => {
    return apiRequest('add_trip.php', {
      method: 'POST',
      body: { email, destination, image_res: imageRes },
    });
  },

  deleteTrip: async (email, destination) => {
    return apiRequest('delete_trip.php', {
      method: 'POST',
      body: { email, destination },
    });
  },

  getPlaceDetails: async (place) => {
    return apiRequest(`place_details.php?place=${encodeURIComponent(place)}`);
  },
};

export const weatherApi = {
  getWeather: async (place) => {
    return apiRequest(`weather.php?place=${encodeURIComponent(place)}`);
  },
};

export const ticketsApi = {
  getTickets: async (fromCity, toCity) => {
    return apiRequest(
      `tickets.php?from=${encodeURIComponent(fromCity || 'Nellore')}&to=${encodeURIComponent(toCity)}`
    );
  },
};

export const hotelsApi = {
  getHotels: async (place) => {
    return apiRequest(`hotels.php?place=${encodeURIComponent(place)}`);
  },
};

export const budgetApi = {
  getBudget: async (trip) => {
    return apiRequest(`budget.php?action=get&trip=${encodeURIComponent(trip)}`);
  },

  setLimit: async (trip, limit) => {
    return apiRequest(`budget.php?action=set_limit&trip=${encodeURIComponent(trip)}&limit=${limit}`);
  },

  addExpense: async (trip, category, amount, description) => {
    return apiRequest(
      `budget.php?action=add_expense&trip=${encodeURIComponent(trip)}&category=${encodeURIComponent(
        category
      )}&amount=${amount}&description=${encodeURIComponent(description || '')}`
    );
  },

  deleteExpense: async (trip, id) => {
    return apiRequest(`budget.php?action=delete_expense&trip=${encodeURIComponent(trip)}&id=${id}`);
  },
};

export const packingApi = {
  getItems: async (trip) => {
    return apiRequest(`packing.php?action=get&trip=${encodeURIComponent(trip)}`);
  },

  addItem: async (trip, item, category) => {
    return apiRequest(
      `packing.php?action=add&trip=${encodeURIComponent(trip)}&item=${encodeURIComponent(
        item
      )}&category=${encodeURIComponent(category)}`
    );
  },

  toggleItem: async (trip, id, status) => {
    return apiRequest(
      `packing.php?action=toggle&trip=${encodeURIComponent(trip)}&id=${id}&status=${status ? 1 : 0}`
    );
  },

  deleteItem: async (trip, id) => {
    return apiRequest(`packing.php?action=delete&trip=${encodeURIComponent(trip)}&id=${id}`);
  },
};

export const chatApi = {
  askBuddy: async (message, history = []) => {
    return apiRequest('ask_buddy.php', {
      method: 'POST',
      asJson: true,
      body: { message, history },
    });
  },
};
