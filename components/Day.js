import { DateTime, Duration } from "luxon";
import classNames from "classnames";
import { useEffect, useState } from "react";

const formatDate = (dateTime) =>
  DateTime.fromISO(dateTime).toLocaleString(DateTime.DATE_FULL);
const formatDateTime = (dateTime) =>
  DateTime.fromISO(dateTime).toLocaleString(DateTime.DATETIME_FULL);

const toTime = (dateTime) =>
  DateTime.fromISO(dateTime).toFormat("yyyy-MM-dd'T'HH:mm");

const Day = (today) => {
  const [data, setData] = useState(today);

  const updateTime = (e) =>
    setData({ ...data, [e.target.name]: e.target.value });

  useEffect(() => {
    const newData = { ...data };
    const first_sleep = DateTime.fromISO(newData.bedtime_start).plus(
      Duration.fromObject({ seconds: newData.onset_latency })
    );

    const start = DateTime.fromISO(newData.revised_bedtime_start);
    const end = DateTime.fromISO(newData.bedtime_start);

    const bedtime_start_diff = end.diff(start, ["hours", "minutes"]).toObject();

    const time_awake = Duration.fromObject({
      seconds: newData.awake,
    }).shiftTo("hours", "minutes");

    const revised_time_awake = Duration.fromObject({
      ...bedtime_start_diff,
    }).shiftTo("hours", "minutes");

    const total_time_awake = time_awake.plus(revised_time_awake);
    const total_time_in_bed = Duration.fromObject(
      DateTime.fromISO(data?.out_of_bed_time || data.bedtime_end)
        .diff(
          DateTime.fromISO(data?.revised_bedtime_start || data.bedtime_start),
          "seconds"
        )
        .toObject()
    ).shiftTo("hours", "minutes");

    const total_time_asleep = Duration.fromObject({
      seconds: data.total,
    }).shiftTo("hours", "minutes");

    const efficiency =
      (total_time_asleep.as("hours") / total_time_in_bed.as("hours")) * 100;

    setData({
      ...newData,
      first_sleep,
      time_awake: time_awake.toHuman({ unitDisplay: "narrow" }),
      revised_time_awake: revised_time_awake.toHuman({
        unitDisplay: "narrow",
      }),
      total_time_awake: total_time_awake.toHuman({ unitDisplay: "narrow" }),
      bedtime_start_diff,
      total_time_in_bed: total_time_in_bed.toHuman({ unitDisplay: "narrow" }),
      total_time_asleep: total_time_asleep.toHuman({ unitDisplay: "narrow" }),
      efficiency,
    });
  }, [data.revised_bedtime_start, data?.out_of_bed_time]);

  return (
    <div className="border rounded-xl shadow-2xl lg:w-1/2 overflow-hidden">
      <ol className="list-none flex flex-col divide-y">
        <Question
          label="What time did you get into bed?"
          key="What time did you get into bed?"
        >
          <Input
            value={
              data?.revised_bedtime_start
                ? toTime(data.revised_bedtime_start)
                : toTime(data.bedtime_start)
            }
            name="revised_bedtime_start"
            onChange={updateTime}
          />
        </Question>
        <Question
          label="What time did you fall asleep?"
          key="What time did you fall asleep?"
        >
          <Answer>{formatDateTime(data.first_sleep)}</Answer>
        </Question>
        <Question
          label="How long were you up in the middle of the night?"
          key="How long were you up in the middle of the night?"
        >
          <Answer>{data?.total_time_awake}</Answer>
        </Question>
        <Question
          label="What time did you finally wake up?"
          key="What time did you finally wake up?"
        >
          <Answer>{formatDateTime(data.bedtime_end)}</Answer>
        </Question>
        <Question
          label="What time did you finally get out of bed?"
          key="What time did you finally get out of bed?"
        >
          <Input
            value={
              data?.out_of_bed_time
                ? toTime(data.out_of_bed_time)
                : toTime(data.bedtime_end)
            }
            name="out_of_bed_time"
            onChange={updateTime}
          />
        </Question>
        <Question
          label="Total time in bed for the night"
          key="Total time in bed for the night"
        >
          <Answer>{data.total_time_in_bed}</Answer>
        </Question>
        <Question
          label="Total time asleep for the night"
          key="Total time asleep for the night"
        >
          <Answer>{data.total_time_asleep}</Answer>
        </Question>
        <Question
          label="Sleep efficiency for the night"
          key="Sleep efficiency for the night"
        >
          <Answer>{Math.floor(data.efficiency)}%</Answer>
        </Question>
      </ol>
      <pre className="hidden text-xs p-5 border-t">
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </div>
  );
};
export default Day;

const Question = ({ label, children, ...props }) => (
  <li className="md:flex justify-between gap-x-5 group" {...props}>
    <h6 className="md:w-1/2 p-2 md:p-3 md:px-8 font-serif italic md:text-lg text-slate-600 bg-slate-50 md:group-last:pb-5">
      {label}
    </h6>
    {children}
  </li>
);

const Answer = ({ children }) => (
  <dd className="py-2 md:py-3 px-3 font-mono text-xs mt-1 ml-2 md:w-1/2 pb-3 group-last:pb-4">
    {children}
  </dd>
);

const Input = (props) => (
  <Answer>
    <input
      type="datetime-local"
      pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"
      className="block rounded font-mono text-xs appearance-none"
      {...props}
    />
  </Answer>
);
