// import { state, logout } from "../utils/state.js";
// import router from "../utils/router.js";

const Navbar = {
  template: `
    <nav  class="h2 navbar navbar-expand-sm bg-dark navbar-dark justify-content-center">
        <ul class="navbar-nav">
            <li class="nav-item"  v-if="!store.getters.getLoginState" style="padding-left: 2px; padding-right: 2px;">
                <router-link to="/login">Login</router-link>
            </li>
            <li class="nav-item" v-if="!store.getters.getLoginState"  style="padding-left: 2px; padding-right: 2px;">
                <router-link to="/register">Register</router-link>
            </li>
            <li class="nav-item"  v-if="store.getters.getLoginState && store.getters.getRole === 'admin'"  style="padding-left: 2px; padding-right: 2px;">
                <router-link to="/dashboard-admin">Dashboard</router-link>
            </li>
            <li class="nav-item"  v-if="store.getters.getLoginState && store.getters.getRole === 'infl'"  style="padding-left: 2px; padding-right: 2px;">
                <router-link to="/dashboard-infl">Dashboard</router-link>
            </li>

            <li class="nav-item"  v-if="store.getters.getLoginState && store.getters.getRole === 'spons'"  style="padding-left: 2px; padding-right: 2px;">
                <router-link to="/dashboard-spons">Dashboard</router-link>
            </li>

            <li class="nav-item" v-if="store.getters.getLoginState"  style="padding-left: 10px; padding-right: 0px;">
                <button class="btn btn-danger text-xl" @click="logout">Logout</button>
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
