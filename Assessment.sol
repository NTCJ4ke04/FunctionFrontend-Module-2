// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public contractBalance;

    struct Wallet {
        address owner;
        uint256 balance;
    }

    mapping(address => Wallet) private wallets;

    event Deposit(address indexed walletOwner, uint256 amount);
    event Withdraw(address indexed walletOwner, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event WalletCreated(address indexed walletOwner);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        contractBalance = initBalance;
    }

    modifier onlyWalletOwner(address _walletOwner) {
        require(msg.sender == _walletOwner, "You are not the owner of this wallet");
        _;
    }

    function createWallet() public {
        require(wallets[msg.sender].owner == address(0), "Wallet already exists for this address");
        
        wallets[msg.sender] = Wallet({
            owner: msg.sender,
            balance: 0
        });

        emit WalletCreated(msg.sender);
    }

    function getWalletBalance() public view returns (uint256) {
        return wallets[msg.sender].balance;
    }

    function depositToWallet(uint256 _amount) public payable onlyWalletOwner(msg.sender) {
        Wallet storage wallet = wallets[msg.sender];
        uint _previousBalance = wallet.balance;

        wallet.balance += _amount;
        contractBalance += _amount;

        assert(wallet.balance == _previousBalance + _amount);

        emit Deposit(msg.sender, _amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdrawFromWallet(uint256 _withdrawAmount) public onlyWalletOwner(msg.sender) {
        Wallet storage wallet = wallets[msg.sender];
        uint _previousBalance = wallet.balance;

        if (wallet.balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: wallet.balance,
                withdrawAmount: _withdrawAmount
            });
        }

        wallet.balance -= _withdrawAmount;
        contractBalance -= _withdrawAmount;

        assert(wallet.balance == (_previousBalance - _withdrawAmount));

        emit Withdraw(msg.sender, _withdrawAmount);
    }

    function transferFromWallet(address payable _to, uint256 _amount) public onlyWalletOwner(msg.sender) {
        Wallet storage senderWallet = wallets[msg.sender];
        Wallet storage receiverWallet = wallets[_to];

        require(senderWallet.balance >= _amount, "Insufficient balance");

        uint _previousSenderBalance = senderWallet.balance;
        uint _previousReceiverBalance = receiverWallet.balance;

        senderWallet.balance -= _amount;
        receiverWallet.balance += _amount;

        assert(senderWallet.balance == (_previousSenderBalance - _amount));
        assert(receiverWallet.balance == (_previousReceiverBalance + _amount));

        emit Transfer(msg.sender, _to, _amount);
    }
}
