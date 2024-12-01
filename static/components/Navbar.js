// import { state, logout } from "../utils/state.js";
// import router from "../utils/router.js";

const Navbar = {
  template: `
    <nav  class="h2 navbar navbar-expand-sm navbar-dark " >
      <i v-if="!store.getters.getLoginState" class="bi bi-lock-fill" style="position: absolute;right: 10px;"></i>
      <i v-if="store.getters.getLoginState" class="bi bi-unlock" style="position: absolute;right: 10px;"></i>
      <div class="container-fluid d-flex justify-content-center">
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="mx-auto collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav mx-auto">
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

              <li class="nav-item"  v-if="store.getters.getLoginState"  >
                  <router-link to="/stats"><button type="button" class="btn btn-info shadow" > Stats </button></router-link>
              </li>

              <li class="nav-item" v-if="store.getters.getLoginState"   >
                  <button type="button" class="btn btn-danger shadow" @click="logout">Logout</button>
              </li>
          </ul>
        </div>
        </div>
      </nav>
  `,

  data(){
    return{
    LoginState:{true:"&#128994",false:"&#128997"}}
  },

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
