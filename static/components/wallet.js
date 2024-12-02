const wallet = {
    template:`
        <div class="container">
        <!-- Wallet Balance Section -->
        <div class="wallet-balance">
         <i class="icon bi bi-wallet"></i>
            <h4>Your Balance</h4>
            <h2>&#x20b9 {{this.balance}}</h2>
        </div>

        </div>

    `,
    props:{
        balance:{
            type:Number
        },
    }

};


export default wallet;