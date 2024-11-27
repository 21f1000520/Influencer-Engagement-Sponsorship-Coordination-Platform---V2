const Stats = {
    template: `<h1> This is Stats </h1>`,

    data(){
        return{
            all_running:[],
        }
    },

    mounted() {
    console.log('mounted stats')
    },

    methods:{
        async Get_all_running(){
            console.log('get all running')
        },

    },

};

export default Stats;
