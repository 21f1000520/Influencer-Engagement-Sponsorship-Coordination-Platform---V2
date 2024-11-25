// import Navbar from "../components/Navbar.js";
import Home from "../pages/Home.js";
import Login from "../pages/Login.js";
import Register from "../pages/Register.js";
// import Logout from "../pages/Logout.js";
import DashboardInfl from "../pages/DashboardInfl.js";
import DashboardSpons from "../pages/DashboardSpons.js";
import DashboardAdmin from "../pages/DashboardAdmin.js";
// import Profile from "../pages/Profile.js";
import UpdateUser from "../pages/UpdateUser.js";

import store from "./store.js";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
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
//   { path: "/profile", component: Profile, meta: { loggedIn: true } },
];

const router = new VueRouter({
  routes,
});


// frontend router protection
router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresLogin)) {
    console.log(store.getters.getLoginState)
    if (!store.getters.getLoginState) {
      console.log('inside loggedIn false');
      next({ path: "/login" });
    } else if (to.meta.role && to.meta.role !== store.getters.getRole) {
      console.log('inside role false match');
      next({ path: "/" });
    } else {
      console.log('third if after login and role match');

      next();
    }
  } else {
    console.log('does not require log in');
    next();
  }
});

export default router;
