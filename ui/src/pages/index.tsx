
import Head from 'next/head';
import Image from 'next/image';
import { useEffect } from 'react';
import GradientBG from '../components/GradientBG.js';
import styles from '../styles/Home.module.css';
//https://berkeley.minaexplorer.com/transaction/5JuxnMvyu2y4cxKZWqoFok9c4er24W7rRGYiKjBdUEmodhDRKhg3
export default function Home() {
  useEffect(() => {
    (async () => {
      const { Mina, PublicKey, fetchAccount, UInt64, AccountUpdate, UInt32 } = await import('snarkyjs');
      const { Add, MinaVesting } = await import('../../../contracts/build/src/');

      const zkAppAddress = 'B62qr3xuExGyePotUWw8Y16G75pUEfzGsvDZjTPEM2r5TMCftCTes4y'//'B62qm3p1ZGw3xiWu4x6bfrF2FS4kj2bp1qrHkdM9rr9WscP3g6qNcb6';
      const senderAddress = 'B62qidwYomTJhfjAngGc2EyU5V49tLFGFmURL9uz5Npat4S2ixnJMB6'//'B62qqkBRuiFYVMNqUTBdM36egQEjm4fYfyBbtTpjyRXyaWfCrtmZs4L';

      // This should be removed once the zkAppAddress is updated.
      if (!zkAppAddress) {
        console.error(
          'The following error is caused because the zkAppAddress has an empty string as the public key. Update the zkAppAddress with the public key for your zkApp account, or try this address for an example "Add" smart contract that we deployed to Berkeley Testnet: B62qqkb7hD1We6gEfrcqosKt9C398VLp1WXeTo1i9boPoqF7B1LxHg4'
        );
      }

      const zkApp = new MinaVesting(PublicKey.fromBase58(zkAppAddress));
      Mina.setActiveInstance(Mina.Network('https://proxy.berkeley.minaexplorer.com/graphql'));
      await MinaVesting.compile();
      const account = await fetchAccount({ publicKey: zkAppAddress, ...zkApp }, 'https://proxy.berkeley.minaexplorer.com/graphql');
      console.log(`-account:`, account);
      // const zkState = zkApp.num.get().toString();
      const accountUpdate = AccountUpdate.create(PublicKey.fromBase58(senderAddress))

      console.log(`-zkApp State:`, zkApp.account.balance.get().value.toString(), Object.keys(accountUpdate.account))
      let tx = await Mina.transaction({ sender: PublicKey.fromBase58(senderAddress), fee: 0.1e9 }, () => {
        // zkApp.withdraw(
        //   zkApp.account.balance.get()
        // );
        zkApp.update(PublicKey.fromBase58(senderAddress), UInt32.from(2), zkApp.account.balance.get(), zkApp.vestingPeriod.get(), zkApp.vestingIncrement.get())
      });
      // console.log(`tx:`, tx, tx.toJSON());
      const provedTx = await tx.prove();

      try {
        await (window as any).mina.requestAccounts();
        const result = await (window as any).mina.sendTransaction({
          transaction: tx.toJSON(),
          feePayer: {
            fee: Number(0.01),
            memo: "Tung's memo",
          }
        })
        console.log({ result })
      } catch (error) {
        console.log(`--error:`, error);
      }
    })();
  }, []);

  return (
    <>
      <Head>
        <title>Mina zkApp UI</title>
        <meta name="description" content="built with SnarkyJS" />
        <link rel="icon" href="/assets/favicon.ico" />
      </Head>
      <GradientBG>
        <main className={styles.main}>
          <div className={styles.center}>
            <a
              href="https://minaprotocol.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className={styles.logo}
                src="/assets/HeroMinaLogo.svg"
                alt="Mina Logo"
                width="191"
                height="174"
                priority
              />
            </a>
            <p className={styles.tagline}>
              built with
              <code className={styles.code}> SnarkyJS</code>
            </p>
          </div>
          <p className={styles.start}>
            Get started by editing
            <code className={styles.code}> src/pages/index.tsx</code>
          </p>
          <div className={styles.grid}>
            <a
              href="https://docs.minaprotocol.com/zkapps"
              className={styles.card}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h2>
                <span>DOCS</span>
                <div>
                  <Image
                    src="/assets/arrow-right-small.svg"
                    alt="Mina Logo"
                    width={16}
                    height={16}
                    priority
                  />
                </div>
              </h2>
              <p>Explore zkApps, how to build one, and in-depth references</p>
            </a>
            <a
              href="https://docs.minaprotocol.com/zkapps/tutorials/hello-world"
              className={styles.card}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h2>
                <span>TUTORIALS</span>
                <div>
                  <Image
                    src="/assets/arrow-right-small.svg"
                    alt="Mina Logo"
                    width={16}
                    height={16}
                    priority
                  />
                </div>
              </h2>
              <p>Learn with step-by-step SnarkyJS tutorials</p>
            </a>
            <a
              href="https://discord.gg/minaprotocol"
              className={styles.card}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h2>
                <span>QUESTIONS</span>
                <div>
                  <Image
                    src="/assets/arrow-right-small.svg"
                    alt="Mina Logo"
                    width={16}
                    height={16}
                    priority
                  />
                </div>
              </h2>
              <p>Ask questions on our Discord server</p>
            </a>
            <a
              href="https://docs.minaprotocol.com/zkapps/how-to-deploy-a-zkapp"
              className={styles.card}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h2>
                <span>DEPLOY</span>
                <div>
                  <Image
                    src="/assets/arrow-right-small.svg"
                    alt="Mina Logo"
                    width={16}
                    height={16}
                    priority
                  />
                </div>
              </h2>
              <p>Deploy a zkApp to Berkeley Testnet</p>
            </a>
          </div>
        </main>
      </GradientBG>
    </>
  );
}
