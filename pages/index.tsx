import { GetStaticProps } from "next";
import { DayStats } from "components/stat";
import type { NextPage } from "next";
import Head from "next/head";
import useSWR from "swr";
import { SleepData, getSleepData } from "./api/sleep";

const fetcher = (url: string, ...args: any) =>
  fetch(url, ...args).then((res) => res.json());

const Home: NextPage = () => {
  const { data, error } = useSWR("/api/sleep", fetcher);
  const { sleep = [] } = data || {};

  return (
    <div>
      <Head>
        <title>Sleep Journal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-2">
        {sleep.map((data: SleepData, index: number) => (
          <DayStats {...data} index={index} />
        ))}
      </div>
    </div>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async (ctx) => {
  const sleep = await getSleepData();

  return {
    props: {
      revalidate: 10, // In seconds
      fallback: {
        "/api/sleep": sleep,
      },
    },
  };
};
