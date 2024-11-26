
const camp_dashboard={
    template:`
    <div class="popup" @click.self="$emit('ClosePopup')"> 
        <div class="popup-inner shadow-lg" style="max-width: 1920px">
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
        </div>
    </div>
    `,

    props:{
        id:{
            type:Number
        }
    },
    data(){
        return {
            all_camps:[],
            sent_reqs:[],
            recieved_reqs:[],
            all_influencers:[],
        }
    },

    async mounted(){
        this.Get_all_sent_to_infl();
        this.Get_all_sent_to_spons();
        this.Get_all_infls();

    },

    computed:{
        untouched_influencer(){

        },
    },

    methods:{
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
                console.log(datas);
                this.sent_reqs=datas;
                
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
                this.recieved_reqs=datas;
                
            }else {
            const errorData = await res.json();
            console.error("No requests recieved to sponsor", errorData);
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
            }else {
            const errorData = await res.json();
            console.error("No influencers could be found, failed:", errorData);
            
            }
        },

    },
};

export default camp_dashboard;