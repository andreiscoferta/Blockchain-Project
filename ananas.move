


    module ananas::ananas {
    use sui::coin::{Self, TreasuryCap, Coin};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::object::{Self, UID};
    use std::option;

    // OTW (One-Time Witness) and the type for the Token
    struct ANANAS has drop {}

    // Struct to represent the admin capability along with deployer's address
    struct AdminCap has key { 
        id: UID, 
        deployer_address: address 
    }

    // Initialize the module
    fun init(otw: ANANAS, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency<ANANAS>(
            otw,
            9, // 9 decimals
            b"ANS", // Symbol
            b"Ananas", // Name
            b"Ananass", // Description
            option::none(), // URL
            ctx
        );
        transfer::public_freeze_object(metadata);

        // Capture the deployer's address
        let deployer_address = tx_context::sender(ctx);

        // Create and transfer AdminCap to the deployer with their address
        let admin_cap = AdminCap {
            id: object::new(ctx),
            deployer_address: deployer_address
        };
        transfer::transfer(admin_cap, tx_context::sender(ctx));
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
    }

    // Public function to mint tokens, only callable by the admin
    public entry fun mint(
        c: &mut TreasuryCap<ANANAS>, 
        amount: u64, 
        recipient: address, 
        _admin: &AdminCap, 
        ctx: &mut TxContext
    ) {
        coin::mint_and_transfer(c, amount, recipient, ctx);
    }

    public entry fun burn(
        c: &mut TreasuryCap<ANANAS>, 
        coin: Coin<ANANAS>,
        _admin: &AdminCap, 
        ctx: &mut TxContext
    ) {
        coin::burn(c, coin);
    }
}
