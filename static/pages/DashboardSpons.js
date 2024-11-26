import campaign from "../components/Campaign_view.js";




const DashboardSpons = {


  template: `<div class="row d-flex justify-content-center" v-bind:class="{'blurrclass':blurr}">
                <div class="col-8  justify-content-center" style="text-align: center;">
                    <h1 class="block " style="background: blue;">Welcome Sponsor {{this.user_data.fname}}</h1>
                    <div v-if="this.flagged" class="alert alert-danger" role="alert"> 
                        <h1>You Have been Flagged by Admin, contact Admin!!!</h1>
                    </div>
                    <div v-else> 
                    <campaign :camps=this.campaigns @blurr="Blurr_back" style="text-align: center;"/>
                    <button type="button" class="btn btn-danger" @click="Add_Campaign" style="border-radius: 26px;">Add Campaign</button>
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

    methods:{
        Add_Campaign(){
            this.$router.push("/add_campaign");
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
