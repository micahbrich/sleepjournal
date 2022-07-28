import Day from "components/Day";
import Head from "next/head";
import useSWR, { SWRConfig } from "swr";
import { getSleepData } from "./api/oura";

const fetcher = (url, ...args) => fetch(url, ...args).then((res) => res.json());

const Home = ({ fallback }) => {
  const { data, error } = useSWR("/api/oura", fetcher);

  if (!data && !error)
    return (
      <div className="p-4 flex justify-center items-center min-h-screen min-w-screen">
        Loading...
      </div>
    );
  if (error) return <div>{error}</div>;

  const { today } = data;

  return (
    <SWRConfig value={{ fallback }}>
      <>
        <Head>
          <title>Sleep Journal</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="p-4 flex flex-col justify-center items-center min-w-full min-h-screen">
          <Day {...today} />
        </div>
      </>
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
