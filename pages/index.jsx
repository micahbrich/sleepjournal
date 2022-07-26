import { GetStaticProps } from "next";
import { DayStats } from "components/stat";
import Head from "next/head";
import useSWR, { SWRConfig } from "swr";
import { SleepData, getSleepData } from "./api/oura";

const fetcher = (url, ...args) => fetch(url, ...args).then((res) => res.json());

const Home = ({ fallback }) => {
  const { data, error } = useSWR("/api/oura", fetcher);

  return (
    <SWRConfig value={{ fallback }}>
      <div>
        <Head>
          <title>Sleep Journal</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-2">
          {data?.sleep?.map((data, index) => (
            <DayStats {...data} index={index} />
          ))}
        </div>
      </div>
    </SWRConfig>
  );
};

export default Home;

export const getStaticProps = async (ctx) => {
  const { sleep } = await getSleepData();

  return {
    props: {
      revalidate: 10, // In seconds
      fallback: {
        "/api/oura": sleep,
      },
    },
  };
};
