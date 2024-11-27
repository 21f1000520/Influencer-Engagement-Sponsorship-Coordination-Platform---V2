

const show_campaigns={
    template:`
    <div>
    <table class="table table-hover table-striped caption-top" v-if="untouched_camps.length>0">
    <caption v-if="untouched_camps.length>0"><h1 class="display-5">Available Campaigns</h1></caption>
            <thead class="table-primary">
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
               <tr v-for="(Campaign,index) in untouched_camps" v-bind:class="{ 'table-warning': !Campaign.visibility}">
                    <th scope="row">{{ index+1 }}</th>
                    <td>{{ Campaign.name }}</td>
                    <td>{{ Campaign.description }}</td>
                    <td>{{ Campaign.budget }}</td>
                    <td>{{ Campaign.goals }}</td>
                    <td>{{ Campaign.sponsor_name }}</td>
                    <td>
                        <button type="button" class="btn btn-primary" @click="Send_Req_to_spons(Campaign.id)">Send Request</button> 
                    </td>
                    
                </tr>
            </tbody>
        </table>

    
     <table class="table table-hover table-striped caption-top" v-if="recieved_req_camp.length>0">
            <caption v-if="recieved_req_camp.length>0"><h1 class="display-5">Recieved Requests</h1></caption>
            <thead class="table-danger">
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Name</th>
                    <th scope="col">Details</th>
                    <th scope="col">Payment (Rs.)</th>
                    <th scope="col">Goals</th>
                    <th scope="col">Run By</th>
                    <th scope="col">Status</th>
                    
                </tr>
            </thead>
            <tbody>
               <tr v-for="(Campaign,index) in recieved_req_camp" v-bind:class="{ 'table-warning': !Campaign.visibility}">
                    <th scope="row">{{ index+1 }}</th>
                    <td>{{ Campaign.name }}</td>
                    <td>{{ Campaign.description }}</td>
                    <td>{{ Campaign.budget }}</td>
                    <td>{{ Campaign.goals }}</td>
                    <td>{{ Campaign.sponsor_name }}</td>
                    <td v-if="Campaign.status==='pending'"> 
                        <span class="badge bg-primary">Request Recieved (Pending)</span> 
                        <button v-if="!Campaign.flag" type="button" class="btn btn-success" @click="Accept_sent_to_infl(Campaign.req_id)" >Accept Request</button> 
                        <button v-if="Campaign.flag" type="button" class="btn btn-success"  disabled>Accept Request</button>
                        <button v-if="!Campaign.flag" type="button" class="btn btn-warning" @click="Reject_sent_to_infl(Campaign.req_id)" >Reject Request</button> 
                        <button v-if="Campaign.flag" type="button" class="btn btn-warning" disabled >Reject Request</button>  
                    </td>

                    <td v-if="Campaign.status==='accepted'"> <span class="badge bg-success">Request Accepted</span> </td>

                    <td v-if="Campaign.status==='rejected'"> 
                        <span class="badge bg-danger">Request Rejected</span> 
                        <button v-if="!Campaign.flag" type="button" class="btn btn-danger" @click="Delete_sent_to_infl(Campaign.req_id)" >Delete Request</button> 
                        <button v-if="Campaign.flag" type="button" class="btn btn-danger" disabled >Delete Request</button> 
                    </td>
                    
                    
                </tr>
            </tbody>
        </table>


        <table class="table table-hover table-striped caption-top" v-if="sent_req_camp.length>0">
            <caption v-if="sent_req_camp.length>0"><h1 class="display-5">Sent Requests</h1></caption>
            <thead class="table-success">
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Name</th>
                    <th scope="col">Details</th>
                    <th scope="col">Payment (Rs.)</th>
                    <th scope="col">Goals</th>
                    <th scope="col">Run By</th>
                    <th scope="col">Status</th>
                </tr>
            </thead>
            <tbody>
               <tr v-for="(Campaign,index) in sent_req_camp" v-bind:class="{ 'table-warning': !Campaign.visibility}">
                    <th scope="row">{{ index+1 }}</th>
                    <td>{{ Campaign.name }}</td>
                    <td>{{ Campaign.description }}</td>
                    <td>{{ Campaign.budget }}</td>
                    <td>{{ Campaign.goals }}</td>
                    <td>{{ Campaign.sponsor_name }}</td>
                    <td v-if="Campaign.status==='pending'"> 
                        <span class="badge bg-primary">Request Sent (Pending)</span> 
                        <button v-if="!Campaign.flag" type="button" class="btn btn-danger" @click="Delete_sent_to_spons(Campaign.req_id)" >Delete Request</button> 
                        <button v-if="Campaign.flag" type="button" class="btn btn-danger" disabled >Delete Request</button> 
                    </td>

                    <td v-if="Campaign.status==='accepted'"> <span class="badge bg-success">Request Accepted</span> </td>

                    <td v-if="Campaign.status==='rejected'"> 
                        <span class="badge bg-danger">Request Rejected</span> 
                        <button v-if="!Campaign.flag" type="button" class="btn btn-danger" @click="Delete_sent_to_spons(Campaign.req_id)" >Delete Request</button> 
                        <button v-if="Campaign.flag" type="button" class="btn btn-danger" disabled >Delete Request</button> 
                    </td>
                    
                </tr>
            </tbody>
        </table>


    </div>
    `,

    props:{
        id:{type:Number},
        all_camps: {
                type: Array,
                required: false,
                },
        req_to_inf: {
            type: Array,
            required: false,
        },
        req_to_spons: {
            type: Array,
            required: false,
        },
    },
    data(){
        return {
            popup:false,
            popupId:"",
            sent_req_camp:[],
            recieved_req_camp:[],
            running_req_camp:[],
        }
    },

    computed:{

        untouched_camps(){
            console.log('this user id',this.id)
            let unt_camps=[];
            let sent_camp=[];
            let recieved_camp=[];
            let running_camp=[];
            // let flag_invisible=false;
            for (let i = 0; i < this.all_camps.length; i++) {
                let flag_sent=false;
                let flag_recieved=false;
                let camp = this.all_camps[i];
                if (!camp.flag){
                    for (let j = 0; j < this.req_to_spons.length; j++) {
                        let sent = this.req_to_spons[j];
                        if (camp.id===sent.campaign_id && this.id===sent.influencer_id){
                            console.log(camp.id,sent.campaign_id,'touched sent')
                            flag_sent = true;
                            camp.req_id=sent.id
                            camp.status=sent.status
                            if (sent.status==='accepted'){
                                running_camp.push(camp)
                            }
                            break;
                        } 
                    };
                    
                    for (let j = 0; j < this.req_to_inf.length; j++) {
                        let recieved = this.req_to_inf[j];
                        
                        if (camp.id===recieved.campaign_id && this.id===recieved.influencer_id){
                            console.log(camp.id,recieved.campaign_id,'touched recieved')
                            flag_recieved = true;
                            camp.req_id=recieved.id
                            camp.status=recieved.status
                            if (recieved.status==='accepted'){
                                running_camp.push(camp)
                            }
                            break;
                            
                        }
                        // else if(this.id===recieved.influencer_id && !flag_invisible){
                        //     console.log('non visible detected',recieved.campaign_id)
                        //     flag_invisible=true
                        //     break;
                        // }
                    };
                
                    if (!flag_sent && !flag_recieved){
                        unt_camps.push(camp)
                    };
                    if (flag_sent){
                        sent_camp.push(camp)
                    };
                    if (flag_recieved){
                        recieved_camp.push(camp)
                    };
                }
            }
            this.sent_req_camp=sent_camp;
            this.recieved_req_camp=recieved_camp;
            this.running_req_camp=running_camp;
            return unt_camps
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
                
            }else {
                const errorData = await res.json();
                console.error("Could not delete to spons", errorData);
            }
        },

        async Reject_sent_to_infl(id){
            console.log('reject req from spons to infl',id)
            const origin = window.location.origin;
            const url = `${origin}/reject_req_to_infl/${id}`;
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
                this.$emit('recal_sent_inf')
                
            }else {
                const errorData = await res.json();
                console.error("Could not reject", errorData);
            }
        },

        async Accept_sent_to_infl(id){
            console.log('Accept req from spons to infl',id)
            const origin = window.location.origin;
            const url = `${origin}/accept_req_to_infl/${id}`;
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
                this.$emit('recal_sent_inf')
                
            }else {
                const errorData = await res.json();
                console.error("Could not accept", errorData);
            }
        },


        async Send_Req_to_spons(id){
            console.log('send req from infl to spons',id)
            const origin = window.location.origin;
            const url = `${origin}/send_ad_req_to_spons/${id}`;
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
                this.$emit('recal_sent_spons')

            }else {
                const errorData = await res.json();
                console.error("Could not send req to infl", errorData);
            }            
            
        },
    },
};

export default show_campaigns;