import app from '../hono/hono';
import telegramService from '../service/telegram-service';

app.get('/telegram/getEmail/:token', async (c) => {
	c.header('Cache-Control', 'private, no-store, max-age=0');
	c.header('CDN-Cache-Control', 'no-store');
	const content = await telegramService.getEmailContent(c, c.req.param());
	return c.html(content)
});

