import router from "../utils/router.js";

const Register = {
  template: `
    <div class="d-flex justify-content-center align-items-center vh-500">
      <div class="card shadow p-4">
        <h3 class="card-title text-center mb-4">Sign Up</h3>
        <div class="form-group mb-3">
          <label for="email" class="form-label">Email address*</label>
          <input v-model="email" type="email" class="form-control" placeholder="Email" id="email" required />
        </div>
        <div id="email_validation" v-if="!isValidEmail">Email is {{isValidEmail ? 'valid' : 'invalid'}}</div>
        <div class="form-group mb-4">
          <label for="password" class="form-label">Password*</label>
          <input v-model="password" type="password" class="form-control" placeholder="Password" id="password" required/>
          <div v-if="this.password.length<4" id="plateform_validation">Password length should be atleast 4</div>
        </div>
        <div class="form-group mb-4">
          <label for="fname" class="form-label">First Name*</label>
          <input v-model="fname" type="text" class="form-control" placeholder="First Name" id="fname" required/>
          <div v-if="this.fname.length===0" id="plateform_validation">Enter First Name</div>
        </div>
        <div class="form-group mb-4">
          <label for="lname" class="form-label">Last Name</label>
          <input v-model="lname" type="text" class="form-control" placeholder="Last Name" id="lname"/>
        </div>
        <div class="form-group mb-4">
          <label for="roles" class="form-label">Select Role*</label>
          <select v-model="role" class="form-control" id="roles">
            <option value="spons">Sponser</option>
            <option value="infl">Influencer</option>
          </select>
        </div>
        <div v-if="role==='infl'" class="form-group mb-4">
          <label for="aboutMe" class="form-label">About Me</label>
          <textarea  v-model="aboutMe" class="form-control" id="aboutMe" rows="3"></textarea>

          <input type="checkbox" id="Instagram" value="Instagram" v-model="platforms" />
          <label for="Instagram">Instagram</label>

          <input type="checkbox" id="Twitter" value="Twitter" v-model="platforms" />
          <label for="Twitter">Twitter</label>

          <input type="checkbox" id="Youtube" value="Youtube" v-model="platforms" />
          <label for="Youtube">Youtube</label>
          <div v-if="this.platforms.length===0" id="plateform_validation">Select atleast one Plateform</div>
        </div>
        <div v-if="role==='spons'" class="form-group mb-4">
          <label for="industry" class="form-label">Industry*</label>
          <input  v-model="industry" class="form-control" id="industry" type="text" required/>
          <div v-if="this.industry.length===0" id="plateform_validation">Enter Industry</div>
        </div>

        <button class="btn btn-primary w-100" @click="click_submit">Submit</button>
      </div>
    </div>
  `,
  data() {
    return {
      email: "",
      password: "",
      fname:"",
      lname:"",
      role: "",
      aboutMe:"",
      platforms:[],
      industry:"",
      error_email:"",
      error_plateform:"",
      error_role:"",
      error_password:"",
    };
  },

  
computed: {
    isValidEmail() {
      if (!/^[^@]+@\w+(\.\w+)+\w$/.test(this.email)){
        this.error_email="Enter Valid Email address";
        return false;
        }
        this.error_email="";
        return true;
      },
    
    isRole(){
      return this.role.length>0
    },

    passwordCheck(){
      if (this.password.length<4){
        this.error_password="Password should be atleast 4 character long";
        return false;
      }
      this.error_password=""
      return true;
    },

    firstNameCheck(){
      if (this.fname.length===0){
        return false;
      }
      return true;
    },

    
  },
  
  methods: {
    check_form(){
      if (this.role==='infl'){
          console.log(this.platforms.length)
          if (this.platforms.length===0){
            this.error_plateform="select atleast one plateform";
            console.log('plateform wrong')
            return false;
            } else{
              this.error_plateform="";
              return true;
               }
        } else {
            return true
          }
      },

    error_show(){
      if (this.error_email){

        alert(this.error_email);
      }
      if (this.error_plateform){

        alert(this.error_plateform);
      }
      if (!this.isRole){
        
        alert('select Role');
      }
      if (this.error_password){
        alert(this.error_password);
      }

      if (!this.firstNameCheck){
        alert('Enter First Name');
      }

    },
    // validateEmail() {
    //   if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.email)) {
    //       this.msg['email'] = 'Please enter a valid email address';
    //     } else {
    //       this.msg['email'] = '';
    //     }   
    // },

    click_submit(){
      this.check_form()
      console.log(this.error_email)
      console.log(this.error_plateform)
      console.log(this.role.length)
      if (this.error_email !== "" || this.error_plateform!=="" || !this.isRole || !this.passwordCheck || !this.firstNameCheck){
        this.error_show();
      }else{
        this.submitInfo();
      }
    },
    
    async submitInfo() {
        const origin = window.location.origin;
        const url = `${origin}/register`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({

            email: this.email,
            password: this.password,
            role: this.role,
            fname:this.fname,
            lname:this.lname,
            industry:this.industry,
            platforms:this.platforms
          }),
          credentials: "same-origin",
        });

        if (res.ok) {
          const data = await res.json();
          console.log(data);
          // Handle successful sign up, e.g., redirect or store token
          router.push("/login");
        } else {
          const errorData = await res.json();
          console.error("Sign up failed:", errorData);
          // Handle sign up error
        }
    },
  },
};

export default Register;
