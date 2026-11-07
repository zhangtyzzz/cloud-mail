// Loaded only by the development-only VITE_UI_PREVIEW mode. No live API calls.
const accounts = [
  { accountId: 1, userId: 1, email: 'hello@example.com', name: '个人邮箱', allReceive: 1, sort: 3 },
  { accountId: 2, userId: 1, email: 'studio@example.com', name: '工作来信', allReceive: 0, sort: 2 },
  { accountId: 3, userId: 1, email: 'notes@example.com', name: '订阅与灵感', allReceive: 0, sort: 1 },
];
const settings = {
  title: 'Tymee Mail', loginDomain: 1, register: 1, regKey: 1, receive: 0, send: 0,
  manyEmail: 0, addEmail: 0, autoRefresh: 0, registerVerify: 1, addEmailVerify: 1,
  minEmailPrefix: 1, emailPrefixFilter: [], domainList: ['@example.com'],
  r2Domain: '', siteKey: '', secretKey: '', background: '', loginOpacity: .9,
  notice: 1, noticeTitle: '', noticeContent: '', noticeType: 'none', noticeWidth: 400,
  noticeDuration: 0, noticePosition: 'top-right', noticeOffset: 16,
  projectLink: false, linuxdoSwitch: 1, githubSwitch: 1, googleSwitch: 1,
  tgBotStatus: 0, tgChatId: '', tgBotToken: '', tgMsgFrom: 'only-name', tgMsgTo: 'show', tgMsgText: 'show',
  forwardStatus: 1, forwardEmail: '', webhookStatus: 1, webhookUrl: '', webhookRetry: 0,
  ruleType: 0, ruleEmail: '', syncDelete: 1, noRecipient: 1, storageType: 'KV',
  bucket: '', region: '', endpoint: '', s3AccessKey: '', s3SecretKey: '', forcePathStyle: 1,
  aiCode: 1, aiCodeFilter: [], blackSubject: '', blackContent: '', blackFrom: '',
  resendTokens: {}, customDomain: '', autoCleanDays: 0, autoCleanExclude: '',
};
const user = {
  userId: 1, name: 'Tymee', email: accounts[0].email, sendCount: 0, type: 0,
  account: accounts[0], permKeys: ['*'],
  role: { name: '管理员', roleId: 1, sendType: 'count', sendCount: 0, accountCount: 0, availDomain: '@example.com' },
};
const samples = [
  ['林知夏', '下周设计评审 · 更新后的界面方案', '把细节放回体验里。新版界面已经准备好，一起看看吧。', 2, 0],
  ['Linear', 'Your workspace, a little more organized', 'This week: a clearer view of your projects and a few thoughtful improvements.', 2, 0],
  ['陈亦', '周六下午，去看那个展吧', '我订好了两张票。下午三点，老地方见。', 1, 0],
  ['少数派', '本周值得读：让数字生活更轻一点', '好用的工具不必很多。几个让工作和生活更有条理的小发现。', 3, 1],
  ['Figma', 'A fresh look at what you’ve been making', 'Your weekly digest of design, collaboration, and good ideas.', 2, 1],
  ['Tymee Notes', '给未来自己的一份阅读清单', '建筑、摄影，还有那些值得慢慢读完的故事。', 3, 1],
  ['周航', 'Re: 周末徒步的路线', '路线已经整理好了，全程大约六公里，不用起得太早。', 1, 1],
  ['Cloud Mail', '欢迎回到你的私人邮箱', '所有来信，安静地汇聚在这里。', 1, 1],
];
let messages = samples.map(([name, subject, text, accountId, unread], i) => ({
  emailId: 100 - i, accountId, userId: 1, name, subject, text,
  sendEmail: `${['zhixia','notifications','chenyi','weekly','news','notes','zhouhang','welcome'][i]}@example.org`,
  senderEmail: '', toEmail: accounts.find(a => a.accountId === accountId).email,
  recipient: JSON.stringify([{ address: accounts.find(a => a.accountId === accountId).email, name: 'Tymee' }]),
  cc: '[]', bcc: '[]', content: '', type: 0, status: 0, unread, isDel: 0,
  isStar: i === 0 || i === 3 ? 1 : 0, attList: [], code: '', messageId: `preview-${i}`,
  createTime: new Date(Date.now() - (i * 98 + 12) * 60000).toISOString().replace('T', ' ').slice(0, 19),
}));
messages[0].content = `<div style="font-family:-apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif;color:#344052;line-height:1.95;font-size:14px;padding:4px 0 24px"><p style="color:#8490a2;font-size:11px;letter-spacing:2px;margin:0 0 23px">STUDIO NOTES / 设计更新</p><h1 style="font-size:28px;line-height:1.4;letter-spacing:-1px;color:#202b3b;margin:0 0 24px;font-weight:600">把细节放回体验里。</h1><p>Tymee，你好，</p><p>这几天，我们重新梳理了邮箱的阅读体验。少一些干扰，给内容更多空间，让每一次打开都轻松一点。</p><div style="border-left:2px solid #82b4ef;padding:4px 0 4px 18px;margin:25px 0;color:#5d7190">清晰的层次、自然的留白，<br/>还有恰到好处的通透感。</div><p>更新后的方案已经准备好了。下周一下午，我们可以一起看看实际效果，再慢慢打磨那些细小但重要的地方。</p><p style="margin-top:28px">周末愉快。<br/><strong style="font-weight:550">知夏</strong></p><p style="font-size:11px;color:#91a0b2;margin-top:28px">Sent with a little thought and a lot of care.</p></div>`;

