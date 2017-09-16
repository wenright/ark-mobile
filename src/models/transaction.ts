import { Transaction as TransactionModel, TransactionType } from 'ark-ts/model';
import arkConfig from 'ark-ts/config';

import { MarketCurrency, MarketHistory } from '@models/market';

const TX_TYPES = {
  0: 'Send',
  1: 'Second Signature Creation',
  2: 'Delegate Registration',
  3: 'Vote',
  4: 'Multisignature Creation',
};

export class Transaction extends TransactionModel {

  public date: Date;
  public totalAmount: number;

  constructor(public address: string) {
    super();
  }

  deserialize(input: any): Transaction {
    let self: any = this;

    for (let prop in input) {
      self[prop] = input[prop];
    }

    this.date = new Date(this.getTimestamp() * 1000);

    return self;
  }

  getAmount() {
    let amount = this.amount;

    if (this.isSender()) amount = this.amount + this.fee;

    return amount;
  }

  getAmountEquivalent(history: MarketHistory, marketCurrency: MarketCurrency): number {
    if (!history || !marketCurrency) return 0;

    let ticker = history.findDate(this.date);
    let currency = ticker ? ticker.getCurrency({ code: marketCurrency.code }) : null;
    let price = currency ? currency.price : 0;

    return this.getAmount() * price;
  }

  getTimestamp() {
    var blockchainDate = arkConfig.blockchain.date;
    var blockchainTime = blockchainDate.getTime() / 1000;

    return this.timestamp + blockchainTime;
  }

  getTypeLabel(): string {
    let type = TX_TYPES[this.type];

    if (this.isTransfer() && !this.isSender()) type = 'Receive';

    return type;
  }

  isTransfer(): boolean {
    return this.type == TransactionType.SendArk;
  }

  isSameAddress(): boolean {
    return this.senderId == this.recipientId;
  }

  isSender(): boolean {
    return this.senderId == this.address;
  }

  isReceiver(address: string): boolean {
    return this.recipientId == this.address;
  }

}