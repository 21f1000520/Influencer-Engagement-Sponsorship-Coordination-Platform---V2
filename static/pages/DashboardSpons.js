import campaign from "../components/Campaign_view.js";




const DashboardSpons = {


  template: `<div class="row d-flex justify-content-center" >
                <div class="col-8  justify-content-center" style="text-align: center;">
                    <div class="badge rounded-pill px-4 py-0 shadow" style="background: rgb(255, 178, 111); margin-bottom:5%"><h1>Welcome Sponsor {{this.user_data.fname}}</h1></div>
                    <div v-if="this.flagged" class="alert alert-danger" role="alert"> 
                        <h1>You Have been Flagged by Admin, contact Admin!!!</h1>
                    </div>
                    <div v-else> 
                    <campaign :camps=this.campaigns @blurr="Blurr_back" @reload_campaigns="Reload_camps" style="text-align: center;"/>
                    <button type="button" class="btn btn-success shadow-lg" @click="Add_Campaign" style="border-radius: 26px;">Add Campaign</button>
                    <router-link to="/update-user"><button type="button" class="btn btn-primary bt-custom-dashboard shadow-lg" style="border-radius: 26px;">Update Profile</button></router-link>
                    </div>
                </div>
            </div>
                
                `,
    data(){
     return {
      flagged:false,
      user_data:{},
      campaigns:[],
      flagged:false,
      blurr:false,
     }
    },

    async beforeMount(){
        console.log('before mount')
        let origin = window.location.origin;
        let url = `${origin}/get_current_user`;
        let res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authentication-Token":sessionStorage.getItem("token"),
        },
        });
        if (res.ok){
            let datas = await res.json();
            // this.all_influencers = datas;
            console.log(datas);
            this.flagged=datas.flag;
            this.user_data=datas;
            console.log(this.user_data,'user data')
        }else {
        let errorData = await res.json();
        console.error("No current user:", errorData);
        sessionStorage.clear()
        this.$router.push("/login");
        // this.$router.go();
        
        }

    },

    async mounted(){
        console.log('mounted')
        this.get_all_camps()
    },

    methods:{

        

        Add_Campaign(){
            this.$router.push("/add_campaign");
        },

        async Reload_camps(){
            console.log('signal recieved')
            this.get_all_camps()
        },

        async get_all_camps(){
            let origin = window.location.origin;
            let url = `${origin}/get_campaigns`;
            let res = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token":sessionStorage.getItem("token"),
                    },
                });
            if (res.ok){
                let datas = await res.json();
                // this.all_influencers = datas;
                console.log(datas);
                this.campaigns=datas;
                console.log(this.campaigns,'campaigns data')
            }else {
                let errorData = await res.json();
                console.error("No campaign found:", errorData);
        
            }


        },

        Blurr_back(){
            console.log('blurr');
            this.blurr=!this.blurr
        },

    },

    components:{
        campaign
    }

};

export default DashboardSpons;
