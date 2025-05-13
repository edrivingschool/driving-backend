class Lesson {
    constructor(id, course_id, title, content, media_url, media_type, document_content, position) {
        this.id = id;
        this.course_id = course_id;
        this.title = title;
        this.content = content;
        this.media_url = media_url;
        this.media_type = media_type;
        this.document_content = document_content;
        this.position = position;
    }
}

module.exports = Lesson;