const DashboardSpons = {
  template: `<div class="row d-flex justify-content-center">
                <div class="col-8  justify-content-center" style="text-align: center;">
                    <h1 class="block" style="background: blue;">Welcome Sponsor {{this.user_data.fname}}</h1>
                    <div v-if="this.flagged" class="alert alert-danger" role="alert"> 
                        <h1>You Have been Flagged by Admin, contact Admin!!!</h1>
                    </div>
                    <div v-else> 
                    
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













            };

export default DashboardSpons;
