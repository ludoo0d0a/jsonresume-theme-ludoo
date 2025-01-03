var fs = require('fs');
var _ = require('lodash');
var gravatar = require('gravatar');
var Mustache = require('mustache');

var d = new Date();
var curyear = d.getFullYear();

function getMonth(startDateStr, locale) {
    const month = startDateStr.substr(5,2)
    const date = new Date(2024, month, 1); 
    const monthText = date.toLocaleString(locale, { month: 'long' });
    return monthText+' '
}

function render(resumeObject) {
    const DEFAULT_LANG = 'en'
    const lang = (resumeObject.meta && resumeObject.meta.lang) || DEFAULT_LANG;

    const allI18ns= {
        'en': {
            'present': 'Present',
            'i18n.expected':' (i18n.expected)',
            'title':{
                'about': 'About',
                'work-experience': 'Work Experience',
                'volunteer': 'Volunteer',
                'projects': 'Projects',
                'references': 'References'
            }
            
        },
        'fr': {
            'present': "Aujourd'hui",
            'i18n.expected': " (attendu)",
            'title':{
                'about': 'A propos',
                'work-experience': 'Expériences',
                'volunteer': 'Volontariat',
                'projects': 'Projets',
                'references': 'Références'
            }
        }
    }
    const i18n = allI18ns[lang] || allI18ns[DEFAULT_LANG];

    resumeObject.title = i18n.title;

    resumeObject.basics.capitalName = resumeObject.basics.name.toUpperCase();
    if(resumeObject.basics && resumeObject.basics.email) {
        resumeObject.basics.gravatar = gravatar.url(resumeObject.basics.email, {
                        s: '200',
                        r: 'pg',
                        d: 'mm'
                    });
    }
    if (resumeObject.basics.image || resumeObject.basics.gravatar) {
        resumeObject.photo = resumeObject.basics.image ? resumeObject.basics.image : resumeObject.basics.gravatar;
    }

    _.each(resumeObject.basics.profiles, function(p){
        switch(p.network.toLowerCase()) {
            // special cases
            case "google-plus":
            case "googleplus":
                p.iconClass = "fab fa-google-plus";
                break;
            case "flickr":
            case "flicker":
                p.iconClass = "fab fa-flickr";
                break;
            case "dribbble":
            case "dribble":
                p.iconClass = "fab fa-dribbble";
                break;
            case "codepen":
                p.iconClass = "fab fa-codepen";
                break;
            case "soundcloud":
                p.iconClass = "fab fa-soundcloud";
                break;
            case "reddit":
                p.iconClass = "fab fa-reddit";
                break;
            case "tumblr":
            case "tumbler":
                p.iconClass = "fab fa-tumblr";
                break;
            case "stack-overflow":
            case "stackoverflow":
                p.iconClass = "fab fa-stack-overflow";
                break;
            case "blog":
            case "rss":
                p.iconClass = "fas fa-rss";
                break;
            case "gitlab":
                p.iconClass = "fab fa-gitlab";
                break;
            case "keybase":
                p.iconClass = "fas fa-key";
                break;
            case "pdf":
            case "doc":
            case "document":
            case "cv":
            case "resume":
                p.iconClass = "fas fa-file-pdf";
                break;
                
            default:
                // try to automatically select the icon based on the name
                p.iconClass = "fab fa-" + p.network.toLowerCase();
        }

        if (p.url) {
            p.text = p.url;
        } else {
            p.text = p.network + ": " + p.username;
        }
    });

    function formatSection(w) {
        if (w.startDate) {
            w.startDateYear = (w.startDate || "").substr(0, 4);
            w.startDateMonth = getMonth(w.startDate || "");
        }
        if (w.endDate) {
            w.endDateYear = (w.endDate || "").substr(0, 4);
            w.endDateMonth = getMonth(w.endDate || "");
        } else {
            w.endDateYear = i18n.present
        }
        if (w.highlights) {
            if (w.highlights[0]) {
                if (w.highlights[0] !== "") {
                    w.boolHighlights = true;
                }
            }
        }
    }

    if (resumeObject.work && resumeObject.work.length) {
        resumeObject.workBool = true;
        _.each(resumeObject.work, function(w){
            formatSection(w);
        });
    }

    if (resumeObject.volunteer && resumeObject.volunteer.length) {
        resumeObject.volunteerBool = true;
        _.each(resumeObject.volunteer, function(w){
            formatSection(w);
        });
    }

    if (resumeObject.projects && resumeObject.projects.length) {
        if (resumeObject.projects[0].name) {
            resumeObject.projectsBool = true;
        }
    }

    if (resumeObject.education && resumeObject.education.length) {
        if (resumeObject.education[0].institution) {
            resumeObject.educationBool = true;
            _.each(resumeObject.education, function(e){
                if( !e.area || !e.studyType ){
                  e.educationDetail = (e.area == null ? '' : e.area) + (e.studyType == null ? '' : e.studyType);
                } else {
                  e.educationDetail = e.area + ", "+ e.studyType;
                }
                if (e.startDate) {
                    e.startDateYear = e.startDate.substr(0,4);
                    e.startDateMonth = getMonth(e.startDate || "");
                } else {
                    e.endDateMonth = "";
                }
                if (e.endDate) {
                    e.endDateYear = e.endDate.substr(0,4);
                    e.endDateMonth = getMonth(e.endDate || "")

                    if (e.endDateYear > curyear) {
                        e.endDateYear += i18n.expected;
                    }
                } else {
                    e.endDateYear = i18n.present
                    e.endDateMonth = '';
                }
                if (e.courses) {
                    if (e.courses[0]) {
                        if (e.courses[0] !== "") {
                            e.educationCourses = true;
                        }
                    }
                }
            });
        }
    }

    if (resumeObject.awards && resumeObject.awards.length) {
        if (resumeObject.awards[0].title) {
            resumeObject.awardsBool = true;
            _.each(resumeObject.awards, function(a){
                a.year = (a.date || "").substr(0,4);
                a.day = (a.date || "").substr(8,2);
                a.month = getMonth(a.date || "");
            });
        }
    }

    if (resumeObject.publications && resumeObject.publications.length) {
        if (resumeObject.publications[0].name) {
            resumeObject.publicationsBool = true;
            _.each(resumeObject.publications, function(a){
                a.year = (a.releaseDate || "").substr(0,4);
                a.day = (a.releaseDate || "").substr(8,2);
                a.month = getMonth(a.releaseDate || "");
            });
        }
    }

    if (resumeObject.skills && resumeObject.skills.length) {
        if (resumeObject.skills[0].name) {
            resumeObject.skillsBool = true;
        }
    }

    if (resumeObject.interests && resumeObject.interests.length) {
        if (resumeObject.interests[0].name) {
            resumeObject.interestsBool = true;
        }
    }

    if (resumeObject.languages && resumeObject.languages.length) {
        if (resumeObject.languages[0].language) {
            resumeObject.languagesBool = true;
        }
    }

    if (resumeObject.references && resumeObject.references.length) {
        if (resumeObject.references[0].name) {
            resumeObject.referencesBool = true;
        }
    }

    resumeObject.css = fs.readFileSync(__dirname + "/style.css", "utf-8");
    resumeObject.printcss = fs.readFileSync(__dirname + "/print.css", "utf-8");
    var theme = fs.readFileSync(__dirname + '/resume.template', 'utf8');
    return Mustache.render(theme, resumeObject);
}
module.exports = {
    render: render
}
