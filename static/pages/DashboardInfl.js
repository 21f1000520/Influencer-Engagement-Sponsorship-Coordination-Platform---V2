const DashboardInfl = {
  template: `<div class="row d-flex justify-content-center">
              <div class="col-8  justify-content-center" style="text-align: center;">
                <h1 class="block" style="background: red;">Welcome {{this.user_data.fname}}</h1>
                <div v-if="this.flagged" class="alert alert-danger" role="alert"> 
                  <h1>You Have been Flagged by Admin, contact Admin!!!</h1>
                </div>
                <div v-else>
                  <div class="container" >

                    <div class="row align-items-center" >

                        <div class="col-4 align-items-center" style="margin-top: 1%;">
                          <img v-bind:src="'/static/images/'+imagename" class="rounded mx-auto d-block img-fluid" alt="Profile Picture" style="width: 200px;">
                          <div class="form-container">
                            <label for = "file" class="form-label">Upload Profile Pic</label>
                            <input class="form-control" type="file" @change="handleFileUpload( $event )" id='file'/>
                            <div style="margin-top:10%;">
                              <button v-if="showupload" @click="uploadImage" class="btn btn-primary">Upload</button>
                              <button v-else class="btn btn-light" disabled >Upload</button>
                            </div>
                          </div>
                        </div>
                        
                        <div class="col-1"></div>
                        
                        <div class="col-7 " style="margin-top: 0%; background:rgb(210, 233, 233);">
                            <ul class="list-group list-group-flush" >
                                <li class="list-group-item"> {{this.user_data.fname}} {{this.user_data.lname}} </li>
                                <li class="list-group-item"> {{this.user_data.email}} </li>
                                <li class="list-group-item" v-if="this.user_data.role==='infl'">
                                  <span class="badge bg-secondary" style="margin-left:5%;" v-for="(plt,index2) in this.user_data.plateforms"> 
                                    {{ plt }}
                                  </span>
                                </li>
                                <li class="list-group-item" style="columns: red;" v-if="this.user_data.role==='infl'">{{this.user_data.aboutMe}}</li>
                            </ul>
                            <div style="margin-top:5%">
                                <a class="btn btn-outline-info" @click="update_profile"> Update Profile </a>
                            </div>
                        </div>

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
      showupload:false
     }
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
      
    }

    if (this.user_data.dp_name){
      console.log(this.user_data.dp_name);
      this.imagename=this.user_data.dp_name;
    }
  },

  methods:{
    
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
    }
  }

};

export default DashboardInfl;
