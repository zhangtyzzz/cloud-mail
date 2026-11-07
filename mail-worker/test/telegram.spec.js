import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { readEmail, readSettings } = vi.hoisted(() => ({
	readEmail: vi.fn(),
	readSettings: vi.fn(),
}));

vi.mock('../src/entity/orm', () => ({
	default: () => ({ select: () => ({ from: () => ({ where: () => ({ get: readEmail }) }) }) }),
}));
vi.mock('../src/service/setting-service', () => ({ default: { query: readSettings } }));

import jwtUtils from '../src/utils/jwt-utils';
import telegramService from '../src/service/telegram-service';
import app from '../src/hono/hono';
import '../src/api/telegram-api';

const env = { jwt_secret: 'test-only-signing-key-not-a-production-secret' };
const context = { env };
const now = new Date('2026-11-07T00:00:00Z');
const email = { emailId: 123, subject: 'Test notice', text: 'Private test body', content: '' };

describe('Telegram email view links', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(now);
		readEmail.mockReset().mockResolvedValue(email);
		readSettings.mockReset().mockResolvedValue({
			tgBotToken: 'test-only-bot-token',
			tgChatId: '12345',
			customDomain: 'https://mail.example.com',
			tgMsgTo: 'show',
			tgMsgFrom: 'hide',
			tgMsgText: 'show',
		});
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })));
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	async function createNotificationToken() {
		await telegramService.sendEmailToBot(context, email);
		const body = JSON.parse(fetch.mock.calls[0][1].body);
		const url = new URL(body.reply_markup.inline_keyboard[0][0].web_app.url);
		expect(url.origin).toBe('https://mail.example.com');
		return url.pathname.split('/').pop();
	}

	it('creates a notification link valid until, but not including, 24 hours', async () => {
		const token = await createNotificationToken();
		const payload = await jwtUtils.verifyToken(context, token);
		expect(payload.emailId).toBe(email.emailId);
		expect(payload.exp - payload.iat).toBe(86400);
		vi.setSystemTime(now.getTime() + 86400 * 1000 - 1000);
		expect(await telegramService.getEmailContent(context, { token })).toContain(email.text);
		vi.setSystemTime(now.getTime() + 86400 * 1000);
		expect(await telegramService.getEmailContent(context, { token })).toContain('Access denied');
		// Expired links must not load email data.
		expect(readEmail).toHaveBeenCalledTimes(1);
	});

	it('keeps existing links without an expiry usable', async () => {
		const token = await jwtUtils.generateToken(context, { emailId: email.emailId });
		vi.setSystemTime(now.getTime() + 30 * 86400 * 1000);
		expect(await telegramService.getEmailContent(context, { token })).toContain(email.text);
	});

	it('rejects a link signed with a different key without reading email data', async () => {
		const token = await jwtUtils.generateToken({ env: { jwt_secret: 'wrong-key' } }, { emailId: email.emailId }, 86400);
		expect(await telegramService.getEmailContent(context, { token })).toContain('Access denied');
		expect(readEmail).not.toHaveBeenCalled();
	});

	it.each([false, true])('disables browser and CDN caching, expired=%s', async (expired) => {
		const token = await createNotificationToken();
		if (expired) vi.setSystemTime(now.getTime() + 86400 * 1000);
		const response = await app.request(`/telegram/getEmail/${token}`, {}, env);
		expect(response.headers.get('Cache-Control')).toBe('private, no-store, max-age=0');
		expect(response.headers.get('CDN-Cache-Control')).toBe('no-store');
		expect(await response.text()).toContain(expired ? 'Access denied' : email.text);
	});
});
