require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const axios = require('axios');

const app = express();
const SECRET = process.env.JWT_SECRET || 'sso-secret'; 
const AUTH_SERVER_URL = process.env.AUTH_SERVER_URL || 'http://localhost:3000';
const PORT = process.env.APP_A_PORT || 3001;

app.use(cookieParser());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - App A - ${req.method} ${req.path} - ${req.ip}`);
    next();
});

const requireAuth = async (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        const loginUrl = `${AUTH_SERVER_URL}/login?redirect=${encodeURIComponent(req.originalUrl)}`;
        return res.redirect(loginUrl);
    }
    
    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.clearCookie('token', { domain: process.env.COOKIE_DOMAIN || '.localhost' });
        const loginUrl = `${AUTH_SERVER_URL}/login?redirect=${encodeURIComponent(req.originalUrl)}`;
        res.redirect(loginUrl);
    }
};

app.get('/', requireAuth, (req, res) => {
    res.json({
        message: 'Welcome to App A',
        user: {
            username: req.user.username,
            sessionId: req.user.sessionId,
            loggedInAt: new Date(req.user.iat * 1000).toISOString()
        },
        app: 'App A',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/user', requireAuth, (req, res) => {
    res.json({
        username: req.user.username,
        sessionId: req.user.sessionId,
        app: 'App A'
    });
});


app.listen(PORT, () => {
    console.log(`App A running on port ${PORT}`);
    console.log(`Auth server URL: ${AUTH_SERVER_URL}`);
});