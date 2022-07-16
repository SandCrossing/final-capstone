const dateFormat = /\d\d\d\d-\d\d-\d\d/;
const timeFormat = /\d\d:\d\d/;

function asDateString(date) {
  return `${date.getFullYear().toString(10)}-${(date.getMonth() + 1)
    .toString(10)
    .padStart(2, "0")}-${date.getDate().toString(10).padStart(2, "0")}`;
}

export function formatAsDate(dateString) {
  return dateString.match(dateFormat)[0];
}

export function formatAsTime(timeString) {
  return timeString.match(timeFormat)[0];
}

export function today() {
  return asDateString(new Date());
}

export function previous(currentDate) {
  let [ year, month, day ] = currentDate.split("-");
  month -= 1;
  const date = new Date(year, month, day);
  date.setMonth(date.getMonth());
  date.setDate(date.getDate() - 1);
  return asDateString(date);
}

export function next(currentDate) {
  let [ year, month, day ] = currentDate.split("-");
  month -= 1;
  const date = new Date(year, month, day);
  date.setMonth(date.getMonth());
  date.setDate(date.getDate() + 1);
  return asDateString(date);
}


export const formatDate = (date) => {
  const months = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
  };

  const month = months[Number(date.slice(5, 7))];
  const day = Number(date.slice(8, 10));
  const year = Number(date.slice(0, 4));

  return `${month} ${day}, ${year}`;
};

export const formatTime = (time) => {
  let hour = time[0] + time[1];
  let minutes = time[3] + time[4];
  let meridiem = "AM";
  if (Number(hour) >= 12) {
    meridiem = "PM";
    Number(hour) === 12 ? (hour = 12) : (hour -= 12);
  }
  return `${hour}:${minutes} ${meridiem}`;
};

export const formatPhone = (number) => {
  const cleaned = ("" + number).replace(/\D/g, "");
  const match = cleaned.match(/^(1|)?(\d{3})?(\d{3})(\d{4})$/);
  if (match) {
    const intlCode = match[1] ? "+1 " : "";
    const areaCode = match[2] ? `(${match[2]})` : "";
    return [intlCode, areaCode, match[3], "-", match[4]].join("");
  }
  return number;
};