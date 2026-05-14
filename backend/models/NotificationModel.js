class Notification {
    constructor({ recipientEmail, type, title, message, relatedId = null, metadata = {} }) {
        this.recipientEmail = recipientEmail;
        this.type = type; // 'parcel', 'payment', 'system', 'promotion'
        this.title = title;
        this.message = message;
        this.relatedId = relatedId;
        this.metadata = metadata;
        this.isRead = false;
        this.createdAt = new Date();
    }
}

module.exports = Notification;
