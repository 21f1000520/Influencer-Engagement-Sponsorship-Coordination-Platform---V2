import camp_dashboard from "./camp_dashboard.js";
import UpdateCamp from "./Update_campaign.js";


const campaign = {
    template: `
    <div  >
        <div :class="'row row-cols-'+((camps.length > 3) ? '3' : camps.length)+ ' g-3' " class="d-flex justify-content-center">
            <div v-for="camp in camps" class="col">
                <div class="card text-dark shadow-lg" v-bind:class="{ 'bg-light': (camp.visibility && !camp.flag), 'bg-warning': (!camp.visibility && !camp.flag) ,'bg-custom':camp.flag}">
                    <div class="card-header"><h5>{{camp.name}}</h5></div>
                    <div class="card-body ">
                        <p class="card-text" style="color: blueviolet;">{{camp.description}}.</p>
                        <ul class="list-group list-group-flush shadow" v-bind:class="{ 'bg-light': (camp.visibility && !camp.flag), 'bg-warning': (!camp.visibility && !camp.flag) ,'bg-custom':camp.flag}">
                            <li class="list-group-item " v-bind:class="{ 'bg-light': (camp.visibility && !camp.flag), 'bg-warning': (!camp.visibility && !camp.flag) ,'bg-custom':camp.flag}">Start Date: {{camp.start_date}}</li>
                            <li class="list-group-item " v-bind:class="{ 'bg-light': (camp.visibility && !camp.flag), 'bg-warning': (!camp.visibility && !camp.flag) ,'bg-custom':camp.flag}">End Date: {{camp.end_date}}</li>
                            <li class="list-group-item " v-bind:class="{ 'bg-light': (camp.visibility && !camp.flag), 'bg-warning': (!camp.visibility && !camp.flag) ,'bg-custom':camp.flag}">Budget (Rs.): {{camp.budget}}</li>
                        </ul>
                    </div>
                    <div class="card-footer" v-if="!camp.flag">
                        <button class="btn btn-info shadow" style="border-radius: 16px;" @click="view_camp(camp.id,camp.name)" ><i class="bi bi-view-list"></i> View</button>
                        
                        <button class="btn btn-primary shadow" style="border-radius: 16px;" @click="update_camp(camp.id)" ><i class="bi bi-cloud-arrow-up"></i> Update</button>
                        <button class="btn btn-danger shadow" style="border-radius: 16px;" @dblclick="delete_camp(camp.id)"><i class="bi bi-trash"></i> Delete</button>
                    </div>

                    <div class="card-footer alert alert-danger" role="alert" v-else>
                        No Access, Flagged by Admin!!!
                    </div>
                    
                </div>
            </div>
        </div>
        <div v-if="this.popup_update"> 
            <UpdateCamp :id="popup_updateId"  @ClosePopup="Close" @reload_camps_data="Send_signal_reload" class='slide'/> 
        </div>

        <div v-if="this.popup_view"> 
            <camp_dashboard class='slide' :name="this.camp_name" :id="popup_updateId" :sent_reqs="sent_reqs" :recieved_reqs="recieved_reqs" :all_influencers="all_influencers"  
                @ClosePopup="Close" @recal_sent_inf="Get_all_sent_to_infl" @recal_sent_spons="Get_all_sent_to_spons" @recal_all_inf="Get_all_infls" /> 
        </div>
    </div>
    `,

    props: {
        camps: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            popup_update: false,
            popup_view: false,
            popup_updateId: "",

            sent_reqs: [],
            recieved_reqs: [],
            all_influencers: [],
            camp_name: "",
        }
    },
    async mounted() {
        this.Get_all_sent_to_infl();
        this.Get_all_sent_to_spons();
        this.Get_all_infls();

    },
    methods: {
        update_camp(id) {
            console.log('update campaign', id);
            this.popup_update = true;
            this.popup_updateId = id;
            this.$emit("blurr")
        },

        view_camp(id, name) {
            console.log('view campaign', id);

            this.popup_updateId = id;
            this.popup_view = true;
            this.camp_name = name;
            this.$emit("blurr")
        },
        Close() {
            console.log('Close')
            this.popup_update = false
            this.popup_view = false
            this.$emit("blurr")
        },

        Send_signal_reload() {
            console.log('signal emitted')
            this.$emit("reload_campaigns")
        },

        async delete_camp(id) {
            console.log('delete campaign', id)
            let origin = window.location.origin;
            let url = `${origin}/delete_campaigns/${id}`;
            let res = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": sessionStorage.getItem("token"),
                },
            });
            if (res.ok) {
                let datas = await res.json();
                // this.all_influencers = datas;
                console.log(datas);
                this.$emit("reload_campaigns")
            } else {
                let errorData = await res.json();
                console.error("Could not delete", errorData);

            }
        },

        async Get_all_sent_to_infl() {
            const origin = window.location.origin;
            const url = `${origin}/get_all_req_to_inf`;
            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": sessionStorage.getItem("token"),
                },
            });
            if (res.ok) {
                const datas = await res.json();
                // this.all_influencers = datas;
                console.log(datas);
                this.sent_reqs = datas;

            } else if (res.status === 403 || res.status === 401) {
                console.error("Forbidden Request");
                sessionStorage.clear()
                this.$store.commit("logout");
                this.$store.commit("setRole", null);
                this.$router.push("/login");
                this.$router.go()
            } else {
                const errorData = await res.json();
                console.error("No requests to infl", errorData);
            }
        },
        async Get_all_sent_to_spons() {
            const origin = window.location.origin;
            const url = `${origin}/get_all_req_to_spons`;
            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": sessionStorage.getItem("token"),
                },
            });
            if (res.ok) {
                const datas = await res.json();
                // this.all_influencers = datas;
                console.log(datas);
                this.recieved_reqs = datas;

            } else if (res.status === 403 || res.status === 401) {
                console.error("Forbidden Request");
                sessionStorage.clear()
                this.$store.commit("logout");
                this.$store.commit("setRole", null);
                this.$router.push("/login");
                this.$router.go()
            } else {
                const errorData = await res.json();
                console.error("No requests recieved to sponsor", errorData);
            }
        },

        async Get_all_infls() {
            const origin = window.location.origin;
            const url = `${origin}/users/infl`;
            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": sessionStorage.getItem("token"),
                },
            });
            if (res.ok) {
                const datas = await res.json();
                this.all_influencers = datas;
                // console.log(datas);
            } else if (res.status === 403 || res.status === 401) {
                console.error("Forbidden Request");
                sessionStorage.clear()
                this.$store.commit("logout");
                this.$store.commit("setRole", null);
                this.$router.push("/login");
                this.$router.go()
            } else {
                const errorData = await res.json();
                console.error("No influencers could be found, failed:", errorData);

            }
        },


    },
    components: {
        UpdateCamp, camp_dashboard
    }
};

export default campaign;