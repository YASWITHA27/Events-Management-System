const { DateTime } = require('luxon');

exports.parseAndFormatDate = (dateString) => {
    const parsedDate = DateTime.fromFormat(dateString, 'MMMM d, yyyy, h:mm a');

    const formattedDate = parsedDate.toFormat("yyyy-MM-d'T'HH:mm");

    return formattedDate;
};

const categories = new Map([
    ['Sports Extravaganza', 'images/sports_extravaganza.jpg'],
    ['Board Game Bonanza', 'images/board_game.jpg'],
    ['Cultural Carnival', 'images/cultural_carnival.jpg'],
    ['Tech Symposium', 'images/tech_symposium.jpg'],
    ['Other', 'images/other-events.jpg']
]);

exports.categories = categories;

exports.formatDate = (inputDate) => {

    const date = new Date(inputDate);

    const formattedDate = date.toLocaleString('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
    });

    return formattedDate;
};

exports.hideFlashMessage = (messageId, delay) => {
    setTimeout(function() {
        var message = document.getElementById(messageId);
        if (message) {
            message.style.display = "none";
        }
    }, delay);
}

