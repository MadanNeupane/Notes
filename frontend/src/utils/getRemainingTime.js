

const getRemainingTime = time => {
    const now = new Date();
    const then = new Date(time);

    const timeDifference = then.getTime() - now.getTime();

    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let timeLeft;

    if (days > 0) timeLeft = `${days} day${days > 1 ? 's' : ''}`;
    else if (hours > 0) timeLeft = `${hours} hour${hours > 1 ? 's' : ''}`;
    else if (minutes > 0) timeLeft = `${minutes} minute${minutes > 1 ? 's' : ''}`;
    else if (seconds > 0) timeLeft = `${seconds} second${seconds > 1 ? 's' : ''}`;

    return timeLeft;
}


export default getRemainingTime