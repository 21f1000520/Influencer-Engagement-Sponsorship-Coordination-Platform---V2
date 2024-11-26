const DashboardAdmin = {
  template: `
        <div class="row d-flex justify-content-center">
            <div class="col-8  justify-content-center" style="text-align: center;">
            <h1 class="block">Welcome Admin</h1>
                <h2>List of all Influencers</h2>
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">First Name</th>
                                <th scope="col">Last Name</th>
                                <th scope="col">Plateforms</th>
                                <th scope="col">E-mail</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(influencer,index) in all_influencers">
                            <td> {{ index+1 }} </td>
                            <td> {{ influencer.fname }} </td>
                            <td> {{ influencer.lname }} </td>
                            <td>
                            <p v-for="(plt,index2) in influencer.plateforms"> {{ plt }} <span v-if="index2 != Object.keys(influencer.plateforms).length - 1">, </span> </p>
                            </td>
                            <td> {{ influencer.email }} </td>
                            <td> 
                                <button v-if="!influencer.flag" type="button" class="btn btn-danger" @click="Switch_Flag(influencer.id)">Flag</button>
                                <button v-if="influencer.flag" type="button" class="btn btn-primary"  @click="Switch_Flag(influencer.id)">Unflag</button> 
                            </td>

                        </tr>
                        </tbody>
                    </table>   

                <h2>List of all Sponsors</h2>
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">First Name</th>
                                <th scope="col">Last Name</th>
                                <th scope="col">E-mail</th>
                                <th scope="col">Industry</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(sponsor,index) in all_sponsors">
                            <td> {{ index+1 }} </td>
                            <td> {{ sponsor.fname }} </td>
                            <td> {{ sponsor.lname }} </td>
                            <td> {{ sponsor.email }} </td>
                            <td> {{ sponsor.industry }} </td>
                            <td> 
                                <button v-if="!sponsor.flag" type="button" class="btn btn-danger" @click="Switch_Flag(sponsor.id)">Flag</button>
                                <button v-if="sponsor.flag" type="button" class="btn btn-primary"  @click="Switch_Flag(sponsor.id)">Unflag</button> 
                                <button v-if="!sponsor.active" type="button" class="btn btn-primary" @click="Switch_active(sponsor.id)">Activate</button>
                                <button v-if="sponsor.active" type="button" class="btn btn-danger" @click="Switch_inactive(sponsor.id)">De-Activate</button>
                                
                            </td>

                        </tr>
                        </tbody>
                    </table>   
            </div>    
        </div>    
            `,
    data() {
        return {
            all_influencers:[],
            all_sponsors:[],
        };
    },

    methods:{
        async Switch_Flag(id){
            console.log('flag switch',id);
            const origin = window.location.origin;
            const url = `${origin}/switch-flag/${id}`;
            const res = await fetch(url,{
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token":sessionStorage.getItem("token"),
                    },
                });
             if (res.ok){
                console.log('Switched');
                let datas = await res.json();
                console.log(datas)
                if (datas.flag){
                    alert('Flagged');
                }else{
                    alert('Un-Flagged')
                }
                this.$router.go();
             }else {
                const errorData = await res.json();
                console.error("could not flag, failed:", errorData);
            }

        },

        async Switch_active(id){
            console.log('active switch',id);
            const origin = window.location.origin;
            const url = `${origin}/activate_spons/${id}`;
            const res = await fetch(url,{
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token":sessionStorage.getItem("token"),
                    },
                });
             if (res.ok){
                console.log('activated');
                alert('Activated');
                this.$router.go();
             }else {
                const errorData = await res.json();
                console.error("could not activate, failed:", errorData);
            }
        },

        async Switch_inactive(id){
            console.log('Deactive switch',id);
            const origin = window.location.origin;
            const url = `${origin}/deactivate_spons/${id}`;
            const res = await fetch(url,{
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token":sessionStorage.getItem("token"),
                    },
                });
             if (res.ok){
                console.log('deactivated');
                alert('De-Activated');
                this.$router.go();
             }else {
                const errorData = await res.json();
                console.error("could not deactivate, failed:", errorData);
            }
        },
    },

    async mounted(){
        console.log("mounted")
        const origin = window.location.origin;
        const url = `${origin}/users/infl`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token":sessionStorage.getItem("token"),
          },
        });
        if (res.ok){
            const datas = await res.json();
            this.all_influencers = datas;
            // console.log(datas);
        }else {
          const errorData = await res.json();
          console.error("No influencers could be found, failed:", errorData);
         
        }

        const url2 = `${origin}/users/spons`;
        const res2 = await fetch(url2, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token":sessionStorage.getItem("token"),
          },
        });
        if (res.ok){
            const datas2 = await res2.json();
            this.all_sponsors = datas2;
            // console.log(datas2);
        }else {
          const errorData = await res.json();
          console.error("No sponsor could be found, failed:", errorData);
          
        }

    },
};

export default DashboardAdmin;
