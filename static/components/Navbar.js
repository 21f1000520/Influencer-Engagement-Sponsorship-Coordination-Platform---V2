// import { state, logout } from "../utils/state.js";
// import router from "../utils/router.js";

const Navbar = {
  template: `
    <nav  class="h2 navbar navbar-expand-sm navbar-dark justify-content-center" >
        <ul class="navbar-nav">
            <li class="nav-item"  v-if="!store.getters.getLoginState"  >
                <router-link to="/login"><button type="button" class="btn btn-primary bt-custom-login shadow">Login</button></router-link>
            </li>
            <li class="nav-item" v-if="!store.getters.getLoginState"   >
                <router-link to="/register"><button type="button" class="btn btn-success shadow">Register</button></router-link>
            </li>
            <li class="nav-item"  v-if="store.getters.getLoginState && store.getters.getRole === 'admin'"   >
                <router-link to="/dashboard-admin"><button type="button" class="btn btn-warning bt-custom-dashboard shadow">Dashboard</button></router-link>
            </li>
            <li class="nav-item"  v-if="store.getters.getLoginState && store.getters.getRole === 'infl'"   >
                <router-link to="/dashboard-infl"><button type="button" class="btn btn-warning bt-custom-dashboard shadow">Dashboard</button></router-link>
            </li>

            <li class="nav-item"  v-if="store.getters.getLoginState && store.getters.getRole === 'spons'"  >
                 <router-link to="/dashboard-spons"><button type="button" class="btn btn-warning bt-custom-dashboard shadow" >Dashboard</button></router-link>
            </li>

            <li class="nav-item"  v-if="store.getters.getLoginState && ['spons','infl'].includes(store.getters.getRole)"  >
                 <router-link to="/stats"><button type="button" class="btn btn-info bt-custom-dashboard shadow" >Stats</button></router-link>
            </li>

            <li class="nav-item" v-if="store.getters.getLoginState"   >
                <button type="button" class="btn btn-danger shadow" @click="logout">Logout</button>
            </li>
      </ul>
      </nav>
  `,

  methods: {
    logout() {
      // clear session
      sessionStorage.clear();

      // clear vuex login info
      this.$store.commit("logout");
      this.$store.commit("setRole", null);
      console.log(this.$store.getters.getLoginState,'login state after logout');
      this.$router.push("/login");
      this.$router.go();

    },

  },
  computed: {
    store() {
      console.log(this.$store.getters.getLoginState,'login state');
      return this.$store;
    },
  },
};


export default Navbar;
