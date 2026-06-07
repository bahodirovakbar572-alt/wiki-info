const express = require('express');
const path = require('path');
require('dotenv').config();
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3300;
const WIKI_API_URL = process.env.WIKI_API_URL || `https://${process.env.WIKI_LANG || 'en'}.wikipedia.org/w/api.php`;

function buildWikiUrl(params) {
    const url = new URL(WIKI_API_URL);
    const defaultParams = {
        origin: '*',
        format: 'json',
        formatversion: '2',
        ...params,
    };

    Object.entries(defaultParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });

    return url.toString();
}

app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.json());

// Frontend'ni yuborish
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, '../frontend') });
});

// Wikipedia qidiruv API
app.get('/api/wiki/search', async (req, res) => {
    const query = (req.query.q || '').trim();
    if (!query) {
        return res.status(400).json({ error: 'Qidiruv so\'rovi bo\'sh bo\'lishi mumkin emas' });
    }

    try {
        const url = buildWikiUrl({
            action: 'query',
            list: 'search',
            srsearch: query,
            srlimit: '20',
        });

        const response = await fetch(url);
        const data = await response.json();
        const results = (data.query?.search || []).map(item => ({
            title: item.title,
            snippet: item.snippet.replace(/<[^>]+>/g, ''),
        }));

        res.json(results);
    } catch (error) {
        console.error('Wiki qidiruv xato:', error);
        res.status(500).json({ error: 'Wiki API bilan bog\'lanishda xato yuz berdi' });
    }
});

// Wikipedia sahifa mazmunini olish
app.get('/api/wiki/page', async (req, res) => {
    const title = (req.query.title || '').trim();
    if (!title) {
        return res.status(400).json({ error: 'Sahifa nomi ko\'rsatilmagan' });
    }

    try {
        const url = buildWikiUrl({
            action: 'query',
            prop: 'extracts',
            explaintext: '1',
            exsectionformat: 'plain',
            titles: title,
            redirects: '1',
        });

        const response = await fetch(url);
        const data = await response.json();
        const page = data.query?.pages?.[0];
        if (!page || page.missing) {
            return res.status(404).json({ error: 'Sahifa topilmadi' });
        }

        res.json({ title: page.title, content: page.extract });
    } catch (error) {
        console.error('Wiki sahifa xato:', error);
        res.status(500).json({ error: 'Wiki API bilan bog\'lanishda xato yuz berdi' });
    }
});

app.listen(PORT, () => {
    console.log(`Server ${PORT} portida ishga tushdi: http://localhost:${PORT}`);
});