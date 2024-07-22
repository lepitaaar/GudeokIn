import moment from "moment";

export function getWeekdaysDates(): string[] {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (일요일)부터 6 (토요일)까지
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + 1);

    const weekdays: string[] = [];

    function formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // 월은 0부터 시작하므로 +1 필요
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}${month}${day}`;
    }

    for (let i = 0; i < 5; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        weekdays.push(formatDate(date));
    }

    return weekdays;
}

export function isValidEmail(email: string): boolean {
    // Regular expression to match the email pattern
    const emailRegex =
        /^[0-9]{4}[1-3][0-9]{1}[0-9]{1}[0-9]{1,2}@gudeok\.hs\.kr$/;
    return emailRegex.test(email);
}

export function extractEmailDetails(
    email: string
): { year: number; grade: number; class: number; number: number } | null {
    if (!isValidEmail(email)) {
        return null;
    }

    // Extract the numeric parts of the email
    const emailParts = email.match(
        /^([0-9]{4})([1-3])([0-9]{1})([0-9]{1,2})@gudeok\.hs\.kr$/
    );

    if (emailParts && emailParts.length === 5) {
        return {
            year: parseInt(emailParts[1], 10),
            grade: parseInt(emailParts[2], 10),
            class: parseInt(emailParts[3], 10),
            number: parseInt(emailParts[4], 10),
        };
    }

    return null;
}

export function ChangeDateToSigan(date: string) {
    const time = moment(new Date());

    const duration = moment.duration(time.diff(moment(date)));

    const min = duration.asMinutes();
    const hours = duration.asHours();

    if (min < 1) {
        return "0분 전";
    } else if (hours < 1) {
        return `${Math.floor(min)}분 전`;
    } else if (hours < 24) {
        return `${Math.floor(hours)}시간 전`;
    } else {
        return moment(date).format("YYYY-MM-DD HH:mm");
    }
}

export function changeDateFormat(dateString: string) {
    const date = new Date(Date.parse(dateString));

    return `${(date.getUTCMonth() + 1).toString().padStart(2, "0")}/${date
        .getUTCDate()
        .toString()
        .padStart(2, "0")} ${date
        .getUTCHours()
        .toString()
        .padStart(2, "0")}:${date.getUTCMinutes().toString().padStart(2, "0")}`;
}
