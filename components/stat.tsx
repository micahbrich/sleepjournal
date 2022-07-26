import { SleepData } from "pages/api/oura";
import { DateTime, Duration } from "luxon";

interface DayStatsProps extends SleepData {
  index: number;
}

export const DayStats = ({ index, ...data }: DayStatsProps) => {
  const date = DateTime.fromISO(data.summary_date).toLocaleString(
    DateTime.DATE_FULL
  );
  const startTime = DateTime.fromISO(data.bedtime_start);
  const endTime = DateTime.fromISO(data.bedtime_end);

  const onsetLatency = Duration.fromObject({ seconds: data.onset_latency });
  const firstSleep = startTime.plus(onsetLatency);

  const duration = Duration.fromObject({
    seconds: data.duration,
  }).shiftTo("hours", "minutes");

  const awake = Duration.fromObject({
    seconds: data.awake,
  }).shiftTo("hours", "minutes");

  const asleep = Duration.fromObject({
    seconds: data.total,
  }).shiftTo("hours", "minutes");

  return (
    <div className="border border-grey-100 rounded-lg shadow-lg">
      <header
        className={`border-b py-3 px-3 pl-6 rounded-t-md ${
          index === 0 ? "text-white bg-red-500" : "text-gray-500 bg-slate-100"
        }`}
      >
        <h6 className="uppercase text-xs font-bold tracking-wider">{date}</h6>
      </header>
      <dl className="p-2 px-4 pb-5 flex flex-col divide-y gap-y-2">
        <Stat label="1. What time did you get into bed?">
          {startTime.toLocaleString(DateTime.TIME_SIMPLE)}
        </Stat>
        <Stat label="2. What time did you fall asleep?">
          {firstSleep.toLocaleString(DateTime.TIME_SIMPLE)}
        </Stat>
        <Stat label="3. How long were you up in the middle of the night?">
          {awake.toHuman({ unitDisplay: "narrow" })}
        </Stat>
        <Stat label="4. What time did you finally wake up?">
          {endTime.toLocaleString(DateTime.TIME_SIMPLE)}
        </Stat>
        <Stat label="5. What time did you finally get out of bed?"></Stat>
        <Stat label="6. Total time in bed for the night">
          {duration.toHuman({ unitDisplay: "narrow" })}
        </Stat>
        <Stat label="7. Total time asleep for the night">
          {asleep.toHuman({ unitDisplay: "narrow" })}
        </Stat>
        <Stat label="8. Sleep efficiency for the night">
          {data.efficiency}%
        </Stat>
      </dl>
    </div>
  );
};

const Stat = ({ label, children }: { label: string; children?: any }) => {
  return (
    <div className="flex justify-between items-baseline pt-3">
      <dt className="block font-serif italic text-base pb-1">{label}</dt>
      <dd className="font-mono text-xs tracking-tight pb-1">{children}</dd>
    </div>
  );
};
