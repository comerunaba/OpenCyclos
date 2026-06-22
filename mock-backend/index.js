const express = require('express');
const cors = require('cors');

const app = express();
const port = 6001;

app.use(cors());
app.use(express.json());

// In-memory store for settings
let adminSettings = {
  applicationName: 'Cyclos',
  allowNewRegistrations: true,
  theme: 'light'
};

app.get('/rest/general', (req, res) => {
  res.json({
    cyclosVersion: '4.15.1 (mocked)',
    applicationName: adminSettings.applicationName
  });
});

app.post('/rest/login', (req, res) => {
  const { principal, password } = req.body;

  // In a real application, you would validate the credentials.
  // Here, we'll just accept any login and return a mock user.
  if (principal && password) {
    res.json({
      user: {
        name: principal === 'admin' ? 'Global Admin' : 'Mock User',
        username: principal,
        email: `${principal}@example.com`,
        role: principal === 'admin' ? 'admin' : 'user'
      },
      sessionToken: 'mock-session-token-12345'
    });
  } else {
    res.status(400).json({ error: 'Missing principal or password' });
  }
});

app.get('/rest/admin/settings', (req, res) => {
  // In a real app, you would check if the user is an admin
  res.json(adminSettings);
});

app.post('/rest/admin/settings', (req, res) => {
  // In a real app, you would check if the user is an admin
  const newSettings = req.body;
  adminSettings = { ...adminSettings, ...newSettings };
  res.json(adminSettings);
});

app.listen(port, () => {
  console.log(`Mock Cyclos backend listening at http://localhost:${port}`);
});
