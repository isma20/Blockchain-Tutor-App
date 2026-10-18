import { Injectable } from '@angular/core';
import Web3 from 'web3';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {
  private web3: any;
  public isConnected = false;

  constructor() {
    if (typeof window.ethereum !== 'undefined') {
      this.web3 = new Web3(window.ethereum);
    } else {
      console.warn('MetaMask not found!');
    }
  }

  async connectWallet(): Promise<boolean> {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      return false;
    }
  }

  async getAccount(): Promise<string> {
    const accounts = await this.web3.eth.getAccounts();
    return accounts[0];
  }
}