import React, { ReactChild } from "react";
import { Task } from "../../types/public-types";
import { addToDate, isSameDate } from "../../helpers/date-helper";
import styles from "./grid.module.css";

export type GridBodyProps = {
  tasks: Task[];
  dates: Date[];
  svgWidth: number;
  rowHeight: number;
  columnWidth: number;
  todayColor: string;
  weekendDay?: number[];
  weekendColor?: string;
  holidayList?: Date[];
  holidayColor?: string;
  rtl: boolean;
};

export const GridBody: React.FC<GridBodyProps> = ({
  tasks,
  dates,
  rowHeight,
  svgWidth,
  columnWidth,
  todayColor,
  weekendDay,
  weekendColor,
  holidayList,
  holidayColor,
  rtl,
}) => {
  let y = 0;
  const gridRows: ReactChild[] = [];
  const rowLines: ReactChild[] = [
    <line
      key="RowLineFirst"
      x="0"
      y1={0}
      x2={svgWidth}
      y2={0}
      className={styles.gridRowLine}
    />,
  ];
  for (const task of tasks) {
    gridRows.push(
      <rect
        key={"Row" + task.id}
        x="0"
        y={y}
        width={svgWidth}
        height={rowHeight}
        className={styles.gridRow}
      />
    );
    rowLines.push(
      <line
        key={"RowLine" + task.id}
        x="0"
        y1={y + rowHeight}
        x2={svgWidth}
        y2={y + rowHeight}
        className={styles.gridRowLine}
      />
    );
    y += rowHeight;
  }

  const now = new Date();
  let tickX = 0;
  const ticks: ReactChild[] = [];
  let today: ReactChild = <rect />;
  const weekend: ReactChild[] = [];
  const holidays: ReactChild[] = [];
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    ticks.push(
      <line
        key={date.getTime()}
        x1={tickX}
        y1={0}
        x2={tickX}
        y2={y}
        className={styles.gridTick}
      />
    );
    if (
      (i + 1 !== dates.length &&
        date.getTime() < now.getTime() &&
        dates[i + 1].getTime() >= now.getTime()) ||
      // if current date is last
      (i !== 0 &&
        i + 1 === dates.length &&
        date.getTime() < now.getTime() &&
        addToDate(
          date,
          date.getTime() - dates[i - 1].getTime(),
          "millisecond"
        ).getTime() >= now.getTime())
    ) {
      today = (
        <rect
          x={tickX}
          y={0}
          width={columnWidth}
          height={y}
          fill={todayColor}
        />
      );
    }

    // Weekend
    const currentDay = date.getDay();
    const currentTime = date.getTime();
    if (weekendDay && weekendDay.includes(currentDay)) {
      weekend.push(
        <rect 
          key={`we-${currentTime}`}
          x={tickX}
          y={0}
          width={columnWidth}
          height={y}
          fill={weekendColor}
        />
      )
    }

    // Holiday
    if (holidayList && holidayList.length > 0) {
      // Check if current time is within holiday range
      for (let j = 0; j < holidayList.length; j++) {
        if (isSameDate(holidayList[j], date)) {
          holidays.push(
            <rect 
              key={`hl-${currentTime}`}
              x={tickX}
              y={0}
              width={columnWidth}
              height={y}
              fill={holidayColor}
            />
          )
        }
      }
    }

    // rtl for today
    if (
      rtl &&
      i + 1 !== dates.length &&
      date.getTime() >= now.getTime() &&
      dates[i + 1].getTime() < now.getTime()
    ) {
      today = (
        <rect
          x={tickX + columnWidth}
          y={0}
          width={columnWidth}
          height={y}
          fill={todayColor}
        />
      );
    }
    tickX += columnWidth;
  }
  return (
    <g className="gridBody">
      <g className="rows">{gridRows}</g>
      <g className="rowLines">{rowLines}</g>
      <g className="ticks">{ticks}</g>
      <g className="today">{today}</g>
      <g className="weekend">{weekend}</g>
      <g className="holidays">{holidays}</g>
    </g>
  );
};
