const http = require('http');
const fs = require('fs');
const path = require('path');

class LocalWebServer {
  constructor(port = 8085) {
    this.port = port;
    this.server = null;
    this.webDir = path.resolve(__dirname, '../../web');
    this.backendDir = path.resolve(__dirname, '../../backend');
  }

  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        // Handle CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.writeHead(204);
          res.end();
          return;
        }

        const urlObj = new URL(req.url, `http://localhost:${this.port}`);
        let reqPath = decodeURIComponent(urlObj.pathname);

        // Handle backend API mock/endpoints if PHP server not running directly
        if (reqPath.startsWith('/TravelBuddy/backend/') || reqPath.startsWith('/backend/')) {
          const endpoint = path.basename(reqPath);
          this.handleMockApi(endpoint, req, res);
          return;
        }

        // Normalize web path
        if (reqPath.startsWith('/TravelBuddy/web/')) {
          reqPath = reqPath.replace('/TravelBuddy/web/', '/');
        } else if (reqPath.startsWith('/web/')) {
          reqPath = reqPath.replace('/web/', '/');
        }

        if (reqPath === '/' || reqPath === '') {
          reqPath = '/index.html';
        }

        const filePath = path.join(this.webDir, reqPath);

        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found: ' + reqPath);
            return;
          }
          res.writeHead(200, { 'Content-Type': this.getMimeType(filePath) });
          res.end(data);
        });
      });

      this.server.listen(this.port, () => {
        console.log(`[LocalWebServer] Serving TravelBuddy Web at http://localhost:${this.port}/index.html`);
        resolve(`http://localhost:${this.port}/index.html`);
      });

      this.server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`[LocalWebServer] Port ${this.port} is in use, assuming server already active`);
          resolve(`http://localhost:${this.port}/index.html`);
        } else {
          reject(err);
        }
      });
    });
  }

  handleMockApi(endpoint, req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (endpoint.includes('login.php')) {
      res.end(JSON.stringify({ status: 'success', message: 'Login successful', user: { id: 1, name: 'Alice Traveler', email: 'alice@travelbuddy.com' } }));
    } else if (endpoint.includes('register.php')) {
      res.end(JSON.stringify({ status: 'success', message: 'Account registered successfully', user_id: 101 }));
    } else if (endpoint.includes('get_trips.php')) {
      res.end(JSON.stringify({
        status: 'success',
        trips: [
          { id: 1, destination: 'Paris, France', start_date: '2026-12-01', end_date: '2026-12-07', budget: 1500, status: 'Upcoming' },
          { id: 2, destination: 'Tokyo, Japan', start_date: '2027-02-10', end_date: '2027-02-18', budget: 2800, status: 'Planning' }
        ]
      }));
    } else if (endpoint.includes('add_trip.php')) {
      res.end(JSON.stringify({ status: 'success', message: 'Trip added successfully', trip_id: 3 }));
    } else if (endpoint.includes('delete_trip.php')) {
      res.end(JSON.stringify({ status: 'success', message: 'Trip deleted successfully' }));
    } else if (endpoint.includes('weather.php')) {
      res.end(JSON.stringify({
        status: 'success',
        city: 'Paris',
        current: { temp: 22, condition: 'Partly Cloudy', humidity: 55, wind: 12 },
        forecast: [
          { day: 'Mon', temp: 22, condition: 'Sunny' },
          { day: 'Tue', temp: 20, condition: 'Rainy' },
          { day: 'Wed', temp: 23, condition: 'Clear' }
        ]
      }));
    } else if (endpoint.includes('place_details.php')) {
      res.end(JSON.stringify({
        status: 'success',
        title: 'Paris, France',
        description: 'The City of Light known for its art, fashion, gastronomy, and culture.',
        attractions: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame', 'Arc de Triomphe']
      }));
    } else if (endpoint.includes('tickets.php')) {
      res.end(JSON.stringify({
        status: 'success',
        flights: [{ provider: 'Air France', duration: '8h 20m', price: '$450' }],
        trains: [{ provider: 'Eurostar Express', duration: '2h 15m', price: '$120' }],
        buses: [{ provider: 'FlixBus', duration: '6h 40m', price: '$35' }],
        cabs: [{ provider: 'CityRide Premium', duration: '45m', price: '$65' }]
      }));
    } else if (endpoint.includes('hotels.php')) {
      res.end(JSON.stringify({
        status: 'success',
        hotels: [
          { name: 'Hotel Le Meurice', rating: 4.9, price: '$420/night', phone: '+33 1 44 58 10 10' },
          { name: 'Citadines Bastille', rating: 4.5, price: '$160/night', phone: '+33 1 43 57 20 20' }
        ]
      }));
    } else if (endpoint.includes('budget.php')) {
      res.end(JSON.stringify({
        status: 'success',
        budget_total: 1500,
        spent_total: 350,
        remaining: 1150,
        expenses: [{ id: 1, title: 'Dinner in Montmartre', amount: 80, category: 'Food' }]
      }));
    } else if (endpoint.includes('community.php')) {
      res.end(JSON.stringify({
        status: 'success',
        posts: [{ id: 1, author: 'Marco Polo', title: 'Hidden gems in Florence', likes: 24, comments: 5 }]
      }));
    } else {
      res.end(JSON.stringify({ status: 'success', message: 'Mock response OK' }));
    }
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log('[LocalWebServer] Server stopped.');
    }
  }
}

module.exports = LocalWebServer;
