import wallet from "../components/wallet.js";

const Stats = {
    template: `<div class="row d-flex justify-content-center appear">
                    <div class="col-8  justify-content-center" style="text-align: center;">
                        
                        <div class="table-responsive">
                            <table class="table table-hover table-striped caption-top" v-if="all_running.length>0">
                            <caption v-if="all_running.length>0"><h1 class="display-5">All Running Ads</h1>  </caption>
                                <thead class="table-success">
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Name</th>
                                        <th scope="col">Details</th>
                                        <th scope="col">Budget &#x20b9</th>
                                        <th scope="col" v-if="current_user_role!=='infl'">Influecer</th>
                                        <th scope="col" v-if="current_user_role!=='spons'">Sponsor</th>
                                        <th scope="col">Progress (%)</th>
                                        <th scope="col" v-if="current_user_role==='infl'">Recieved Money &#x20b9</th>
                                        <th scope="col" v-if="current_user_role==='spons'">Paid Money &#x20b9</th>
                                        
                                    
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
                                    <td colspan="5" class="h6" v-if="current_user_role!=='admin'"></td>
                                    <td class="" v-if="current_user_role==='spons'">Total Paid = </td>
                                    <td class="" v-if="current_user_role==='spons'">&#x20b9 {{ Math.round(payment.reduce((partialSum, a) => partialSum + a, 0))}}</td>
                                </tfoot>
                            </table>
                        </div>
                        
                        <wallet class="moveUP" v-if="this.current_user_role==='infl'" :balance="Math.round(payment.reduce((partialSum, a) => partialSum + a, 0))"/>
                      

                        <button type="button" v-if="!this.isWaiting && this.all_running.length>0" class="btn w-50 btn-danger" @click="download_csv" style="border-radius: 26px;">Download CSV file</button>
                        <button type="button" v-else-if="this.isWaiting && this.all_running.length>0" class="btn w-50 btn-danger placeholder-wave col-4" @click="download_csv" style="border-radius: 26px;" disabled>
                            <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                            <span role="status">Loading...</span>
                        </button>
                        
                        
                        <div v-show="this.progress.length>0" class="chart-container" >
                            <canvas id="myChart"></canvas>
                        </div>
                        
                        <div  v-if = "networkError" class="display-5 alert alert-danger mx-auto" role="alert">
                            Network Error!! Internet is down
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
            isWaiting: false,
            networkError:false,
            current_user_role:""
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
                if (this.current_user_role==='infl'){

                    lb.push(camp.name)
                }else if (this.current_user_role==='spons'){
                    lb.push('# '+(i+1))
                }else{
                    lb.push('# '+(i+1))
                }
            };
            this.progress=prg
            this.labels=lb

            this.payment=pay
            // console.log('progress',prg,lb)
            console.log('progress',this.progress)
        },

        handleBlob(blob,filename){
            const url = URL.createObjectURL(blob);

            // Create a temporary <a> element to trigger the download
            const link = document.createElement('a');
            link.href = url;
            link.download = filename
            document.body.appendChild(link);
            link.click();

            // Clean up
            link.remove();
            URL.revokeObjectURL(url); // Free memory
        },

        async download_csv(){
            console.log('download CSV')
            this.isWaiting = true
            const origin = window.location.origin;
            const url = `${origin}/start-export`;
            const res = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token":sessionStorage.getItem("token"),
                    },
                });
            const data = await res.json()
            if (res.ok) {
                const taskId = data['task_id']
                console.log(taskId,'task id')
                const intv = setInterval(async () => {
                            const url = `${origin}/download-export/${taskId}`;
                            const csv_res = await fetch(url, {
                                                method: "GET",
                                                headers: {
                                                    "Content-Type": "blob",
                                                    "Authentication-Token":sessionStorage.getItem("token"),
                                                },
                                    });
                            if (csv_res.ok) {
                                this.isWaiting = false
                                clearInterval(intv)
                                const blob = await csv_res.blob();
                                // this.all_influencers = datas;
                                let filename=this.current_user_role+'_'+
                                            this.all_running[0].current_user_name+'_'+taskId.slice(0, 5)+'.csv'; // Name of the file to be saved
                                this.handleBlob(blob,filename);
                            }
                        },
                    1000)
            }
            // setInterval(this.Status(task_id), 2000)
        },

        handleError(err) {
            // console.warn(err);
            console.log('network error')
            let body = JSON.stringify({"internet":"down"})
            return new Response(body,{ status: 200, statusText: "NetworkError" });
        },

        async Get_all_running(){
            console.log('get all running')
            const origin = window.location.origin;
            const url = `${origin}/get_all_running`;
            const res = await (fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token":sessionStorage.getItem("token"),
                    },
                }).catch(this.handleError));

            if (res.ok){
                // console.log(res,'inside ok')
                if (res.statusText==='NetworkError'){
                    this.networkError=true;
                    console.log('network error status text found')
                    return 0
                }
                const datas = await res.json();
                // this.all_influencers = datas;
                console.log(datas);
                this.all_running=datas;
                this.current_user_role=this.all_running[0].current_user_role;
            }else if(res.status===403 || res.status===401){
                console.error("Forbidden Request");
                sessionStorage.clear()
                this.$store.commit("logout");
                this.$store.commit("setRole", null);
                
                this.$router.push("/login");
                this.$router.go()
            }else {
                const errorData = await res.json();
                console.error("No running ads", errorData);
            }
        },

        CreateChart(){
            const ctx = document.getElementById('myChart');
            console.log(this.progress)
            console.log(window.innerWidth,'inner width')
            let w = window.innerWidth;
            if (w<500){
                Chart.defaults.font.size = 6;
                
            }else if(w>1000){
                Chart.defaults.font.size = 16;
                
            }else if(w>500 && w<900){
                Chart.defaults.font.size = 8;
                
            }else {
                Chart.defaults.font.size = 12;

            }
            
            let chart = new Chart(ctx, 
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
                                            text:'Progress (%)'
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

    components:{
        wallet
    }

};

export default Stats;
