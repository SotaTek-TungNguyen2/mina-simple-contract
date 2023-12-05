import { SmartContract, UInt32, UInt64, state, State, method, AccountUpdate, PublicKey } from 'snarkyjs';

const fee = 1e7

export class MinaVesting extends SmartContract {
  @state(PublicKey) beneficiary = State<PublicKey>();
  @state(UInt32) cliffTime = State<UInt32>();
  @state(UInt64) cliffAmount = State<UInt64>();
  @state(UInt32) vestingPeriod = State<UInt32>();
  @state(UInt64) vestingIncrement = State<UInt64>();
  
  init() {
    super.init();
    let actualBalance = this.account.balance.get().sub(fee);
    this.account.balance.assertEquals(actualBalance)
    /**update zk app's state */
    this.beneficiary.set(PublicKey.fromBase58("B62qidwYomTJhfjAngGc2EyU5V49tLFGFmURL9uz5Npat4S2ixnJMB6"))
    this.cliffTime.set(UInt32.from(3))
    this.cliffAmount.set(actualBalance)
    this.vestingPeriod.set(UInt32.from(1)) // 0 is not allowed; default value is 1
    this.vestingIncrement.set(UInt64.from(0))

    const accountUpdate = AccountUpdate.create(PublicKey.fromBase58("B62qidwYomTJhfjAngGc2EyU5V49tLFGFmURL9uz5Npat4S2ixnJMB6"))

    accountUpdate.account.timing.set({
      initialMinimumBalance: this.cliffAmount.get(),
      cliffTime: this.cliffTime.get(),
      cliffAmount: this.cliffAmount.get(),
      vestingPeriod: this.vestingPeriod.get(),
      vestingIncrement: this.vestingIncrement.get(),
    })
  }

  @method update(beneficiary: PublicKey, cliffTime: UInt32, cliffAmount: UInt64, vestingPeriod: UInt32, vestingIncrement: UInt64) {
    this.beneficiary.assertEquals(this.beneficiary.get())
    this.cliffAmount.assertEquals(this.cliffAmount.get())
    this.cliffTime.assertEquals(this.cliffTime.get())
    this.vestingPeriod.assertEquals(this.vestingPeriod.get())
    this.vestingIncrement.assertEquals(this.vestingIncrement.get())
    /**update zk app's state */
    this.beneficiary.set(beneficiary)
    this.cliffTime.set(cliffTime)
    this.cliffAmount.set(cliffAmount)
    this.vestingPeriod.set(vestingPeriod)
    this.vestingIncrement.set(vestingIncrement)
    
    const accountUpdate = AccountUpdate.create(this.address)
    accountUpdate.account.timing.set({
      initialMinimumBalance: this.cliffAmount.get(),
      cliffTime: this.cliffTime.get(),
      cliffAmount: this.cliffAmount.get(),
      vestingPeriod: UInt32.from(1), // 0 is not allowed; default value is 1
      vestingIncrement: UInt64.from(0),
    })
  }

  @method withdraw(amount: UInt64) {
    this.beneficiary.assertEquals(this.beneficiary.get())
    this.sender.assertEquals(this.beneficiary.get())
    this.send({ to: this.sender, amount });
  }

  @method deposit(amount: UInt64) {
    let senderUpdate = AccountUpdate.createSigned(this.sender);
    senderUpdate.send({ to: this, amount });
  }
}
