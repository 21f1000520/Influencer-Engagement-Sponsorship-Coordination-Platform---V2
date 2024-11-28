const DashboardAdmin = {
  template: `
        <div class="row d-flex justify-content-center">
            <div class="col-8  justify-content-center" style="text-align: center;">
            <div class="badge rounded-pill px-4 py-0" style="background: #859F3D; margin-bottom:5%"><h1 class="display-5">Welcome Admin</h1></div>
                
                <div class="input-group">
                    <input type="text" class="form-control" placeholder="Search Influencers by Name" v-model="Search_term_inf"  >
                    <div class="input-group-btn">
                        <button class="btn btn-default" @click="search_inf">
                            <i class="bi bi-search"></i></i> 
                        </button>
                    </div>
                </div>
                
                <table class="table table-hover table-striped caption-top">
                <caption v-if="all_influencers.length>0"><h1 class="display-5">Influencers {{Search_term_inf}}</h1></caption>
                    <thead class="table-primary">
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">First Name</th>
                            <th scope="col">Last Name</th>
                            <th scope="col">Plateforms</th>
                            <th scope="col">E-mail</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody  v-if="all_influencers.length>0">
                        <tr v-for="(influencer,index) in all_influencers">
                            <td> {{ index+1 }} </td>
                            <td> {{ influencer.fname }} </td>
                            <td> {{ influencer.lname }} </td>
                            <td>
                            <p v-for="(plt,index2) in influencer.plateforms"> <i v-if="plt==='Instagram'" class="bi bi-instagram"></i> 
                                    <i v-if="plt==='Youtube'" class="bi bi-youtube"></i>
                                    <i v-if="plt==='Twitter'" class="bi bi-twitter-x"></i>
                                    {{ plt }} </p>
                            </td>
                            <td> {{ influencer.email }} </td>
                            <td> 
                                <button v-if="!influencer.flag" type="button" class="btn btn-warning" @click="Switch_Flag(influencer.id)"><i class="bi bi-flag"></i> Flag</button>
                                <button v-if="influencer.flag" type="button" class="btn btn-primary"  @click="Switch_Flag(influencer.id)"><i class="bi bi-flag-fill"></i> Unflag</button> 
                                <button type="button" class="btn btn-danger" data-bs-toggle="tooltip" data-bs-placement="top" title="Double Click to Delete"  @dblclick="Delete(influencer.id)"><i class="bi bi-trash"></i> Delete User</button> 
                            </td>

                        </tr>
                    </tbody>
                    <tbody v-else>
                        <tr> <td colspan="6"> No Influencer Found!! </td> </tr>
                    </tbody>
                </table>   

                <hr>
                <div class="input-group">
                    <input type="text" class="form-control" placeholder="Search Sponsors by Name" v-model="Search_term_inf"  >
                    <div class="input-group-btn">
                        <button class="btn btn-default" @click="search_inf">
                            <i class="bi bi-search"></i></i> 
                        </button>
                    </div>
                </div>
                <table class="table table-hover table-striped caption-top" v-if="all_sponsors.length>0">
                <caption v-if="all_sponsors.length>0"><h1 class="display-5">Sponsors</h1></caption>
                    <thead class="table-danger">
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
                                <button v-if="!sponsor.flag" type="button" class="btn btn-warning" @click="Switch_Flag(sponsor.id)"><i class="bi bi-flag"></i> Flag</button>
                                <button v-if="sponsor.flag" type="button" class="btn btn-primary"  @click="Switch_Flag(sponsor.id)"><i class="bi bi-flag-fill"></i> Unflag</button> 
                                <button v-if="!sponsor.active" type="button" class="btn btn-primary" @click="Switch_active(sponsor.id)">Activate</button>
                                <button v-if="sponsor.active" type="button" class="btn btn-info" @click="Switch_inactive(sponsor.id)">De-Activate</button>
                                <button type="button" class="btn btn-danger" data-bs-toggle="tooltip" data-bs-placement="top" title="Double Click to Delete"  @dblclick="Delete(sponsor.id)"><i class="bi bi-trash"></i> Delete User</button> 
                              
                            </td>
                        </tr>
                    </tbody>
                </table>   

                <hr>
                <table class="table table-hover table-striped caption-top" v-if="all_camps.length>0">
                <caption v-if="all_camps.length>0"><h1 class="display-5">Campaigns</h1></caption>
                    <thead class="table-success">
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Name</th>
                            <th scope="col">Details</th>
                            <th scope="col">Payment (Rs.)</th>
                            <th scope="col">Goals</th>
                            <th scope="col">Run By</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(Campaign,index) in all_camps" v-bind:class="{ 'table-danger': !Campaign.visibility}">
                            <th scope="row">{{ index+1 }}</th>
                            <td>{{ Campaign.name }}</td>
                            <td>{{ Campaign.description }}</td>
                            <td>{{ Campaign.budget }}</td>
                            <td>{{ Campaign.goals }}</td>
                            <td>{{ Campaign.sponsor_name }}</td>
                            <td>
                                <button v-if="!Campaign.flag" type="button" class="btn btn-warning" @click="Switch_Flag_camp(Campaign.id)"><i class="bi bi-flag"></i> Flag</button>
                                <button v-if="Campaign.flag" type="button" class="btn btn-primary"  @click="Switch_Flag_camp(Campaign.id)"><i class="bi bi-flag-fill"></i> Unflag</button> 
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
            all_camps:[],
            Search_term_inf:"",
        };
    },

    methods:{
        search_inf(){
            // console.log(this.Search_term_inf)
            if (this.Search_term_inf.length>0){
                let new_inf=[];
                let reg_search = new RegExp(this.Search_term_inf, 'gi')
                console.log(reg_search)
                for (let inf of this.all_influencers){
                    console.log(inf.fname,inf.lname)
                    if (inf.fname.search(reg_search)>=0){
                        console.log('found in first')
                        new_inf.push(inf)
                    }else if (inf.lname.search(reg_search)>=0){
                        console.log('found in last')
                        new_inf.push(inf)
                    }else{
                        console.log("not found")
                    }
                }
                this.all_influencers=new_inf;
            }
        },
        async Delete(id){
            console.log('delete user',id)
            const origin = window.location.origin;
            const url = `${origin}/delete_user/${id}`;
            const res = await fetch(url,{
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token":sessionStorage.getItem("token"),
                    },
                });
             if (res.ok){
                console.log('Switched');
                let datas = await res.json();
                console.log(datas)
                // if (datas.flag){
                //     alert('Flagged');
                // }else{
                //     alert('Un-Flagged')
                // }
                this.Get_all_infls()
                this.Get_all_spons()
                this.Get_all_camps()
             }else if(res.status===403 || res.status===401){
                console.error("Forbidden Request");
                sessionStorage.clear()
                this.$store.commit("logout");
                this.$store.commit("setRole", null);
                this.$router.push("/login");
            }else {
                const errorData = await res.json();
                console.error("could not flag, failed:", errorData);
            }
        },

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
                // if (datas.flag){
                //     alert('Flagged');
                // }else{
                //     alert('Un-Flagged')
                // }
                this.Get_all_infls()
                this.Get_all_spons()
             }else if(res.status===403 || res.status===401){
                console.error("Forbidden Request");
                sessionStorage.clear()
                this.$store.commit("logout");
                this.$store.commit("setRole", null);
                this.$router.push("/login");
            }else {
                const errorData = await res.json();
                console.error("could not flag, failed:", errorData);
            }

        },

        async Switch_Flag_camp(id){
            console.log('flag switch',id);
            const origin = window.location.origin;
            const url = `${origin}/switch-flag-camp/${id}`;
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
                // if (datas.flag){
                //     alert('Flagged');
                // }else{
                //     alert('Un-Flagged')
                // }
                this.Get_all_camps()
             }else if(res.status===403 || res.status===401){
                console.error("Forbidden Request");
                sessionStorage.clear()
                this.$store.commit("logout");
                this.$store.commit("setRole", null);
                this.$router.push("/login");
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
                // alert('Activated');
                this.Get_all_infls()
                this.Get_all_spons()
             }else if(res.status===403 || res.status===401){
                console.error("Forbidden Request");
                sessionStorage.clear()
                this.$store.commit("logout");
                this.$store.commit("setRole", null);
                this.$router.push("/login");
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
                // alert('De-Activated');
                this.Get_all_infls()
                this.Get_all_spons()
             }else if(res.status===403 || res.status===401){
                console.error("Forbidden Request");
                sessionStorage.clear()
                this.$store.commit("logout");
                this.$store.commit("setRole", null);
                this.$router.push("/login");
            }else {
                const errorData = await res.json();
                console.error("could not deactivate, failed:", errorData);
            }
        },

        async Get_all_infls(){
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
            }else if(res.status===403 || res.status===401){
                console.error("Forbidden Request");
                sessionStorage.clear()
                this.$store.commit("logout");
                this.$store.commit("setRole", null);
                this.$router.push("/login");
            }else {
            console.log(res.status===403)
            const errorData = await res.json();
            console.error("No influencers could be found, failed:", errorData);
            
            }
        },

        async Get_all_spons(){
            const url = `${origin}/users/spons`;
            const res = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authentication-Token":sessionStorage.getItem("token"),
            },
            });
            if (res.ok){
                const datas = await res.json();
                this.all_sponsors = datas;
                // console.log(datas2);
            }else if(res.status===403 || res.status===401){
                console.error("Forbidden Request");
                sessionStorage.clear()
                this.$store.commit("logout");
                this.$store.commit("setRole", null);
                this.$router.push("/login");
            }else {
            const errorData = await res.json();
            console.error("No sponsor could be found, failed:", errorData);
            
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
                
            }else if(res.status===403 || res.status===401){
                console.error("Forbidden Request");
                sessionStorage.clear()
                this.$store.commit("logout");
                this.$store.commit("setRole", null);
                this.$router.push("/login");
            }else {
            const errorData = await res.json();
            console.error("No campaigns", errorData);
            }
        },
    },

    async mounted(){
        console.log("mounted")
        this.Get_all_infls()
        this.Get_all_spons()
        this.Get_all_camps()
        

    },
};

export default DashboardAdmin;
