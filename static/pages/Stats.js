const Stats = {
    template: `<div class="row d-flex justify-content-center">
                    <div class="col-8  justify-content-center" style="text-align: center;">
                        <table class="table table-hover table-striped caption-top" v-if="all_running.length>0">
                        <caption v-if="all_running.length>0"><h1 class="display-5">All Running Ads</h1>  </caption>
                            <thead class="table-success">
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Details</th>
                                    <th scope="col">Budget &#x20b9</th>
                                    <th scope="col" v-if="all_running[0].current_user_role!=='infl'">Influecer</th>
                                    <th scope="col" v-if="all_running[0].current_user_role!=='spons'">Sponsor</th>
                                    <th scope="col">Progress (%)</th>
                                    <th scope="col" v-if="all_running[0].current_user_role==='infl'">Recieved Money &#x20b9</th>
                                    <th scope="col" v-if="all_running[0].current_user_role==='spons'">Paid Money &#x20b9</th>
                                    
                                   
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
                                    <td v-if="(Campaign.flag || Campaign.influencer_flag || Campaign.sponsor_flag) && Campaign.current_user_role!=='admin' " colspan="5" class="h6"  > Flagged By Admin!!! </td>
                                    <td v-if="(Campaign.flag || Campaign.influencer_flag || Campaign.sponsor_flag) && Campaign.current_user_role==='admin' " colspan="5" class="h6"  > Flagged By Admin!!! </td>
                                    <td v-if="!Campaign.flag && !Campaign.influencer_flag && !Campaign.sponsor_flag"> {{Math.round(progress[index]*100)/100}} </td>
                                    <td v-if="Campaign.current_user_role!=='admin' && !Campaign.flag && !Campaign.influencer_flag && !Campaign.sponsor_flag">{{ Math.round(payment[index]) }}</td>
                                </tr>

                            </tbody>
                            <tfoot class="table-success">
                                <td colspan="5" class="h6" v-if="all_running[0].current_user_role!=='admin'"></td>
                                <td class="h6" v-if="all_running[0].current_user_role!=='admin'">Total Paid = </td>
                                <td class="h6 " v-if="all_running[0].current_user_role!=='admin'">&#x20b9 {{ Math.round(payment.reduce((partialSum, a) => partialSum + a, 0))}}</td>
                            </tfoot>
                        </table>   
                       <button type="button" v-if="this.task_id.length===0" class="btn w-50 btn-danger" @click="download_csv" style="border-radius: 26px;">Download CSV file</button>
                       <button type="button" v-else class="btn w-50 btn-danger" @click="download_csv" style="border-radius: 26px;" disabled>Download CSV file</button>
                     
                        <div v-show="this.progress.length>0" class="chart-container">
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
            payment:[],
            task_id:"",

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
            let pay=[]
            for (let i=0;i<this.all_running.length;i++){
                let camp=this.all_running[i]
                if (camp.flag || camp.influencer_flag || camp.sponsor_flag){
                    continue;
                }
                // console.log(camp.start_date,camp.end_date);
                let start =  new Date(camp.start_date);
                let end =  new Date(camp.end_date);
                let ms_now = Date.now();
                let length =  end.getTime()-start.getTime()
                let spent = ms_now-start.getTime()
                let frac = spent/length*100
                // console.log(length,'duration',ms_now,'now',spent,'spent',frac,'frac',start.getTime(),'start')
                // console.log(frac,camp.name)
                if (frac>=100){
                    pay.push(camp.budget)
                    prg.push(100)
                }else{
                    pay.push(camp.budget*Math.floor(frac/10)/10)
                    // console.log(camp.budget*Math.floor(frac/10)/10)
                    prg.push(frac)
                }
                lb.push(camp.name)
            };
            this.progress=prg
            this.labels=lb

            this.payment=pay
            // console.log('progress',prg,lb)
            console.log('progress',this.progress)
        },

        async get_celery_task_id(){
            console.log('get celery task id')
            const origin = window.location.origin;
            const url = `${origin}/start-export`;
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
                console.log(datas,'celery task id');
                this.task_id=datas.task_id
                
                
            
            }else {
                const errorData = await res.json();
                console.error("Could not get the celery task id", errorData);
            }
        },

        async Status(task_id){
            const origin = window.location.origin;
            const url = `${origin}/download-export/${task_id}`;
            const res = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "blob",
                "Authentication-Token":sessionStorage.getItem("token"),
            },
            });
            if (res.ok){
                const blob = await res.blob();
                // this.all_influencers = datas;
                console.log('success')
                console.log(blob,'celery task');
                const url = URL.createObjectURL(blob);

                // Create a temporary <a> element to trigger the download
                const link = document.createElement('a');
                link.href = url;
                link.download = this.all_running[0].current_user_role+'_'+this.task_id+'.csv'; // Name of the file to be saved
                document.body.appendChild(link);
                link.click();

                // Clean up
                link.remove();
                URL.revokeObjectURL(url); // Free memory
                return 'downloaded'
                // return datas
                
                
            }
            else {
                const errorData = await res.json();
                // console.error("Could not get the celery task", errorData);
            }
        },

        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        
        async download_csv(){
            console.log('download CSV')
            if (this.task_id.length===0){
                await this.get_celery_task_id()
            }
            console.log('task_id',this.task_id)
            let s = await this.Status(this.task_id)
            for (let index = 0; index < 10; index++) {
                console.log(s)
                s = await this.Status(this.task_id)
                this.sleep(5000)
                if (s==='downloaded'){
                    this.task_id=""
                    break;
                }
                
            }
            // setInterval(this.Status(task_id), 2000)
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
                this.$store.commit("logout");
                this.$store.commit("setRole", null);
                
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
                                        },
                                        max:100,
                                    
                                    }
                                },
                            // barThickness: 100,
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
