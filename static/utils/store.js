const store = new Vuex.Store({
  state: {
    loggedIn: false,
    role: "",
  },
  getters: {
    getLoginState(state) {
      console.log(sessionStorage.getItem('email'), 'inside')
      if (sessionStorage.getItem('email')) {
        state.loggedIn = true;
        return true;
      }
      return state.loggedIn;
    },
    getRole(state) {
      if (sessionStorage.getItem('role')) {
        state.role = sessionStorage.getItem('role');
        return state.role;
      }
      return state.role;
    }
  },
  mutations: {
    setLogin(state) {
      state.loggedIn = true;
    },
    logout(state) {
      Object.assign(state.loggedIn, false)
      state.role = ""
    },
    setRole(state, role) {
      state.role = role;
    },
  },
});

export default store;
