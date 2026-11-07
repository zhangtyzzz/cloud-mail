    import { defineStore } from 'pinia'

export const useAccountStore = defineStore('account', {
    state: () => ({
        currentAccountId: 0,
        currentAccount: {},
        viewAllMail: true,
        changeUserAccountName: ''
    }),
    getters: {
        allReceive: state => state.viewAllMail ? 1 : 0,
        mailboxScopeKey: state => `${state.currentAccountId}:${state.viewAllMail ? 'all' : 'single'}`,
    },
    actions: {
        selectMailbox(account, all = false) {
            this.currentAccountId = account.accountId;
            this.currentAccount = account;
            this.viewAllMail = all;
        },
    },
})