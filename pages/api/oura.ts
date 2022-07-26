import type { NextApiRequest, NextApiResponse } from "next";
import { ApiError } from "next/dist/server/api-utils";
import {
  format,
  startOfWeek,
  endOfWeek,
  subWeeks,
  subDays,
  addDays,
} from "date-fns";
import { sortBy } from "lodash";

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
  activity?: any;
  sleep?: SleepData[] | null;
  start?: string | null;
  end?: string | null;
  error?: string | null;
}

export interface SleepData {
  error?: string;
  query?: string;
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
    const { start, end } = getDates();
    const { activity } = await getActivityData(start, end);
    const { sleep } = await getSleepData(start, end);
    return res.status(200).json({ start, end, sleep, activity });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return res.status(500).json({ error: error.message });
    }
  }
}

const getDates = () => {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const yesterday = startOfWeek(subDays(today, 1));

  const start = format(yesterday, "yyyy-MM-dd");
  const end = format(tomorrow, "yyyy-MM-dd");
  return { start, end };
};

export const getActivityData = async (start?: string, end?: string) => {
  const dates = getDates();
  let options = {
    start: start || dates.start,
    end: end || dates.end,
  } as any;
  const query = new URLSearchParams(options).toString();

  const { activity } = await fetcher(`activity?${query}`);
  const sorted = sortBy(activity, "summary_date").reverse();

  return { start, end, activity: sorted };
};

export const getSleepData = async (start?: string, end?: string) => {
  const dates = getDates();
  let options = {
    start: start || dates.start,
    end: end || dates.end,
  } as any;
  const query = new URLSearchParams(options).toString();

  const { sleep } = await fetcher(`sleep?${query}`);
  const sorted = sortBy(sleep, "summary_date").reverse();

  return { start, end, sleep: sorted };
};
