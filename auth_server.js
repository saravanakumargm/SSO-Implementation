require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const app = express();
const SECRET = process.env.JWT_SECRET || 'sso-secret';
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

const activeSessions = new Map();

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
    next();
});

app.get('/login', (req, res) => {
    const redirectUrl = req.query.redirect || 'http://localhost:3001';
    res.json({
        message: 'Please login using POST /login endpoint',
        instructions: {
            method: 'POST',
            url: '/login',
            body: {
                username: 'admin',
                password: 'password'
            }
        },
        redirectUrl: redirectUrl,
        demoCredentials: {
            username: 'admin',
            password: 'password'
        }
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    
    // Mock authentication
    if (username === 'admin' && password === 'password') {
        const sessionId = crypto.randomBytes(16).toString('hex');
        const token = jwt.sign({ 
            username, 
            sessionId,
            iat: Math.floor(Date.now() / 1000)
        }, SECRET, { expiresIn: process.env.TOKEN_EXPIRY || '1h' });
        
        activeSessions.set(sessionId, { username, createdAt: Date.now() });
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            domain: process.env.COOKIE_DOMAIN || '.localhost',
            sameSite: process.env.COOKIE_SAME_SITE || 'Lax',
            maxAge: parseInt(process.env.SESSION_TIMEOUT) || 3600000
        });
        
        res.json({ 
            success: true, 
            message: 'Logged in successfully',
            user: { username }
        });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.post('/logout', (req, res) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, SECRET);
            activeSessions.delete(decoded.sessionId);
        } catch (e) {
            console.log('Error in logout',e)
        }
    }
    
    res.clearCookie('token', {
        domain: process.env.COOKIE_DOMAIN || '.localhost',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    });
    
    res.json({ success: true, message: 'Logged out successfully' });
});

app.listen(PORT, () => {
    console.log(`Auth server running on port ${PORT}`);
    console.log(`JWT Secret: ${SECRET.substring(0, 8)}...`);
});