export async function adapter(config) {
  const url = new URL(config.url, 'http://preview.local');
  const path = url.pathname;
  const params = { ...Object.fromEntries(url.searchParams), ...config.params };
  const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : config.data || {};
  let data = null;
  let code = 200;
  let message = '';
  if (path === '/setting/websiteConfig') data = { ...settings, domainList: localStorage.getItem('token') ? settings.domainList : [] };
  else if (path === '/setting/query') data = { ...settings };
  else if (path === '/setting/set') { Object.assign(settings, body); }
  else if (path === '/login') data = { token: 'local-ui-preview-only' };
  else if (path === '/logout') data = null;
  else if (path === '/my/loginUserInfo') data = { ...user };
  else if (path === '/account/list') data = params.accountId ? [] : [...accounts];
  else if (path === '/account/setAllReceive') {
    const a = accounts.find(a => a.accountId === Number(body.accountId));
    if (a) {
      const next = a.allReceive ? 0 : 1;
      accounts.forEach(item => { item.allReceive = 0; });
      a.allReceive = next;
    }
  }
  else if (path === '/account/setName') { const a = accounts.find(a => a.accountId === body.accountId); if (a) a.name = body.name; }
  else if (path === '/account/add') { data = { ...accounts[0], email: body.email, accountId: accounts.length + 1, allReceive: 0 }; accounts.push(data); }
  else if (path === '/email/list' || path === '/star/list' || path === '/allEmail/list') {
    let list = messages.filter(m => !m.isDel);
    if (Number(params.type) === 1) list = [];
    const scope = Number(params.allReceive);
    const allReceive = Number.isNaN(scope) ? accounts.find(a => a.accountId === Number(params.accountId))?.allReceive : scope;
    if (!allReceive && params.accountId) list = list.filter(m => m.accountId === Number(params.accountId));
    if (path === '/star/list') list = list.filter(m => m.isStar);
    if (params.emailId) list = list.filter(m => m.emailId < Number(params.emailId));
    if (params.text) list = list.filter(m => `${m.subject} ${m.text} ${m.name}`.toLowerCase().includes(String(params.text).toLowerCase()));
    data = { list: list.map(m => ({ ...m })), total: list.length, latestEmail: list[0] || {} };
  }
  else if (path === '/email/latest') data = [];
  else if (path === '/email/read') { const ids = String(body.emailIds).split(',').map(Number); messages.forEach(m => { if (ids.includes(m.emailId)) m.unread = 1; }); }
  else if (path === '/email/delete') { const ids = String(params.emailIds).split(',').map(Number); messages = messages.filter(m => !ids.includes(m.emailId)); }
  else if (path === '/email/send') { code = 400; message = '这是设计预览，邮件不会实际发送。'; }
  else if (path === '/star/add' || path === '/star/cancel') { const m = messages.find(m => m.emailId === Number(body.emailId || params.emailId)); if (m) m.isStar = path.endsWith('/add') ? 1 : 0; }
  else if (path === '/draft/list') data = [];
  else if (path === '/draft/add' || path === '/draft/set') data = { draftId: 1, ...body };
  else if (path.endsWith('/list') || path.endsWith('/tree')) data = [];
  else if (path === '/analysis/echarts') data = {};
  return { data: structuredClone({ code, data, message }), status: 200, statusText: 'OK', headers: {}, config };
}
