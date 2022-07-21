class Activity {
    constructor(title, titleLowerCase, date, topics, subject, docID, userID) {
        this.title = title;
        this.titleLowerCase = titleLowerCase;
        this.date = date;
        this.topics = topics;
        this.subject = subject;
        this.docID = docID;
        this.userID = userID;
    }
    toString() {
        return this.title + ', ' + this.titleLowerCase + ', ' + this.date + ', ' + this.topics + ', ' + this.subject + ', ' + this.docID + ', ' + this.userID
    }
}

// Firestore data converter
var activityConverter = {
    toFirestore: function (activity) {
        return {
            title: activity.title,
            titleLowerCase: activity.titleLowerCase,
            date: activity.date,
            topics: activity.topics,
            subject: activity.subject,
            docID: activity.docID,
            userID: activity.userID
        };
    },
    fromFirestore: function (snapshot, options) {
        const data = snapshot.data(options);
        return new Activity(data.title, data.titleLowerCase, data.date, data.topics, data.subject, data.docID, data.userID);
    }
};