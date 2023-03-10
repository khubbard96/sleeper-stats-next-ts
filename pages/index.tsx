import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Dynasty League</title>
        <meta
          name="description"
          content="A web app to see advanced stats for the dynasty league"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to the Dynasty League app</h1>

        <p className={styles.description}>Get started by selecting a year</p>

        <div className={styles.grid}>
          <a href="/app/year/2022" className={styles.card}>
            <h2>2022</h2>
          </a>

          <a href="/app/year/2021" className={styles.card}>
            <h2>2021</h2>
          </a>

          <a href="/app/year/2020" className={styles.card}>
            <h2>2020</h2>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}
