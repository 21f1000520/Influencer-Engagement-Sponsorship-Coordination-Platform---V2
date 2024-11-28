
const camp_dashboard={
    template:`
    <div class="popup" @click.self="$emit('ClosePopup')"> 
        <div class="popup-inner shadow-lg" style="max-width: 1920px; max-height: 100%;">
            <table class="table table-hover table-striped caption-top" v-if="untouched_influencer.length>0">
            <caption v-if="untouched_influencer.length>0"><h1 class="display-5">Available Influencers</h1></caption>
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
                <tr v-for="(influencer,index) in untouched_influencer">
                    <td> {{ index+1 }} </td>
                    <td> {{ influencer.fname }} </td>
                    <td> {{ influencer.lname }} </td>
                    <td>
                    <p v-for="(plt,index2) in influencer.plateforms"> {{ plt }} <span v-if="index2 != Object.keys(influencer.plateforms).length - 1">, </span> </p>
                    </td>
                    <td> {{ influencer.email }} </td>
                    <td> 
                        <button v-if="!influencer.flag" type="button" class="btn btn-primary" @click="Send_Req(influencer.id)" >Send Request</button> 
                        <button v-if="influencer.flag" type="button" class="btn btn-primary"  disabled>Send Request</button> 
                    </td>

                </tr>
                </tbody>
            </table>   

            
            <table class="table table-hover table-striped caption-top" v-if="sent_influencers.length>0">
            <caption v-if="sent_influencers.length>0"><h1 class="display-5">Sent Ad Requests</h1></caption>
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">First Name</th>
                        <th scope="col">Last Name</th>
                        <th scope="col">Plateforms</th>
                        <th scope="col">E-mail</th>
                        <th scope="col">Status</th>
                    </tr>
                </thead>
                <tbody>
                <tr v-for="(influencer,index) in sent_influencers">
                    <td> {{ index+1 }} </td>
                    <td> {{ influencer.fname }} </td>
                    <td> {{ influencer.lname }} </td>
                    <td>
                    <p v-for="(plt,index2) in influencer.plateforms"> {{ plt }} <span v-if="index2 != Object.keys(influencer.plateforms).length - 1">, </span> </p>
                    </td>
                    <td> {{ influencer.email }} </td>
                    <td v-if="influencer.status==='pending'"> 
                        <span class="badge bg-secondary">Request Sent (Pending)</span> 
                        <button v-if="!influencer.flag" type="button" class="btn btn-danger" @click="Delete_sent_to_infl(influencer.req_id)" >Delete Request</button> 
                        <button v-if="influencer.flag" type="button" class="btn btn-danger" disabled >Delete Request</button> 
                    </td>
                    <td v-if="influencer.status==='accepted'"> <span class="badge bg-success">Request Accepted</span> </td>
                    <td v-if="influencer.status==='rejected'"> 
                        <span class="badge bg-danger">Request Rejected</span> 
                        <button v-if="!influencer.flag" type="button" class="btn btn-danger" @click="Delete_sent_to_infl(influencer.req_id)" >Delete Request</button> 
                        <button v-if="influencer.flag" type="button" class="btn btn-danger" disabled >Delete Request</button> 
                    </td>

                </tr>
                </tbody>
            </table>   

            
            <table class="table table-hover table-striped caption-top" v-if="recieved_influencers.length>0">
            <caption v-if="recieved_influencers.length>0"><h1 class="display-5">Recieved Ad Requests</h1></caption>
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">First Name</th>
                        <th scope="col">Last Name</th>
                        <th scope="col">Plateforms</th>
                        <th scope="col">E-mail</th>
                        <th scope="col">Status</th>
                    </tr>
                </thead>
                <tbody>
                <tr v-for="(influencer,index) in recieved_influencers">
                    <td> {{ index+1 }} </td>
                    <td> {{ influencer.fname }} </td>
                    <td> {{ influencer.lname }} </td>
                    <td>
                    <p v-for="(plt,index2) in influencer.plateforms"> {{ plt }} <span v-if="index2 != Object.keys(influencer.plateforms).length - 1">, </span> </p>
                    </td>
                    <td> {{ influencer.email }} </td>

                    <td v-if="influencer.status==='pending'"> 
                        <span class="badge bg-primary">Request Recieved (Pending)</span> 
                        <button v-if="!influencer.flag" type="button" class="btn btn-success" @click="Accept_sent_to_spons(influencer.req_id)" >Accept Request</button> 
                        <button v-if="influencer.flag" type="button" class="btn btn-success"  disabled>Accept Request</button>
                        <button v-if="!influencer.flag" type="button" class="btn btn-warning" @click="Reject_sent_to_spons(influencer.req_id)" >Reject Request</button> 
                        <button v-if="influencer.flag" type="button" class="btn btn-warning" disabled >Reject Request</button>  
                    </td>

                    <td v-if="influencer.status==='accepted'"> <span class="badge bg-success">Request Accepted</span> </td>

                    <td v-if="influencer.status==='rejected'"> 
                        <span class="badge bg-danger">Request Rejected</span> 
                        <button v-if="!influencer.flag" type="button" class="btn btn-danger" @click="Delete_sent_to_spons(influencer.req_id)" >Delete Request</button> 
                        <button v-if="influencer.flag" type="button" class="btn btn-danger" disabled >Delete Request</button> 
                    </td>

                </tr>
                </tbody>
            </table>   

        <button class="btn btn-secondary shadow-lg" style="border-radius: 120px;" @click="$emit('ClosePopup')">&#10060 Close</button>
        </div>
    </div>
    `,

    props:{
        id:{
            type:Number
        },
        all_influencers:{type:Array},
        sent_reqs:{type:Array},
        recieved_reqs:{type:Array},
    },

    data(){
        return{
        sent_influencers:[],
        recieved_influencers:[],
        running_req_inf:[],
        }
    },

    computed:{

        untouched_influencer(){
            let unt_inf=[];
            let sent_inf=[];
            let recieved_inf=[];
            let running_req=[];
            for (let i = 0; i < this.all_influencers.length; i++) {
                let flag_sent=false;
                let flag_recieved=false;
                let inf = this.all_influencers[i];
                if (!inf.flag){
                    for (let j = 0; j < this.sent_reqs.length; j++) {
                        let sent = this.sent_reqs[j];
                        if (inf.id===sent.influencer_id && this.id===sent.campaign_id){
                            console.log(inf.id,sent.influencer_id,'touched sent')
                            flag_sent = true;
                            inf.status = sent.status
                            inf.req_id = sent.id
                            if (sent.status==='accepted'){
                                running_req.push(inf)
                            }
                            break;
                        } 
                    };
                    
                    for (let j = 0; j < this.recieved_reqs.length; j++) {
                        let recieved = this.recieved_reqs[j];
                        console.log(inf.id,recieved.influencer_id)
                        if (inf.id===recieved.influencer_id && this.id===recieved.campaign_id){
                            console.log(inf.id,recieved.influencer_id,'touched recieved')
                            flag_recieved = true;
                            inf.status = recieved.status
                            inf.req_id = recieved.id
                            if (recieved.status==='accepted'){
                                running_req.push(inf)
                            }
                            break;
                        } 
                    };
                
                    if (!flag_sent && !flag_recieved){
                        unt_inf.push(inf)
                    };
                    if (flag_sent){
                        sent_inf.push(inf)
                    };
                    if (flag_recieved){
                        recieved_inf.push(inf)
                    };
                }
            }
            this.sent_influencers=sent_inf;
            this.recieved_influencers=recieved_inf;
            this.running_req_inf=running_req;
            return unt_inf
        },

    },

    methods:{
        async Delete_sent_to_infl(id){
            console.log('delete',id)
            const origin = window.location.origin;
            const url = `${origin}/delete_req_to_infl/${id}`;
            const res = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token":sessionStorage.getItem("token"),
                    },
                });
            if (res.ok){
                const datas = await res.json();
                // this.all_influencers = datas;
                console.log(datas);
                this.$emit('recal_sent_inf')
                
            }else if(res.status===403 || res.status===401){
                console.error("Forbidden Request");
                sessionStorage.clear()
                this.$router.push("/login");
            }else {
                const errorData = await res.json();
                console.error("Could not delete", errorData);
            }
        },

        async Delete_sent_to_spons(id){
            console.log('delete',id)
            const origin = window.location.origin;
            const url = `${origin}/delete_req_to_spons/${id}`;
            const res = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token":sessionStorage.getItem("token"),
                    },
                });
            if (res.ok){
                const datas = await res.json();
                // this.all_influencers = datas;
                console.log(datas);
                this.$emit('recal_sent_spons')
                
            }else if(res.status===403 || res.status===401){
                console.error("Forbidden Request");
                sessionStorage.clear()
                this.$router.push("/login");
            }else {
                const errorData = await res.json();
                console.error("Could not delete to spons", errorData);
            }
        },
        async Reject_sent_to_spons(id){
            console.log('reject',id)
            const origin = window.location.origin;
            const url = `${origin}/reject_req_to_spons/${id}`;
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
                this.$emit('recal_sent_spons')
                
            }else if(res.status===403 || res.status===401){
                console.error("Forbidden Request");
                sessionStorage.clear()
                this.$router.push("/login");
            }else {
                const errorData = await res.json();
                console.error("Could not reject to spons", errorData);
            }
        },
        async Accept_sent_to_spons(id){
            console.log('reject',id)
            const origin = window.location.origin;
            const url = `${origin}/accept_req_to_spons/${id}`;
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
                this.$emit('recal_sent_spons')
                
            }else if(res.status===403 || res.status===401){
                console.error("Forbidden Request");
                sessionStorage.clear()
                this.$router.push("/login");
            }else {
                const errorData = await res.json();
                console.error("Could not accept to spons", errorData);
            }
        },

        async Send_Req(id){
            // /send_ad_req_to_infl/<c_id>/<infl_id>
            console.log('send req to infl',id)
            const origin = window.location.origin;
            const url = `${origin}/send_ad_req_to_infl/${this.id}/${id}`;
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
                // this.Get_all_sent_to_infl();
                this.$emit('recal_sent_inf')

            }else if(res.status===403 || res.status===401){
                console.error("Forbidden Request");
                sessionStorage.clear()
                this.$router.push("/login");
            }else {
                const errorData = await res.json();
                console.error("Could not send req to infl", errorData);
            }
        },

    },
};

export default camp_dashboard;