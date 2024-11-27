import show_campaigns from "../components/Show_camps.js";


const DashboardInfl = {
  template: `
            <div class="row d-flex justify-content-center">
              <div class="col-9  justify-content-center" style="text-align: center;">
                <div class="badge rounded-pill px-4 py-0" style="background: rgb(177, 116, 87); margin-bottom:5%"><h1>Welcome {{this.user_data.fname}}</h1></div>
                
                
                <div v-if="this.flagged" class="alert alert-danger" role="alert"> 
                  <h1>You Have been Flagged by Admin, contact Admin!!!</h1>
                </div>
                <div v-else>
                  <div class="container" >
                    <div class="row align-items-center" >

                        <div class="col-6 align-items-center rounded" style="margin-top: 1%;">
                          <img v-bind:src="'/static/images/'+imagename" class="rounded img-fluid" alt="Profile Picture" style="max-width: 70%;">
                          <div class="form-container">
                            <label for = "file" class="form-label" style="margin-top:10%;"><h6>Upload Profile Pic</h6></label>
                            <input class="form-control" type="file" @change="handleFileUpload( $event )" id='file'/>
                            <div style="margin-top:5%;">
                              <button v-if="showupload" @click="uploadImage" class="btn btn-primary">Upload</button>
                              <button v-else class="btn btn-light " disabled >Upload</button>
                            </div>
                          </div>
                        </div>

                        <div class="col-8 shadow-lg p-3 mb-5 bg-transparent rounded" style="margin-top: 0%; background:rgb(210, 233, 233); width:50%; border-radius: 50px;">
                            <ul class="list-group list-group-flush bg-transparent" >
                                <li class="list-group-item display-5 bg-transparent"> {{this.user_data.fname}} {{this.user_data.lname}} </li>
                                <li class="list-group-item h5 bg-transparent"> {{this.user_data.email}} </li>
                                <li class="list-group-item h5 bg-transparent" v-if="this.user_data.role==='infl'">
                                  <span class="badge bg-secondary h5" style="margin-left:5%;" v-for="(plt,index2) in this.user_data.plateforms"> 
                                    {{ plt }}
                                  </span>
                                </li>
                                <li class="list-group-item h5 text-muted bg-transparent" style="columns: red;" v-if="this.user_data.role==='infl'">{{this.user_data.aboutMe}}</li>
                            </ul>
                            <div style="margin-top:5%">
                                <a class="btn btn-outline-info h2" @click="update_profile"> Update Profile </a>
                            </div>
                        </div>

                    </div>

                  </div>
                  
                  
                  <div class="row d-flex justify-content-center">
                    <div class="col-12  justify-content-center" style="text-align: center;">
                      <button type="button" class="btn btn-danger w-50" @click="view_all_camps" style="border-radius: 26px;">View Campaigns</button>
                    
                      <show_campaigns v-if="this.showCamps" :all_camps="all_camps" 
                      :req_to_inf="req_to_inf" :req_to_spons="req_to_spons" :id="user_data.id"
                      @recal_sent_spons="Get_all_sent_to_spons" @recal_sent_inf="Get_all_sent_to_infl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            `,
  data(){
     return {
      flagged:false,
      user_data:{},
      imagename:"sample.jpg",
      file:null,
      filename:null,
      showupload:false,
      showCamps:false,
      all_camps:[],
      req_to_inf:[],
      req_to_spons:[],
     }
  },

  async beforeMount(){
    console.log('before mount')
    this.Get_all_camps();
    this.Get_all_sent_to_infl();
    this.Get_all_sent_to_spons();
  },

  async mounted(){
    console.log('mounted')
    const origin = window.location.origin;
    const url = `${origin}/get_current_user`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authentication-Token":sessionStorage.getItem("token"),
      },
    });
    if (res.ok){
        const datas = await res.json();
        // this.all_influencers = datas;
        console.log(datas);
        this.flagged=datas.flag;
        this.user_data=datas;
        console.log(this.user_data,'user data')
    }else {
      const errorData = await res.json();
      console.error("No current user:", errorData);
      sessionStorage.clear()
      this.$router.push("/login");
    }

    if (this.user_data.dp_name){
      console.log(this.user_data.dp_name);
      this.imagename=this.user_data.dp_name;
    }
  },

  methods:{
    async Get_all_sent_to_infl(){
        const origin = window.location.origin;
        const url = `${origin}/get_all_req_to_inf`;
        const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authentication-Token":sessionStorage.getItem("token"),
        },
        });
        if (res.ok){
            const datas = await res.json();
            // this.all_influencers = datas;
            console.log(datas,'sent to infl');
            this.req_to_inf=datas;
            
        }else {
        const errorData = await res.json();
        console.error("No requests to infl", errorData);
        }
    },
    async Get_all_sent_to_spons(){
        const origin = window.location.origin;
        const url = `${origin}/get_all_req_to_spons`;
        const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authentication-Token":sessionStorage.getItem("token"),
        },
        });
        if (res.ok){
            const datas = await res.json();
            // this.all_influencers = datas;
            console.log(datas);
            this.req_to_spons=datas;
            
        }else {
        const errorData = await res.json();
        console.error("No requests recieved to sponsor", errorData);
        }
    },


    async Get_all_camps(){
        const origin = window.location.origin;
        const url = `${origin}/get_all_campaigns`;
        const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authentication-Token":sessionStorage.getItem("token"),
        },
        });
        if (res.ok){
            const datas = await res.json();
            // this.all_influencers = datas;
            console.log(datas);
            this.all_camps=datas;
            
        }else {
        const errorData = await res.json();
        console.error("No campaigns", errorData);
        }
    },




    validateFile(filename){
      let allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
      
      if (!allowedExtensions.exec(filename)) {
        alert('Invalid file type');
        return false;
      } 
      else 
      {
        return true;
      }
    },
    
    async update_profile(){
      console.log('update profile')
      this.$router.push("/update-user")

    },
    handleFileUpload( e ){
      this.file = e.target.files[0];
      let extention = this.file.name.substring(this.file.name.lastIndexOf('.')+1, this.file.name.length) || this.file.name;
      console.log(this.file.name,extention)
      if  (this.validateFile(this.file.name)){
        this.showupload=true;
        this.filename = this.user_data.fname+'_'+this.user_data.id+'.'+extention
        console.log(this.filename)
      }
            
    },

    async uploadImage() {
      let formData = new FormData();
      formData.append('file', this.file);
      formData.append('name', this.filename);

      for (let key of formData.entries()) {
        console.log(key[0] + ', ' + key[1]);
      }

      const origin = window.location.origin;
      const url = `${origin}/upload_image`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Authentication-Token":sessionStorage.getItem("token"),
        },
        body: formData,
        });

      if (res.ok){
        const response = await res.json();
        console.log(response);
        this.$router.go();
    }else {
      const errorData = await res.json();
      console.error("could not upload:", errorData);
      
    }
    },

    view_all_camps(){
      console.log('view camps')
      this.showCamps=!this.showCamps
    }
  },
  components:{
    show_campaigns
  }

};

export default DashboardInfl;
