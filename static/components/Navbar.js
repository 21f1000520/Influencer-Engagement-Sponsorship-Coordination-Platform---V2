// import { state, logout } from "../utils/state.js";
// import router from "../utils/router.js";

const Navbar = {
  template: `
    <nav class="navbar navbar-expand-sm bg-dark navbar-dark justify-content-center">
        <ul class="navbar-nav">
            <li class="nav-item" style="padding-left: 2px; padding-right: 2px;">
                <router-link to="/">Home</router-link>
            </li>
            <li class="nav-item" style="padding-left: 2px; padding-right: 2px;">
                <router-link v-if="!state.loggedIn" to="/login">Login</router-link>
            </li>
            <li class="nav-item" style="padding-left: 2px; padding-right: 2px;">
                <router-link v-if="!state.loggedIn" to="/register">Regsiter</router-link>
            </li>
            <li class="nav-item" style="padding-left: 2px; padding-right: 2px;">
                <button class="btn btn-warning text-xl" v-if="state.loggedIn" @click="logout">Logout</button>
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

      this.$router.push("/");
    },
  },
  computed: {
    state() {
      return this.$store.state;
    },
  },
};

export default Navbar;
