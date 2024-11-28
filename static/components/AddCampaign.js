const AddCamp = {
  template: `
  
    <div class="d-flex justify-content-center align-items-center">
        <div class="card shadow-lg p-3 mb-5 bg-body rounded" style="width: 40%;">
            <h3 class="card-title text-center mb-4">Campaign</h3>

                    <div class="form-group mb-4">
                        <label for="name">Name</label>
                        <input type="text" class="form-control" v-model="name" aria-describedby="nameHelp"
                            placeholder="Enter name for the Campaign (Required)" id="name" required>
                        <div id="email_validation" v-if="this.name.length===0">Enter a Name</div>
                    </div>
                    <div class="form-group mb-4">
                        <label for="description">Description</label>
                        <input type="text" class="form-control" v-model="description" aria-describedby="nameHelp"
                            placeholder="Enter description for the Campaign (Required)" id="description" required>
                        <div id="email_validation" v-if="this.description.length===0">Enter a description</div>
                    </div>
                    <div class="form-group mb-4">
                        <label for="startDate">Start Date</label>
                        <input v-model="startDate" class="form-control" type="date" id="startDate" required >
                        <div id="email_validation" v-if="this.startDate.length===0">Enter a start Date</div>
                    </div>
                    <div class="form-group mb-4">
                        <label for="endDate">End Date</label>
                        <input v-model="endDate" class="form-control" type="date" id="endDate" required >
                        <div id="email_validation" v-if="this.endDate.length===0">Enter a end Date</div>
                    </div>
                    <div class="form-group mb-4">
                        <label for="budget">Budget</label>
                        <input type="text" class="form-control" v-model="budget" placeholder="Budget (Rs.)" id="budget" required>
                        <div id="email_validation" v-if="this.budget.length===0">Enter a Budget</div>
                    </div>
                    <div class="form-group mb-4">
                        <label for="goal">Goal</label>
                        <input type="text" class="form-control" v-model="goal" placeholder="Goal of the campaign (optional)" id="goal">
                        <div id="email_validation" v-if="this.goal.length===0">Enter a goal</div>
                    </div>
     
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" v-model="visibility" id="visibility" value="public">
                        <label class="form-check-label" for="visibility">Make it Public?</label>
                    </div>
                
                    <div class="text-center mb-4" style="margin-top: 5%;">
                        <button class="btn btn-primary" @click="go_to_dashboard">Go Back</button>
                        <button class="btn btn-success" id="create" @click='Handle_Click'>Create</button>
                    </div>
        </div>
    </div>
    
    `,

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


    methods:{
        go_to_dashboard(){

            switch (this.$store.getters.getRole) {
                case "spons":
                    this.$router.push("/dashboard-spons");
                    break;
                case "infl":
                    this.$router.push("/dashboard-infl");
                }
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
                this.Create_Campaign();
            }
        },

        async Create_Campaign(){
            console.log(this.name)
            console.log(this.description)
            console.log(this.startDate)
            console.log(this.endDate)
            console.log(this.budget)
            console.log(this.goal)
            console.log(this.visibility)
            if (this.visibility===""){
                this.visibility=false
            }
            const origin = window.location.origin;
            const url = `${origin}/add_campaign`;
            const res = await fetch(url, {
                method: "POST",
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

        if (res.ok) {
          const data = await res.json();
          console.log(data);
          // Handle successful sign up, e.g., redirect or store token
          switch (this.$store.getters.getRole) {
                case "spons":
                    this.$router.push("/dashboard-spons");
                    break;
                case "infl":
                    this.$router.push("/dashboard-infl");
                    
                }
        } else if(res.status===403 || res.status===401){
                console.error("Forbidden Request");
                sessionStorage.clear()
                this.$router.push("/login");
            }else {
          const errorData = await res.json();
          console.error("Addition failed:", errorData);
          // Handle sign up error
        }


        }

    }



};

export default AddCamp;
