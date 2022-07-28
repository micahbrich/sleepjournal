import { SleepData } from "pages/api/oura";
import { DateTime, Duration } from "luxon";
import { useState, useEffect } from "react";

interface DayStatsProps extends SleepData {
  index: number;
}

export const DayStats = ({ index, ...input }: DayStatsProps) => {
  const [data, setData] = useState<SleepData>(input);
  const [calculated, setCalculatedData] = useState<any>({});
  const update = (name: string, value: any) =>
    setData({ ...data, [name]: value });

  useEffect(() => {
    const date = DateTime.fromISO(data.summary_date).toLocaleString(
      DateTime.DATE_FULL
    );

    const startTime = DateTime.fromISO(data.bedtime_start);
    const endTime = DateTime.fromISO(data.bedtime_end);

    // const onsetLatency = Duration.fromObject({ seconds: data.onset_latency });
    // const firstSleep = startTime.plus(onsetLatency);
    const firstSleep = DateTime.fromISO(data.bedtime_start).plus({
      seconds: data.onset_latency,
    });

    const duration = Duration.fromObject({
      seconds: data.duration,
    }).shiftTo("hours", "minutes");

    const awake = Duration.fromObject({
      seconds: data.awake,
    }).shiftTo("hours", "minutes");

    const asleep = Duration.fromObject({
      seconds: data.total,
    }).shiftTo("hours", "minutes");

    setCalculatedData({
      date,
      startTime,
      endTime,
      firstSleep,
      duration,
      awake,
      asleep,
    });
  }, [data]);

  const { date, startTime, endTime, firstSleep, duration, awake, asleep } =
    calculated;

  return (
    <div className="border border-grey-100 rounded-lg shadow-lg w-full h-full min-h-screen flex flex-col md:max-w-xl mx-auto md:min-h-fit lg:my-8 mb-4">
      <header
        className={`border-b py-3 px-3 pl-6 rounded-t-md ${
          index === 0 ? "text-white bg-red-500" : "text-gray-500 bg-slate-100"
        }`}
      >
        <h6 className="uppercase text-xs font-bold tracking-wider">{date}</h6>
      </header>
      <dl className="p-2 px-4 pb-5 flex-grow flex flex-col h-full divide-y gap-y-2 bg-red-50">
        <Stat
          label="1. What time did you get into bed?"
          update={(e) => update("bedtime_start", e.target.value)}
          dateTime={startTime}
        >
          {DateTime.fromISO(startTime).toLocaleString(DateTime.TIME_SIMPLE)}
        </Stat>

        <Stat
          label="2. What time did you fall asleep?"
          update={(e) => {
            let dt = DateTime.fromISO(e.target.value);
            let latency = DateTime.fromISO(data.bedtime_start)
              .diff(dt)
              .as("seconds");
            update("onset_latency", latency);
          }}
          dateTime={firstSleep}
        >
          {DateTime.fromISO(firstSleep).toLocaleString(DateTime.TIME_SIMPLE)}
        </Stat>

        <Stat
          label="3. How long were you up in the middle of the night?"
          update={(e) => update("awake", e.target.value)}
        >
          {awake.toHuman({ unitDisplay: "narrow" })}
        </Stat>

        <Stat
          label="4. What time did you finally wake up?"
          update={(e) => update("bedtime_end", e.target.value)}
          dateTime={endTime}
        >
          {endTime.toLocaleString(DateTime.TIME_SIMPLE)}
        </Stat>

        <Stat
          label="5. What time did you finally get out of bed?"
          update={(e) => update("day_start", e.target.value)}
          dateTime={endTime}
        ></Stat>

        <Stat
          label="6. Total time in bed for the night"
          update={(e) => update("duration", e.target.value)}
        >
          {duration.toHuman({ unitDisplay: "narrow" })}
        </Stat>

        <Stat
          label="7. Total time asleep for the night"
          update={(e) => update("total", e.target.value)}
        >
          {asleep.toHuman({ unitDisplay: "narrow" })}
        </Stat>

        <Stat
          label="8. Sleep efficiency for the night"
          update={(e) => update("efficiency", e.target.value)}
        >
          {data.efficiency}%
        </Stat>
      </dl>
      <pre className="text-xs p-4">
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </div>
  );
};

const Stat = ({
  label,
  update,
  dateTime,
  children,
}: {
  label: string;
  dateTime?: DateTime;
  update: (e: any) => void;
  children?: any;
}) => {
  return (
    <div className="flex justify-between items-baseline pt-3 gap-x-5">
      <dt className="block font-serif italic text-base pb-1">{label}</dt>
      <dd className="font-mono text-xs tracking-tight pb-1">
        {dateTime ? (
          <input
            type="datetime-local"
            value={dateTime.toFormat("yyyy-MM-dd'T'hh:mm")}
            className="p-2 rounded"
            onChange={update}
          />
        ) : (
          <>{children}</>
        )}
      </dd>
    </div>
  );
};
// <input value={children} className="p-2 rounded" onChange={update} />