class Lesson {
    constructor(id, course_id, title, content, media_url, media_type, document_url, position) {
        this.id = id;
        this.course_id = course_id;
        this.title = title;
        this.content = content;
        this.media_url = media_url;
        this.media_type = media_type;
        this.document_url = document_url;
        this.position = position;
    }
}

module.exports = Lesson;
