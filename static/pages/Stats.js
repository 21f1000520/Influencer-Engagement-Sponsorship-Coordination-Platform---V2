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
                                    <th scope="col" v-if="all_running[0].current_user_role!=='infl'">Influecer</th>
                                    <th scope="col" v-if="all_running[0].current_user_role!=='spons'">Sponsor</th>
                                    <th scope="col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(Campaign,index) in all_running" v-bind:class="{ 'table-danger': (!Campaign.visibility && !Campaign.flag && !Campaign.influencer_flag && !Campaign.sponsor_flag), 'table-dark':(Campaign.flag || Campaign.influencer_flag || Campaign.sponsor_flag)}">
                                    
                                    <th scope="row">{{ index+1 }}</th>
                                    <td >{{ Campaign.name }}</td>
                                    <td v-if="!Campaign.flag && !Campaign.influencer_flag && !Campaign.sponsor_flag">{{ Campaign.description }}</td>
                                    <td v-if="!Campaign.flag && !Campaign.influencer_flag && !Campaign.sponsor_flag">{{ Campaign.budget }}</td>
                                    <td v-if="Campaign.current_user_role!=='infl' && !Campaign.flag && !Campaign.influencer_flag && !Campaign.sponsor_flag">{{ Campaign.influencer_name }}</td>
                                    <td v-if="Campaign.current_user_role!=='spons' && !Campaign.flag && !Campaign.influencer_flag && !Campaign.sponsor_flag">{{ Campaign.sponsor_name }}</td>
                                    <td v-if="(Campaign.flag || Campaign.influencer_flag || Campaign.sponsor_flag) && Campaign.current_user_role!=='admin' " colspan="3" class="h6"  > Flagged By Admin!!! </td>
                                    <td v-if="(Campaign.flag || Campaign.influencer_flag || Campaign.sponsor_flag) && Campaign.current_user_role==='admin' " colspan="4" class="h6"  > Flagged By Admin!!! </td>
                                    <td>
                                        <button v-if="!Campaign.flag && !Campaign.influencer_flag && !Campaign.sponsor_flag" type="button" class="btn btn-danger" >Button</button>
                                        <button v-if="Campaign.flag || Campaign.influencer_flag || Campaign.sponsor_flag" type="button" class="btn btn-danger" disabled>Button</button>
                                    </td>   
                                    
                                 
                                </tr>

                            </tbody>
                        </table>   
                       
                        <div  class="chart-container">
                            <canvas id="myChart"></canvas>
                        </div>
                    </div>
                </div>
                    `,

    data(){
        return{
            all_running:[],
            progress:[],
            labels:[],
        }
    },

    async beforeMount() {
    console.log('before mount')
    await this.Get_all_running()
    if (this.all_running.length>0){
            this.Get_plot_data()
            this.CreateChart()
    }else{
        console.log('could not find running')
    }

    },

    mounted(){
        console.log('mounted')
         
    },


    methods:{

        Get_plot_data(){
            let prg=[]
            let lb=[]
            for (let i=0;i<this.all_running.length;i++){
                let camp=this.all_running[i]
                // console.log(camp.start_date,camp.end_date);
                let start =  new Date(camp.start_date);
                let end =  new Date(camp.end_date);
                let ms_now = Date.now();
                let length =  end.getTime()-start.getTime()
                let spent = ms_now-start.getTime()
                let frac = spent/length*100
                // console.log(frac,camp.name)
                prg.push(frac)
                lb.push(camp.name)
            };
            this.progress=prg
            this.labels=lb
            // console.log('progress',prg,lb)
            console.log('progress',this.progress)
        },

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
                // console.log(datas);
                this.all_running=datas;
                
            }else if(res.status===403 || res.status===401){
                console.error("Forbidden Request");
                sessionStorage.clear()
                this.$router.push("/login");
            }else {
                const errorData = await res.json();
                console.error("No running ads", errorData);
            }
        },

    CreateChart(){
        const ctx = document.getElementById('myChart');
        console.log(this.progress)
        new Chart(ctx, 
                {
                    type: 'bar',
                    data: {
                        labels: this.labels,
                        datasets: [{
                            label: 'Progress (%)',
                            data: this.progress,
                            borderColor: '#D6C0B3',
                            backgroundColor: '#AB886D',
                            borderWidth: 1,
                            borderRadius: 10,
                            
                        }]
                    },
                    options: {
                        responsive:true,
                        scales: {
                                y: {
                                    beginAtZero: true,
                                    title:{
                                        display:true,
                                        text:'Progress'
                                    }
                                
                                }
                            },
                        plugins:{
                            title:{
                                display:true,
                                text: 'Progress of All running ad requests'
                            },
                 
                        }
                    },
                }
            );
    },
    

    },



};

export default Stats;
