// import Navbar from "../components/Navbar.js";
import Home from "../pages/Home.js";
import Login from "../pages/Login.js";
import Register from "../pages/Register.js";
// import Logout from "../pages/Logout.js";
import DashboardInfl from "../pages/DashboardInfl.js";
import DashboardSpons from "../pages/DashboardSpons.js";
import DashboardAdmin from "../pages/DashboardAdmin.js";
// import Profile from "../pages/Profile.js";
import UpdateUser from "../components/UpdateUser.js";
import AddCamp from "../components/AddCampaign.js";

import store from "./store.js";
import Stats from "../pages/Stats.js";


const routes = [
  { path: "/", 
    component: Login,
    meta:{requiresLogout:true}, 
  },

  { path: "/login", component: Login, meta:{requiresLogout:true},  },
  { path: "/register", component: Register,meta:{requiresLogout:true},  },
//   { path: "/logout", component: Logout },
  {
    path: "/dashboard-infl",
    component: DashboardInfl,
    meta: { requiresLogin: true, role: "infl" },
  },

  {
    path: "/dashboard-spons",
    component: DashboardSpons,
    meta: { requiresLogin: true, role: "spons" },
  },

  {
    path: "/dashboard-admin",
    component: DashboardAdmin,
    meta: { requiresLogin: true, role: "admin" },
  },
  {
    path: "/update-user",
    component: UpdateUser,
    meta: { requiresLogin: true },
  },
  {
    path: "/add_campaign",
    component: AddCamp,
    meta: { requiresLogin: true, role: "spons" },
  },
  { path: "/stats", 
    name: "stats",
    component: Stats, 
    meta: { requiresLogin: true } },
];

const router = new VueRouter({
  routes,
});


// frontend router protection
router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresLogin)) {
    console.log('require log in')
    console.log(store.getters.getLoginState,'login state',store.getters.getRole,'role')
    if (!store.getters.getLoginState) {
      console.log('State show not logged in');
      next({ path: "/login" });
    } else if (to.meta.role && to.meta.role !== store.getters.getRole) {
      console.log('logged in, require role, but role dont match');
      next({ path: "/" });
    } else {
      console.log('logged in and role match');
      next();
    }
  } else {
    console.log('does not require log in');
    next();
  }
  if (to.matched.some((record) => record.meta.requiresLogout)) {
    console.log('require logout')
    if (store.getters.getLoginState) {
      console.log('inside loggedIn true');
      switch (store.getters.getRole) {
          case "spons":
            next({ path: "/dashboard-spons" });
            break;
          case "infl":
             next({ path: "/dashboard-infl" });
            break;
          case "admin":
             next({ path: "/dashboard-admin" });
        }
    }else {
    console.log('does not require log out');
    next();
  }
  }
});

export default router;
