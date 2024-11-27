const UpdateCamp = {
    template:`
        <div class="popup" @click.self="$emit('ClosePopup')"> 
            <div class="popup-inner shadow-lg" >
                <h2 class="display-6 px-4 py-2 rounded-pill bg-info text-dark shadow-lg"> Update Campaign </h2>
                <form>
                    <div class="mb-3">
                        <label for="name">Name</label>
                        <input type="text" class="form-control" v-model="name" aria-describedby="nameHelp"
                            placeholder="Enter name for the Campaign (Required)" id="name" required>
                        <div id="email_validation" v-if="this.name.length===0">Enter a Name</div>
                    </div>
                    <div class="mb-3">
                        <label for="description">Description</label>
                        <input type="text" class="form-control" v-model="description" aria-describedby="nameHelp"
                            placeholder="Enter description for the Campaign (Required)" id="description" required>
                        <div id="email_validation" v-if="this.description.length===0">Enter a description</div>
                    </div>
                    <div class="mb-3">
                        <label for="startDate">Start Date</label>
                        <input v-model="startDate" class="form-control" type="date" id="startDate" required >
                        <div id="email_validation" v-if="this.startDate.length===0">Enter a start Date</div>
                    </div>
                    <div class="mb-3">
                        <label for="endDate">End Date</label>
                        <input v-model="endDate" class="form-control" type="date" id="endDate" required >
                        <div id="email_validation" v-if="this.endDate.length===0">Enter a end Date</div>
                    </div>
                    <div class="mb-3">
                        <label for="budget">Budget</label>
                        <input type="text" class="form-control" v-model="budget" placeholder="Budget (Rs.)" id="budget" required>
                        <div id="email_validation" v-if="this.budget.length===0">Enter a Budget</div>
                    </div>
                    <div class="mb-3">
                        <label for="goal">Goal</label>
                        <input type="text" class="form-control" v-model="goal" placeholder="Goal of the campaign (optional)" id="goal">
                        <div id="email_validation" v-if="this.goal.length===0">Enter a goal</div>
                    </div>
                     <div class="mb-3">
                        <input class="form-check-input" type="checkbox" v-model="visibility" id="visibility" value="public">
                        <label class="form-check-label" for="visibility">Make it Public?</label>
                    </div>
                    
                    <button class="btn btn-primary" @click.prevent="Handle_Click">Update</button>
                </form>
                <slot />
                <button class="btn btn-secondary shadow-lg" style="border-radius: 120px;" @click="$emit('ClosePopup')">&#10060 Close</button>
            </div>
        </div>
    
        `,
    props:{
        id:{
            type:Number
        }
    },
    data(){
        return{
           name:"",
           description:"",
           startDate:"",
           endDate:"",
           budget:"",
           goal:"",
           visibility:""
        }
    },

    async mounted(){
        console.log('mounted',this.id)
        // /get_campaign/<id>
        let origin = window.location.origin;
        let url = `${origin}/get_campaign/${this.id}`;
        let res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authentication-Token":sessionStorage.getItem("token"),
        },
        });
        if (res.ok){
            let datas = await res.json();
            // this.all_influencers = datas;
            console.log(datas);
            this.name=datas.name;
            this.description=datas.description;
            this.startDate=datas.start_date;
            this.endDate=datas.end_date;
            this.budget=datas.budget;
            this.goal=datas.goals;
            this.visibility=datas.visibility;
            
        }else {
        let errorData = await res.json();
        console.error("No campaign found:", errorData);
        this.$router.push("/")
        }
    },

     methods:{
        doStuff(){
            console.log('clicked outside')
        },
        Handle_Click(){
            if (this.name.length === 0){
                alert('Must Enter a Name')
            }else if (this.description.length===0){
                alert('Must Enter a description')
            }else if (this.startDate.length===0){
                alert('Must Enter a start date')
            }else if (this.endDate.length===0){
                alert('Must Enter an end date')
            }else if (this.budget.length===0){
                alert('Must Enter a budget')
            }else if (this.goal.length===0){
                alert('Must Enter a goal')
            }else{
                this.Update_campaign();
            }
        },
        
        async Update_campaign(){
            
            console.log(this.name)
            console.log(this.description)
            console.log(this.startDate)
            console.log(this.endDate)
            console.log(this.budget)
            console.log(this.goal)
            console.log(this.visibility)
            let origin = window.location.origin;
            let url = `${origin}/update_campaigns/${this.id}`;
            let res = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token":sessionStorage.getItem("token"),
                },
                body: JSON.stringify({
                    name: this.name,
                    description: this.description,
                    startDate: this.startDate,
                    endDate:this.endDate,
                    budget:this.budget,
                    goal:this.goal,
                    visibility:this.visibility
                }),
            });
            if (res.ok){
                let datas = await res.json();
                // this.all_influencers = datas;
                console.log('updated')
                console.log(datas);
                this.$emit('reload_camps_data')
                this.$emit('ClosePopup')
                
                
            }else {
                let errorData = await res.json();
                console.error("Could not update", errorData);
                this.$router.push("/")
            }
        }
    }

};

export default UpdateCamp;
