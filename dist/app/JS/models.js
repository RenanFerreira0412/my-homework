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


class User {
    constructor(name, email, id) {
        this.name = name;
        this.email = email;
        this.id = id;
    }
    toString() {
        return this.name + ', ' + this.email + this.id
    }
}

// Firestore data converter
var userConverter = {
    toFirestore: function (user) {
        return {
            name: user.name,
            email: user.email,
            id: user.id
        };
    },
    fromFirestore: function (snapshot, options) {
        const data = snapshot.data(options);
        return new User(data.name, data.email, data.id);
    }
};