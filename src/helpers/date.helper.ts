import moment from "moment";

export const convertMiliToSecond = (mili: number) => {
    return Math.floor(mili / 1000);
}

export const dateNowSecond = () => {
    return convertMiliToSecond(Date.now());
}

export const changeDatetimeFormat = (datetime: string, fromFormat : string, toFormat: string) => {
    return moment(datetime, fromFormat).format(toFormat);
}

export const dateTimeToISO = (datetime: string) => {
    return moment(datetime).toISOString();
}