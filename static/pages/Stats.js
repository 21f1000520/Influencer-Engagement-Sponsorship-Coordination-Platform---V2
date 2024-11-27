const Stats = {
    template: `<div class="row d-flex justify-content-center">
                    <div class="col-8  justify-content-center" style="text-align: center;">
                        <table class="table table-hover table-striped caption-top" v-if="all_running.length>0">
                        <caption v-if="all_running.length>0"><h1 class="display-5">All Running Ads</h1></caption>
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
                                <tr v-for="(Campaign,index) in all_running" v-bind:class="{ 'table-danger': !Campaign.visibility}">
                                    <th scope="row">{{ index+1 }}</th>
                                    <td>{{ Campaign.name }}</td>
                                    <td>{{ Campaign.description }}</td>
                                    <td>{{ Campaign.budget }}</td>
                                    <td>{{ Campaign.goals }}</td>
                                    <td>{{ Campaign.sponsor_name }}</td>
                                    <td>
                                        <button v-if="!Campaign.flag" type="button" class="btn btn-danger" @click="Switch_Flag_camp(Campaign.id)">Flag</button>
                                        <button v-if="Campaign.flag" type="button" class="btn btn-primary"  @click="Switch_Flag_camp(Campaign.id)">Unflag</button> 
                                    </td>   
                                </tr>
                            </tbody>
                        </table>   
                    
                    </div>
                </div>
                    `,

    data(){
        return{
            all_running:[],
        }
    },

    mounted() {
    console.log('mounted stats')
    this.Get_all_running()
    },

    methods:{
        async Get_all_running(){
            console.log('get all running')
            const origin = window.location.origin;
            const url = `${origin}/get_all_running`;
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
                this.all_running=datas;
                
            }else {
            const errorData = await res.json();
            console.error("No running ads", errorData);
            }
        },

    },

};

export default Stats;
