var fs = require('fs');
var gravatar = require('gravatar');
var Mustache = require('mustache');

function render(resumeObject) {
    const DEFAULT_LANG = 'en'
    const lang = (resumeObject.meta && resumeObject.meta.lang) || DEFAULT_LANG;
    // get locale from language
    const locale = lang; //(lang === 'fr') ? 'fr-FR' : 'en-US';

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

    function applyDate(date, a) {
        const d = parseDate(date)
        a.year = d.year
        a.day = d.day
        a.month = d.monthText
    }

    function parseDate(dateText) {
        const date = new Date(dateText);
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const monthText = date.toLocaleString(locale, { month: 'long' });

        return {date,year, day, monthText, month };
    }

    function isFirst(r, name) {
        return !!(r && r.length && (name ? r[name] : r))
    }

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

    resumeObject.basics.profiles.forEach(p => {
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
                p.iconClass = `fab fa-${p.network.toLowerCase()}`;
        }

        p.text = (p.url) ? p.url :  `${p.network}: ${p.username}`;
    });

    function formatSection(w) {
        if (w.startDate) {
            const ds = parseDate(w.startDate)
            w.startDateYear = ds.year
            w.startDateMonth = ds.monthText
        }
        if (w.endDate) {
            const de = parseDate(w.endDate)
            w.endDateYear = de.year
            w.endDateMonth = de.monthText
        } else {
            w.endDateYear = i18n.present
            w.endDateMonth = '';
        }
        w.boolHighlights = isFirst(w.highlights)
    }

    if (resumeObject.work && resumeObject.work.length) {
        resumeObject.workBool = true;
        resumeObject.work.forEach(w => formatSection(w));
    }

    if (resumeObject.volunteer && resumeObject.volunteer.length) {
        resumeObject.volunteerBool = true;
        resumeObject.volunteer.forEach(w => formatSection(w));
    }


    resumeObject.projectsBool = isFirst(resumeObject.projects , 'name')

    if (isFirst(resumeObject.education , 'institution')) {
        resumeObject.educationBool = true;
        resumeObject.education.forEach(e => {
            formatSection(e);
            e.educationDetail = [e.area, e.studyType].filter(Boolean).join(', ');
            e.educationCourses = isFirst(e.courses)
        });
    }

    if (isFirst(resumeObject.awards , 'title')) {
        resumeObject.awardsBool = true;
        resumeObject.awards.forEach(a => {
            applyDate(a.date, a)
        });
    }

    if (isFirst(resumeObject.publications , 'name')) {
        resumeObject.publicationsBool = true;
        resumeObject.publications.forEach(p => {
            applyDate(p.releaseDate, p)
        });
    }

    resumeObject.skillsBool = isFirst(resumeObject.skills , 'name')
    resumeObject.interestsBool = isFirst(resumeObject.interests, 'name')
    resumeObject.languagesBool = isFirst(resumeObject.languages, 'language')
    resumeObject.referencesBool = isFirst(resumeObject.references, 'name')

    resumeObject.css = fs.readFileSync(__dirname + "/style.css", "utf-8");
    resumeObject.printcss = fs.readFileSync(__dirname + "/print.css", "utf-8");
    var theme = fs.readFileSync(__dirname + '/resume.template', 'utf8');
    return Mustache.render(theme, resumeObject);
}
module.exports = {
    render: render
}
