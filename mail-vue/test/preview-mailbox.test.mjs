import test from 'node:test';
import assert from 'node:assert/strict';

let instance = 0;
async function preview() {
  return (await import(`../src/preview/mailbox.js?test=${++instance}`)).adapter;
}
async function request(adapter, url, params = {}, data = {}) {
  return (await adapter({ url, params, data })).data.data;
}

test('preview responses behave like independent HTTP payloads', async () => {
  const adapter = await preview();
  const clientAccounts = await request(adapter, '/account/list');
  // A local UI update must not also mutate the simulated server.
  clientAccounts[1].allReceive = 1;
  const unchanged = await request(adapter, '/account/list');
  assert.equal(unchanged[1].allReceive, 0);

  await request(adapter, '/account/setAllReceive', {}, { accountId: 2 });
  const serverAccounts = await request(adapter, '/account/list');
  assert.deepEqual(serverAccounts.map(a => a.allReceive), [0, 1, 0]);
  serverAccounts[0].email = 'changed-on-client@example.com';
  assert.equal((await request(adapter, '/account/list'))[0].email, 'hello@example.com');
});

test('explicit all/single filters can round-trip repeatedly without losing messages', async () => {
  const adapter = await preview();
  for (const accountId of [1, 2, 3, 2, 1]) {
    const all = await request(adapter, '/email/list', { accountId, allReceive: 1 });
    assert.equal(all.total, 8);
    const single = await request(adapter, '/email/list', { accountId, allReceive: 0 });
    assert.equal(single.total, accountId === 3 ? 2 : 3);
    assert.ok(single.list.every(m => m.accountId === accountId));
    assert.equal((await request(adapter, '/email/list', { accountId, allReceive: 1 })).total, 8);
  }
});

test('preview falls back to the server account preference when the scope is omitted', async () => {
  const adapter = await preview();
  assert.equal((await request(adapter, '/email/list', { accountId: 1 })).total, 8);
  await request(adapter, '/account/setAllReceive', {}, { accountId: 2 });
  assert.equal((await request(adapter, '/email/list', { accountId: 1 })).total, 3);
  assert.equal((await request(adapter, '/email/list', { accountId: 2 })).total, 8);
});
