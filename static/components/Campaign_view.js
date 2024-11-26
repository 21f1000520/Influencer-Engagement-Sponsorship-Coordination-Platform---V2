import camp_dashboard from "./camp_dashboard.js";
import UpdateCamp from "./Update_campaign.js";


const campaign={
    template:`
    <div>
    <div :class="'row row-cols-'+camps.length+'g-3'">
        <div v-for="camp in camps" class="col">
            <div class="card text-dark shadow-lg" v-bind:class="{ 'bg-light': camp.visibility, 'bg-warning': !camp.visibility }">
                <div class="card-header"><h5>{{camp.name}}</h5></div>
                <div class="card-body ">
                    <p class="card-text" style="color: blueviolet;">{{camp.description}}.</p>
                    <ul class="list-group list-group-flush shadow" >
                        <li class="list-group-item">Start Date: {{camp.start_date}}</li>
                        <li class="list-group-item">End Date: {{camp.end_date}}</li>
                        <li class="list-group-item">Budget (Rs.): {{camp.budget}}</li>
                    </ul>
                </div>
                <div class="card-footer">
                    <button v-if="camp.visibility" class="btn btn-info shadow" style="border-radius: 16px;" @click="view_camp(camp.id)" >View</button>
                    <button v-if="!camp.visibility" class="btn btn-info shadow" style="border-radius: 16px;" @click="view_camp(camp.id)" disabled >View</button>
                    <button class="btn btn-primary shadow" style="border-radius: 16px;" @click="update_camp(camp.id)" >Update</button>
                    <button class="btn btn-danger shadow" style="border-radius: 16px;" @click="delete_camp(camp.id)">Delete</button>
                </div>
                
            </div>
      </div>
    </div>
    <div v-if="this.popup_update"> <UpdateCamp :id="popup_updateId"  @ClosePopup="Close"/> </div>
    <div v-if="this.popup_view"> <camp_dashboard :id="popup_updateId"  @ClosePopup="Close"/> </div>
    </div>
    `,

    props:{
        camps: {
                type: Array,
                required: true,
                },
    },
    data(){
        return {
            popup_update:false,
            popup_view:false,
            popup_updateId:"",
        }
    },
    methods:{
        update_camp(id){
            console.log('update campaign',id);
            this.popup_update=true;            
            this.popup_updateId=id;
            this.$emit("blurr")
        },

        view_camp(id){
            console.log('view campaign',id);
            this.popup_updateId=id;
            this.popup_view=true;
            this.$emit("blurr")
        },
        Close(){
            console.log('Close')
            this.popup_update=false
            this.popup_view=false
            this.$emit("blurr")
        },
        async delete_camp(id){
            console.log('delete campaign',id)
            let origin = window.location.origin;
            let url = `${origin}/delete_campaigns/${id}`;
            let res = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authentication-Token":sessionStorage.getItem("token"),
            },
            });
            if (res.ok){
                let datas = await res.json();
                // this.all_influencers = datas;
                console.log(datas);
                this.$router.go()
            }else {
            let errorData = await res.json();
            console.error("Could not delete", errorData);
            
            }
        }
    },
    components:{
        UpdateCamp,camp_dashboard
    }
};

export default campaign;