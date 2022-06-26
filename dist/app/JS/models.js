class Activity {
    constructor(title, date, topics, subject, docID) {
        this.title = title;
        this.date = date;
        this.topics = topics;
        this.subject = subject;
        this.docID = docID;
    }
    toString() {
        return this.title + ', ' + this.date + ', ' + this.topics + ', ' + this.subject + ', ' + this.docID
    }
}

// Firestore data converter
var activityConverter = {
    toFirestore: function (activity) {
        return {
            title: activity.title,
            date: activity.date,
            topics: activity.topics,
            subject: activity.subject,
            docID: activity.docID

        };
    },
    fromFirestore: function (snapshot, options) {
        const data = snapshot.data(options);
        return new Activity(data.title, data.date, data.topics, data.subject, data.docID);
    }
};