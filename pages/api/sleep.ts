import type { NextApiRequest, NextApiResponse } from "next";
import { ApiError } from "next/dist/server/api-utils";
import { format, startOfWeek, endOfWeek, subWeeks, subDays } from "date-fns";

const access_token = process.env.OURA_TOKEN;

const fetcher = (path: string, ...args: any) =>
  fetch(`https://api.ouraring.com/v1/${path}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
      Accepts: "application/json",
    },
    ...args,
  }).then((res) => res.json());

interface APIResponse {
  sleep?: SleepData[] | undefined;
  start?: string;
  end?: string;
  error?: string | undefined;
}

export interface SleepData {
  error?: string;
  summary_date: string;
  period_id: number;
  is_longest: number;
  timezone: number;
  bedtime_end: string;
  bedtime_start: string;
  breath_average: number;
  duration: number;
  total: number;
  awake: number;
  rem: number;
  deep: number;
  light: number;
  midpoint_time: number;
  efficiency: number;
  restless: number;
  onset_latency: number;
  hr_5min: number[];
  hr_average: number;
  hr_lowest: number;
  hypnogram_5min: number;
  rmssd: number;
  rmssd_5min: number[];
  score: number;
  score_alignment: number;
  score_deep: number;
  score_disturbances: number;
  score_efficiency: number;
  score_latency: number;
  score_rem: number;
  score_total: number;
  temperature_deviation: number;
  temperature_trend_deviation: number;
  bedtime_start_delta: number;
  bedtime_end_delta: number;
  midpoint_at_delta: number;
  temperature_delta: number;
}

export default async function (
  req: NextApiRequest,
  res: NextApiResponse<APIResponse>
) {
  try {
    // const activity = await getActivityData();
    const sleep = await getSleepData();
    return res.status(200).json({ ...sleep });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return res.status(500).json({ error: error.message });
    }
  }
}

export const getActivityData = async () => {
  const { activity } = await fetcher("activity");
  return activity;
};

export const getSleepData = async () => {
  const today = new Date();
  const startDate = new Date();
  const yesterday = startOfWeek(subDays(startDate, 1));
  const start = format(startDate, "yyyy-MM-dd");
  const end = format(yesterday, "yyyy-MM-dd");

  const { sleep } = await fetcher(`sleep?start=${yesterday}&end=${today}`);
  const sorted = sleep.sort((a: SleepData, b: SleepData) => {
    const aD = new Date(a.summary_date).getTime();
    const bD = new Date(b.summary_date).getTime();
    return bD - aD;
  });

  return { start, end, sleep: sorted };
};
