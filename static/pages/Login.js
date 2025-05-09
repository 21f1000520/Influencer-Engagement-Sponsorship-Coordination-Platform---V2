import router from "../utils/router.js";

const Login = {
  template: `
    <div class="d-flex justify-content-center align-items-center vh-100 appear">
      <div class="card shadow p-4 border rounded-3 w-35">
        <h3 class="card-title text-center mb-4">Login</h3>
        <div class="form-group mb-3">
          <input v-model="email" type="email" class="form-control" placeholder="Email" required/>
        </div>
        <div class="form-group mb-4">
          <input v-model="password" type="password" class="form-control" placeholder="Password" required/>
        </div>
        <div class="form-group alert alert-danger py-1"  v-show="this.notFound" role="alert"> 
              <i class="bi bi-exclamation-triangle-fill"></i> No Such User Exist 
        </div>
        <div id = "loginError" class="form-group alert alert-danger py-1"  v-show="this.wrongPass">
          <i class="bi bi-exclamation-triangle-fill"></i> Wrong Password 
        </div>
        <div id = "loginError" class="form-group alert alert-danger py-1"  v-show="this.notActive"> 
              <i class="bi bi-exclamation-triangle-fill"></i> User must be activated first by the Admin 
        </div>

        <button class="btn btn-primary w-100" @click="submitInfo">Log In</button>
       
        <router-link to="/register"><button type="button" class="btn btn-success w-100 shadow">Register</button></router-link>
        
        </div>
       
    </div>
  `,
  data() {
    return {
      email: "",
      password: "",
      notFound:false,
      wrongPass:false,
      notActive:false,
    };
  },

  mounted(){
    // this.$router.go();
    console.log('mounted log in page')
    this.$store.commit("logout", false);
  },
  methods: {


    async submitInfo() {
      const url = window.location.origin;
      const res = await fetch(url + "/user_login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: this.email, password: this.password }),
      });

      if (res.ok) {
        const data = await res.json();

        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("role", data.role);
        sessionStorage.setItem("email", data.email);
        sessionStorage.setItem("id", data.id);

        console.log(sessionStorage.getItem("role"));

        // add data to vuex
        this.$store.commit("setRole", data.role);
        this.$store.commit("setLogin", true);
        setTimeout(function() { sessionStorage.clear(); }, (30*60 * 1000));
        switch (data.role) {
          case "spons":
            this.$router.push("/dashboard-spons");
            break;
          case "infl":
            this.$router.push("/dashboard-infl");
            break;
          case "admin":
            this.$router.push("/dashboard-admin");
        }
      } else {
        let data = await res.json();
        console.log(data)
        if (data.message==='invalid user'){
          this.notFound=true;
        }
        if (data.message==='wrong password'){
          this.wrongPass=true;
        }
        if (data.message==='User not activated'){
          this.notActive=true;
        }
        setTimeout(() => this.wrongPass = false, 3000)
        setTimeout(() => this.notFound = false,  3000)
        setTimeout(() => this.notActive = false, 3000)
        console.error("Login Failed");
      }
    },
  },
};

export default Login;
