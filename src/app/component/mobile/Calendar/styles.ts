import Calendar from "react-calendar";
import styled from "styled-components";
import "react-calendar/dist/Calendar.css";

export const StyledCalendarWrapper = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    position: relative;

    .react-calendar {
        width: 100%;
        border: none;
        border-radius: 0.5rem;
        box-shadow: 0px 7px 8px 0px rgba(0, 0, 0, 0.1);
        padding: 3% 5%;
        background-color: white;
    }

    .react-calendar__navigation {
        justify-content: center;
    }

    .react-calendar__navigation button {
        font-weight: 600;
        font-size: 1rem;
    }

    .react-calendar__navigation button:focus {
        background-color: white;
    }

    .react-calendar__navigation button:disabled {
        background-color: white;
        color: #000000; /* theme("colors.black") */
    }

    .react-calendar__navigation__label {
        flex-grow: 0 !important;
    }

    .react-calendar__month-view__weekdays abbr {
        text-decoration: none;
        font-weight: 800;
    }

    .react-calendar__tile--now {
        background: none;
        abbr {
            color: #d10000;
        }
    }

    .react-calendar__year-view__months__month {
        border-radius: 0.8rem;
        background-color: #e5e7eb; /* theme("colors.gray.200") */
        padding: 0;
    }

    .react-calendar__tile--hasActive {
        background-color: #2563eb; /* theme("colors.blue.600") */
        abbr {
            color: white;
        }
    }

    .react-calendar__tile {
        padding: 5px 0px 18px;
        position: relative;
    }

    .react-calendar__year-view__months__month {
        flex: 0 0 calc(33.3333% - 10px) !important;
        margin-inline-start: 5px !important;
        margin-inline-end: 5px !important;
        margin-block-end: 10px;
        padding: 20px 6.6667px;
        font-size: 0.9rem;
        font-weight: 600;
        color: #6b7280; /* theme("colors.gray.500") */
    }

    .react-calendar__tile:enabled:hover,
    .react-calendar__tile:enabled:focus,
    .react-calendar__tile--active {
        background-color: #2563eb; /* theme("colors.blue.600") */
        border-radius: 0.3rem;
        abbr {
            color: white;
        }
        div {
            color: white;
        }
    }
`;

export const StyledCalendar = styled(Calendar)``;

export const StyledDate = styled.div`
    position: absolute;
    right: 7%;
    top: 6%;
    background-color: #2563eb; /* theme("colors.blue.600") */
    color: #ffffff; /* theme("colors.yellow.500") */
    width: 18%;
    min-width: fit-content;
    height: 1.5rem;
    text-align: center;
    margin: 0 auto;
    line-height: 1.6rem;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 700;
`;

export const StyledToday = styled.div`
    font-size: x-small;
    color: #4b5563; /* theme("colors.gray.700") */
    font-weight: 600;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%);
`;

export const StyledDot = styled.div`
    background-color: #f59e0b; /* theme("colors.gray.700") */
    border-radius: 50%;
    width: 0.3rem;
    height: 0.3rem;
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translateX(-50%);
`;
