import { clsx } from "clsx";
import React, { Component } from "react";

import { addDays, getWeek, getStartOfWeek, isSameDay } from "./date_utils";
import Day from "./day";
import WeekNumber from "./week_number";

interface DayProps extends React.ComponentPropsWithoutRef<typeof Day> {}
interface WeekNumberProps
  extends React.ComponentPropsWithoutRef<typeof WeekNumber> {}

interface WeekProps
  extends Omit<
      DayProps,
      | "ariaLabelPrefixWhenEnabled"
      | "disabledDayAriaLabelPrefix"
      | "day"
      | "onClick"
      | "onMouseEnter"
    >,
    Omit<WeekNumberProps, "weekNumber" | "date" | "onClick"> {
  day: Date;
  chooseDayAriaLabelPrefix: DayProps["ariaLabelPrefixWhenEnabled"];
  disabledDayAriaLabelPrefix: DayProps["ariaLabelPrefixWhenDisabled"];
  onDayClick?: (day: Date, event: React.MouseEvent<HTMLDivElement>) => void;
  onDayMouseEnter?: (day: Date) => void;
  shouldCloseOnSelect?: boolean;
  setOpen?: (open: boolean) => void;
  formatWeekNumber?: (date: Date) => number;
  onWeekSelect?: (
    day: Date,
    weekNumber: number,
    event: React.MouseEvent<HTMLDivElement>,
  ) => void;
}

export default class Week extends Component<WeekProps> {
  static get defaultProps(): Partial<WeekProps> {
    return {
      shouldCloseOnSelect: true,
    };
  }

  handleDayClick = (
    day: Date,
    event: React.MouseEvent<HTMLDivElement>,
  ): void => {
    if (this.props.onDayClick) {
      this.props.onDayClick(day, event);
    }
  };

  handleDayMouseEnter = (day: Date): void => {
    if (this.props.onDayMouseEnter) {
      this.props.onDayMouseEnter(day);
    }
  };

  handleWeekClick = (
    day: Date,
    weekNumber: number,
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (typeof this.props.onWeekSelect === "function") {
      this.props.onWeekSelect(day, weekNumber, event);
    }
    if (this.props.showWeekPicker) {
      this.handleDayClick(day, event);
    }
    if (this.props.shouldCloseOnSelect) {
      this.props.setOpen?.(false);
    }
  };

  formatWeekNumber = (date: Date): number => {
    if (this.props.formatWeekNumber) {
      return this.props.formatWeekNumber(date);
    }
    return getWeek(date);
  };

  renderDays = () => {
    const startOfWeek = this.startOfWeek();
    const days = [];
    const weekNumber = this.formatWeekNumber(startOfWeek);
    if (this.props.showWeekNumber) {
      const onClickAction =
        this.props.onWeekSelect || this.props.showWeekPicker
          ? this.handleWeekClick.bind(this, startOfWeek, weekNumber)
          : undefined;
      days.push(
        <WeekNumber
          key="W"
          {...this.props}
          weekNumber={weekNumber}
          date={startOfWeek}
          onClick={onClickAction}
        />,
      );
    }
    return days.concat(
      [0, 1, 2, 3, 4, 5, 6].map<JSX.Element>((offset: number): JSX.Element => {
        const day = addDays(startOfWeek, offset);
        return (
          <Day
            {...this.props}
            ariaLabelPrefixWhenEnabled={this.props.chooseDayAriaLabelPrefix}
            ariaLabelPrefixWhenDisabled={this.props.disabledDayAriaLabelPrefix}
            key={day.valueOf()}
            day={day}
            onClick={this.handleDayClick.bind(this, day)}
            onMouseEnter={this.handleDayMouseEnter.bind(this, day)}
          />
        );
      }),
    );
  };

  startOfWeek = (): Date =>
    getStartOfWeek(
      this.props.day,
      this.props.locale,
      this.props.calendarStartDay,
    );

  isKeyboardSelected = (): boolean =>
    !this.props.disabledKeyboardNavigation &&
    !isSameDay(this.startOfWeek(), this.props.selected) &&
    isSameDay(this.startOfWeek(), this.props.preSelection);

  render(): JSX.Element {
    const weekNumberClasses = {
      "react-datepicker__week": true,
      "react-datepicker__week--selected": isSameDay(
        this.startOfWeek(),
        this.props.selected,
      ),
      "react-datepicker__week--keyboard-selected": this.isKeyboardSelected(),
    };
    return <div className={clsx(weekNumberClasses)}>{this.renderDays()}</div>;
  }
}
