import router from "./utils/router.js";
import Navbar from "./components/Navbar.js";
import store from "./utils/store.js";
import AddCamp from "./components/AddCampaign.js";
import UpdateUser from "./components/UpdateUser.js";


new Vue({
  el: "#app",
  template: `
  <div>
    <Navbar/>
    <router-view/>
    </div>
    `,
  router,
  store,
  components: {
    Navbar,AddCamp,UpdateUser
  },
});