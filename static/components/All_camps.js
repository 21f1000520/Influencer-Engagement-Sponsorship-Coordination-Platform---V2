

const all_campaigns={
    template:`
    <div>
     <table class="table table-hover">
            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Name</th>
                    <th scope="col">Details</th>
                    <th scope="col">Payment (Rs.)</th>
                    <th scope="col">Goals</th>
                    <th scope="col">Actions</th>
                </tr>
            </thead>
            <tbody>
               <tr v-for="(Campaign,index) in camps">
                    <th scope="row">{{ index+1 }}</th>
                    <td>{{ Campaign.name }}</td>
                    <td>{{ Campaign.description }}</td>
                    <td>{{ Campaign.budget }}</td>
                    <td>{{ Campaign.goals }}</td>
                    <td>
                        <button type="button" class="btn btn-primary" >Button</button> 
                    </td>
                    
                </tr>
            </tbody>
        </table>
    </div>
    `,

    props:{
        camps: {
                type: Array,
                required: false,
                },
    },
    data(){
        return {
            popup:false,
            popupId:"",
        }
    },
    methods:{
        
    },
};

export default all_campaigns;